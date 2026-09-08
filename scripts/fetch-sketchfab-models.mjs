#!/usr/bin/env node
/**
 * HARMONA — Sketchfab 3D Model Bulk Sourcing Pipeline
 * Sourced under Permissive Creative Commons licenses ONLY: CC0, CC BY, CC BY-SA.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Load .env manually if dotenv is not yet required
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const SKETCHFAB_TOKEN = process.env.SKETCHFAB_API_TOKEN;
const MANIFEST_PATH = path.join(ROOT_DIR, 'instruments.manifest.json');
const PUBLIC_MODELS_DIR = path.join(ROOT_DIR, 'public', 'models');
const ASSETS_MODELS_DIR = path.join(ROOT_DIR, 'src', 'assets', 'models');
const ASSETS_MD_PATH = path.join(ROOT_DIR, 'ASSETS.md');

// Permissive Creative Commons licenses strictly permitted
const PERMISSIVE_LICENSES = ['cc0', 'by', 'by-sa'];

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const targetInstrumentArg = args.find((a) => a.startsWith('--instrument='))?.split('=')[1];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       HARMONA — Automated 3D Model Sourcing Pipeline         ║');
console.log('║       Creative Commons Permissive License Gate (CC0/BY/SA)   ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

if (!SKETCHFAB_TOKEN || SKETCHFAB_TOKEN.includes('your_sketchfab_api_token')) {
  console.warn('⚠️  SKETCHFAB_API_TOKEN is not configured in .env!');
  console.log('\n📖 To fetch models automatically:');
  console.log('  1. Sign up / log in to Sketchfab: https://sketchfab.com');
  console.log('  2. Copy your API Token: https://sketchfab.com/settings/password');
  console.log('  3. Create a .env file: SKETCHFAB_API_TOKEN=your_token_here');
  console.log('  4. Re-run: npm run fetch:models\n');
  console.log('👉 For now, instruments without GLB files will be gracefully gated as "Coming Soon".\n');
  process.exit(0);
}

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
  process.exit(1);
}

// Ensure model output directories exist
fs.mkdirSync(PUBLIC_MODELS_DIR, { recursive: true });
fs.mkdirSync(ASSETS_MODELS_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText} on ${url}`);
  }
  return res.json();
}

async function searchCandidate(instrument) {
  for (const keyword of instrument.keywords) {
    try {
      const searchUrl = `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=${encodeURIComponent(
        keyword
      )}&sort_by=-likeCount`;

      const data = await fetchJson(searchUrl, {
        Authorization: `Token ${SKETCHFAB_TOKEN}`,
      });

      if (!data.results || data.results.length === 0) continue;

      // Filter for permissive licenses
      const candidates = data.results.filter((m) => {
        const lic = (m.license?.slug || m.license?.label || '').toLowerCase();
        const isPermissive = PERMISSIVE_LICENSES.some((p) => lic.includes(p));
        const isStandardOrEditorial = lic.includes('standard') || lic.includes('editorial');
        return isPermissive && !isStandardOrEditorial;
      });

      if (candidates.length === 0) continue;

      // Rank by quality signals
      candidates.sort((a, b) => {
        const polyA = a.vertexCount || a.faceCount || 0;
        const polyB = b.vertexCount || b.faceCount || 0;

        // Ideal range: 2000 to 180000 vertices
        const scoreA = (a.likeCount || 0) * 2 + (polyA > 1000 && polyA < 200000 ? 50 : 0);
        const scoreB = (b.likeCount || 0) * 2 + (polyB > 1000 && polyB < 200000 ? 50 : 0);
        return scoreB - scoreA;
      });

      return candidates[0];
    } catch (err) {
      console.warn(`  Search error with keyword "${keyword}":`, err.message);
    }
  }
  return null;
}

async function downloadModel(uid, targetGlbPath) {
  const downloadInfoUrl = `https://api.sketchfab.com/v3/models/${uid}/download`;
  const info = await fetchJson(downloadInfoUrl, {
    Authorization: `Token ${SKETCHFAB_TOKEN}`,
  });

  const gltfArchive = info.gltf || info.glb;
  if (!gltfArchive || !gltfArchive.url) {
    throw new Error(`No downloadable glTF/GLB archive returned for ${uid}`);
  }

  // Download the archive zip / glb
  const tempDir = path.join(ROOT_DIR, 'scripts', '.tmp');
  fs.mkdirSync(tempDir, { recursive: true });
  const tempZip = path.join(tempDir, `${uid}.zip`);

  const response = await fetch(gltfArchive.url);
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(tempZip, Buffer.from(arrayBuffer));

  // Extract using PowerShell or tar
  const extractDir = path.join(tempDir, uid);
  fs.mkdirSync(extractDir, { recursive: true });

  try {
    execSync(`powershell -command "Expand-Archive -Path '${tempZip}' -DestinationPath '${extractDir}' -Force"`, {
      stdio: 'pipe',
    });
  } catch {
    // fallback if tar exists
    execSync(`tar -xf "${tempZip}" -C "${extractDir}"`, { stdio: 'pipe' });
  }

  // Find glb or scene.gltf
  let finalGlbPath = null;
  const files = fs.readdirSync(extractDir);

  const foundGlb = files.find((f) => f.endsWith('.glb'));
  if (foundGlb) {
    finalGlbPath = path.join(extractDir, foundGlb);
    fs.copyFileSync(finalGlbPath, targetGlbPath);
  } else {
    // Look for scene.gltf and pack to glb via gltf-pack or gltf-pipeline
    const foundGltf = files.find((f) => f.endsWith('.gltf'));
    if (foundGltf) {
      const srcGltf = path.join(extractDir, foundGltf);
      // Run gltf-transform pack if available
      try {
        execSync(`npx -y @gltf-transform/cli copy "${srcGltf}" "${targetGlbPath}"`, { stdio: 'pipe' });
      } catch {
        fs.copyFileSync(srcGltf, targetGlbPath);
      }
    }
  }

  // Clean temp files
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}

  return fs.existsSync(targetGlbPath);
}

function updateAssetsAttribution(record) {
  if (!fs.existsSync(ASSETS_MD_PATH)) return;

  let content = fs.readFileSync(ASSETS_MD_PATH, 'utf8');
  const entryHeader = '## Sourced 3D Model Attribution Registry';

  const row = `| **${record.instrumentName}** (\`${record.instrumentId}\`) | [${record.modelTitle}](${record.sourceUrl}) | ${record.author} | \`${record.license}\` | ${new Date().toISOString().split('T')[0]} |`;

  if (!content.includes(entryHeader)) {
    content += `\n\n${entryHeader}\n\n| Instrument | Model Title | Author / Studio | License | Date Sourced |\n| :--- | :--- | :--- | :--- | :--- |\n`;
  }

  if (!content.includes(record.instrumentId)) {
    content += `${row}\n`;
    fs.writeFileSync(ASSETS_MD_PATH, content, 'utf8');
    console.log(`  📝 Added attribution to ASSETS.md`);
  }
}

async function run() {
  const instrumentsToProcess = targetInstrumentArg
    ? manifest.filter((i) => i.id === targetInstrumentArg)
    : manifest;

  console.log(`Processing ${instrumentsToProcess.length} instruments...\n`);

  for (const inst of instrumentsToProcess) {
    console.log(`🔍 [${inst.id}] Checking ${inst.name}...`);
    const publicGlb = path.join(PUBLIC_MODELS_DIR, `${inst.id}.glb`);
    const assetsGlb = path.join(ASSETS_MODELS_DIR, `${inst.id}.glb`);

    if (fs.existsSync(publicGlb) && !isForce) {
      console.log(`  ✓ GLB already exists (${(fs.statSync(publicGlb).size / 1024 / 1024).toFixed(2)} MB). Skipping.`);
      continue;
    }

    const candidate = await searchCandidate(inst);
    if (!candidate) {
      console.log(`  ⚠️  No permissive CC candidate found. Marked as Coming Soon.`);
      continue;
    }

    console.log(`  ✨ Found candidate: "${candidate.name}" by ${candidate.user?.displayName || candidate.user?.username}`);
    console.log(`     License: ${candidate.license?.label || candidate.license?.slug}`);
    console.log(`     Polygons: ${candidate.vertexCount || candidate.faceCount || 'N/A'}, Likes: ${candidate.likeCount}`);

    if (isDryRun) {
      console.log(`  (Dry run: skipping download)`);
      continue;
    }

    try {
      console.log(`  📥 Downloading model...`);
      const success = await downloadModel(candidate.uid, publicGlb);

      if (success && fs.existsSync(publicGlb)) {
        // Also copy to src/assets/models/
        fs.copyFileSync(publicGlb, assetsGlb);
        console.log(`  ✅ Successfully saved to public/models/${inst.id}.glb`);

        // Update available-models.json
        try {
          const availPath = path.join(ROOT_DIR, 'src', 'content', 'available-models.json');
          const availJson = fs.existsSync(availPath) ? JSON.parse(fs.readFileSync(availPath, 'utf8')) : { models: [] };
          if (!availJson.models.includes(inst.id)) {
            availJson.models.push(inst.id);
            fs.writeFileSync(availPath, JSON.stringify(availJson, null, 2), 'utf8');
            console.log(`  📋 Updated src/content/available-models.json`);
          }
        } catch (mErr) {
          console.warn(`  Warning updating available-models.json:`, mErr.message);
        }

        // Update ASSETS.md attribution
        updateAssetsAttribution({
          instrumentId: inst.id,
          instrumentName: inst.name,
          modelTitle: candidate.name,
          sourceUrl: candidate.viewerUrl,
          author: candidate.user?.displayName || candidate.user?.username,
          license: candidate.license?.label || candidate.license?.slug,
        });

        // Run optimization
        try {
          execSync(`node "${path.join(__dirname, 'optimize-models.mjs')}" "${publicGlb}"`, { stdio: 'inherit' });
        } catch (optErr) {
          console.warn(`  Optimization notice:`, optErr.message);
        }
      }
    } catch (dlErr) {
      console.error(`  ❌ Failed to download or convert:`, dlErr.message);
    }
  }

  console.log('\n🎉 Sourcing process complete!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

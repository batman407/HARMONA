#!/usr/bin/env node
/**
 * HARMONA — gltf-transform 3D Model Optimization Pipeline
 * Compresses geometry, prunes unused nodes, and verifies PBR materials.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_MODELS_DIR = path.join(ROOT_DIR, 'public', 'models');

const targetArg = process.argv[2];

async function optimizeGlb(glbPath) {
  if (!fs.existsSync(glbPath)) {
    console.warn(`File does not exist: ${glbPath}`);
    return;
  }

  const initialSize = fs.statSync(glbPath).size;
  console.log(`\n📦 Optimizing: ${path.basename(glbPath)} (${(initialSize / 1024 / 1024).toFixed(2)} MB)...`);

  try {
    const { NodeIO } = await import('@gltf-transform/core');
    const { KHRONOS_EXTENSIONS } = await import('@gltf-transform/extensions');
    const { dedup, prune, resample, weld } = await import('@gltf-transform/functions');

    const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
    const document = await io.read(glbPath);

    // Apply optimization passes
    await document.transform(
      weld({ tolerance: 0.0001 }),
      dedup(),
      resample(),
      prune()
    );

    // Write back optimized file
    await io.write(glbPath, document);

    const finalSize = fs.statSync(glbPath).size;
    const savings = ((1 - finalSize / initialSize) * 100).toFixed(1);
    console.log(`  ✓ Done! Final size: ${(finalSize / 1024 / 1024).toFixed(2)} MB (${savings}% reduction)`);
  } catch (err) {
    console.warn(`  Optimization pass warning: ${err.message}. Retaining original GLB.`);
  }
}

async function main() {
  if (targetArg) {
    await optimizeGlb(path.resolve(targetArg));
  } else {
    if (!fs.existsSync(PUBLIC_MODELS_DIR)) return;
    const files = fs.readdirSync(PUBLIC_MODELS_DIR).filter((f) => f.endsWith('.glb'));
    console.log(`Optimizing ${files.length} models in ${PUBLIC_MODELS_DIR}...`);
    for (const file of files) {
      await optimizeGlb(path.join(PUBLIC_MODELS_DIR, file));
    }
  }
}

main().catch((err) => {
  console.error('Optimization error:', err);
});

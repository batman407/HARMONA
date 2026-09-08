# HARMONA — Explore the World of Sound 🎵✨

> **Interactive 3D Acoustic & Instrument Interaction Engine**
> Built with React, Vite, TypeScript, Tailwind CSS, Three.js (React Three Fiber / Drei), and Web Audio API.

---

## 🌟 Overview

**HARMONA** is not an encyclopedia: it is an **Instrument Interaction Engine**—a dark-premium 3D acoustic studio where instruments respond physically and sonically to the user. Users can explore authentic 3D instruments, inspect internal acoustic mechanisms, activate mechanical parts (bowing, striking, plucking, blowing), visualize vibrations and harmonics in real time, and experiment with physical acoustic parameters (resonator size, tension, damping, breath pressure).

---

## 🛡️ 3D Graphics Quality Gate

HARMONA strictly adheres to photoreal, product-shot standards:
- **Zero Low-Quality Primitives in Production**: Boxes, cylinders, and placeholder geometry are completely eliminated from shipping builds.
- **Photoreal GLB Models with PBR Textures**: All enabled 3D instruments load realistic glTF/GLB models with physical PBR materials (roughness, metalness, normal maps, sheen, clearcoat).
- **Graceful Gating**: If a photoreal 3D model is not yet present for an instrument, it is automatically marked as **Coming Soon (3D)** with a sleek studio placeholder card while keeping the **Sound Lab**, **Harmonics Spectrum**, and **Physical Synthesis** fully operational.
- **Multi-Part vs Single-Mesh Anatomy**: Explode and isolation tools automatically adapt. When a single-mesh sculpt is loaded, Disassemble mode clearly displays *"Anatomy model not available yet. This photoreal model is currently a single-mesh sculpt."*

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/batman407/HARMONA.git
cd HARMONA
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎨 Automatic 3D Model Sourcing Pipeline (Creative Commons)

HARMONA includes an automated model acquisition and optimization pipeline that searches the **Sketchfab REST API** strictly for **Permissive Creative Commons (CC0, CC BY, CC BY-SA)** licensed assets.

### How to configure:
1. **Create an account / log in** to [Sketchfab](https://sketchfab.com).
2. **Retrieve your API Token** from [Sketchfab Account Settings > Password & API](https://sketchfab.com/settings/password).
3. **Set up `.env`**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your token:
   ```env
   SKETCHFAB_API_TOKEN=your_sketchfab_api_token_here
   ```
4. **Fetch Models**:
   ```bash
   # Download and optimize all eligible CC-licensed models
   npm run fetch:models

   # Fetch a specific instrument
   npm run fetch:models -- --instrument=guitar

   # Dry-run search without downloading
   npm run fetch:models -- --dry-run
   ```
5. **Optimize 3D Geometry & Textures**:
   ```bash
   npm run optimize:models
   ```
   The optimization pipeline uses `@gltf-transform` to weld duplicate vertices, deduplicate accessors, resample keyframes, and prune unused materials, producing lightweight, web-ready 60fps assets.

All downloaded models are automatically documented with full artist attribution and license terms in [`ASSETS.md`](./ASSETS.md).

---

## 🎸 Instrument Catalog (V1 Roster)

HARMONA features 17 diverse acoustic mechanisms across 7 instrument families:

| Family | Instrument | Primary Acoustic Mechanism | Pitch Range |
| :--- | :--- | :--- | :--- |
| **Strings** | Classical Acoustic Guitar | Plucked nylon/steel strings on spruce soundboard | E2 – B5 |
| **Strings** | Electric Guitar | Magnetic pickups inducing electromagnetic signal | E2 – D6 |
| **Strings** | Electric Bass Guitar | Low-frequency steel strings with split-coil pickup | E1 – G4 |
| **Strings** | Orchestral Violin | Friction bowing of gut/steel over carved spruce bridge | G3 – A7 |
| **Strings** | Concert Pedal Harp | 47 plucked gut strings with mechanical pedal pitch alteration | C1 – G7 |
| **Keyboards** | Grand Piano | Felt hammers striking high-tension cast-iron framed strings | A0 – C8 |
| **Keyboards** | Cathedral Pipe Organ | Pressurized wind passing through flue & reed rank pipes | C-1 – C9 |
| **Percussion** | Acoustic Drum Kit | Tuned membranes struck with sticks + metallic cymbals | 30 Hz – 15 kHz |
| **Percussion** | Orchestral Marimba | Rosewood tone bars tuned over tuned metal resonator pipes | C2 – C7 |
| **Percussion** | West African Djembe | Goatskin membrane on hand-carved hardwood goblet | C2 – G5 |
| **Woodwinds** | Concert Flute | Edge-tone embouchure slit across lip plate hole | C4 – D7 |
| **Woodwinds** | Clarinet | Single cane reed vibrating against slotted mouthpiece | D3 – A6 |
| **Brass** | Bb Trumpet | Lip-reed buzzing through cup mouthpiece with 3 piston valves | F#3 – D6 |
| **Brass** | Tenor Trombone | Lip-reed acoustic wave modulated by telescoping slide | E2 – F5 |
| **Brass** | Eb Alto Saxophone | Conical brass bore driven by vibrating single cane reed | Db3 – Ab5 |
| **World** | West African Kora | 21-string calabash gourd harp-lute with cowhide face | F1 – F6 |
| **World** | African Kalimba (Mbira) | Staggered forged steel spring tines mounted on hardwood soundbox | C4 – D6 |

---

## 🔬 Studio Modes & Features

- **3D Studio Viewer**:
  - Orbit, pan, zoom with smooth inertial damping.
  - Three-point studio lighting with directional key light, fill light, rim light, and HDRI reflections.
  - Soft contact shadows for grounded realism.
  - Part selection and anatomical inspection.
- **Disassemble / Explode Mode**:
  - Smooth slider (0% to 100%) expanding instrument sub-assemblies along their natural acoustic axes.
  - Isolate specific parts (soundboard, neck, pickups, bridge, keys, reeds).
  - X-Ray mode rendering translucent ghosted hulls with highlighted internal acoustic paths.
- **Sound Lab**:
  - High-precision Web Audio physical modeling synthesizer tailored to each instrument's mechanism.
  - Live 60 FPS **Oscilloscope** (time-domain waveform).
  - Real-time **FFT Spectrum Analyser** displaying fundamental frequencies, odd/even harmonics, and inharmonic noise bursts.
- **Acoustic Experiment Mode**:
  - Real-time physical parameter sliders: Resonator Volume, String/Membrane Tension, Material Damping, Air Flow Rate.
  - Hear and see timbre changes dynamically as physical parameters are altered.
- **Multi-Language (i18n)**:
  - Full English (default) with automatic RTL layout switching for Arabic / Hebrew.
- **Dark / Light Studio Aesthetics**:
  - Obsidian dark theme and clean aluminum light theme, accented with champagne gold.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **3D Engine**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Styling**: Tailwind CSS + CSS Custom Properties Design System
- **State Management**: Zustand
- **Animations**: GSAP
- **Audio Engine**: Web Audio API (`AudioContext`, `AnalyserNode`, `BiquadFilterNode`, `GainNode`)
- **Asset Optimization**: `@gltf-transform/core`, `@gltf-transform/functions`

---

## 📄 License & Attribution

- HARMONA codebase is released under the **MIT License**.
- 3D models and audio samples are sourced strictly under **Creative Commons (CC0, CC BY, CC BY-SA)** licenses. See [`ASSETS.md`](./ASSETS.md) for full individual credits and attribution.

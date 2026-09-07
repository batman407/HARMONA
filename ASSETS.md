# HARMONA V1 — Instrument Asset & Acoustic Registry

HARMONA features 17 procedural 3D instruments sculpted directly via Three.js and React Three Fiber, coupled to a real-time Web Audio API physical modeling and harmonic synthesis engine.

---

## Catalog & Acoustic Mechanism Matrix

| Instrument | Family | Acoustic Classification | Sound Generator | Resonance / Radiation | Interactive Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Acoustic Guitar** | Strings | Plucked Chordophone | 6 nylon/steel strings | Helmholtz body cavity + Sitka spruce soundboard | Karplus-Strong string pluck |
| **Electric Guitar** | Strings | Solid-Body Chordophone | 6 ferromagnetic strings | Alnico V magnetic pickup + tube saturation shaper | Pickups & tone control simulation |
| **Bass Guitar** | Strings | Solid-Body Low Chordophone | 4 heavy wound strings | Split-coil humbucking + sub-octave fundamental | Low-frequency sub-bass generator |
| **Violin** | Strings | Bowed Chordophone | 4 tuned strings (G-D-A-E) | Helmholtz stick-slip friction + wood body formants | Continuous bow sawtooth + vibrato LFO |
| **Concert Harp** | Strings | Frame Chordophone | 47 graduated strings | Sitka soundboard + double-action pedal discs | Shimmering multi-octave string plucks |
| **Grand Piano** | Keyboards | Struck Chordophone | Felt hammer on unison triples | Cast iron frame + spruce soundboard | Coupled oscillator hammer thud |
| **Pipe Organ** | Keyboards | Flue Aerophone Keyboard | Multivoice flue pipe ranks | Resonating cylindrical columns + air chiff | Additive harmonic stop mixtures |
| **Concert Snare Drum** | Percussion | Membranophone | Struck batter head membrane | Bessel circular modes + bottom snare wire noise | Bessel J₀/J₁ impact + highpass noise |
| **Drum Kit** | Percussion | Membranophone / Idiophone | Kick, Snare, Toms, Cymbals | Dual-head shells + B20 bronze inharmonic plates | Multi-element drum kit trigger |
| **Djembe** | Percussion | Goblet Membranophone | Shaved goatskin head | Carved lenké goblet cavity + open bottom port | Center bass thump vs edge rim slap |
| **Bb Trumpet** | Brass | Lip-Reed Aerophone | Buzzing embouchure lips | Cylindrical valve tubing + flared brass bell | Additive brassy saw + bell formant |
| **Tenor Trombone** | Brass | Slide Brass Aerophone | Buzzing lip-reed | Telescoping outer slide + flared acoustic bell | Continuous portamento slide positions |
| **Alto Saxophone** | Woodwinds | Conical Reed Aerophone | Single cane reed | Conical bore + Boehm tone hole pad clusters | Conical air column + reed pulse |
| **Concert Flute** | Woodwinds | Edge-Tone Aerophone | Embouchure air jet vortex | Cylindrical bore + open/closed tone holes | Pure sinusoidal tone + breath noise chiff |
| **Analog Synthesizer** | Electronic | Subtractive Synthesizer | Dual detuned VCOs | 24dB resonant ladder filter + ADSR VCA envelope | Resonant filter sweep + analog detune |
| **West African Kora** | World | Spike Harp-Lute | 21 nylon/monofilament strings | Calabash gourd resonator + cowskin table | Upright bridge double-plane plucks |
| **Kalimba** | World | Lamellophone | 17 cantilever steel tines | Hollowed mahogany chamber + Helmholtz wah ports | Cantilever beam 1x & 6.27x modal chime |

---

## Disassembly & Explosion Vectors

Every instrument features mathematically computed exploded-view 3D vectors (`explodeVector`) corresponding to its physical mechanical anatomy:
- `body` / `shell` / `chassis`: Structural acoustic foundation
- `exciter`: Strings, keys, tines, reeds, or membranes
- `transducer`: Bridge, pickups, or valves
- `radiator`: Soundboards, flared bells, or sound ports

---

## Synthesis Engine Details

Implemented in `src/audio/AudioEngine.ts`:
- **Physical Modeling**: Discrete-time Karplus-Strong feedback loop with frequency-dependent dampening filters.
- **Bessel Function Synthesis**: Radial membrane mode modeling for circular boundary conditions $(J_0, J_1)$.
- **Acoustic Formants**: Resonant biquad bandpass filters simulating instrument horn bell impedance matching and wood resonances.
- **Real-Time Analyser**: 2048-point FFT powering the dynamic oscilloscope and frequency spectrum analyzer.

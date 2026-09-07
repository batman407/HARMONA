import guitarEn from './en/guitar.json';
import electricGuitarEn from './en/electric_guitar.json';
import bassGuitarEn from './en/bass_guitar.json';
import violinEn from './en/violin.json';
import harpEn from './en/harp.json';
import pianoEn from './en/piano.json';
import pipeOrganEn from './en/pipe_organ.json';
import drumEn from './en/drum.json';
import drumKitEn from './en/drum_kit.json';
import djembeEn from './en/djembe.json';
import trumpetEn from './en/trumpet.json';
import tromboneEn from './en/trombone.json';
import saxophoneEn from './en/alto_saxophone.json';
import fluteEn from './en/flute.json';
import synthesizerEn from './en/synthesizer.json';
import koraEn from './en/kora.json';
import kalimbaEn from './en/kalimba.json';

import { InstrumentData, ComingSoonInstrument } from './types';

export const INSTRUMENTS_CATALOG: InstrumentData[] = [
  // Strings
  guitarEn as unknown as InstrumentData,
  electricGuitarEn as unknown as InstrumentData,
  bassGuitarEn as unknown as InstrumentData,
  violinEn as unknown as InstrumentData,
  harpEn as unknown as InstrumentData,
  // Keyboards
  pianoEn as unknown as InstrumentData,
  pipeOrganEn as unknown as InstrumentData,
  // Percussion
  drumEn as unknown as InstrumentData,
  drumKitEn as unknown as InstrumentData,
  djembeEn as unknown as InstrumentData,
  // Brass
  trumpetEn as unknown as InstrumentData,
  tromboneEn as unknown as InstrumentData,
  // Woodwinds
  saxophoneEn as unknown as InstrumentData,
  fluteEn as unknown as InstrumentData,
  // Electronic
  synthesizerEn as unknown as InstrumentData,
  // World / Folk
  koraEn as unknown as InstrumentData,
  kalimbaEn as unknown as InstrumentData,
];

export const INSTRUMENT_FAMILIES = [
  { id: 'all', label: 'All Instruments', icon: 'Sparkles' },
  { id: 'strings', label: 'Chordophones (Strings)', icon: 'Music' },
  { id: 'keyboards', label: 'Keyboards', icon: 'Layers' },
  { id: 'percussion', label: 'Membranophones & Drums', icon: 'Disc' },
  { id: 'brass', label: 'Brass Aerophones', icon: 'Flame' },
  { id: 'woodwinds', label: 'Woodwind Aerophones', icon: 'Wind' },
  { id: 'electronic', label: 'Electronic & Synth', icon: 'Zap' },
  { id: 'world', label: 'World & Folk Traditions', icon: 'Globe' },
];

export const COMING_SOON_CATALOG: ComingSoonInstrument[] = [
  {
    id: 'sitar',
    name: 'Ravi Shankar Sitar',
    family: 'world',
    familyName: 'Sympathetic Plucked Chordophone',
    shortDescription: '20-string classical Indian lute with curved movable frets and vibrating jawari bridge.',
    comingSoon: true,
  },
  {
    id: 'theremin',
    name: 'Leon Theremin Etherwave',
    family: 'electronic',
    familyName: 'Heterodyne Radiophonic Aerophone',
    shortDescription: 'Dual-antenna contactless instrument played through human capacitive coupling.',
    comingSoon: true,
  },
  {
    id: 'cello',
    name: 'Concert Cello',
    family: 'strings',
    familyName: 'Bowed Tenor Chordophone',
    shortDescription: 'Deep resonance chamber producing warm, sonorous low-register harmonics.',
    comingSoon: true,
  },
  {
    id: 'didgeridoo',
    name: 'Yidaki (Didgeridoo)',
    family: 'world',
    familyName: 'Natural Drone Aerophone',
    shortDescription: 'Termite-hollowed eucalyptus drone producing continuous circular breathing harmonics.',
    comingSoon: true,
  },
  {
    id: 'timpani',
    name: 'Orchestral Timpani',
    family: 'percussion',
    familyName: 'Tunable Copper Kettle Drum',
    shortDescription: 'Pedal-tuned parabolic copper kettle with defined harmonic pitch resonance.',
    comingSoon: true,
  },
  {
    id: 'accordion',
    name: 'Chromatic Accordion',
    family: 'keyboards',
    familyName: 'Free-Reed Aerophone',
    shortDescription: 'Bellows-driven hand-pumped reed bank with bass chord buttons and treble keyboard.',
    comingSoon: true,
  }
];

export const getInstrumentById = (id: string): InstrumentData => {
  const found = INSTRUMENTS_CATALOG.find((inst) => inst.id === id);
  return found || INSTRUMENTS_CATALOG[0];
};

export interface InstrumentPart {
  label: string;
  function: string;
  characteristics: {
    material: string;
    mechanism: string;
    role: string;
  };
  explodeVector: [number, number, number];
}

export interface SoundDNA {
  exciter: string;
  resonator: string;
  harmonics: string;
  attackDecay: string;
  timbreProfile: string;
  radiationPattern: string;
  fundamentalRange: string;
  harmonicWarmth: number; // 0 - 100
  percussiveness: number; // 0 - 100
  sustainScore: number;   // 0 - 100
  brightness: number;     // 0 - 100
}

export interface SoundStep {
  step: number;
  partKey: string;
  title: string;
  explanation: string;
}

export type InstrumentFamily =
  | 'strings'
  | 'keyboards'
  | 'percussion'
  | 'brass'
  | 'woodwinds'
  | 'electronic'
  | 'world';

export type InteractionType =
  | 'string_pluck'
  | 'piano_keys'
  | 'drum_strike'
  | 'brass_valves'
  | 'wind_keys'
  | 'synth_keys'
  | 'tine_pluck';

export interface InstrumentData {
  id: string;
  name: string;
  family: InstrumentFamily;
  familyName: string;
  shortDescription: string;
  description: string;
  historicalOrigins: string;
  acousticPrinciples: string[];
  characteristics: {
    pitchRange: string;
    dynamicRange: string;
    timbralColor: string;
    orchestralRole: string;
  };
  soundDNA: SoundDNA;
  parts: Record<string, InstrumentPart>;
  followTheSound: SoundStep[];
  interactiveControls: {
    type: InteractionType;
    keysOrTriggers: {
      id: string;
      label: string;
      note: string;
      freq: number;
    }[];
  };
  tags?: string[];
}

/** Placeholder entry for Coming Soon instruments */
export interface ComingSoonInstrument {
  id: string;
  name: string;
  family: InstrumentFamily;
  familyName: string;
  shortDescription: string;
  comingSoon: true;
}

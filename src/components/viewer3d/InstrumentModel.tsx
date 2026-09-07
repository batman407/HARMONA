import React, { Suspense } from 'react';
import { InstrumentData } from '../../content/types';
import { GuitarMesh } from './procedural/GuitarMesh';
import { ElectricGuitarMesh } from './procedural/ElectricGuitarMesh';
import { BassGuitarMesh } from './procedural/BassGuitarMesh';
import { ViolinMesh } from './procedural/ViolinMesh';
import { HarpMesh } from './procedural/HarpMesh';
import { PianoMesh } from './procedural/PianoMesh';
import { PipeOrganMesh } from './procedural/PipeOrganMesh';
import { DrumMesh } from './procedural/DrumMesh';
import { DrumKitMesh } from './procedural/DrumKitMesh';
import { DjembeMesh } from './procedural/DjembeMesh';
import { TrumpetMesh } from './procedural/TrumpetMesh';
import { TromboneMesh } from './procedural/TromboneMesh';
import { SaxophoneMesh } from './procedural/SaxophoneMesh';
import { FluteMesh } from './procedural/FluteMesh';
import { SynthesizerMesh } from './procedural/SynthesizerMesh';
import { KoraMesh } from './procedural/KoraMesh';
import { KalimbaMesh } from './procedural/KalimbaMesh';

interface InstrumentModelProps {
  instrument: InstrumentData;
}

export const InstrumentModel: React.FC<InstrumentModelProps> = ({ instrument }) => {
  const renderModel = () => {
    switch (instrument.id) {
      case 'guitar':
        return <GuitarMesh parts={instrument.parts} />;
      case 'electric_guitar':
        return <ElectricGuitarMesh parts={instrument.parts} />;
      case 'bass_guitar':
        return <BassGuitarMesh parts={instrument.parts} />;
      case 'violin':
        return <ViolinMesh parts={instrument.parts} />;
      case 'harp':
        return <HarpMesh parts={instrument.parts} />;
      case 'piano':
        return <PianoMesh parts={instrument.parts} />;
      case 'pipe_organ':
        return <PipeOrganMesh parts={instrument.parts} />;
      case 'drum':
        return <DrumMesh parts={instrument.parts} />;
      case 'drum_kit':
        return <DrumKitMesh parts={instrument.parts} />;
      case 'djembe':
        return <DjembeMesh parts={instrument.parts} />;
      case 'trumpet':
        return <TrumpetMesh parts={instrument.parts} />;
      case 'trombone':
        return <TromboneMesh parts={instrument.parts} />;
      case 'alto_saxophone':
        return <SaxophoneMesh parts={instrument.parts} />;
      case 'flute':
        return <FluteMesh parts={instrument.parts} />;
      case 'synthesizer':
        return <SynthesizerMesh parts={instrument.parts} />;
      case 'kora':
        return <KoraMesh parts={instrument.parts} />;
      case 'kalimba':
        return <KalimbaMesh parts={instrument.parts} />;
      default:
        return <GuitarMesh parts={instrument.parts} />;
    }
  };

  return (
    <Suspense fallback={null}>
      <group>{renderModel()}</group>
    </Suspense>
  );
};

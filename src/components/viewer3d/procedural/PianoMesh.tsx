import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface PianoMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const PianoMesh: React.FC<PianoMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const hammersGroupRef = useRef<THREE.Group>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.2, metalness = 0.1) => {
    const isSelected = selectedPartKey === partKey;
    const isHovered = hoveredPartKey === partKey;

    if (isGhostMode) {
      return {
        color: isSelected ? '#F2C14E' : '#4E6B99',
        transparent: true,
        opacity: isSelected ? 0.75 : 0.22,
        roughness: 0.1,
        metalness: 0.2,
      };
    }

    return {
      color: isSelected ? '#FFD36A' : isHovered ? '#E8B642' : baseColor,
      roughness: isSelected ? 0.15 : roughness,
      metalness: isSelected ? 0.5 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleKeyClick = (keyId: string, noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    setActiveKey(keyId);
    audioEngine.playPianoKey(freq);
    triggerVibration(1.1);
    setLastPlayedNote({ note: noteName, freq });
    setTimeout(() => setActiveKey(null), 250);
  };

  const whiteKeys = [
    { id: 'c4', note: 'C4', freq: 261.63, x: -0.42 },
    { id: 'd4', note: 'D4', freq: 293.66, x: -0.30 },
    { id: 'e4', note: 'E4', freq: 329.63, x: -0.18 },
    { id: 'f4', note: 'F4', freq: 349.23, x: -0.06 },
    { id: 'g4', note: 'G4', freq: 392.00, x: 0.06 },
    { id: 'a4', note: 'A4', freq: 440.00, x: 0.18 },
    { id: 'b4', note: 'B4', freq: 493.88, x: 0.30 },
    { id: 'c5', note: 'C5', freq: 523.25, x: 0.42 },
  ];

  const blackKeys = [
    { id: 'cs4', note: 'C#4', freq: 277.18, x: -0.36 },
    { id: 'ds4', note: 'D#4', freq: 311.13, x: -0.24 },
    { id: 'fs4', note: 'F#4', freq: 369.99, x: 0.00 },
    { id: 'gs4', note: 'G#4', freq: 415.30, x: 0.12 },
    { id: 'as4', note: 'A#4', freq: 466.16, x: 0.24 },
  ];

  useFrame((state) => {
    if (!hammersGroupRef.current) return;
    const vib = useViewerStore.getState().vibrationIntensity;
    if (vib > 0) {
      hammersGroupRef.current.children.forEach((hammer, idx) => {
        hammer.rotation.x = -Math.sin(state.clock.elapsedTime * 50 + idx) * 0.25 * vib;
      });
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      {/* 1. PIANO CASE (Grand Rim & Legs) */}
      <PartMeshWrapper
        partKey="piano_case"
        explodeVector={parts.piano_case?.explodeVector || [0, 0, 0]}
      >
        <group>
          {/* Main grand body */}
          <mesh position={[0, 0.2, -0.2]}>
            <boxGeometry args={[1.5, 0.45, 1.8]} />
            <meshStandardMaterial {...getMaterialProps('piano_case', '#0E0E12', 0.12, 0.05)} />
          </mesh>
          {/* Curved tail wedge */}
          <mesh position={[0.25, 0.2, -0.9]} rotation={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.45, 24]} />
            <meshStandardMaterial {...getMaterialProps('piano_case', '#0E0E12', 0.12, 0.05)} />
          </mesh>
          {/* 3 Legs */}
          {[-0.6, 0.6].map((x, i) => (
            <mesh key={`leg-front-${i}`} position={[x, -0.4, 0.5]}>
              <cylinderGeometry args={[0.06, 0.04, 0.8, 16]} />
              <meshStandardMaterial color="#0A0A0E" roughness={0.15} metalness={0.1} />
            </mesh>
          ))}
          <mesh position={[0.2, -0.4, -0.9]}>
            <cylinderGeometry args={[0.06, 0.04, 0.8, 16]} />
            <meshStandardMaterial color="#0A0A0E" roughness={0.15} metalness={0.1} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. LID (Angled Acoustic Reflection Prop Lid) */}
      <PartMeshWrapper partKey="lid" explodeVector={parts.lid?.explodeVector || [0, 0.8, 0]}>
        <group position={[0, 0.46, -0.2]} rotation={[-0.45, 0, 0.1]}>
          <mesh>
            <boxGeometry args={[1.48, 0.04, 1.76]} />
            <meshStandardMaterial {...getMaterialProps('lid', '#15161C', 0.15, 0.05)} />
          </mesh>
          {/* Brass prop stick */}
          <mesh position={[0.45, -0.3, 0.3]} rotation={[0.45, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.7, 12]} />
            <meshStandardMaterial color="#E8C872" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. SOUNDBOARD */}
      <PartMeshWrapper
        partKey="soundboard"
        explodeVector={parts.soundboard?.explodeVector || [0, -0.4, 0]}
      >
        <group position={[0, 0.1, -0.2]}>
          <mesh>
            <boxGeometry args={[1.38, 0.03, 1.6]} />
            <meshStandardMaterial {...getMaterialProps('soundboard', '#E2BA84', 0.35, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. CAST IRON HARP PLATE */}
      <PartMeshWrapper
        partKey="iron_plate"
        explodeVector={parts.iron_plate?.explodeVector || [0, 0.4, 0]}
      >
        <group position={[0, 0.25, -0.2]}>
          <mesh>
            <boxGeometry args={[1.35, 0.04, 1.55]} />
            <meshStandardMaterial {...getMaterialProps('iron_plate', '#C8A048', 0.3, 0.7)} />
          </mesh>
          {/* Webbing cutouts */}
          <mesh position={[-0.2, 0.03, -0.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
            <meshStandardMaterial color="#1C1808" roughness={0.8} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. STRINGS */}
      <PartMeshWrapper
        partKey="strings"
        explodeVector={parts.strings?.explodeVector || [0, 0.25, 0]}
      >
        <group position={[0, 0.3, -0.2]}>
          {Array.from({ length: 24 }).map((_, i) => (
            <mesh key={`str-${i}`} position={[-0.55 + i * 0.048, 0, 0]} rotation={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 1.4, 6]} />
              <meshStandardMaterial
                {...getMaterialProps('strings', i < 6 ? '#C97A48' : '#DFDFE5', 0.1, 0.95)}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 6. HAMMERS */}
      <PartMeshWrapper
        partKey="hammers"
        explodeVector={parts.hammers?.explodeVector || [0, 0.15, 0.5]}
      >
        <group ref={hammersGroupRef} position={[0, 0.28, 0.42]}>
          {whiteKeys.map((k) => (
            <group key={`hammer-${k.id}`} position={[k.x, 0, 0]}>
              <mesh position={[0, 0.04, -0.08]}>
                <boxGeometry args={[0.025, 0.04, 0.06]} />
                <meshStandardMaterial {...getMaterialProps('hammers', '#EFEBD9', 0.9, 0.0)} />
              </mesh>
              <mesh position={[0, 0.02, -0.03]} rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.12, 8]} />
                <meshStandardMaterial color="#8B5A2B" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 7. KEYS (WHITE) */}
      <PartMeshWrapper
        partKey="keys_white"
        explodeVector={parts.keys_white?.explodeVector || [0, 0, 0.8]}
      >
        <group position={[0, 0.24, 0.65]}>
          {whiteKeys.map((k) => {
            const isDepressed = activeKey === k.id;
            return (
              <mesh
                key={k.id}
                position={[k.x, isDepressed ? -0.02 : 0, 0]}
                onClick={(e) => handleKeyClick(k.id, k.note, k.freq, e)}
              >
                <boxGeometry args={[0.105, 0.05, 0.32]} />
                <meshStandardMaterial
                  {...getMaterialProps('keys_white', isDepressed ? '#F2C14E' : '#FDFDFD', 0.2, 0.05)}
                  emissive={isDepressed ? '#73520A' : '#000000'}
                />
              </mesh>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 8. KEYS (BLACK) */}
      <PartMeshWrapper
        partKey="keys_black"
        explodeVector={parts.keys_black?.explodeVector || [0, 0.05, 0.82]}
      >
        <group position={[0, 0.28, 0.61]}>
          {blackKeys.map((k) => {
            const isDepressed = activeKey === k.id;
            return (
              <mesh
                key={k.id}
                position={[k.x, isDepressed ? -0.02 : 0, 0]}
                onClick={(e) => handleKeyClick(k.id, k.note, k.freq, e)}
              >
                <boxGeometry args={[0.065, 0.065, 0.2]} />
                <meshStandardMaterial
                  {...getMaterialProps('keys_black', isDepressed ? '#F2C14E' : '#111115', 0.3, 0.1)}
                  emissive={isDepressed ? '#73520A' : '#000000'}
                />
              </mesh>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 9. PEDALS */}
      <PartMeshWrapper
        partKey="pedals"
        explodeVector={parts.pedals?.explodeVector || [0, -0.9, 0.4]}
      >
        <group position={[0, -0.55, 0.3]}>
          {/* Lyre columns */}
          <mesh position={[-0.12, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 12]} />
            <meshStandardMaterial color="#101014" roughness={0.3} />
          </mesh>
          <mesh position={[0.12, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 12]} />
            <meshStandardMaterial color="#101014" roughness={0.3} />
          </mesh>
          {/* 3 Brass Pedals */}
          {[-0.08, 0, 0.08].map((px, idx) => (
            <mesh key={`pedal-${idx}`} position={[px, 0, 0.08]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.04, 0.02, 0.16]} />
              <meshStandardMaterial {...getMaterialProps('pedals', '#E5B84B', 0.2, 0.9)} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

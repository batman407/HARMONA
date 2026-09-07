import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface GuitarMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const GuitarMesh: React.FC<GuitarMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const stringsRef = useRef<THREE.Group>(null);

  // Material helpers
  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.35, metalness = 0.1) => {
    const isSelected = selectedPartKey === partKey;
    const isHovered = hoveredPartKey === partKey;

    if (isGhostMode) {
      return {
        color: isSelected ? '#F2C14E' : '#4E6B99',
        transparent: true,
        opacity: isSelected ? 0.75 : 0.22,
        roughness: 0.1,
        metalness: 0.2,
        wireframe: false,
      };
    }

    return {
      color: isSelected ? '#FFD36A' : isHovered ? '#E8B642' : baseColor,
      roughness: isSelected ? 0.2 : roughness,
      metalness: isSelected ? 0.4 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  // String pluck animation
  useFrame((state) => {
    if (!stringsRef.current) return;
    const vib = useViewerStore.getState().vibrationIntensity;
    if (vib > 0) {
      stringsRef.current.children.forEach((child, idx) => {
        const offset = Math.sin(state.clock.elapsedTime * 65 + idx) * 0.008 * vib;
        child.position.z = 0.13 + offset;
      });
    }
  });

  const handleStringClick = (noteName: string, freq: number, stringIndex: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playGuitarString(freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: noteName, freq });
  };

  const stringNotes = [
    { name: 'E2', freq: 82.41, x: -0.075 },
    { name: 'A2', freq: 110.0, x: -0.045 },
    { name: 'D3', freq: 146.83, x: -0.015 },
    { name: 'G3', freq: 196.0, x: 0.015 },
    { name: 'B3', freq: 246.94, x: 0.045 },
    { name: 'E4', freq: 329.63, x: 0.075 },
  ];

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. BODY (Lower & Upper bouts contour) */}
      <PartMeshWrapper partKey="body" explodeVector={parts.body?.explodeVector || [0, 0, 0]}>
        <group>
          {/* Lower bout */}
          <mesh position={[0, -0.65, 0]}>
            <cylinderGeometry args={[0.75, 0.75, 0.24, 32]} />
            <meshStandardMaterial {...getMaterialProps('body', '#3A1E14', 0.45, 0.15)} />
          </mesh>
          {/* Waist */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.24, 32]} />
            <meshStandardMaterial {...getMaterialProps('body', '#3A1E14', 0.45, 0.15)} />
          </mesh>
          {/* Upper bout */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 0.24, 32]} />
            <meshStandardMaterial {...getMaterialProps('body', '#3A1E14', 0.45, 0.15)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. SOUNDBOARD (Top Spruce Plate) */}
      <PartMeshWrapper
        partKey="soundboard"
        explodeVector={parts.soundboard?.explodeVector || [0, 0, 0.45]}
      >
        <group position={[0, 0, 0.12]}>
          <mesh position={[0, -0.65, 0]}>
            <cylinderGeometry args={[0.74, 0.74, 0.02, 32]} />
            <meshStandardMaterial {...getMaterialProps('soundboard', '#D4A373', 0.3, 0.05)} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.54, 0.54, 0.02, 32]} />
            <meshStandardMaterial {...getMaterialProps('soundboard', '#D4A373', 0.3, 0.05)} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.61, 0.61, 0.02, 32]} />
            <meshStandardMaterial {...getMaterialProps('soundboard', '#D4A373', 0.3, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. SOUNDHOLE & ROSETTE */}
      <PartMeshWrapper
        partKey="soundhole"
        explodeVector={parts.soundhole?.explodeVector || [0, 0.15, 0.5]}
      >
        <group position={[0, 0.15, 0.135]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.025, 32]} />
            <meshStandardMaterial {...getMaterialProps('soundhole', '#120904', 0.9, 0.0)} />
          </mesh>
          {/* Rosette ring */}
          <mesh position={[0, 0, 0.005]}>
            <ringGeometry args={[0.22, 0.28, 32]} />
            <meshStandardMaterial color="#E8C88A" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. BRIDGE & SADDLE */}
      <PartMeshWrapper
        partKey="bridge"
        explodeVector={parts.bridge?.explodeVector || [0, -0.2, 0.55]}
      >
        <group position={[0, -0.65, 0.14]}>
          <mesh>
            <boxGeometry args={[0.38, 0.12, 0.04]} />
            <meshStandardMaterial {...getMaterialProps('bridge', '#1A1412', 0.5, 0.1)} />
          </mesh>
          {/* White bone saddle */}
          <mesh position={[0, 0.01, 0.025]}>
            <boxGeometry args={[0.28, 0.015, 0.02]} />
            <meshStandardMaterial color="#F4F1EA" roughness={0.2} metalness={0.05} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. NECK */}
      <PartMeshWrapper partKey="neck" explodeVector={parts.neck?.explodeVector || [0, 0.6, 0]}>
        <group position={[0, 1.45, 0.04]}>
          <mesh>
            <boxGeometry args={[0.2, 1.4, 0.1]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#4A2A1A', 0.35, 0.1)} />
          </mesh>
          {/* Headstock */}
          <mesh position={[0, 0.85, 0.02]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.25, 0.45, 0.08]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#3A1E14', 0.3, 0.15)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 6. FRETBOARD & FRETS */}
      <PartMeshWrapper
        partKey="fretboard"
        explodeVector={parts.fretboard?.explodeVector || [0, 0.6, 0.2]}
      >
        <group position={[0, 1.35, 0.1]}>
          <mesh>
            <boxGeometry args={[0.21, 1.3, 0.025]} />
            <meshStandardMaterial {...getMaterialProps('fretboard', '#141414', 0.4, 0.1)} />
          </mesh>
          {/* Nickel Frets */}
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={i} position={[0, -0.55 + i * 0.085, 0.015]}>
              <boxGeometry args={[0.21, 0.008, 0.006]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 7. TUNING PEGS */}
      <PartMeshWrapper
        partKey="tuning_pegs"
        explodeVector={parts.tuning_pegs?.explodeVector || [0, 1.2, 0]}
      >
        <group position={[0, 2.3, 0.06]}>
          {[-0.14, 0.14].map((x, colIdx) =>
            [0, 0.1, 0.2].map((y, rowIdx) => (
              <mesh key={`${colIdx}-${rowIdx}`} position={[x, y, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.08, 16]} />
                <meshStandardMaterial {...getMaterialProps('tuning_pegs', '#E2B855', 0.2, 0.9)} />
              </mesh>
            ))
          )}
        </group>
      </PartMeshWrapper>

      {/* 8. TENSIONED STRINGS */}
      <PartMeshWrapper
        partKey="strings"
        explodeVector={parts.strings?.explodeVector || [0, 0, 0.7]}
      >
        <group ref={stringsRef} position={[0, 0.3, 0.14]}>
          {stringNotes.map((str, idx) => (
            <mesh
              key={str.name}
              position={[str.x, 0, 0]}
              onClick={(e) => handleStringClick(str.name, str.freq, idx, e)}
            >
              <cylinderGeometry args={[0.004 + (5 - idx) * 0.0012, 0.004 + (5 - idx) * 0.0012, 2.5, 8]} />
              <meshStandardMaterial
                {...getMaterialProps('strings', '#E8C568', 0.15, 0.95)}
                emissive="#614A0A"
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

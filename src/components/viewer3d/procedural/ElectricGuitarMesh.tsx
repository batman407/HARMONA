import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface ElectricGuitarMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const ElectricGuitarMesh: React.FC<ElectricGuitarMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const stringsRef = useRef<THREE.Group>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.25, metalness = 0.2) => {
    const isSelected = selectedPartKey === partKey;
    const isHovered = hoveredPartKey === partKey;

    if (isGhostMode) {
      return {
        color: isSelected ? '#F2C14E' : '#4E6B99',
        transparent: true,
        opacity: isSelected ? 0.8 : 0.2,
        roughness: 0.1,
        metalness: 0.2,
      };
    }

    return {
      color: isSelected ? '#FFD36A' : isHovered ? '#F0B938' : baseColor,
      roughness: isSelected ? 0.15 : roughness,
      metalness: isSelected ? 0.4 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  useFrame((state) => {
    if (!stringsRef.current) return;
    const vib = useViewerStore.getState().vibrationIntensity;
    if (vib > 0) {
      stringsRef.current.children.forEach((child, idx) => {
        const offset = Math.sin(state.clock.elapsedTime * 70 + idx) * 0.007 * vib;
        child.position.z = 0.16 + offset;
      });
    }
  });

  const handleStringClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playElectricGuitar(freq);
    triggerVibration(1.1);
    setLastPlayedNote({ note: noteName, freq });
  };

  const stringNotes = [
    { name: 'E2', freq: 82.41, x: -0.06 },
    { name: 'A2', freq: 110.0, x: -0.036 },
    { name: 'D3', freq: 146.83, x: -0.012 },
    { name: 'G3', freq: 196.0, x: 0.012 },
    { name: 'B3', freq: 246.94, x: 0.036 },
    { name: 'E4', freq: 329.63, x: 0.06 },
  ];

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. SOLID BODY (Les Paul / Strat style cutaway) */}
      <PartMeshWrapper partKey="body" explodeVector={parts.body?.explodeVector || [0, 0, 0]}>
        <group position={[0, -0.5, 0]}>
          {/* Main slab */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.25, 0.18]} />
            <meshStandardMaterial {...getMaterialProps('body', '#B31B1B', 0.2, 0.3)} />
          </mesh>
          {/* Upper bout curves */}
          <mesh position={[-0.32, 0.35, 0]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#961515', 0.2, 0.3)} />
          </mesh>
          <mesh position={[0.32, 0.3, 0]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.18, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#961515', 0.2, 0.3)} />
          </mesh>
          {/* Lower bout curves */}
          <mesh position={[-0.3, -0.3, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.18, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#851010', 0.2, 0.3)} />
          </mesh>
          <mesh position={[0.3, -0.3, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.18, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#851010', 0.2, 0.3)} />
          </mesh>
          {/* Pickguard */}
          <mesh position={[-0.14, 0.05, 0.095]}>
            <boxGeometry args={[0.32, 0.65, 0.015]} />
            <meshStandardMaterial {...getMaterialProps('body', '#E8E8DF', 0.4, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. PICKUPS (Dual Humbuckers) */}
      <PartMeshWrapper partKey="pickups" explodeVector={parts.pickups?.explodeVector || [0, 0.25, 0.5]}>
        <group position={[0, -0.42, 0.1]}>
          {/* Neck Humbucker */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.32, 0.13, 0.06]} />
            <meshStandardMaterial {...getMaterialProps('pickups', '#1C1C1E', 0.3, 0.8)} />
          </mesh>
          {/* Bridge Humbucker */}
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.32, 0.13, 0.06]} />
            <meshStandardMaterial {...getMaterialProps('pickups', '#1C1C1E', 0.3, 0.8)} />
          </mesh>
          {/* Pole pieces */}
          {[-0.1, -0.06, -0.02, 0.02, 0.06, 0.1].map((px, i) => (
            <React.Fragment key={i}>
              <mesh position={[px, 0.18, 0.035]}>
                <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
                <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[px, -0.12, 0.035]}>
                <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
                <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.1} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 3. TUNE-O-MATIC BRIDGE & TAILPIECE */}
      <PartMeshWrapper partKey="bridge" explodeVector={parts.bridge?.explodeVector || [0, -0.15, 0.55]}>
        <group position={[0, -0.76, 0.1]}>
          {/* Tune-o-matic saddle */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.3, 0.05, 0.04]} />
            <meshStandardMaterial {...getMaterialProps('bridge', '#D4D4D8', 0.2, 0.9)} />
          </mesh>
          {/* Stopbar tailpiece */}
          <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.28, 16]} />
            <meshStandardMaterial {...getMaterialProps('bridge', '#C4C4C8', 0.2, 0.9)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. NECK & HEADSTOCK */}
      <PartMeshWrapper partKey="neck" explodeVector={parts.neck?.explodeVector || [0, 0.7, 0]}>
        <group position={[0, 0.85, 0.02]}>
          {/* Maple shaft */}
          <mesh position={[0, 0, -0.02]} castShadow>
            <boxGeometry args={[0.16, 1.4, 0.08]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#D2A679', 0.4, 0.05)} />
          </mesh>
          {/* Headstock angled */}
          <mesh position={[0, 0.85, -0.04]} rotation={[-0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.22, 0.38, 0.07]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#1C1C1E', 0.3, 0.2)} />
          </mesh>
          {/* Tuning pegs */}
          {[-0.12, 0.12].map((side, sIdx) =>
            [0.72, 0.82, 0.92].map((y, pIdx) => (
              <mesh key={`${sIdx}-${pIdx}`} position={[side, y, -0.04]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.015, 0.015, 0.07, 12]} />
                <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.1} />
              </mesh>
            ))
          )}
        </group>
      </PartMeshWrapper>

      {/* 5. FRETBOARD */}
      <PartMeshWrapper partKey="fretboard" explodeVector={parts.fretboard?.explodeVector || [0, 0.7, 0.2]}>
        <group position={[0, 0.85, 0.07]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 1.4, 0.02]} />
            <meshStandardMaterial {...getMaterialProps('fretboard', '#2C1B10', 0.5, 0.05)} />
          </mesh>
          {/* Frets */}
          {Array.from({ length: 22 }).map((_, i) => (
            <mesh key={i} position={[0, -0.65 + i * 0.06, 0.012]}>
              <boxGeometry args={[0.14, 0.005, 0.005]} />
              <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 6. STRINGS */}
      <PartMeshWrapper partKey="strings" explodeVector={parts.strings?.explodeVector || [0, 0, 0.7]}>
        <group ref={stringsRef} position={[0, 0.25, 0.09]}>
          {stringNotes.map((str, idx) => (
            <mesh
              key={idx}
              position={[str.x, 0, 0]}
              onClick={(e) => handleStringClick(str.name, str.freq, e)}
            >
              <cylinderGeometry args={[0.004 + (5 - idx) * 0.001, 0.004 + (5 - idx) * 0.001, 2.1, 8]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'strings' ? '#FFD36A' : '#E6E6FA'}
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 7. VOLUME / TONE KNOBS */}
      <PartMeshWrapper partKey="knobs" explodeVector={parts.knobs?.explodeVector || [0.5, -0.3, 0.35]}>
        <group position={[0.26, -0.65, 0.1]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
            <meshStandardMaterial {...getMaterialProps('knobs', '#C8963E', 0.2, 0.7)} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
            <meshStandardMaterial {...getMaterialProps('knobs', '#C8963E', 0.2, 0.7)} />
          </mesh>
          <mesh position={[0.02, -0.1, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
            <meshStandardMaterial {...getMaterialProps('knobs', '#C8963E', 0.2, 0.7)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 8. OUTPUT JACK */}
      <PartMeshWrapper partKey="output_jack" explodeVector={parts.output_jack?.explodeVector || [0.8, -0.5, 0]}>
        <mesh position={[0.4, -0.9, 0.02]} rotation={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial {...getMaterialProps('output_jack', '#DDDDDD', 0.1, 0.9)} />
        </mesh>
      </PartMeshWrapper>
    </group>
  );
};

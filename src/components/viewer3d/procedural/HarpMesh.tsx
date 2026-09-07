import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface HarpMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const HarpMesh: React.FC<HarpMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const stringsRef = useRef<THREE.Group>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.25, metalness = 0.3) => {
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
      metalness: isSelected ? 0.5 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  useFrame((state) => {
    if (!stringsRef.current) return;
    const vib = useViewerStore.getState().vibrationIntensity;
    if (vib > 0) {
      stringsRef.current.children.forEach((child, idx) => {
        const offset = Math.sin(state.clock.elapsedTime * 65 + idx) * 0.007 * vib;
        child.position.z = offset;
      });
    }
  });

  const handleStringClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playHarp(freq);
    triggerVibration(1.1);
    setLastPlayedNote({ note: noteName, freq });
  };

  const harpNotes = [
    { name: 'C3', freq: 130.81, x: 0.3, len: 1.55, color: '#D22B2B' },
    { name: 'E3', freq: 164.81, x: 0.22, len: 1.45, color: '#EAEAEA' },
    { name: 'G3', freq: 196.0, x: 0.14, len: 1.35, color: '#EAEAEA' },
    { name: 'C4', freq: 261.63, x: 0.06, len: 1.25, color: '#D22B2B' },
    { name: 'E4', freq: 329.63, x: -0.02, len: 1.15, color: '#EAEAEA' },
    { name: 'G4', freq: 392.0, x: -0.1, len: 1.05, color: '#EAEAEA' },
    { name: 'C5', freq: 523.25, x: -0.18, len: 0.95, color: '#D22B2B' },
    { name: 'E5', freq: 659.25, x: -0.26, len: 0.85, color: '#EAEAEA' },
    { name: 'G5', freq: 783.99, x: -0.34, len: 0.75, color: '#EAEAEA' },
    { name: 'C6', freq: 1046.5, x: -0.42, len: 0.65, color: '#D22B2B' },
  ];

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. RESONATOR BOX */}
      <PartMeshWrapper partKey="resonator" explodeVector={parts.resonator?.explodeVector || [0, 0, 0]}>
        <group position={[0.25, -0.1, 0]} rotation={[0, 0, -0.28]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.35, 1.9, 16]} />
            <meshStandardMaterial {...getMaterialProps('resonator', '#6D2B12', 0.3, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. SOUNDBOARD */}
      <PartMeshWrapper partKey="soundboard" explodeVector={parts.soundboard?.explodeVector || [0, 0, 0.6]}>
        <group position={[0.22, -0.1, 0.14]} rotation={[0, 0, -0.28]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 1.85, 0.02]} />
            <meshStandardMaterial {...getMaterialProps('soundboard', '#D2B48C', 0.4, 0.05)} />
          </mesh>
          {/* Central strip anchor */}
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.04, 1.8, 0.015]} />
            <meshStandardMaterial color="#3E2010" roughness={0.4} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. CURVED NECK (Harmonic Curve) */}
      <PartMeshWrapper partKey="neck" explodeVector={parts.neck?.explodeVector || [0, 1.0, 0.2]}>
        <group position={[-0.1, 0.92, 0]}>
          <mesh rotation={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[1.2, 0.18, 0.16]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#591E0A', 0.25, 0.3)} />
          </mesh>
          {/* Gold pedal discs */}
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[-0.45 + i * 0.08, -0.06, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 4. PILLAR COLUMN */}
      <PartMeshWrapper partKey="pillar" explodeVector={parts.pillar?.explodeVector || [-0.5, 0, 0]}>
        <group position={[-0.65, -0.05, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.08, 1.95, 24]} />
            <meshStandardMaterial {...getMaterialProps('pillar', '#D4AF37', 0.2, 0.85)} />
          </mesh>
          {/* Capital top */}
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.12, 0.06, 0.15, 24]} />
            <meshStandardMaterial color="#E5C158" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. STRINGS ARRAY */}
      <PartMeshWrapper partKey="strings" explodeVector={parts.strings?.explodeVector || [0.3, 0, 0.5]}>
        <group ref={stringsRef} position={[0, 0, 0.05]}>
          {harpNotes.map((str, idx) => (
            <mesh
              key={idx}
              position={[str.x, -0.8 + str.len / 2, 0]}
              onClick={(e) => handleStringClick(str.name, str.freq, e)}
            >
              <cylinderGeometry args={[0.0035, 0.0035, str.len, 8]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'strings' ? '#FFD36A' : str.color}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 6. PEDALS */}
      <PartMeshWrapper partKey="pedals" explodeVector={parts.pedals?.explodeVector || [0, -0.8, 0.3]}>
        <group position={[-0.2, -1.05, 0]}>
          {/* Pedestal base */}
          <mesh position={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.14, 0.45]} />
            <meshStandardMaterial {...getMaterialProps('pedals', '#3E2010', 0.4, 0.1)} />
          </mesh>
          {/* 7 Brass foot pedals */}
          {[-0.35, -0.23, -0.11, 0.05, 0.17, 0.29, 0.41].map((px, i) => (
            <mesh key={i} position={[px, -0.02, 0.22]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.04, 0.025, 0.14]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

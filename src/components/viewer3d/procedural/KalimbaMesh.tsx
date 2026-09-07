import React, { useRef } from 'react';
import * as THREE from 'three';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface KalimbaMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const KalimbaMesh: React.FC<KalimbaMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.35, metalness = 0.15) => {
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
      roughness: isSelected ? 0.2 : roughness,
      metalness: isSelected ? 0.4 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleTineClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playKalimba(freq);
    triggerVibration(1.1);
    setLastPlayedNote({ note: noteName, freq });
  };

  // 17-key V-shape layout for kalimba tines
  const tineKeys = [
    { name: 'D6', freq: 1174.66, x: -0.32, len: 0.28 },
    { name: 'B5', freq: 987.77, x: -0.28, len: 0.32 },
    { name: 'G5', freq: 783.99, x: -0.24, len: 0.36 },
    { name: 'E5', freq: 659.25, x: -0.2, len: 0.4 },
    { name: 'C5', freq: 523.25, x: -0.16, len: 0.44 },
    { name: 'A4', freq: 440.0, x: -0.12, len: 0.48 },
    { name: 'F4', freq: 349.23, x: -0.08, len: 0.52 },
    { name: 'D4', freq: 293.66, x: -0.04, len: 0.56 },
    { name: 'C4', freq: 261.63, x: 0.0, len: 0.6 }, // Longest center tine
    { name: 'E4', freq: 329.63, x: 0.04, len: 0.56 },
    { name: 'G4', freq: 392.0, x: 0.08, len: 0.52 },
    { name: 'B4', freq: 493.88, x: 0.12, len: 0.48 },
    { name: 'D5', freq: 587.33, x: 0.16, len: 0.44 },
    { name: 'F5', freq: 698.46, x: 0.2, len: 0.4 },
    { name: 'A5', freq: 880.0, x: 0.24, len: 0.36 },
    { name: 'C6', freq: 1046.5, x: 0.28, len: 0.32 },
    { name: 'E6', freq: 1318.51, x: 0.32, len: 0.28 },
  ];

  return (
    <group position={[0, -0.1, 0]} rotation={[0.4, 0, 0]}>
      {/* 1. SOLID / HOLLOW MAHOGANY SOUNDBOX */}
      <PartMeshWrapper partKey="soundbox" explodeVector={parts.soundbox?.explodeVector || [0, 0, -0.5]}>
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.85, 1.25, 0.22]} />
            <meshStandardMaterial {...getMaterialProps('soundbox', '#6A2E1A', 0.4, 0.05)} />
          </mesh>
          {/* Side ergonomics bevels */}
          <mesh position={[-0.43, 0, 0]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.04, 1.2, 0.2]} />
            <meshStandardMaterial color="#552212" roughness={0.4} />
          </mesh>
          <mesh position={[0.43, 0, 0]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.04, 1.2, 0.2]} />
            <meshStandardMaterial color="#552212" roughness={0.4} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. SOUNDHOLE (Rosette & Central Port) */}
      <PartMeshWrapper partKey="soundhole" explodeVector={parts.soundhole?.explodeVector || [0, -0.4, -0.2]}>
        <group position={[0, -0.22, 0.112]}>
          {/* Central circle aperture */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.005, 32]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Decorative carved rosette border */}
          <mesh>
            <torusGeometry args={[0.15, 0.01, 16, 32]} />
            <meshStandardMaterial color="#E6C24C" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. STEEL BRIDGE ROD & SADDLE */}
      <PartMeshWrapper partKey="bridge_rod" explodeVector={parts.bridge_rod?.explodeVector || [0, 0.2, 0.2]}>
        <group position={[0, 0.22, 0.12]}>
          {/* Wooden bridge pillow */}
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[0.74, 0.04, 0.02]} />
            <meshStandardMaterial color="#3A170B" roughness={0.5} />
          </mesh>
          {/* Polished steel rod */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.72, 16]} />
            <meshStandardMaterial color="#E0E0E6" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. RETAINING CLAMP BAR & BOLTS */}
      <PartMeshWrapper partKey="retaining_bar" explodeVector={parts.retaining_bar?.explodeVector || [0, 0.5, 0.3]}>
        <group position={[0, 0.36, 0.13]}>
          <mesh castShadow>
            <boxGeometry args={[0.74, 0.035, 0.025]} />
            <meshStandardMaterial {...getMaterialProps('retaining_bar', '#C8C8D2', 0.2, 0.9)} />
          </mesh>
          {/* 5 Mounting screws */}
          {[-0.3, -0.15, 0, 0.15, 0.3].map((bx, i) => (
            <mesh key={i} position={[bx, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.01, 12]} />
              <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 5. SPRING STEEL TINES (17 Keys in V-Layout) */}
      <PartMeshWrapper partKey="tines" explodeVector={parts.tines?.explodeVector || [0, 0, 0.7]}>
        <group position={[0, 0.22, 0.135]}>
          {tineKeys.map((tine, idx) => (
            <mesh
              key={idx}
              position={[tine.x, -tine.len / 2 + 0.12, 0]}
              onClick={(e) => handleTineClick(tine.name, tine.freq, e)}
            >
              <boxGeometry args={[0.028, tine.len, 0.008]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'tines' ? '#FFD36A' : '#E8EEF5'}
                metalness={0.95}
                roughness={0.12}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

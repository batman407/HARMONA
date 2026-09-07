import React, { useRef } from 'react';
import * as THREE from 'three';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface SaxophoneMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const SaxophoneMesh: React.FC<SaxophoneMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.2, metalness = 0.85) => {
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
      roughness: isSelected ? 0.1 : roughness,
      metalness: isSelected ? 0.95 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleKeyClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playSaxophone(freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: noteName, freq });
  };

  const saxNotes = [
    { name: 'D3', freq: 146.83, y: -0.2 },
    { name: 'G3', freq: 196.0, y: -0.05 },
    { name: 'C4', freq: 261.63, y: 0.1 },
    { name: 'E4', freq: 329.63, y: 0.25 },
    { name: 'A4', freq: 440.0, y: 0.4 },
    { name: 'G5', freq: 783.99, y: 0.55 },
  ];

  return (
    <group position={[-0.1, -0.2, 0]}>
      {/* 1. MAIN CONICAL BODY TUBE */}
      <PartMeshWrapper partKey="body" explodeVector={parts.body?.explodeVector || [0, 0, 0]}>
        <group position={[0, 0.1, 0]}>
          {/* Main vertical cone */}
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.11, 1.2, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#D4AF37', 0.2, 0.9)} />
          </mesh>
          {/* Bottom U-bow curve */}
          <mesh position={[0.15, -0.65, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.15, 0.08, 16, 24, Math.PI]} />
            <meshStandardMaterial {...getMaterialProps('body', '#D4AF37', 0.2, 0.9)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. BELL FLARE */}
      <PartMeshWrapper partKey="bell" explodeVector={parts.bell?.explodeVector || [0, -0.5, 0]}>
        <group position={[0.3, -0.2, 0]} rotation={[0, 0, -0.2]}>
          {/* Bell column */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.11, 0.7, 24]} />
            <meshStandardMaterial {...getMaterialProps('bell', '#E6C24C', 0.15, 0.92)} />
          </mesh>
          {/* Flared lip */}
          <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.26, 0.15, 28, 1, true]} />
            <meshStandardMaterial
              {...getMaterialProps('bell', '#FFD700', 0.15, 0.95)}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. CURVED NECK (CROOK) */}
      <PartMeshWrapper partKey="neck" explodeVector={parts.neck?.explodeVector || [0, 0.6, 0.2]}>
        <group position={[-0.05, 0.85, 0]} rotation={[0, 0, 0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.06, 0.35, 16]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#D4AF37', 0.2, 0.9)} />
          </mesh>
          {/* Octave key lever */}
          <mesh position={[0.04, 0.08, 0]}>
            <boxGeometry args={[0.015, 0.15, 0.015]} />
            <meshStandardMaterial color="#B08D25" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. MOUTHPIECE & REED */}
      <PartMeshWrapper partKey="mouthpiece" explodeVector={parts.mouthpiece?.explodeVector || [0, 0.9, 0]}>
        <group position={[-0.22, 1.05, 0]} rotation={[0, 0, 0.8]}>
          {/* Black Ebonite mouthpiece */}
          <mesh castShadow>
            <coneGeometry args={[0.04, 0.16, 16]} />
            <meshStandardMaterial {...getMaterialProps('mouthpiece', '#1A1A1A', 0.4, 0.1)} />
          </mesh>
          {/* Gold ligature */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.05, 16]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Cane reed */}
          <mesh position={[0.025, -0.01, 0]}>
            <boxGeometry args={[0.01, 0.14, 0.03]} />
            <meshStandardMaterial color="#E8D8A0" roughness={0.6} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. KEY CLUSTERS & PADS */}
      <PartMeshWrapper partKey="key_clusters" explodeVector={parts.key_clusters?.explodeVector || [0.4, 0, 0.3]}>
        <group position={[0.08, 0.1, 0.02]}>
          {saxNotes.map((k, idx) => (
            <group
              key={idx}
              position={[0, k.y, 0.04]}
              onClick={(e) => handleKeyClick(k.name, k.freq, e)}
            >
              {/* Key pad cup */}
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.015, 16]} />
                <meshStandardMaterial
                  color={hoveredPartKey === 'key_clusters' ? '#FFD36A' : '#F5F5DC'}
                  metalness={0.6}
                  roughness={0.25}
                />
              </mesh>
              {/* Pearl touch piece */}
              <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.008, 16]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
              </mesh>
            </group>
          ))}
          {/* Rod mechanism */}
          <mesh position={[0.04, 0.12, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.9, 12]} />
            <meshStandardMaterial color="#B58F28" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>
    </group>
  );
};

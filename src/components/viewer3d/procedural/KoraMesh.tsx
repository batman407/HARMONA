import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface KoraMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const KoraMesh: React.FC<KoraMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const stringsRef = useRef<THREE.Group>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.45, metalness = 0.1) => {
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

  useFrame((state) => {
    if (!stringsRef.current) return;
    const vib = useViewerStore.getState().vibrationIntensity;
    if (vib > 0) {
      stringsRef.current.children.forEach((child, idx) => {
        const offset = Math.sin(state.clock.elapsedTime * 65 + idx) * 0.007 * vib;
        child.position.z = 0.22 + offset;
      });
    }
  });

  const handleStringClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playKora(freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: noteName, freq });
  };

  const koraNotes = [
    { name: 'F2', freq: 87.31, x: -0.06, side: 'left' },
    { name: 'C3', freq: 130.81, x: -0.038, side: 'left' },
    { name: 'F3', freq: 174.61, x: -0.016, side: 'left' },
    { name: 'A3', freq: 220.0, x: 0.016, side: 'right' },
    { name: 'C4', freq: 261.63, x: 0.038, side: 'right' },
    { name: 'E4', freq: 329.63, x: 0.06, side: 'right' },
  ];

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. CALABASH GOURD RESONATOR (Half Sphere) */}
      <PartMeshWrapper partKey="calabash" explodeVector={parts.calabash?.explodeVector || [0, 0, -0.6]}>
        <group position={[0, -0.25, -0.1]}>
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              {...getMaterialProps('calabash', '#9C5B23', 0.5, 0.05)}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Side soundhole port */}
          <mesh position={[0.38, 0, -0.2]} rotation={[0, Math.PI / 3, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. COWSKIN SOUND TABLE */}
      <PartMeshWrapper partKey="skin_table" explodeVector={parts.skin_table?.explodeVector || [0, 0, 0.4]}>
        <group position={[0, -0.25, 0.01]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.54, 0.54, 0.02, 32]} />
            <meshStandardMaterial {...getMaterialProps('skin_table', '#D7C7B0', 0.65, 0.05)} />
          </mesh>
          {/* Chrome / brass tacks along perimeter */}
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i / 28) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.53, 0.012, Math.sin(a) * 0.53]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color="#E6C24C" metalness={0.9} roughness={0.2} />
              </mesh>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 3. HARDWOOD NECK (SPIKE) */}
      <PartMeshWrapper partKey="neck_stick" explodeVector={parts.neck_stick?.explodeVector || [0, 0.8, 0]}>
        <group position={[0, 0.4, 0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.038, 0.038, 2.2, 20]} />
            <meshStandardMaterial {...getMaterialProps('neck_stick', '#4A2312', 0.35, 0.1)} />
          </mesh>
          {/* Iron ring tuning loops / leather konso */}
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[0, 0.45 + i * 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.042, 0.008, 12, 24]} />
              <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 4. NOTCHED ROSEWOOD BRIDGE */}
      <PartMeshWrapper partKey="bridge" explodeVector={parts.bridge?.explodeVector || [0, 0, 0.8]}>
        <group position={[0, -0.22, 0.12]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.28, 0.03]} />
            <meshStandardMaterial {...getMaterialProps('bridge', '#6D2B12', 0.4, 0.05)} />
          </mesh>
          {/* Leather cushion base */}
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[0.22, 0.025, 0.08]} />
            <meshStandardMaterial color="#8B0000" roughness={0.6} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. HANDPOSTS & CROSSBAR */}
      <PartMeshWrapper partKey="handposts" explodeVector={parts.handposts?.explodeVector || [0.4, 0, 0.2]}>
        <group position={[0, -0.2, 0.06]}>
          {/* Left handpost */}
          <mesh position={[-0.26, 0.15, 0]} rotation={[0, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.7, 16]} />
            <meshStandardMaterial {...getMaterialProps('handposts', '#5A2A18', 0.4, 0.05)} />
          </mesh>
          {/* Right handpost */}
          <mesh position={[0.26, 0.15, 0]} rotation={[0, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.7, 16]} />
            <meshStandardMaterial {...getMaterialProps('handposts', '#5A2A18', 0.4, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 6. STRINGS */}
      <PartMeshWrapper partKey="strings" explodeVector={parts.strings?.explodeVector || [0, 0, 1.0]}>
        <group ref={stringsRef} position={[0, 0.35, 0.12]}>
          {koraNotes.map((str, idx) => (
            <mesh
              key={idx}
              position={[str.x, 0, 0]}
              onClick={(e) => handleStringClick(str.name, str.freq, e)}
            >
              <cylinderGeometry args={[0.003, 0.003, 1.7, 8]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'strings' ? '#FFD36A' : '#E8EEF5'}
                roughness={0.2}
                metalness={0.7}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

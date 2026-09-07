import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface ViolinMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const ViolinMesh: React.FC<ViolinMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const stringsRef = useRef<THREE.Group>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.35, metalness = 0.1) => {
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
        const offset = Math.sin(state.clock.elapsedTime * 60 + idx) * 0.006 * vib;
        child.position.z = 0.14 + offset;
      });
    }
  });

  const handleStringClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playViolin(freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: noteName, freq });
  };

  const violinNotes = [
    { name: 'G3', freq: 196.0, x: -0.035 },
    { name: 'D4', freq: 293.66, x: -0.012 },
    { name: 'A4', freq: 440.0, x: 0.012 },
    { name: 'E5', freq: 659.25, x: 0.035 },
  ];

  return (
    <group position={[0, -0.15, 0]}>
      {/* 1. BODY (Back plate & ribs) */}
      <PartMeshWrapper partKey="body" explodeVector={parts.body?.explodeVector || [0, 0, 0]}>
        <group position={[0, -0.4, 0]}>
          {/* Lower bout */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.12, 32]} />
            <meshStandardMaterial {...getMaterialProps('body', '#8D3A1B', 0.3, 0.1)} />
          </mesh>
          {/* Waist (C-bouts) */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 32]} />
            <meshStandardMaterial {...getMaterialProps('body', '#803417', 0.3, 0.1)} />
          </mesh>
          {/* Upper bout */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.12, 32]} />
            <meshStandardMaterial {...getMaterialProps('body', '#8D3A1B', 0.3, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. TOP PLATE */}
      <PartMeshWrapper partKey="top_plate" explodeVector={parts.top_plate?.explodeVector || [0, 0, 0.5]}>
        <group position={[0, -0.4, 0.065]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.33, 0.33, 0.015, 32]} />
            <meshStandardMaterial {...getMaterialProps('top_plate', '#A64B2A', 0.25, 0.08)} />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.21, 0.21, 0.015, 32]} />
            <meshStandardMaterial {...getMaterialProps('top_plate', '#A64B2A', 0.25, 0.08)} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.27, 0.015, 32]} />
            <meshStandardMaterial {...getMaterialProps('top_plate', '#A64B2A', 0.25, 0.08)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. F-HOLES */}
      <PartMeshWrapper partKey="f_holes" explodeVector={parts.f_holes?.explodeVector || [0, 0.1, 0.55]}>
        <group position={[0, -0.38, 0.075]}>
          <mesh position={[-0.11, 0.02, 0]}>
            <boxGeometry args={[0.025, 0.22, 0.005]} />
            <meshStandardMaterial {...getMaterialProps('f_holes', '#111111', 0.8, 0.1)} />
          </mesh>
          <mesh position={[0.11, 0.02, 0]}>
            <boxGeometry args={[0.025, 0.22, 0.005]} />
            <meshStandardMaterial {...getMaterialProps('f_holes', '#111111', 0.8, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. BRIDGE */}
      <PartMeshWrapper partKey="bridge" explodeVector={parts.bridge?.explodeVector || [0, -0.05, 0.5]}>
        <group position={[0, -0.38, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.09, 0.02]} />
            <meshStandardMaterial {...getMaterialProps('bridge', '#D2B48C', 0.5, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. STRINGS */}
      <PartMeshWrapper partKey="strings" explodeVector={parts.strings?.explodeVector || [0, 0.05, 0.6]}>
        <group ref={stringsRef} position={[0, 0.1, 0.12]}>
          {violinNotes.map((str, idx) => (
            <mesh
              key={idx}
              position={[str.x, 0, 0]}
              onClick={(e) => handleStringClick(str.name, str.freq, e)}
            >
              <cylinderGeometry args={[0.003 + (3 - idx) * 0.001, 0.003 + (3 - idx) * 0.001, 1.8, 8]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'strings' ? '#FFD36A' : '#E8E8E8'}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 6. FINGERBOARD */}
      <PartMeshWrapper partKey="fingerboard" explodeVector={parts.fingerboard?.explodeVector || [0, 0.5, 0.15]}>
        <group position={[0, 0.25, 0.09]}>
          <mesh castShadow>
            <boxGeometry args={[0.09, 1.1, 0.025]} />
            <meshStandardMaterial {...getMaterialProps('fingerboard', '#181818', 0.35, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 7. CHINREST & TAILPIECE */}
      <PartMeshWrapper partKey="chinrest" explodeVector={parts.chinrest?.explodeVector || [0, -0.3, 0.3]}>
        <group position={[0, -0.85, 0.09]}>
          {/* Ebony tailpiece */}
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI]} castShadow>
            <coneGeometry args={[0.06, 0.25, 4]} />
            <meshStandardMaterial {...getMaterialProps('chinrest', '#151515', 0.3, 0.1)} />
          </mesh>
          {/* Chinrest cup */}
          <mesh position={[-0.14, -0.05, 0.03]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
            <meshStandardMaterial {...getMaterialProps('chinrest', '#221612', 0.4, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 8. SCROLL & PEGBOX */}
      <PartMeshWrapper partKey="scroll" explodeVector={parts.scroll?.explodeVector || [0, 1.1, 0]}>
        <group position={[0, 1.05, 0.02]}>
          {/* Pegbox */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.26, 0.07]} />
            <meshStandardMaterial {...getMaterialProps('scroll', '#8D3A1B', 0.4, 0.1)} />
          </mesh>
          {/* Scroll spiral */}
          <mesh position={[0, 0.2, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.06, 0.03, 16, 32]} />
            <meshStandardMaterial {...getMaterialProps('scroll', '#7A3217', 0.4, 0.1)} />
          </mesh>
          {/* 4 Pegs */}
          {[-0.08, -0.02, 0.04, 0.1].map((py, i) => (
            <mesh key={i} position={[i % 2 === 0 ? -0.06 : 0.06, py, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 0.14, 12]} />
              <meshStandardMaterial color="#111111" roughness={0.3} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

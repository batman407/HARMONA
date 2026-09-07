import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface BassGuitarMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const BassGuitarMesh: React.FC<BassGuitarMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const stringsRef = useRef<THREE.Group>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.3, metalness = 0.15) => {
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
        const offset = Math.sin(state.clock.elapsedTime * 45 + idx) * 0.012 * vib;
        child.position.z = 0.15 + offset;
      });
    }
  });

  const handleStringClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playBassGuitar(freq);
    triggerVibration(1.4);
    setLastPlayedNote({ note: noteName, freq });
  };

  const bassNotes = [
    { name: 'E1', freq: 41.2, x: -0.05 },
    { name: 'A1', freq: 55.0, x: -0.017 },
    { name: 'D2', freq: 73.42, x: 0.017 },
    { name: 'G2', freq: 98.0, x: 0.05 },
  ];

  return (
    <group position={[0, -0.3, 0]}>
      {/* 1. SOLID BASS BODY (Precision Bass style) */}
      <PartMeshWrapper partKey="body" explodeVector={parts.body?.explodeVector || [0, 0, 0]}>
        <group position={[0, -0.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.95, 1.35, 0.18]} />
            <meshStandardMaterial {...getMaterialProps('body', '#1A2332', 0.35, 0.25)} />
          </mesh>
          {/* Extended upper horn */}
          <mesh position={[-0.38, 0.42, 0]} rotation={[0, 0, 0.25]}>
            <cylinderGeometry args={[0.2, 0.22, 0.22, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#161D2A', 0.35, 0.25)} />
          </mesh>
          {/* Lower horn */}
          <mesh position={[0.34, 0.25, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.18, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#161D2A', 0.35, 0.25)} />
          </mesh>
          {/* Tortoise shell style pickguard */}
          <mesh position={[-0.1, 0.05, 0.095]}>
            <boxGeometry args={[0.42, 0.75, 0.015]} />
            <meshStandardMaterial {...getMaterialProps('body', '#4A1E14', 0.4, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. SPLIT-COIL PICKUP */}
      <PartMeshWrapper partKey="pickup" explodeVector={parts.pickup?.explodeVector || [0, 0.2, 0.45]}>
        <group position={[0, -0.48, 0.1]}>
          {/* Upper pair for E and A */}
          <mesh position={[-0.035, 0.06, 0]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.05]} />
            <meshStandardMaterial {...getMaterialProps('pickup', '#111111', 0.3, 0.7)} />
          </mesh>
          {/* Lower pair for D and G */}
          <mesh position={[0.035, -0.06, 0]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.05]} />
            <meshStandardMaterial {...getMaterialProps('pickup', '#111111', 0.3, 0.7)} />
          </mesh>
          {/* Pole magnets */}
          {[-0.07, -0.01, 0.01, 0.07].map((px, i) => (
            <mesh key={i} position={[px, i < 2 ? 0.06 : -0.06, 0.028]}>
              <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
              <meshStandardMaterial color="#DDDDDD" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 3. HEAVY BASS BRIDGE */}
      <PartMeshWrapper partKey="bridge" explodeVector={parts.bridge?.explodeVector || [0, -0.1, 0.5]}>
        <group position={[0, -0.92, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.12, 0.04]} />
            <meshStandardMaterial {...getMaterialProps('bridge', '#DCDCDC', 0.15, 0.95)} />
          </mesh>
          {/* 4 heavy saddles */}
          {[-0.05, -0.017, 0.017, 0.05].map((bx, i) => (
            <mesh key={i} position={[bx, 0.02, 0.025]}>
              <boxGeometry args={[0.02, 0.04, 0.02]} />
              <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 4. LONG-SCALE NECK */}
      <PartMeshWrapper partKey="neck" explodeVector={parts.neck?.explodeVector || [0, 0.8, 0]}>
        <group position={[0, 0.95, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 1.7, 0.08]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#DEB887', 0.45, 0.05)} />
          </mesh>
          {/* Headstock */}
          <mesh position={[0.03, 1.05, -0.03]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.22, 0.45, 0.06]} />
            <meshStandardMaterial {...getMaterialProps('neck', '#DEB887', 0.45, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. FRETBOARD */}
      <PartMeshWrapper partKey="fretboard" explodeVector={parts.fretboard?.explodeVector || [0, 0.8, 0.18]}>
        <group position={[0, 0.95, 0.07]}>
          <mesh castShadow>
            <boxGeometry args={[0.13, 1.7, 0.02]} />
            <meshStandardMaterial {...getMaterialProps('fretboard', '#E8C39E', 0.4, 0.05)} />
          </mesh>
          {/* Frets */}
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[0, -0.8 + i * 0.08, 0.012]}>
              <boxGeometry args={[0.12, 0.006, 0.005]} />
              <meshStandardMaterial color="#B0B0B0" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 6. STRINGS */}
      <PartMeshWrapper partKey="strings" explodeVector={parts.strings?.explodeVector || [0, 0, 0.7]}>
        <group ref={stringsRef} position={[0, 0.35, 0.09]}>
          {bassNotes.map((str, idx) => (
            <mesh
              key={idx}
              position={[str.x, 0, 0]}
              onClick={(e) => handleStringClick(str.name, str.freq, e)}
            >
              <cylinderGeometry args={[0.008 + (3 - idx) * 0.002, 0.008 + (3 - idx) * 0.002, 2.5, 8]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'strings' ? '#FFD36A' : '#D0D0E0'}
                metalness={0.9}
                roughness={0.15}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 7. TUNERS */}
      <PartMeshWrapper partKey="tuners" explodeVector={parts.tuners?.explodeVector || [0, 1.1, 0]}>
        <group position={[0, 1.95, -0.03]}>
          {[-0.05, 0.04, 0.13, 0.22].map((ty, i) => (
            <mesh key={i} position={[-0.1, ty, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
              <meshStandardMaterial {...getMaterialProps('tuners', '#D4D4D8', 0.2, 0.9)} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

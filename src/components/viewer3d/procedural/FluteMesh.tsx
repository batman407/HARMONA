import React from 'react';
import * as THREE from 'three';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface FluteMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const FluteMesh: React.FC<FluteMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.15, metalness = 0.95) => {
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
      metalness: isSelected ? 0.98 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleKeyClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playFlute(freq);
    triggerVibration(1.1);
    setLastPlayedNote({ note: noteName, freq });
  };

  const fluteNotes = [
    { name: 'C4', freq: 261.63, x: -0.45 },
    { name: 'E4', freq: 329.63, x: -0.25 },
    { name: 'G4', freq: 392.0, x: -0.05 },
    { name: 'A4', freq: 440.0, x: 0.15 },
    { name: 'C5', freq: 523.25, x: 0.35 },
    { name: 'G5', freq: 783.99, x: 0.55 },
  ];

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
      {/* 1. HEADJOINT & EMBOUCHURE */}
      <PartMeshWrapper partKey="headjoint" explodeVector={parts.headjoint?.explodeVector || [0, 0.8, 0]}>
        <group position={[0.7, 0, 0]}>
          {/* Head tube */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.5, 24]} />
            <meshStandardMaterial {...getMaterialProps('headjoint', '#E0E0E6', 0.15, 0.95)} />
          </mesh>
          {/* Crown cap */}
          <mesh position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.03, 24]} />
            <meshStandardMaterial {...getMaterialProps('headjoint', '#D4AF37', 0.2, 0.9)} />
          </mesh>
          {/* Lip plate & embouchure hole */}
          <mesh position={[0.05, 0.028, 0]} castShadow>
            <boxGeometry args={[0.09, 0.012, 0.045]} />
            <meshStandardMaterial color="#F5F5F5" metalness={0.98} roughness={0.1} />
          </mesh>
          {/* Embouchure hole aperture */}
          <mesh position={[0.05, 0.035, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. MAIN BODY TUBE */}
      <PartMeshWrapper partKey="body" explodeVector={parts.body?.explodeVector || [0, 0, 0]}>
        <group position={[0.05, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.9, 24]} />
            <meshStandardMaterial {...getMaterialProps('body', '#E0E0E6', 0.15, 0.95)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. BOEHM KEYWORK SYSTEM */}
      <PartMeshWrapper partKey="keywork" explodeVector={parts.keywork?.explodeVector || [0.35, 0, 0.25]}>
        <group position={[0, 0.03, 0]}>
          {/* Key rod along flute */}
          <mesh position={[0.05, 0.01, -0.02]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.85, 12]} />
            <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Interactive Key Cups */}
          {fluteNotes.map((k, idx) => (
            <mesh
              key={idx}
              position={[k.x, 0.005, 0]}
              onClick={(e) => handleKeyClick(k.name, k.freq, e)}
            >
              <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'keywork' ? '#FFD36A' : '#FAFAFA'}
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 4. FOOTJOINT */}
      <PartMeshWrapper partKey="footjoint" explodeVector={parts.footjoint?.explodeVector || [0, -0.7, 0]}>
        <group position={[-0.65, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.45, 24]} />
            <meshStandardMaterial {...getMaterialProps('footjoint', '#E0E0E6', 0.15, 0.95)} />
          </mesh>
          {/* Low key rollers */}
          {[-0.1, 0.05].map((rx, i) => (
            <mesh key={i} position={[rx, 0.03, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.012, 12]} />
              <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

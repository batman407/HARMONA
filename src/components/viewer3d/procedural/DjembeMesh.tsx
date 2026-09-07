import React from 'react';
import * as THREE from 'three';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface DjembeMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const DjembeMesh: React.FC<DjembeMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

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

  const handleStrike = (label: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playDjembe(freq);
    triggerVibration(1.4);
    setLastPlayedNote({ note: label, freq });
  };

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. GOBLET SHELL */}
      <PartMeshWrapper partKey="shell" explodeVector={parts.shell?.explodeVector || [0, 0, 0]}>
        <group position={[0, -0.2, 0]}>
          {/* Upper bowl (conical flared) */}
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.55, 0.32, 0.7, 32]} />
            <meshStandardMaterial {...getMaterialProps('shell', '#5C2D15', 0.5, 0.05)} />
          </mesh>
          {/* Narrow waist & lower flare tube */}
          <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.42, 0.85, 32]} />
            <meshStandardMaterial {...getMaterialProps('shell', '#4D2411', 0.5, 0.05)} />
          </mesh>
          {/* Bottom sound port opening */}
          <mesh position={[0, -0.83, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. GOATSKIN MEMBRANE (Batter Head) */}
      <PartMeshWrapper partKey="membrane" explodeVector={parts.membrane?.explodeVector || [0, 0.7, 0]}>
        <group position={[0, 0.51, 0]}>
          {/* Bass Center */}
          <mesh
            position={[0, 0.005, 0]}
            onClick={(e) => handleStrike('Bass', 98, e)}
          >
            <cylinderGeometry args={[0.28, 0.28, 0.015, 32]} />
            <meshStandardMaterial
              color={hoveredPartKey === 'membrane' ? '#FFD36A' : '#EDE8DC'}
              roughness={0.7}
            />
          </mesh>
          {/* Tone / Slap Outer Ring */}
          <mesh
            position={[0, 0, 0]}
            onClick={(e) => handleStrike('Slap', 440, e)}
          >
            <cylinderGeometry args={[0.55, 0.55, 0.012, 32]} />
            <meshStandardMaterial
              color={hoveredPartKey === 'membrane' ? '#FFD36A' : '#DFCDB5'}
              roughness={0.65}
            />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. TENSION ROPES (Mali Weave) */}
      <PartMeshWrapper partKey="tension_ropes" explodeVector={parts.tension_ropes?.explodeVector || [0.6, 0, 0]}>
        <group position={[0, 0.15, 0]}>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const rTop = 0.54;
            const rBottom = 0.28;
            const x1 = Math.cos(angle) * rTop;
            const z1 = Math.sin(angle) * rTop;
            const x2 = Math.cos(angle + 0.12) * rBottom;
            const z2 = Math.sin(angle + 0.12) * rBottom;

            return (
              <mesh
                key={i}
                position={[(x1 + x2) / 2, -0.05, (z1 + z2) / 2]}
                rotation={[0, -angle, 0.32]}
              >
                <cylinderGeometry args={[0.008, 0.008, 0.65, 8]} />
                <meshStandardMaterial {...getMaterialProps('tension_ropes', '#1E4B3E', 0.6, 0.1)} />
              </mesh>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 4. CROWN RING */}
      <PartMeshWrapper partKey="crown_ring" explodeVector={parts.crown_ring?.explodeVector || [0, 0.9, 0]}>
        <group position={[0, 0.5, 0]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.56, 0.025, 16, 32]} />
            <meshStandardMaterial {...getMaterialProps('crown_ring', '#3A3A40', 0.3, 0.8)} />
          </mesh>
        </group>
      </PartMeshWrapper>
    </group>
  );
};

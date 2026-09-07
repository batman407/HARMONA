import React, { useRef } from 'react';
import * as THREE from 'three';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface DrumKitMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const DrumKitMesh: React.FC<DrumKitMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.3, metalness = 0.3) => {
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
      metalness: isSelected ? 0.5 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleDrumClick = (label: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playDrumKitElement(freq);
    triggerVibration(1.3);
    setLastPlayedNote({ note: label, freq });
  };

  return (
    <group position={[0, -0.3, 0]}>
      {/* 1. KICK (BASS DRUM) */}
      <PartMeshWrapper partKey="kick" explodeVector={parts.kick?.explodeVector || [0, -0.3, 0.6]}>
        <group
          position={[0, -0.25, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => handleDrumClick('Kick', 65, e)}
        >
          {/* Drum Shell */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.5, 32]} />
            <meshStandardMaterial {...getMaterialProps('kick', '#1A2E40', 0.25, 0.4)} />
          </mesh>
          {/* Front Head */}
          <mesh position={[0, 0.255, 0]}>
            <cylinderGeometry args={[0.54, 0.54, 0.01, 32]} />
            <meshStandardMaterial color="#111115" roughness={0.4} />
          </mesh>
          {/* Batter Head */}
          <mesh position={[0, -0.255, 0]}>
            <cylinderGeometry args={[0.54, 0.54, 0.01, 32]} />
            <meshStandardMaterial color="#F4F4F0" roughness={0.5} />
          </mesh>
          {/* Chrome Hoops */}
          <mesh position={[0, 0.25, 0]}>
            <torusGeometry args={[0.56, 0.02, 16, 32]} />
            <meshStandardMaterial color="#D8D8E0" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <torusGeometry args={[0.56, 0.02, 16, 32]} />
            <meshStandardMaterial color="#D8D8E0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. SNARE DRUM */}
      <PartMeshWrapper partKey="snare" explodeVector={parts.snare?.explodeVector || [-0.7, 0, 0.4]}>
        <group
          position={[-0.65, 0.05, 0.25]}
          onClick={(e) => handleDrumClick('Snare', 220, e)}
        >
          {/* Snare shell */}
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.16, 24]} />
            <meshStandardMaterial {...getMaterialProps('snare', '#C0C0C8', 0.2, 0.9)} />
          </mesh>
          {/* Batter head */}
          <mesh position={[0, 0.082, 0]}>
            <cylinderGeometry args={[0.29, 0.29, 0.005, 24]} />
            <meshStandardMaterial color="#FAF9F6" roughness={0.6} />
          </mesh>
          {/* Stand stem */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.65, 12]} />
            <meshStandardMaterial color="#888890" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. TOMS (High & Mid Rack Toms + Floor Tom) */}
      <PartMeshWrapper partKey="toms" explodeVector={parts.toms?.explodeVector || [0.4, 0.4, 0.3]}>
        <group>
          {/* High Tom (Left rack) */}
          <group
            position={[-0.22, 0.48, -0.05]}
            rotation={[0.2, 0.15, 0]}
            onClick={(e) => handleDrumClick('High Tom', 175, e)}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.22, 24]} />
              <meshStandardMaterial {...getMaterialProps('toms', '#1A2E40', 0.25, 0.4)} />
            </mesh>
            <mesh position={[0, 0.112, 0]}>
              <cylinderGeometry args={[0.21, 0.21, 0.005, 24]} />
              <meshStandardMaterial color="#FAFAFA" roughness={0.4} />
            </mesh>
          </group>
          {/* Mid Tom (Right rack) */}
          <group
            position={[0.22, 0.48, -0.05]}
            rotation={[0.2, -0.15, 0]}
            onClick={(e) => handleDrumClick('Mid Tom', 130, e)}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.24, 24]} />
              <meshStandardMaterial {...getMaterialProps('toms', '#1A2E40', 0.25, 0.4)} />
            </mesh>
            <mesh position={[0, 0.122, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.005, 24]} />
              <meshStandardMaterial color="#FAFAFA" roughness={0.4} />
            </mesh>
          </group>
          {/* Floor Tom */}
          <group
            position={[0.7, -0.1, 0.2]}
            onClick={(e) => handleDrumClick('Floor Tom', 98, e)}
          >
            <mesh castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.38, 24]} />
              <meshStandardMaterial {...getMaterialProps('toms', '#1A2E40', 0.25, 0.4)} />
            </mesh>
            <mesh position={[0, 0.192, 0]}>
              <cylinderGeometry args={[0.33, 0.33, 0.005, 24]} />
              <meshStandardMaterial color="#FAFAFA" roughness={0.4} />
            </mesh>
          </group>
        </group>
      </PartMeshWrapper>

      {/* 4. HI-HAT CYMBALS */}
      <PartMeshWrapper partKey="hi_hat" explodeVector={parts.hi_hat?.explodeVector || [-0.8, 0.4, 0]}>
        <group
          position={[-0.85, 0.45, 0.1]}
          onClick={(e) => handleDrumClick('Hi-Hat', 750, e)}
        >
          {/* Top cymbal */}
          <mesh position={[0, 0.015, 0]} rotation={[0.05, 0, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.3, 0.02, 24]} />
            <meshStandardMaterial {...getMaterialProps('hi_hat', '#D4AF37', 0.2, 0.9)} />
          </mesh>
          {/* Bottom cymbal */}
          <mesh position={[0, -0.015, 0]} rotation={[-Math.PI + 0.05, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.3, 0.02, 24]} />
            <meshStandardMaterial {...getMaterialProps('hi_hat', '#C5A028', 0.2, 0.9)} />
          </mesh>
          {/* Stand */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.2, 12]} />
            <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. CRASH CYMBAL */}
      <PartMeshWrapper partKey="crash" explodeVector={parts.crash?.explodeVector || [0.8, 0.5, 0]}>
        <group
          position={[-0.55, 0.85, -0.25]}
          rotation={[0.2, 0.1, -0.1]}
          onClick={(e) => handleDrumClick('Crash', 520, e)}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.38, 0.015, 28]} />
            <meshStandardMaterial {...getMaterialProps('crash', '#D4AF37', 0.2, 0.9)} />
          </mesh>
          {/* Boom stand */}
          <mesh position={[0.1, -0.5, 0]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.012, 0.012, 1.1, 12]} />
            <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 6. RIDE CYMBAL */}
      <PartMeshWrapper partKey="ride" explodeVector={parts.ride?.explodeVector || [0.9, 0.3, -0.3]}>
        <group
          position={[0.75, 0.65, -0.15]}
          rotation={[-0.15, -0.2, 0]}
          onClick={(e) => handleDrumClick('Ride', 680, e)}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.44, 0.02, 32]} />
            <meshStandardMaterial {...getMaterialProps('ride', '#C5A028', 0.2, 0.9)} />
          </mesh>
          {/* Stand */}
          <mesh position={[-0.05, -0.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.2, 12]} />
            <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </PartMeshWrapper>
    </group>
  );
};

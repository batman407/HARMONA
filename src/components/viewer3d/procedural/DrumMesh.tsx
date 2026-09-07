import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface DrumMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const DrumMesh: React.FC<DrumMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const [hitRipple, setHitRipple] = useState(0);
  const membraneRef = useRef<THREE.Mesh>(null);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.25, metalness = 0.1) => {
    const isSelected = selectedPartKey === partKey;
    const isHovered = hoveredPartKey === partKey;

    if (isGhostMode) {
      return {
        color: isSelected ? '#F2C14E' : '#4E6B99',
        transparent: true,
        opacity: isSelected ? 0.75 : 0.22,
        roughness: 0.1,
        metalness: 0.2,
      };
    }

    return {
      color: isSelected ? '#FFD36A' : isHovered ? '#E8B642' : baseColor,
      roughness: isSelected ? 0.2 : roughness,
      metalness: isSelected ? 0.5 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleDrumStrike = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playDrumStrike(freq);
    triggerVibration(1.4);
    setHitRipple(1.0);
    setLastPlayedNote({ note: noteName, freq });
  };

  useFrame((state, delta) => {
    if (hitRipple > 0) {
      setHitRipple((prev) => Math.max(0, prev - delta * 4.5));
    }
    if (membraneRef.current) {
      const vib = useViewerStore.getState().vibrationIntensity;
      const wave = Math.sin(state.clock.elapsedTime * 60) * (0.015 * vib + 0.02 * hitRipple);
      membraneRef.current.position.y = 0.35 + wave;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. DRUM SHELL (10-Ply Maple Cylinder) */}
      <PartMeshWrapper
        partKey="drum_shell"
        explodeVector={parts.drum_shell?.explodeVector || [0, 0, 0]}
      >
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.65, 48, 1, true]} />
          <meshStandardMaterial
            {...getMaterialProps('drum_shell', '#803418', 0.25, 0.15)}
            side={THREE.DoubleSide}
          />
        </mesh>
      </PartMeshWrapper>

      {/* 2. BATTER HEAD (Top Membrane) - Clickable to strike */}
      <PartMeshWrapper
        partKey="membrane_top"
        explodeVector={parts.membrane_top?.explodeVector || [0, 0.45, 0]}
      >
        <mesh
          ref={membraneRef}
          position={[0, 0.33, 0]}
          onClick={(e) => handleDrumStrike('G3 (Center)', 196.0, e)}
        >
          <cylinderGeometry args={[0.88, 0.88, 0.01, 48]} />
          <meshStandardMaterial
            {...getMaterialProps('membrane_top', hitRipple > 0.1 ? '#FFE8A3' : '#F5F5F0', 0.8, 0.0)}
            emissive={hitRipple > 0.1 ? '#4A3405' : '#000000'}
          />
        </mesh>
      </PartMeshWrapper>

      {/* 3. RESONANT HEAD (Bottom Membrane) */}
      <PartMeshWrapper
        partKey="membrane_bottom"
        explodeVector={parts.membrane_bottom?.explodeVector || [0, -0.45, 0]}
      >
        <mesh position={[0, -0.33, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.008, 48]} />
          <meshStandardMaterial
            {...getMaterialProps('membrane_bottom', '#DDE4ED', 0.1, 0.1)}
            transparent
            opacity={0.65}
          />
        </mesh>
      </PartMeshWrapper>

      {/* 4. DIE-CAST STEEL HOOPS (Top & Bottom rims) */}
      <PartMeshWrapper partKey="hoops" explodeVector={parts.hoops?.explodeVector || [0, 0.7, 0]}>
        <group>
          {/* Top hoop */}
          <mesh position={[0, 0.36, 0]}>
            <torusGeometry args={[0.92, 0.035, 16, 48]} />
            <meshStandardMaterial {...getMaterialProps('hoops', '#E0E3E8', 0.15, 0.95)} />
          </mesh>
          {/* Bottom hoop */}
          <mesh position={[0, -0.36, 0]}>
            <torusGeometry args={[0.92, 0.035, 16, 48]} />
            <meshStandardMaterial {...getMaterialProps('hoops', '#E0E3E8', 0.15, 0.95)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. TENSION RODS & LUGS */}
      <PartMeshWrapper
        partKey="tension_rods"
        explodeVector={parts.tension_rods?.explodeVector || [0.6, 0, 0]}
      >
        <group>
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const x = Math.cos(angle) * 0.94;
            const z = Math.sin(angle) * 0.94;
            return (
              <group key={`lug-${i}`} position={[x, 0, z]}>
                {/* Tension tube rod */}
                <mesh>
                  <cylinderGeometry args={[0.015, 0.015, 0.62, 8]} />
                  <meshStandardMaterial
                    {...getMaterialProps('tension_rods', '#E0E3E8', 0.1, 0.95)}
                  />
                </mesh>
                {/* Center casing lug */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.04, 0.12, 0.04]} />
                  <meshStandardMaterial color="#BFC4CC" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 6. COILED STEEL SNARE WIRES */}
      <PartMeshWrapper
        partKey="snare_wires"
        explodeVector={parts.snare_wires?.explodeVector || [0, -0.7, 0]}
      >
        <group position={[0, -0.36, 0]}>
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={`wire-${i}`} position={[-0.3 + i * 0.046, 0, 0]}>
              <boxGeometry args={[0.006, 0.004, 1.4]} />
              <meshStandardMaterial {...getMaterialProps('snare_wires', '#D2D7E0', 0.1, 0.95)} />
            </mesh>
          ))}
          {/* Snare end plates */}
          {[-0.7, 0.7].map((pz, idx) => (
            <mesh key={`plate-${idx}`} position={[0, 0, pz]}>
              <boxGeometry args={[0.65, 0.015, 0.08]} />
              <meshStandardMaterial color="#C8963E" metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

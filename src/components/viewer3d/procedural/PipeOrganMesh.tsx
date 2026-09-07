import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface PipeOrganMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const PipeOrganMesh: React.FC<PipeOrganMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.25, metalness = 0.4) => {
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
      metalness: isSelected ? 0.6 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleKeyClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playPipeOrgan(freq);
    triggerVibration(1.0);
    setLastPlayedNote({ note: noteName, freq });
  };

  const organNotes = [
    { name: 'C3', freq: 130.81, x: -0.3 },
    { name: 'D3', freq: 146.83, x: -0.2 },
    { name: 'E3', freq: 164.81, x: -0.1 },
    { name: 'F3', freq: 174.61, x: 0.0 },
    { name: 'G3', freq: 196.0, x: 0.1 },
    { name: 'A3', freq: 220.0, x: 0.2 },
    { name: 'B3', freq: 246.94, x: 0.3 },
  ];

  // Facade pipes heights (symmetric cathedral arrangement)
  const pipeHeights = [0.8, 1.1, 1.4, 1.7, 2.0, 1.7, 1.4, 1.1, 0.8];

  return (
    <group position={[0, -0.3, 0]}>
      {/* 1. PIPE RANKS (Cathedral Facade) */}
      <PartMeshWrapper partKey="pipes" explodeVector={parts.pipes?.explodeVector || [0, 0.8, 0]}>
        <group position={[0, 0.6, -0.1]}>
          {pipeHeights.map((h, i) => {
            const px = (i - 4) * 0.16;
            const r = 0.045 + (h / 2.0) * 0.02;
            return (
              <group key={i} position={[px, h / 2, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[r, r, h, 20]} />
                  <meshStandardMaterial {...getMaterialProps('pipes', '#C8C8D2', 0.2, 0.85)} />
                </mesh>
                {/* Flue mouth cutout */}
                <mesh position={[0, -h / 2 + 0.15, r * 0.95]}>
                  <boxGeometry args={[r * 1.2, 0.04, 0.02]} />
                  <meshStandardMaterial color="#111111" />
                </mesh>
                {/* Conical foot */}
                <mesh position={[0, -h / 2 - 0.06, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[r, 0.12, 20]} />
                  <meshStandardMaterial {...getMaterialProps('pipes', '#9999A6', 0.3, 0.8)} />
                </mesh>
              </group>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 2. WIND CHEST */}
      <PartMeshWrapper partKey="wind_chest" explodeVector={parts.wind_chest?.explodeVector || [0, -0.5, 0]}>
        <group position={[0, 0.45, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.2, 0.6]} />
            <meshStandardMaterial {...getMaterialProps('wind_chest', '#4A2A1A', 0.4, 0.1)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. KEYBOARD MANUALS (Console) */}
      <PartMeshWrapper partKey="manuals" explodeVector={parts.manuals?.explodeVector || [0, -0.2, 0.6]}>
        <group position={[0, 0.15, 0.35]}>
          {/* Console shelf */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.95, 0.12, 0.4]} />
            <meshStandardMaterial {...getMaterialProps('manuals', '#3A1E10', 0.35, 0.1)} />
          </mesh>
          {/* Swell Manual (Upper) */}
          <mesh position={[0, 0.06, -0.06]}>
            <boxGeometry args={[0.78, 0.04, 0.14]} />
            <meshStandardMaterial color="#EAEAEA" roughness={0.2} />
          </mesh>
          {/* Great Manual (Lower interactive keys) */}
          <group position={[0, 0.02, 0.08]}>
            {organNotes.map((k, idx) => (
              <mesh
                key={idx}
                position={[k.x, 0, 0]}
                onClick={(e) => handleKeyClick(k.name, k.freq, e)}
              >
                <boxGeometry args={[0.085, 0.04, 0.16]} />
                <meshStandardMaterial
                  color={hoveredPartKey === 'manuals' ? '#FFD36A' : '#FAFAFA'}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        </group>
      </PartMeshWrapper>

      {/* 4. STOP KNOBS */}
      <PartMeshWrapper partKey="stops" explodeVector={parts.stops?.explodeVector || [0.5, 0, 0.5]}>
        <group position={[0, 0.3, 0.3]}>
          {/* Left jamb knobs */}
          {[-0.42, -0.36].map((x, xi) =>
            [0.08, 0.0, -0.08].map((y, yi) => (
              <mesh key={`L-${xi}-${yi}`} position={[x, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
                <meshStandardMaterial {...getMaterialProps('stops', '#D4AF37', 0.2, 0.8)} />
              </mesh>
            ))
          )}
          {/* Right jamb knobs */}
          {[0.36, 0.42].map((x, xi) =>
            [0.08, 0.0, -0.08].map((y, yi) => (
              <mesh key={`R-${xi}-${yi}`} position={[x, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
                <meshStandardMaterial {...getMaterialProps('stops', '#D4AF37', 0.2, 0.8)} />
              </mesh>
            ))
          )}
        </group>
      </PartMeshWrapper>

      {/* 5. BELLOWS / BLOWER BASE */}
      <PartMeshWrapper partKey="bellows" explodeVector={parts.bellows?.explodeVector || [0, -1.0, 0]}>
        <group position={[0, -0.35, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.7, 0.55]} />
            <meshStandardMaterial {...getMaterialProps('bellows', '#26140A', 0.5, 0.05)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 6. PEDAL BOARD */}
      <PartMeshWrapper partKey="pedal_board" explodeVector={parts.pedal_board?.explodeVector || [0, -0.7, 0.5]}>
        <group position={[0, -0.72, 0.35]}>
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.9, 0.06, 0.55]} />
            <meshStandardMaterial {...getMaterialProps('pedal_board', '#2E1A0F', 0.4, 0.1)} />
          </mesh>
          {/* Radial foot pedals */}
          {Array.from({ length: 11 }).map((_, i) => (
            <mesh key={i} position={[-0.35 + i * 0.07, 0.01, 0]}>
              <boxGeometry args={[0.035, 0.03, 0.48]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#DEB887' : '#222222'} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>
    </group>
  );
};

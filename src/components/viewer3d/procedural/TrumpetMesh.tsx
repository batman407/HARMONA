import React, { useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface TrumpetMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const TrumpetMesh: React.FC<TrumpetMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const [pressedValves, setPressedValves] = useState<Record<number, boolean>>({});

  const getMaterialProps = (partKey: string, baseColor: string = '#E5B84B', roughness = 0.2, metalness = 0.9) => {
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
      color: isSelected ? '#FFE899' : isHovered ? '#FFDA73' : baseColor,
      roughness: isSelected ? 0.12 : roughness,
      metalness: isSelected ? 0.95 : metalness,
      emissive: isSelected ? '#543E08' : isHovered ? '#261C04' : '#000000',
    };
  };

  const handleValveClick = (valveIndex: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    setPressedValves((prev) => ({ ...prev, [valveIndex]: true }));

    // Frequencies corresponding to valve combinations:
    // Open: C4 (261.63), Valve 1: Bb3 (233.08), Valve 2: B3 (246.94), Valve 3: A3 (220.0)
    const freqs = [233.08, 246.94, 220.0];
    const notes = ['Bb3', 'B3', 'A3'];
    const freq = freqs[valveIndex] || 261.63;
    const note = notes[valveIndex] || 'C4';

    audioEngine.playTrumpetNote(freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: `Valve ${valveIndex + 1} (${note})`, freq });

    setTimeout(() => {
      setPressedValves((prev) => ({ ...prev, [valveIndex]: false }));
    }, 300);
  };

  return (
    <group position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* 1. EXPONENTIAL FLARE BELL */}
      <PartMeshWrapper partKey="bell" explodeVector={parts.bell?.explodeVector || [0, 0, -0.6]}>
        <group position={[0, 0, -0.8]}>
          {/* Bell flare cone */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.045, 0.7, 32, 1, true]} />
            <meshStandardMaterial
              {...getMaterialProps('bell', '#E8BC4C')}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Bell bead rim */}
          <mesh position={[0, 0, -0.35]}>
            <torusGeometry args={[0.38, 0.015, 16, 32]} />
            <meshStandardMaterial {...getMaterialProps('bell', '#F5CD62')} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. THREE PÉRINET PISTON VALVES */}
      <PartMeshWrapper partKey="valves" explodeVector={parts.valves?.explodeVector || [0, 0.45, 0]}>
        <group position={[0, 0.1, 0.1]}>
          {[-0.1, 0, 0.1].map((pz, idx) => {
            const isDown = pressedValves[idx];
            return (
              <group key={`valve-${idx}`} position={[0, 0, pz]}>
                {/* Outer valve casing */}
                <mesh>
                  <cylinderGeometry args={[0.045, 0.045, 0.35, 24]} />
                  <meshStandardMaterial {...getMaterialProps('valves', '#E0B244')} />
                </mesh>
                {/* Piston button / stem (interactive) */}
                <mesh
                  position={[0, isDown ? 0.18 : 0.24, 0]}
                  onClick={(e) => handleValveClick(idx, e)}
                >
                  <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
                  <meshStandardMaterial
                    {...getMaterialProps('valves', isDown ? '#FFF0B3' : '#F5D478', 0.1, 0.95)}
                    emissive={isDown ? '#59440B' : '#000000'}
                  />
                </mesh>
                {/* Mother of pearl cap inlay */}
                <mesh position={[0, isDown ? 0.202 : 0.262, 0]}>
                  <cylinderGeometry args={[0.028, 0.028, 0.005, 16]} />
                  <meshStandardMaterial color="#EBEAE6" roughness={0.3} metalness={0.2} />
                </mesh>
              </group>
            );
          })}
        </group>
      </PartMeshWrapper>

      {/* 3. LEADPIPE & TUNING SLIDE */}
      <PartMeshWrapper
        partKey="leadpipe"
        explodeVector={parts.leadpipe?.explodeVector || [0, 0, 0.5]}
      >
        <group position={[0, 0.18, 0.55]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.02, 0.7, 16]} />
            <meshStandardMaterial {...getMaterialProps('leadpipe', '#E2B548')} />
          </mesh>
          {/* Main tuning slide U-bend */}
          <mesh position={[0, -0.06, -0.35]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.06, 0.02, 16, 24, Math.PI]} />
            <meshStandardMaterial {...getMaterialProps('leadpipe', '#E2B548')} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 4. CUP MOUTHPIECE */}
      <PartMeshWrapper
        partKey="mouthpiece"
        explodeVector={parts.mouthpiece?.explodeVector || [0, 0, 0.85]}
      >
        <group position={[0, 0.18, 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Cup */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.045, 0.025, 0.07, 24]} />
            <meshStandardMaterial {...getMaterialProps('mouthpiece', '#EDEDED', 0.1, 0.95)} />
          </mesh>
          {/* Shank */}
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.02, 0.016, 0.12, 16]} />
            <meshStandardMaterial {...getMaterialProps('mouthpiece', '#EDEDED', 0.1, 0.95)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. VALVE SLIDE LOOPS & TUBING */}
      <PartMeshWrapper partKey="tubing" explodeVector={parts.tubing?.explodeVector || [0.4, 0, 0]}>
        <group position={[0.15, 0.05, 0.1]}>
          {/* 1st slide loop */}
          <mesh position={[0, 0.05, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.018, 16, 24]} />
            <meshStandardMaterial {...getMaterialProps('tubing', '#D9A93A')} />
          </mesh>
          {/* 3rd slide loop */}
          <mesh position={[0, -0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.11, 0.018, 16, 24]} />
            <meshStandardMaterial {...getMaterialProps('tubing', '#D9A93A')} />
          </mesh>
        </group>
      </PartMeshWrapper>
    </group>
  );
};

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface TromboneMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const TromboneMesh: React.FC<TromboneMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const slideRef = useRef<THREE.Group>(null);

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

  const handleSlideNoteClick = (noteName: string, freq: number, slideYOffset: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playTrombone(freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: noteName, freq });
    if (slideRef.current) {
      slideRef.current.position.y = slideYOffset;
    }
  };

  const trombonePositions = [
    { label: 'Pos 1 (Bb2)', note: 'Bb2', freq: 116.54, y: 0 },
    { label: 'Pos 2 (A2)', note: 'A2', freq: 110.0, y: -0.08 },
    { label: 'Pos 3 (Ab2)', note: 'Ab2', freq: 103.83, y: -0.16 },
    { label: 'Pos 4 (G2)', note: 'G2', freq: 98.0, y: -0.24 },
    { label: 'Pos 5 (F#2)', note: 'F#2', freq: 92.5, y: -0.32 },
  ];

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
      {/* 1. MOUTHPIECE */}
      <PartMeshWrapper partKey="mouthpiece" explodeVector={parts.mouthpiece?.explodeVector || [-0.7, 0, 0]}>
        <group position={[-0.8, 0.45, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.045, 0.12, 20]} />
            <meshStandardMaterial {...getMaterialProps('mouthpiece', '#EEEEEE', 0.1, 0.95)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 2. INNER SLIDE TUBES */}
      <PartMeshWrapper partKey="slide_inner" explodeVector={parts.slide_inner?.explodeVector || [0, -0.35, 0]}>
        <group position={[-0.2, 0.1, 0]}>
          {/* Top inner tube */}
          <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 1.4, 16]} />
            <meshStandardMaterial {...getMaterialProps('slide_inner', '#CCCCCC', 0.1, 0.95)} />
          </mesh>
          {/* Bottom inner tube */}
          <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 1.4, 16]} />
            <meshStandardMaterial {...getMaterialProps('slide_inner', '#CCCCCC', 0.1, 0.95)} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 3. OUTER SLIDE (Interactive telescoping) */}
      <PartMeshWrapper partKey="slide_outer" explodeVector={parts.slide_outer?.explodeVector || [0, -0.4, 0]}>
        <group ref={slideRef} position={[0.25, 0.1, 0]}>
          {/* Top outer tube */}
          <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 1.3, 16]} />
            <meshStandardMaterial {...getMaterialProps('slide_outer', '#D4AF37', 0.15, 0.9)} />
          </mesh>
          {/* Bottom outer tube */}
          <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 1.3, 16]} />
            <meshStandardMaterial {...getMaterialProps('slide_outer', '#D4AF37', 0.15, 0.9)} />
          </mesh>
          {/* U-Bow return */}
          <mesh position={[0.65, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[0.05, 0.02, 16, 24, Math.PI]} />
            <meshStandardMaterial {...getMaterialProps('slide_outer', '#D4AF37', 0.15, 0.9)} />
          </mesh>
          {/* Slide brace */}
          <mesh position={[-0.45, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.1, 12]} />
            <meshStandardMaterial color="#B08D25" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Interactive Trigger nodes along slide */}
          {trombonePositions.map((pos, idx) => (
            <mesh
              key={idx}
              position={[-0.35 + idx * 0.18, 0.05, 0]}
              onClick={(e) => handleSlideNoteClick(pos.note, pos.freq, pos.y, e)}
            >
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshStandardMaterial
                color={hoveredPartKey === 'slide_outer' ? '#FFD36A' : '#FFAA33'}
                emissive="#663300"
              />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 4. BELL SECTION */}
      <PartMeshWrapper partKey="bell_section" explodeVector={parts.bell_section?.explodeVector || [0.6, 0.2, 0]}>
        <group position={[-0.3, 0.35, 0]}>
          {/* Neckpipe */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.8, 16]} />
            <meshStandardMaterial {...getMaterialProps('bell_section', '#D4AF37', 0.15, 0.9)} />
          </mesh>
          {/* Flared conical bell */}
          <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.3, 0.65, 32, 1, true]} />
            <meshStandardMaterial
              {...getMaterialProps('bell_section', '#E6C24C', 0.15, 0.92)}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. TUNING SLIDE */}
      <PartMeshWrapper partKey="tuning_slide" explodeVector={parts.tuning_slide?.explodeVector || [0.3, 0.5, 0]}>
        <group position={[-0.55, 0.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.06, 0.022, 16, 24, Math.PI]} />
            <meshStandardMaterial {...getMaterialProps('tuning_slide', '#C5A028', 0.2, 0.9)} />
          </mesh>
        </group>
      </PartMeshWrapper>
    </group>
  );
};

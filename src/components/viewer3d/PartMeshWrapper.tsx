import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useViewerStore } from '../../store/useViewerStore';
import { useAppStore } from '../../store/useAppStore';

interface PartMeshWrapperProps {
  partKey: string;
  explodeVector: [number, number, number];
  children: React.ReactNode;
  defaultPosition?: [number, number, number];
  defaultRotation?: [number, number, number];
}

export const PartMeshWrapper: React.FC<PartMeshWrapperProps> = ({
  partKey,
  explodeVector,
  children,
  defaultPosition = [0, 0, 0],
  defaultRotation = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const explodeProgress = useViewerStore((s) => s.explodeProgress);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const isolatedPartKey = useViewerStore((s) => s.isolatedPartKey);
  const setSelectedPartKey = useViewerStore((s) => s.setSelectedPartKey);
  const setHoveredPartKey = useViewerStore((s) => s.setHoveredPartKey);
  const vibrationIntensity = useViewerStore((s) => s.vibrationIntensity);

  const isSelected = selectedPartKey === partKey;
  const isHovered = hoveredPartKey === partKey;
  const isIsolated = isolatedPartKey === partKey;
  const isOtherWhenIsolated = isolatedPartKey !== null && !isIsolated;

  // Target explosion position
  const targetPos = useMemo(() => {
    return new THREE.Vector3(
      defaultPosition[0] + explodeVector[0] * explodeProgress * 2.2,
      defaultPosition[1] + explodeVector[1] * explodeProgress * 2.2,
      defaultPosition[2] + explodeVector[2] * explodeProgress * 2.2
    );
  }, [defaultPosition, explodeVector, explodeProgress]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth lerp to exploded position
    groupRef.current.position.lerp(targetPos, Math.min(1, delta * 12));

    // Subtle vibration oscillation if active
    if (vibrationIntensity > 0 && (isSelected || !selectedPartKey)) {
      const vib = Math.sin(state.clock.elapsedTime * 45) * 0.012 * vibrationIntensity;
      groupRef.current.position.y += vib;
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={defaultRotation}
      visible={!isOtherWhenIsolated}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPartKey(isSelected ? null : partKey);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredPartKey(partKey);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredPartKey(null);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Visual outline/glow shell when selected or hovered */}
      {(isSelected || isHovered) && (
        <pointLight
          color="#F2C14E"
          intensity={isSelected ? 1.8 : 0.8}
          distance={1.5}
          position={[0, 0, 0]}
        />
      )}
      {children}
    </group>
  );
};

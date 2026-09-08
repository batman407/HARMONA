import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { InstrumentData } from '../../content/types';
import { useViewerStore } from '../../store/useViewerStore';
import { useAppStore } from '../../store/useAppStore';
import { audioEngine } from '../../audio/AudioEngine';
import { Clock, Sparkles, Volume2 } from 'lucide-react';

interface RealisticInstrumentModelProps {
  instrument: InstrumentData;
}

// Inner component that actually loads and renders the GLB
const LoadedGLBModel: React.FC<{
  instrument: InstrumentData;
  modelUrl: string;
}> = ({ instrument, modelUrl }) => {
  const gltf = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const setSelectedPartKey = useViewerStore((s) => s.setSelectedPartKey);
  const setHoveredPartKey = useViewerStore((s) => s.setHoveredPartKey);
  const explodeProgress = useViewerStore((s) => s.explodeProgress);
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const vibrationIntensity = useViewerStore((s) => s.vibrationIntensity);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  // Clone scene so modifications don't mutate the cached asset
  const { clonedScene, partsMapping, initialPositions } = useMemo(() => {
    const scene = gltf.scene.clone(true);

    // Compute bounding box and normalize scale & center
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2.4 / maxDim : 1;

    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    scene.scale.set(scale, scale, scale);

    const mapping = new Map<string, THREE.Object3D[]>();
    const positions = new Map<string, THREE.Vector3>();

    // Traverse and tag meshes
    let meshIdx = 0;
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Enhance material PBR properties
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.envMapIntensity = 1.4;
          mesh.material = mat;
        }

        const partKey = mesh.name.toLowerCase() || `part_${meshIdx++}`;
        if (!mapping.has(partKey)) mapping.set(partKey, []);
        mapping.get(partKey)!.push(mesh);
        positions.set(mesh.uuid, mesh.position.clone());
      }
    });

    return { clonedScene: scene, partsMapping: mapping, initialPositions: positions };
  }, [gltf.scene]);

  // Update materials based on selection, hover, and x-ray ghost mode
  useEffect(() => {
    clonedScene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        const isMatch =
          (selectedPartKey && mesh.name.toLowerCase().includes(selectedPartKey.toLowerCase())) ||
          (hoveredPartKey && mesh.name.toLowerCase().includes(hoveredPartKey.toLowerCase()));

        if (isGhostMode) {
          mat.transparent = true;
          mat.opacity = isMatch ? 0.9 : 0.25;
          mat.wireframe = false;
        } else {
          mat.transparent = false;
          mat.opacity = 1.0;
          if (isMatch) {
            mat.emissive = new THREE.Color('#543E08');
            mat.emissiveIntensity = 0.5;
          } else {
            mat.emissive = new THREE.Color('#000000');
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [clonedScene, selectedPartKey, hoveredPartKey, isGhostMode]);

  // Smooth vibration animation
  useFrame((state) => {
    if (groupRef.current && vibrationIntensity > 0) {
      const vib = Math.sin(state.clock.elapsedTime * 60) * 0.008 * vibrationIntensity;
      groupRef.current.position.y = vib;
    } else if (groupRef.current) {
      groupRef.current.position.y = 0;
    }
  });

  // Handle disassembly explosion
  useEffect(() => {
    clonedScene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const initialPos = initialPositions.get(mesh.uuid);
        if (!initialPos) return;

        if (explodeProgress > 0) {
          // Explode radially from center
          const dir = initialPos.clone().normalize();
          if (dir.lengthSq() === 0) dir.set(0, 1, 0);
          mesh.position.copy(initialPos.clone().add(dir.multiplyScalar(explodeProgress * 1.5)));
        } else {
          mesh.position.copy(initialPos);
        }
      }
    });
  }, [explodeProgress, clonedScene, initialPositions]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    // Play default primary note
    const defaultNote = instrument.interactiveControls.keysOrTriggers[0];
    if (defaultNote) {
      audioEngine.playInstrumentNote(instrument.id, defaultNote.freq);
      triggerVibration(1.2);
      setLastPlayedNote({ note: defaultNote.note, freq: defaultNote.freq });
    }

    if (e.object?.name) {
      setSelectedPartKey(e.object.name.toLowerCase());
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (e.object?.name) {
      setHoveredPartKey(e.object.name.toLowerCase());
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHoveredPartKey(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

// Fallback screen for instruments whose photoreal GLB is in production
const ModelComingSoonCard: React.FC<{ instrument: InstrumentData }> = ({ instrument }) => {
  return (
    <Html center distanceFactor={8}>
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-panel border border-[var(--border)] bg-[#070A0F]/90 backdrop-blur-xl text-center max-w-sm shadow-2xl select-none">
        <div className="w-12 h-12 rounded-full bg-[var(--accentSoft)] border border-[var(--accentBorder)] flex items-center justify-center text-[var(--accent)] mb-3">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-[var(--text)] font-heading mb-1">
          {instrument.name}
        </h3>
        <p className="text-xs text-[var(--accent)] font-medium mb-3">
          Photoreal 3D Model in Production
        </p>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-4">
          Per HARMONA quality standards, low-fidelity primitive shapes are disabled. To automatically source and install the realistic Creative Commons model, run:
        </p>
        <div className="w-full p-2.5 rounded-lg bg-black/60 border border-[var(--border)] font-mono text-[10px] text-[var(--accent)] mb-3 select-all">
          npm run fetch:models
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
          <Sparkles className="w-3 h-3 text-[var(--accent)]" />
          <span>Sound Lab & Physical Synthesis are fully interactive</span>
        </div>
      </div>
    </Html>
  );
};

export const RealisticInstrumentModel: React.FC<RealisticInstrumentModelProps> = ({ instrument }) => {
  const modelUrl = instrument.modelCapability?.modelUrl;
  const hasModel = Boolean(instrument.modelCapability?.hasModel && modelUrl);

  if (!hasModel || !modelUrl) {
    return <ModelComingSoonCard instrument={instrument} />;
  }

  return (
    <React.Suspense
      fallback={
        <Html center>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl glass-panel border border-[var(--border)] text-xs text-[var(--text)]">
            <div className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span>Loading Photoreal {instrument.name}...</span>
          </div>
        </Html>
      }
    >
      <LoadedGLBModel instrument={instrument} modelUrl={modelUrl} />
    </React.Suspense>
  );
};

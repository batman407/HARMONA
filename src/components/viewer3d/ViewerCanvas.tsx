import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { InstrumentModel } from './InstrumentModel';
import { useViewerStore } from '../../store/useViewerStore';
import { InstrumentData } from '../../content/types';
import { FloatingPartLabel } from './FloatingPartLabel';

interface ViewerCanvasProps {
  instrument: InstrumentData;
}

const ControlsController: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const cameraResetTrigger = useViewerStore((s) => s.cameraResetTrigger);
  const autoRotate = useViewerStore((s) => s.autoRotate);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [cameraResetTrigger]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      maxPolarAngle={Math.PI / 2 + 0.1}
      minDistance={1.8}
      maxDistance={8.5}
      makeDefault
    />
  );
};

export const ViewerCanvas: React.FC<ViewerCanvasProps> = ({ instrument }) => {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [2.6, 1.8, 3.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      >
        <color attach="background" args={['transparent']} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -3]} intensity={0.8} color="#94B5E8" />
        <pointLight position={[0, -2, 2]} intensity={0.5} color="#F2C14E" />

        {/* 3D Model */}
        <InstrumentModel instrument={instrument} />

        {/* Floating Part Label Annotation */}
        <FloatingPartLabel instrument={instrument} />

        {/* Soft Contact Shadow Catcher */}
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.65}
          scale={7}
          blur={2.5}
          far={3.5}
        />

        <ControlsController />
      </Canvas>
    </div>
  );
};

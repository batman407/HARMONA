import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
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
      controlsRef.current.autoRotateSpeed = 1.0;
    }
  }, [autoRotate]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 + 0.15}
      minDistance={1.4}
      maxDistance={7.5}
      makeDefault
    />
  );
};

export const ViewerCanvas: React.FC<ViewerCanvasProps> = ({ instrument }) => {
  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        camera={{ position: [2.8, 1.6, 3.4], fov: 40 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <color attach="background" args={['transparent']} />

        {/* Photoreal Studio HDRI Environment Reflection */}
        <React.Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={1.2} />
        </React.Suspense>

        {/* 3-Point Studio Product Photography Lighting */}
        <ambientLight intensity={0.5} />
        {/* Key Light (Warm Key) */}
        <directionalLight
          position={[4.5, 7.5, 5]}
          intensity={2.2}
          color="#FFFDF7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        {/* Fill Light (Soft Cool Fill) */}
        <directionalLight
          position={[-5, 3.5, -2]}
          intensity={0.9}
          color="#B8D0F5"
        />
        {/* Rim Light (Gold Accent Hotspot) */}
        <spotLight
          position={[0, 6, -5]}
          angle={0.6}
          penumbra={0.8}
          intensity={2.0}
          color="#F2C14E"
        />
        {/* Bottom bounce light */}
        <pointLight position={[0, -2.5, 1]} intensity={0.4} color="#E8BE65" />

        {/* Realistic Instrument 3D Model */}
        <InstrumentModel instrument={instrument} />

        {/* Floating Part Label Annotation */}
        <FloatingPartLabel instrument={instrument} />

        {/* Realistic Soft Contact Shadow Catcher */}
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.7}
          scale={8}
          blur={2.2}
          far={3.8}
        />

        <ControlsController />
      </Canvas>
    </div>
  );
};

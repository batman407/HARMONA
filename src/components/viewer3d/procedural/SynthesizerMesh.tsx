import React from 'react';
import * as THREE from 'three';
import { PartMeshWrapper } from '../PartMeshWrapper';
import { useViewerStore } from '../../../store/useViewerStore';
import { useAppStore } from '../../../store/useAppStore';
import { audioEngine } from '../../../audio/AudioEngine';

interface SynthesizerMeshProps {
  parts: Record<string, { explodeVector: [number, number, number] }>;
}

export const SynthesizerMesh: React.FC<SynthesizerMeshProps> = ({ parts }) => {
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);

  const getMaterialProps = (partKey: string, baseColor: string, roughness = 0.35, metalness = 0.3) => {
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

  const handleKeyClick = (noteName: string, freq: number, e?: any) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    audioEngine.playSynthesizer(freq);
    triggerVibration(1.1);
    setLastPlayedNote({ note: noteName, freq });
  };

  const synthKeys = [
    { name: 'C2', freq: 65.41, x: -0.5 },
    { name: 'C3', freq: 130.81, x: -0.25 },
    { name: 'C4', freq: 261.63, x: 0.0 },
    { name: 'A4', freq: 440.0, x: 0.25 },
    { name: 'C5', freq: 523.25, x: 0.5 },
  ];

  return (
    <group position={[0, -0.2, 0]} rotation={[0.3, 0, 0]}>
      {/* 1. CHASSIS BASE */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.18, 0.9]} />
        <meshStandardMaterial color="#1E1E24" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Wooden side cheeks */}
      <mesh position={[-0.77, 0.02, 0]} castShadow>
        <boxGeometry args={[0.06, 0.22, 0.92]} />
        <meshStandardMaterial color="#5A2A18" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0.77, 0.02, 0]} castShadow>
        <boxGeometry args={[0.06, 0.22, 0.92]} />
        <meshStandardMaterial color="#5A2A18" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 2. KEYS */}
      <PartMeshWrapper partKey="keys" explodeVector={parts.keys?.explodeVector || [0, -0.3, 0.5]}>
        <group position={[0, 0.12, 0.25]}>
          {/* White keys */}
          {Array.from({ length: 15 }).map((_, i) => {
            const kx = -0.58 + i * 0.082;
            const targetNote = synthKeys.find((k) => Math.abs(k.x - kx) < 0.08) || {
              name: `Key ${i}`,
              freq: 130.81 * Math.pow(2, i / 12),
            };

            return (
              <mesh
                key={i}
                position={[kx, 0, 0]}
                onClick={(e) => handleKeyClick(targetNote.name, targetNote.freq, e)}
              >
                <boxGeometry args={[0.076, 0.04, 0.32]} />
                <meshStandardMaterial
                  color={hoveredPartKey === 'keys' ? '#FFD36A' : '#F8F8FA'}
                  roughness={0.2}
                />
              </mesh>
            );
          })}
          {/* Black keys */}
          {[-0.54, -0.46, -0.3, -0.22, -0.14, 0.02, 0.1, 0.26, 0.34, 0.42].map((bx, i) => (
            <mesh key={`b-${i}`} position={[bx, 0.035, -0.05]}>
              <boxGeometry args={[0.045, 0.05, 0.19]} />
              <meshStandardMaterial color="#18181A" roughness={0.25} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 3. OSCILLATOR SECTION */}
      <PartMeshWrapper
        partKey="oscillator_section"
        explodeVector={parts.oscillator_section?.explodeVector || [-0.5, 0.3, 0.2]}
      >
        <group position={[-0.45, 0.15, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.06, 0.32]} />
            <meshStandardMaterial {...getMaterialProps('oscillator_section', '#2A2A35', 0.4, 0.4)} />
          </mesh>
          {/* Waveform selection switches */}
          {[-0.1, 0, 0.1].map((ox, i) => (
            <mesh key={i} position={[ox, 0.04, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
              <meshStandardMaterial color="#E8A735" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 4. FILTER SECTION (VCF Cutoff / Res) */}
      <PartMeshWrapper
        partKey="filter_section"
        explodeVector={parts.filter_section?.explodeVector || [0, 0.3, 0.2]}
      >
        <group position={[0, 0.15, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.06, 0.32]} />
            <meshStandardMaterial {...getMaterialProps('filter_section', '#242430', 0.4, 0.4)} />
          </mesh>
          {/* Large Cutoff Knob */}
          <mesh position={[-0.07, 0.05, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.04, 24]} />
            <meshStandardMaterial color="#D43737" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Resonance Knob */}
          <mesh position={[0.07, 0.04, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.03, 20]} />
            <meshStandardMaterial color="#D43737" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      </PartMeshWrapper>

      {/* 5. AMP / ADSR ENVELOPE SECTION */}
      <PartMeshWrapper
        partKey="amp_section"
        explodeVector={parts.amp_section?.explodeVector || [0.5, 0.3, 0.2]}
      >
        <group position={[0.45, 0.15, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.06, 0.32]} />
            <meshStandardMaterial {...getMaterialProps('amp_section', '#2A2A35', 0.4, 0.4)} />
          </mesh>
          {/* 4 ADSR Sliders */}
          {[-0.12, -0.04, 0.04, 0.12].map((sx, i) => (
            <group key={i} position={[sx, 0.035, 0]}>
              <boxGeometry args={[0.012, 0.005, 0.2]} />
              <mesh position={[0, 0.015, (i - 1.5) * 0.04]}>
                <boxGeometry args={[0.02, 0.025, 0.03]} />
                <meshStandardMaterial color="#4A90E2" roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 6. CONTROL KNOBS */}
      <PartMeshWrapper partKey="knobs" explodeVector={parts.knobs?.explodeVector || [0, 0.6, 0]}>
        <group position={[0, 0.22, -0.32]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-0.55 + i * 0.16, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.025, 16]} />
              <meshStandardMaterial {...getMaterialProps('knobs', '#C8C8C8', 0.2, 0.8)} />
            </mesh>
          ))}
        </group>
      </PartMeshWrapper>

      {/* 7. OLED DISPLAY */}
      <PartMeshWrapper partKey="display" explodeVector={parts.display?.explodeVector || [-0.3, 0.6, 0]}>
        <group position={[-0.2, 0.21, -0.05]} rotation={[-0.2, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.02, 0.14]} />
            <meshStandardMaterial {...getMaterialProps('display', '#0F1626', 0.2, 0.1)} />
          </mesh>
          {/* Glowing screen glass */}
          <mesh position={[0, 0.012, 0]}>
            <boxGeometry args={[0.23, 0.005, 0.11]} />
            <meshStandardMaterial color="#00F0FF" emissive="#00B4D8" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </PartMeshWrapper>
    </group>
  );
};

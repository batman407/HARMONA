import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { Activity, Radio, Waves, Zap, Layers, Sparkles } from 'lucide-react';
import { useViewerStore } from '../../store/useViewerStore';

interface VisualizeModeProps {
  instrument: InstrumentData;
}

export const VisualizeMode: React.FC<VisualizeModeProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const triggerVibration = useViewerStore((s) => s.triggerVibration);
  const setSelectedPartKey = useViewerStore((s) => s.setSelectedPartKey);

  const [activeHarmonicMode, setActiveHarmonicMode] = useState<number>(1);
  const [activeStage, setActiveStage] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Acoustic stages
  const stages = [
    {
      id: 0,
      name: 'Exciter Disturbance',
      part: 'strings',
      desc: 'Kinetic strike or pluck introduces initial localized potential energy.',
    },
    {
      id: 1,
      name: 'Coupling & Transduction',
      part: 'bridge',
      desc: 'Impedance transformer matches high string resistance to lighter air radiator.',
    },
    {
      id: 2,
      name: 'Body Cavity Resonance',
      part: 'soundboard',
      desc: 'Eigenmodes of the solid wood / metal diaphragm displace ambient air.',
    },
    {
      id: 3,
      name: 'Acoustic Free-Field Radiation',
      part: 'soundhole',
      desc: 'Sound pressure waves propagate omnidirectionally into the listening space.',
    },
  ];

  // Standing Wave / Membrane 2D canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.045;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (instrument.id === 'drum') {
        // 2D Bessel Circular Membrane Simulation
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.min(w, h) * 0.42;

        for (let ring = 5; ring >= 1; ring--) {
          const r = (ring / 5) * maxR;
          const amp = Math.sin(time * 3 - ring * 1.2) * 8;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(1, r + amp), 0, Math.PI * 2);
          ctx.strokeStyle = ring % 2 === 0 ? '#F2C14E' : '#FFD36A';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Center hit pulse
        ctx.beginPath();
        ctx.arc(cx, cy, 6 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      } else {
        // Transverse Standing Wave Simulation
        const cy = h / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, cy);
        ctx.lineTo(w - 10, cy);
        ctx.stroke();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#F2C14E';
        ctx.beginPath();

        const n = activeHarmonicMode; // 1, 2, 3
        const length = w - 40;

        for (let x = 0; x <= length; x += 2) {
          const spatialPart = Math.sin((n * Math.PI * x) / length);
          const timePart = Math.cos(time * 4 * n);
          const y = cy + spatialPart * timePart * 35;

          if (x === 0) ctx.moveTo(20 + x, y);
          else ctx.lineTo(20 + x, y);
        }

        ctx.stroke();

        // Node markers
        for (let k = 0; k <= n; k++) {
          const nx = 20 + (k / n) * length;
          ctx.beginPath();
          ctx.arc(nx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FFD36A';
          ctx.fill();
        }
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [instrument.id, activeHarmonicMode]);

  const handleStageSelect = (idx: number) => {
    setActiveStage(idx);
    const stage = stages[idx];
    if (stage && instrument.parts[stage.part]) {
      setSelectedPartKey(stage.part);
    }
    triggerVibration(1.0);
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Visualizer Canvas Box */}
      <div className="p-3.5 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
              {instrument.id === 'drum' ? 'Bessel Membrane Eigenmodes' : 'Physical Standing Waveform'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--accent)]">
            Mode n = {activeHarmonicMode}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={480}
          height={130}
          className="w-full h-auto bg-[var(--surface)]/80 rounded-lg border border-[var(--border)]"
        />

        {/* Harmonic Mode Selectors (for strings/brass/piano) */}
        {instrument.id !== 'drum' && (
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4].map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveHarmonicMode(mode)}
                className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all ${
                  activeHarmonicMode === mode
                    ? 'bg-[var(--accent)] text-[#070A0F] font-bold'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {mode === 1 ? 'f₀ (Fundamental)' : `${mode}f (${mode}x)`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mechanism Propagation Pipeline (Follow the Mechanism) */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] block">
          Acoustic Propagation Chain
        </span>

        <div className="space-y-2">
          {stages.map((st) => {
            const isActive = activeStage === st.id;
            return (
              <div
                key={st.id}
                onClick={() => handleStageSelect(st.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'glass-panel-accent border-[var(--accent)] bg-[var(--accentSoft)]'
                    : 'bg-[var(--surface2)]/40 border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-[var(--accent)] text-[#070A0F]'
                          : 'bg-white/10 text-[var(--muted)]'
                      }`}
                    >
                      {st.id + 1}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text)] font-heading">
                      {st.name}
                    </span>
                  </div>
                  {isActive && <Radio className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />}
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1 pl-7 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

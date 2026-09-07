import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Volume2, Play, RefreshCw, Sparkles, Activity, Disc, Music } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';
import { useViewerStore } from '../../store/useViewerStore';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getNearestNote = (freq: number): { note: string; cents: number } => {
  const midi = 69 + 12 * Math.log2(Math.max(1, freq) / 440);
  const roundedMidi = Math.round(midi);
  const noteName = NOTE_NAMES[((roundedMidi % 12) + 12) % 12];
  const octave = Math.floor(roundedMidi / 12) - 1;
  const cents = Math.round((midi - roundedMidi) * 100);
  return {
    note: `${noteName}${octave}`,
    cents,
  };
};

export const ExperimentMode: React.FC = () => {
  const { t } = useTranslation();
  const triggerVibration = useViewerStore((s) => s.triggerVibration);

  // Active Lab Tab: 'string' | 'membrane'
  const [activeTab, setActiveTab] = useState<'string' | 'membrane'>('string');

  // String Parameters:
  const [lengthL, setLengthL] = useState<number>(0.65);
  const [tensionT, setTensionT] = useState<number>(72);
  const [densityMu, setDensityMu] = useState<number>(0.0032);

  // Membrane Parameters:
  // R: Radius in meters (0.10m to 0.40m, i.e., 8" to 32" diameter)
  const [radiusR, setRadiusR] = useState<number>(0.18);
  // T: Surface tension in N/m (1000 N/m to 6000 N/m)
  const [membraneTension, setMembraneTension] = useState<number>(2800);
  // σ: Areal density in kg/m² (0.15 to 0.50 kg/m² for Mylar/Goatskin)
  const [arealDensity, setArealDensity] = useState<number>(0.26);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // String frequency: f = (1 / (2L)) * sqrt(T / μ)
  const calculatedStringFreq = useMemo(() => {
    if (lengthL <= 0 || densityMu <= 0) return 196;
    const waveSpeed = Math.sqrt(tensionT / densityMu);
    return waveSpeed / (2 * lengthL);
  }, [lengthL, tensionT, densityMu]);

  // Membrane fundamental mode (0,1): f₀₁ = (2.4048 / (2 * π * R)) * sqrt(T / σ)
  const calculatedMembraneFreq = useMemo(() => {
    if (radiusR <= 0 || arealDensity <= 0) return 200;
    const waveSpeed = Math.sqrt(membraneTension / arealDensity);
    return (2.4048 / (2 * Math.PI * radiusR)) * waveSpeed;
  }, [radiusR, membraneTension, arealDensity]);

  const currentFreq = activeTab === 'string' ? calculatedStringFreq : calculatedMembraneFreq;
  const nearestNoteInfo = useMemo(() => getNearestNote(currentFreq), [currentFreq]);

  const handleTriggerSound = () => {
    if (activeTab === 'string') {
      audioEngine.playGuitarString(calculatedStringFreq, 2.5);
    } else {
      audioEngine.playDrumStrike(calculatedMembraneFreq, 1.0);
    }
    triggerVibration(1.4);
  };

  // Canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const speed = Math.min(0.25, Math.max(0.02, (currentFreq / 440) * 0.08));
      time += speed;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (activeTab === 'string') {
        const cy = h / 2;
        const startX = 25;
        const endX = w - 25;
        const stringPx = (lengthL / 1.0) * (endX - startX);
        const effectiveEndX = startX + stringPx;

        // Baseline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, cy);
        ctx.lineTo(endX, cy);
        ctx.stroke();

        // Active vibrating string
        const thickness = Math.max(1.5, Math.min(6, (densityMu / 0.008) * 6));
        ctx.lineWidth = thickness;
        ctx.strokeStyle = '#F2C14E';
        ctx.beginPath();

        const maxAmp = 28;
        const waveOsc = Math.cos(time * 12);

        for (let px = startX; px <= effectiveEndX; px += 2) {
          const norm = (px - startX) / stringPx;
          const envelope = Math.sin(norm * Math.PI);
          const y = cy + envelope * waveOsc * maxAmp;

          if (px === startX) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();

        // Pins
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(startX, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(effectiveEndX, cy, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Circular membrane Bessel standing modes visualizer
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.min(cx - 20, cy - 8);
        const dispR = (radiusR / 0.4) * maxR;

        // Outer drum rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, dispR, 0, Math.PI * 2);
        ctx.stroke();

        // Bessel nodal wave ripples
        const besselOsc = Math.sin(time * 10);
        for (let r = 5; r < dispR; r += 8) {
          const normR = r / dispR;
          const amp = Math.cos(normR * Math.PI * 1.5) * besselOsc * 16;
          const alpha = Math.max(0.1, 0.8 * (1 - normR));

          ctx.strokeStyle = `rgba(242, 193, 78, ${alpha})`;
          ctx.lineWidth = Math.max(1, 2 + amp * 0.1);
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(1, r + amp * 0.3), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center antinode pulse
        ctx.fillStyle = '#F2C14E';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(2, 5 + besselOsc * 3), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, currentFreq, lengthL, densityMu, radiusR]);

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
        <button
          onClick={() => setActiveTab('string')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'string'
              ? 'bg-[var(--accent)] text-[#070A0F] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>String Acoustics</span>
        </button>
        <button
          onClick={() => setActiveTab('membrane')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'membrane'
              ? 'bg-[var(--accent)] text-[#070A0F] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Drum Membrane</span>
        </button>
      </div>

      {/* Title & Physics Formula Header */}
      <div className="p-4 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
            {activeTab === 'string'
              ? 'Mersenne’s String Law Lab'
              : 'Circular Membrane Bessel Physics Lab'}
          </h2>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs text-[var(--accent)] tracking-wider">
          {activeTab === 'string'
            ? 'f = (1 / 2L) · √(T / μ)'
            : 'f₀₁ = (2.4048 / 2πR) · √(T / σ)'}
        </div>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
          {activeTab === 'string'
            ? 'Manipulate length, tension, and linear mass density to observe real-time modal standing wave response.'
            : 'Explore how drum radius, hoop tension, and head surface mass alter non-harmonic Bessel oscillation modes.'}
        </p>
      </div>

      {/* Calculated Pitch Output Card */}
      <div className="p-4 rounded-xl glass-panel-accent border border-[var(--accent)]/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">
            Fundamental Frequency
          </span>
          <div className="text-2xl font-mono font-bold text-[var(--accent)] mt-0.5">
            {currentFreq.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[var(--text)]">Hz</span>
          </div>
          <div className="text-xs font-mono text-[var(--muted)] mt-0.5">
            Nearest Pitch:{' '}
            <span className="text-[var(--text)] font-semibold">{nearestNoteInfo.note}</span>{' '}
            <span className="text-[10px] text-[var(--accent)]">
              ({nearestNoteInfo.cents >= 0 ? `+${nearestNoteInfo.cents}` : nearestNoteInfo.cents}c)
            </span>
          </div>
        </div>

        {/* Trigger Audio Button */}
        <button
          onClick={handleTriggerSound}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-[#070A0F] shadow-lg shadow-[var(--accentGlow)] hover:scale-105 active:scale-95 transition-all group"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
            {activeTab === 'string' ? 'Pluck' : 'Strike'}
          </span>
        </button>
      </div>

      {/* Real-time Dynamic Oscillation Canvas */}
      <div className="p-3 rounded-xl bg-[var(--surface2)]/70 border border-[var(--border)] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
          <span>
            {activeTab === 'string' ? 'Standing Wave Displacement' : 'Bessel Mode (0,1) Radial Motion'}
          </span>
          <span className="text-[var(--accent)]">
            {activeTab === 'string' ? `L = ${lengthL.toFixed(2)} m` : `Ø = ${(radiusR * 2 * 39.37).toFixed(1)}"`}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={480}
          height={110}
          className="w-full h-auto bg-[var(--surface)]/90 rounded-lg border border-[var(--border)]"
        />
      </div>

      {/* Sliders Block */}
      {activeTab === 'string' ? (
        <div className="p-4 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)] space-y-4">
          {/* 1. String Length L */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)] font-medium">String Length (L)</span>
              <span className="font-mono text-[var(--accent)]">{lengthL.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.00"
              step="0.01"
              value={lengthL}
              onChange={(e) => setLengthL(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer appearance-none"
            />
          </div>

          {/* 2. Tension T */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)] font-medium">Tension (T)</span>
              <span className="font-mono text-[var(--accent)]">{tensionT.toFixed(0)} N</span>
            </div>
            <input
              type="range"
              min="30"
              max="160"
              step="1"
              value={tensionT}
              onChange={(e) => setTensionT(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer appearance-none"
            />
          </div>

          {/* 3. Linear Mass Density μ */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)] font-medium">Linear Mass Density (μ)</span>
              <span className="font-mono text-[var(--accent)]">
                {(densityMu * 1000).toFixed(2)} g/m
              </span>
            </div>
            <input
              type="range"
              min="0.0005"
              max="0.0080"
              step="0.0001"
              value={densityMu}
              onChange={(e) => setDensityMu(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer appearance-none"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)] space-y-4">
          {/* 1. Radius R */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)] font-medium">Head Radius (R)</span>
              <span className="font-mono text-[var(--accent)]">
                {(radiusR * 100).toFixed(1)} cm ({(radiusR * 2 * 39.37).toFixed(1)}")
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.36"
              step="0.01"
              value={radiusR}
              onChange={(e) => setRadiusR(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer appearance-none"
            />
          </div>

          {/* 2. Membrane Tension */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)] font-medium">Hoop Tension (T)</span>
              <span className="font-mono text-[var(--accent)]">{membraneTension.toFixed(0)} N/m</span>
            </div>
            <input
              type="range"
              min="800"
              max="6000"
              step="50"
              value={membraneTension}
              onChange={(e) => setMembraneTension(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer appearance-none"
            />
          </div>

          {/* 3. Areal Density */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)] font-medium">Head Surface Density (σ)</span>
              <span className="font-mono text-[var(--accent)]">
                {(arealDensity * 1000).toFixed(0)} g/m²
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.55"
              step="0.01"
              value={arealDensity}
              onChange={(e) => setArealDensity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer appearance-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

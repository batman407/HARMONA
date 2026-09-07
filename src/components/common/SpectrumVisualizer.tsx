import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../../audio/AudioEngine';

interface SpectrumVisualizerProps {
  height?: number;
  barColor?: string;
  fundamentalFreq?: number;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  height = 140,
  barColor = '#F2C14E',
  fundamentalFreq = 440,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      animationId = requestAnimationFrame(render);

      const width = canvas.width;
      const h = canvas.height;
      const data = audioEngine.getFrequencyData();

      ctx.clearRect(0, 0, width, h);

      // Background frequency grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridFreqs = [100, 500, 1000, 2000, 4000, 8000];
      gridFreqs.forEach((f) => {
        // Approximate log scale position
        const bin = Math.floor((f / 24000) * data.length);
        const x = (bin / (data.length * 0.4)) * width;
        if (x <= width) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
      });

      // Frequency bars (focus on first 40% audible spectrum)
      const numBars = 64;
      const barWidth = (width / numBars) - 1.5;
      const step = Math.floor((data.length * 0.35) / numBars);

      for (let i = 0; i < numBars; i++) {
        const binIndex = i * step;
        const val = data[binIndex] || 0;
        const barHeight = (val / 255) * (h - 22);

        const x = i * (barWidth + 1.5);
        const y = h - barHeight - 16;

        // Gradient bar
        const grad = ctx.createLinearGradient(0, y, 0, h - 16);
        grad.addColorStop(0, '#FFD36A');
        grad.addColorStop(1, 'rgba(214, 167, 61, 0.25)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak dot
        if (barHeight > 6) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, y - 2, barWidth, 2);
        }
      }

      // Harmonic peak markers (fundamental f0, 2f0, 3f0)
      if (fundamentalFreq > 0) {
        const sampleRate = 48000;
        const totalBins = 1024;
        const nyquist = sampleRate / 2;

        for (let harmonic = 1; harmonic <= 4; harmonic++) {
          const targetFreq = fundamentalFreq * harmonic;
          const targetBin = Math.floor((targetFreq / nyquist) * totalBins);
          const barIndex = Math.floor(targetBin / step);

          if (barIndex < numBars) {
            const hx = barIndex * (barWidth + 1.5) + barWidth / 2;
            ctx.fillStyle = harmonic === 1 ? '#F2C14E' : 'rgba(255, 211, 106, 0.7)';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(harmonic === 1 ? 'f₀' : `${harmonic}f`, hx, h - 4);
          }
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [barColor, fundamentalFreq]);

  return (
    <div className="w-full relative rounded-xl overflow-hidden bg-[var(--surface2)]/60 border border-[var(--border)] p-2">
      <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted)] mb-1 flex items-center justify-between">
        <span>FFT Spectrum & Harmonic Series</span>
        <span className="text-[var(--accent)] font-semibold">100Hz – 8kHz</span>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={height}
        className="w-full h-auto block rounded-lg"
      />
    </div>
  );
};

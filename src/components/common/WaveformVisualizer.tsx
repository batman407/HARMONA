import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../../audio/AudioEngine';

interface WaveformVisualizerProps {
  height?: number;
  strokeColor?: string;
  fillGradient?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  height = 120,
  strokeColor = '#F2C14E',
  fillGradient = true,
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
      const data = audioEngine.getWaveformData();

      ctx.clearRect(0, 0, width, h);

      // Subtle center gridline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      // Waveform line
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();

      const sliceWidth = (width * 1.0) / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0; // 0 to 2
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Optional subtle glowing gradient under wave
      if (fillGradient) {
        ctx.lineTo(width, h / 2);
        ctx.lineTo(0, h / 2);
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(242, 193, 78, 0.18)');
        grad.addColorStop(1, 'rgba(242, 193, 78, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [strokeColor, fillGradient]);

  return (
    <div className="w-full relative rounded-xl overflow-hidden bg-[var(--surface2)]/60 border border-[var(--border)] p-2">
      <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted)] mb-1 flex items-center justify-between">
        <span>Time-Domain Oscilloscope</span>
        <span className="text-[var(--accent)] font-semibold">2048 pts</span>
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

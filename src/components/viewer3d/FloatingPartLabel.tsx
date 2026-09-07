import React from 'react';
import { Html } from '@react-three/drei';
import { useViewerStore } from '../../store/useViewerStore';
import { InstrumentData } from '../../content/types';

interface FloatingPartLabelProps {
  instrument: InstrumentData;
}

export const FloatingPartLabel: React.FC<FloatingPartLabelProps> = ({ instrument }) => {
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const hoveredPartKey = useViewerStore((s) => s.hoveredPartKey);
  const explodeProgress = useViewerStore((s) => s.explodeProgress);

  const activeKey = selectedPartKey || hoveredPartKey;
  if (!activeKey) return null;

  const part = instrument.parts[activeKey];
  if (!part) return null;

  const explodeVec = part.explodeVector || [0, 0, 0];
  const position: [number, number, number] = [
    explodeVec[0] * explodeProgress * 2.2,
    explodeVec[1] * explodeProgress * 2.2 + 0.35,
    explodeVec[2] * explodeProgress * 2.2,
  ];

  return (
    <Html position={position} center distanceFactor={6} zIndexRange={[100, 0]}>
      <div className="pointer-events-none transition-all duration-300 transform -translate-y-2">
        <div className="glass-panel-accent px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-xl border border-[#F2C14E]/40 text-left min-w-[180px] max-w-[240px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2C14E] animate-ping" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F2C14E]">
              {part.characteristics.role || 'Acoustic Component'}
            </span>
          </div>
          <div className="text-xs font-semibold text-[var(--text)] font-heading leading-tight">
            {part.label}
          </div>
          <div className="text-[10px] text-[var(--muted)] line-clamp-2 mt-0.5">
            {part.characteristics.mechanism}
          </div>
        </div>
      </div>
    </Html>
  );
};

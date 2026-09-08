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
  // Float neatly above the part so it doesn't block the strike/click area
  const position: [number, number, number] = [
    explodeVec[0] * explodeProgress * 2.2,
    explodeVec[1] * explodeProgress * 2.2 + 0.85,
    explodeVec[2] * explodeProgress * 2.2,
  ];

  return (
    <Html
      position={position}
      center
      pointerEvents="none"
      zIndexRange={[50, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className="pointer-events-none select-none transition-all duration-200 transform -translate-y-2 flex flex-col items-center">
        {/* Sleek compact pill badge */}
        <div className="px-3 py-1 rounded-full bg-[#0B0F17]/92 backdrop-blur-md border border-[#F2C14E]/50 shadow-xl flex items-center gap-2 whitespace-nowrap pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F2C14E] shrink-0" />
          <span className="text-[11px] font-semibold text-white font-heading tracking-wide">
            {part.label}
          </span>
          {part.characteristics.role && (
            <span className="text-[9px] text-[#F2C14E]/90 uppercase font-mono tracking-wider pl-1.5 border-l border-white/20 shrink-0">
              {part.characteristics.role}
            </span>
          )}
        </div>
        {/* Subtle indicator downward notch */}
        <div className="w-1.5 h-1.5 bg-[#0B0F17]/90 border-r border-b border-[#F2C14E]/50 transform rotate-45 -mt-1 pointer-events-none" />
      </div>
    </Html>
  );
};

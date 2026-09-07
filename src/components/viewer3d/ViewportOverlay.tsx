import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { useViewerStore } from '../../store/useViewerStore';
import { useAppStore } from '../../store/useAppStore';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  Hand,
  Compass,
  Layers,
  Activity,
} from 'lucide-react';

interface ViewportOverlayProps {
  instrument: InstrumentData;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const autoRotate = useViewerStore((s) => s.autoRotate);
  const toggleAutoRotate = useViewerStore((s) => s.toggleAutoRotate);
  const resetCamera = useViewerStore((s) => s.resetCamera);
  const explodeProgress = useViewerStore((s) => s.explodeProgress);
  const setExplodeProgress = useViewerStore((s) => s.setExplodeProgress);
  const activeMode = useAppStore((s) => s.activeMode);
  const lastPlayedNote = useAppStore((s) => s.lastPlayedNote);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
      {/* Top Left: Instrument Badge */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="glass-panel px-3.5 py-1.5 rounded-xl border border-[var(--border)] flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--text)] font-heading">
            {instrument.name}
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono border-l border-[var(--border)] pl-2">
            {instrument.characteristics.pitchRange.split('(')[0]}
          </span>
        </div>

        {/* Live Note Badge (when sound is triggered) */}
        {lastPlayedNote && (
          <div className="glass-panel-accent px-3 py-1.5 rounded-xl flex items-center gap-2 animate-bounce-short shadow-xl">
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs font-mono font-bold text-[var(--text)]">
              {lastPlayedNote.note}
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)]">
              {lastPlayedNote.freq.toFixed(1)} Hz
            </span>
          </div>
        )}
      </div>

      {/* Bottom Center / Bottom Left: 3D Interaction Hints */}
      <div className="flex items-end justify-between w-full">
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center gap-2 shadow-md">
          <Hand className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Rotate: Left Click · Pan: Right Click · Zoom: Scroll · Click parts to inspect</span>
        </div>

        {/* Quick View Controls Floating Bar */}
        <div className="pointer-events-auto flex items-center gap-2 glass-panel p-1.5 rounded-xl border border-[var(--border)] shadow-xl">
          {activeMode === 'disassemble' && (
            <div className="flex items-center gap-2 px-2 border-r border-[var(--border)]">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={explodeProgress}
                onChange={(e) => setExplodeProgress(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={resetCamera}
            title={t('actions.resetCamera', 'Reset Camera')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleAutoRotate}
            title={t('actions.autoRotate', 'Auto-Rotate 3D')}
            className={`p-1.5 rounded-lg transition-colors ${
              autoRotate
                ? 'bg-[var(--accentSoft)] text-[var(--accent)]'
                : 'hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

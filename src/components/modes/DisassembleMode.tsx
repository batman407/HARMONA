import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { useViewerStore } from '../../store/useViewerStore';
import {
  Layers,
  Eye,
  RotateCcw,
  Sparkles,
  Maximize2,
  Box,
  Info,
  AlertCircle,
  Clock,
} from 'lucide-react';
import gsap from 'gsap';

interface DisassembleModeProps {
  instrument: InstrumentData;
}

export const DisassembleMode: React.FC<DisassembleModeProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const explodeProgress = useViewerStore((s) => s.explodeProgress);
  const setExplodeProgress = useViewerStore((s) => s.setExplodeProgress);
  const selectedPartKey = useViewerStore((s) => s.selectedPartKey);
  const setSelectedPartKey = useViewerStore((s) => s.setSelectedPartKey);
  const isGhostMode = useViewerStore((s) => s.isGhostMode);
  const toggleGhostMode = useViewerStore((s) => s.toggleGhostMode);
  const isolatedPartKey = useViewerStore((s) => s.isolatedPartKey);
  const setIsolatedPartKey = useViewerStore((s) => s.setIsolatedPartKey);
  const resetDisassembly = useViewerStore((s) => s.resetDisassembly);

  const capability = instrument.modelCapability;
  const isExternalGlb = capability?.hasModel ?? false;
  // If external GLB is used, check if it has multiple parts; if using built-in models, all 17 have rich parts
  const supportsDisassemble = isExternalGlb ? (capability?.supportsDisassemble ?? false) : Object.keys(instrument.parts).length > 0;

  const selectedPart = selectedPartKey ? instrument.parts[selectedPartKey] : null;

  // Animate explosion with GSAP
  const handleQuickExplode = (target: number) => {
    if (!supportsDisassemble) return;
    const obj = { val: explodeProgress };
    gsap.to(obj, {
      val: target,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setExplodeProgress(obj.val),
    });
  };

  const handleToggleIsolate = () => {
    if (!selectedPartKey || !supportsDisassemble) return;
    if (isolatedPartKey === selectedPartKey) {
      setIsolatedPartKey(null);
    } else {
      setIsolatedPartKey(selectedPartKey);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Capability Notification Banner if Disassemble is not supported for external single-mesh */}
      {isExternalGlb && !supportsDisassemble ? (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-300">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Anatomy model not available yet</span>
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              This photoreal model is currently a unified single-mesh sculpt. Interactive anatomical explosion requires a segmented multi-part CAD model.
            </p>
          </div>
        </div>
      ) : null}

      {/* Disassemble Control Hub */}
      <div className={`p-4 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)] space-y-4 ${
        !supportsDisassemble ? 'opacity-50 pointer-events-none' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
              {t('actions.explode', 'Explode Controls')}
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-[var(--accent)]">
            {Math.round(explodeProgress * 100)}%
          </span>
        </div>

        {/* Explode Range Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            disabled={!supportsDisassemble}
            value={explodeProgress}
            onChange={(e) => setExplodeProgress(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg cursor-pointer appearance-none accent-[var(--accent)] disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
            <span>Assembled</span>
            <span>Fully Exploded</span>
          </div>
        </div>

        {/* Quick Explode Presets & Tools */}
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={!supportsDisassemble}
            onClick={() => handleQuickExplode(explodeProgress > 0.5 ? 0 : 1)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-white/10 border border-[var(--border)] text-xs text-[var(--text)] transition-colors disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{explodeProgress > 0.5 ? 'Snap Assemble' : 'Max Explode'}</span>
          </button>

          <button
            onClick={toggleGhostMode}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all ${
              isGhostMode
                ? 'bg-[var(--accentSoft)] border-[var(--accent)] text-[var(--accent)]'
                : 'bg-[var(--surface)] hover:bg-white/10 border-[var(--border)] text-[var(--text)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isGhostMode ? 'Normal Materials' : t('actions.ghostMode', 'Ghost X-Ray')}</span>
          </button>
        </div>

        {/* Isolate & Reassemble Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
          <button
            disabled={!selectedPartKey || !supportsDisassemble}
            onClick={handleToggleIsolate}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all ${
              !selectedPartKey || !supportsDisassemble
                ? 'opacity-40 cursor-not-allowed border-[var(--border)]'
                : isolatedPartKey === selectedPartKey
                ? 'bg-[var(--accent)] text-[#070A0F] font-semibold border-[var(--accent)]'
                : 'bg-[var(--surface)] hover:bg-white/10 border-[var(--border)] text-[var(--text)]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isolatedPartKey === selectedPartKey ? 'Show All Parts' : t('actions.isolate', 'Isolate Part')}</span>
          </button>

          <button
            onClick={resetDisassembly}
            title={t('actions.reassemble', 'Reassemble All')}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-white/10 border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Selected Part Deep-Dive Inspector */}
      {selectedPart ? (
        <div className="p-4 rounded-xl glass-panel-accent border border-[var(--accent)]/50 space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text)] font-heading">
                {selectedPart.label}
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accentSoft)] text-[var(--accent)] font-mono uppercase">
              {selectedPart.characteristics.role}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block">
                Acoustic Function
              </span>
              <p className="text-[var(--text)] mt-0.5 leading-relaxed">
                {selectedPart.function}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block">
                  Material Spec
                </span>
                <span className="text-[11px] text-[var(--text)] font-medium block mt-0.5">
                  {selectedPart.characteristics.material}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block">
                  Mechanical Role
                </span>
                <span className="text-[11px] text-[var(--text)] font-medium block mt-0.5">
                  {selectedPart.characteristics.mechanism}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[var(--surface2)]/40 border border-dashed border-[var(--border)] text-center text-xs text-[var(--muted)] flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-[var(--accent)]/60" />
          <span>{t('actions.selectPart', 'Select a part in 3D to inspect its acoustic function')}</span>
        </div>
      )}

      {/* Parts Explorer List */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] px-1 block">
          Component Hierarchy ({Object.keys(instrument.parts).length} Elements)
        </span>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {Object.entries(instrument.parts).map(([key, part]) => {
            const isSelected = selectedPartKey === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedPartKey(isSelected ? null : key)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--accentSoft)] border-[var(--accent)] text-[var(--accent)] font-semibold'
                    : 'bg-[var(--surface2)]/40 border-[var(--border)] text-[var(--text)] hover:border-[var(--border-hover)]'
                }`}
              >
                <span>{part.label}</span>
                <span className="text-[10px] font-mono text-[var(--muted)]">
                  {part.characteristics.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { INSTRUMENTS_CATALOG, getInstrumentById } from '../../content';
import { useAppStore } from '../../store/useAppStore';
import { audioEngine } from '../../audio/AudioEngine';
import { useViewerStore } from '../../store/useViewerStore';
import { GitCompare, Volume2, Sparkles, Check } from 'lucide-react';

interface CompareModeProps {
  instrument: InstrumentData;
}

export const CompareMode: React.FC<CompareModeProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const compareInstrumentId = useAppStore((s) => s.compareInstrumentId);
  const setCompareInstrumentId = useAppStore((s) => s.setCompareInstrumentId);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);

  // If comparing same instrument, pick a different one
  const targetId =
    compareInstrumentId === instrument.id
      ? INSTRUMENTS_CATALOG.find((i) => i.id !== instrument.id)?.id || 'piano'
      : compareInstrumentId;

  const compareTarget = getInstrumentById(targetId);

  const handlePlayContrast = (instId: string) => {
    audioEngine.playInstrumentNote(instId, 440, 2.5);
    triggerVibration(1.1);
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Target Selector */}
      <div className="p-3 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Compare Against
          </span>
          <GitCompare className="w-3.5 h-3.5 text-[var(--accent)]" />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {INSTRUMENTS_CATALOG.filter((i) => i.id !== instrument.id).map((other) => (
            <button
              key={other.id}
              onClick={() => setCompareInstrumentId(other.id)}
              className={`py-1.5 px-2 rounded-lg text-xs transition-all ${
                targetId === other.id
                  ? 'bg-[var(--accent)] text-[#070A0F] font-bold'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {other.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Fingerprint Comparison */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left: Current Instrument */}
        <div className="p-3.5 rounded-xl glass-panel border border-[var(--accent)]/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[var(--accent)] font-semibold">
              Current
            </span>
            <button
              onClick={() => handlePlayContrast(instrument.id)}
              className="p-1 rounded bg-[var(--accentSoft)] text-[var(--accent)] hover:scale-105 transition-transform"
              title="Play A4 440Hz"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-xs font-bold text-[var(--text)] font-heading leading-tight truncate">
            {instrument.name}
          </h3>

          {/* Fingerprint Bars */}
          <div className="space-y-1.5 text-[10px]">
            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Warmth</span>
                <span className="font-mono">{instrument.soundDNA.harmonicWarmth}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${instrument.soundDNA.harmonicWarmth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Perk/Impact</span>
                <span className="font-mono">{instrument.soundDNA.percussiveness}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${instrument.soundDNA.percussiveness}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Sustain</span>
                <span className="font-mono">{instrument.soundDNA.sustainScore}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${instrument.soundDNA.sustainScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Brightness</span>
                <span className="font-mono">{instrument.soundDNA.brightness}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{ width: `${instrument.soundDNA.brightness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Target Instrument */}
        <div className="p-3.5 rounded-xl glass-panel border border-[var(--border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[var(--muted)] font-semibold">
              Compare
            </span>
            <button
              onClick={() => handlePlayContrast(compareTarget.id)}
              className="p-1 rounded bg-[var(--accentSoft)] text-[var(--accent)] hover:scale-105 transition-transform"
              title="Play A4 440Hz"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-xs font-bold text-[var(--text)] font-heading leading-tight truncate">
            {compareTarget.name}
          </h3>

          {/* Fingerprint Bars */}
          <div className="space-y-1.5 text-[10px]">
            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Warmth</span>
                <span className="font-mono">{compareTarget.soundDNA.harmonicWarmth}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[#94B5E8]"
                  style={{ width: `${compareTarget.soundDNA.harmonicWarmth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Perk/Impact</span>
                <span className="font-mono">{compareTarget.soundDNA.percussiveness}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[#94B5E8]"
                  style={{ width: `${compareTarget.soundDNA.percussiveness}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Sustain</span>
                <span className="font-mono">{compareTarget.soundDNA.sustainScore}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[#94B5E8]"
                  style={{ width: `${compareTarget.soundDNA.sustainScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[var(--muted)]">
                <span>Brightness</span>
                <span className="font-mono">{compareTarget.soundDNA.brightness}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[#94B5E8]"
                  style={{ width: `${compareTarget.soundDNA.brightness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrast Mechanism Breakdown */}
      <div className="p-3.5 rounded-xl bg-[var(--surface2)]/50 border border-[var(--border)] space-y-2 text-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] block">
          Acoustic Transduction Contrast
        </span>

        <div className="space-y-2 pt-1">
          <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-2">
            <span className="text-[11px] text-[var(--muted)]">Exciter</span>
            <div className="text-right text-[11px] text-[var(--text)]">
              <div>{instrument.soundDNA.exciter.split(' ')[0]} ...</div>
              <div className="text-[var(--accent)] font-medium">
                vs {compareTarget.soundDNA.exciter.split(' ')[0]} ...
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-2">
            <span className="text-[11px] text-[var(--muted)]">Resonator</span>
            <div className="text-right text-[11px] text-[var(--text)]">
              <div>{instrument.soundDNA.resonator.split(' ')[0]} ...</div>
              <div className="text-[var(--accent)] font-medium">
                vs {compareTarget.soundDNA.resonator.split(' ')[0]} ...
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-[var(--muted)]">Dynamic Range</span>
            <div className="text-right text-[11px] text-[var(--text)] font-mono">
              <div>{instrument.characteristics.dynamicRange}</div>
              <div className="text-[var(--accent)]">
                vs {compareTarget.characteristics.dynamicRange}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

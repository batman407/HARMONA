import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { useViewerStore } from '../../store/useViewerStore';
import {
  Sparkles,
  Zap,
  Layers,
  Clock,
  Radio,
  History,
  BookOpen,
  ArrowRight,
  Volume2,
} from 'lucide-react';

interface ExploreModeProps {
  instrument: InstrumentData;
}

export const ExploreMode: React.FC<ExploreModeProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const setSelectedPartKey = useViewerStore((s) => s.setSelectedPartKey);
  const activeSoundStep = useViewerStore((s) => s.activeSoundStep);
  const setActiveSoundStep = useViewerStore((s) => s.setActiveSoundStep);

  const [activeTab, setActiveTab] = useState<'dna' | 'soundPath' | 'history'>('dna');

  const soundDna = instrument.soundDNA;

  const handleStepClick = (stepIndex: number, partKey: string) => {
    setActiveSoundStep(stepIndex);
    setSelectedPartKey(partKey);
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Instrument Title & Family Header */}
      <div className="p-3.5 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--accentSoft)] text-[var(--accent)] border border-[var(--accentBorder)] font-semibold">
            {instrument.familyName}
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">
            {instrument.characteristics.pitchRange}
          </span>
        </div>
        <h2 className="text-xl font-heading font-semibold text-[var(--text)] leading-tight">
          {instrument.name}
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
          {instrument.description}
        </p>
      </div>

      {/* Sub-Navigation: Sound DNA vs Follow the Sound vs Origins */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-xs">
        <button
          onClick={() => setActiveTab('dna')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'dna'
              ? 'bg-[var(--accent)] text-[#070A0F] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {t('soundDNA.title', 'Sound DNA')}
        </button>
        <button
          onClick={() => setActiveTab('soundPath')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'soundPath'
              ? 'bg-[var(--accent)] text-[#070A0F] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {t('actions.followTheSound', 'Sound Path')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-[var(--accent)] text-[#070A0F] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          Acoustics & History
        </button>
      </div>

      {/* Tab 1: Sound DNA */}
      {activeTab === 'dna' && (
        <div className="space-y-3">
          {/* Radar Metric Bars */}
          <div className="p-3.5 rounded-xl bg-[var(--surface2)]/60 border border-[var(--border)] space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] block">
              Acoustic Profile Metrics
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] mb-1">
                  <span>Harmonic Warmth</span>
                  <span className="font-mono text-[var(--accent)]">{soundDna.harmonicWarmth}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                    style={{ width: `${soundDna.harmonicWarmth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] mb-1">
                  <span>Percussiveness</span>
                  <span className="font-mono text-[var(--accent)]">{soundDna.percussiveness}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                    style={{ width: `${soundDna.percussiveness}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] mb-1">
                  <span>Sustain Power</span>
                  <span className="font-mono text-[var(--accent)]">{soundDna.sustainScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                    style={{ width: `${soundDna.sustainScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[var(--muted)] mb-1">
                  <span>Acoustic Brightness</span>
                  <span className="font-mono text-[var(--accent)]">{soundDna.brightness}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                    style={{ width: `${soundDna.brightness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DNA Structured Details */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[var(--surface2)]/40 border border-[var(--border)] flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-[var(--text)]">
                  {t('soundDNA.exciter', 'Exciter Mechanism')}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  {soundDna.exciter}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface2)]/40 border border-[var(--border)] flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-[var(--text)]">
                  {t('soundDNA.resonator', 'Resonator Body')}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  {soundDna.resonator}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface2)]/40 border border-[var(--border)] flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-[var(--text)]">
                  {t('soundDNA.attackDecay', 'Attack & Decay Envelope')}
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  {soundDna.attackDecay}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface2)]/40 border border-[var(--border)] flex items-start gap-2.5">
              <Radio className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-[var(--text)]">
                  Radiation & Directionality
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">
                  {soundDna.radiationPattern}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Follow The Sound Path */}
      {activeTab === 'soundPath' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-[var(--muted)]">
            Follow the chain of acoustic transduction from initial excitation to final acoustic radiation.
          </p>
          {instrument.followTheSound.map((step) => {
            const isCurrent = activeSoundStep === step.step;
            return (
              <div
                key={step.step}
                onClick={() => handleStepClick(step.step, step.partKey)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'glass-panel-accent border-[var(--accent)] bg-[var(--accentSoft)]'
                    : 'bg-[var(--surface2)]/40 border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[var(--accent)] text-[#070A0F]'
                        : 'bg-white/10 text-[var(--muted)]'
                    }`}
                  >
                    {step.step}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text)] font-heading">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed pl-7">
                  {step.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Acoustics & History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[var(--surface2)]/50 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-1.5">
              <History className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--text)]">Historical Evolution</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {instrument.historicalOrigins}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface2)]/50 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--text)]">Governing Physics</span>
            </div>
            <ul className="space-y-2">
              {instrument.acousticPrinciples.map((principle, idx) => (
                <li key={idx} className="text-xs text-[var(--muted)] flex items-start gap-2">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

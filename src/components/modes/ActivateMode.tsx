import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { useAppStore } from '../../store/useAppStore';
import { useViewerStore } from '../../store/useViewerStore';
import { audioEngine } from '../../audio/AudioEngine';
import { WaveformVisualizer } from '../common/WaveformVisualizer';
import { PlayCircle, Volume2, Sparkles, Hand } from 'lucide-react';

interface ActivateModeProps {
  instrument: InstrumentData;
}

export const ActivateMode: React.FC<ActivateModeProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const lastPlayedNote = useAppStore((s) => s.lastPlayedNote);
  const setLastPlayedNote = useAppStore((s) => s.setLastPlayedNote);
  const triggerVibration = useViewerStore((s) => s.triggerVibration);

  const controls = instrument.interactiveControls;

  const handleTriggerClick = (noteLabel: string, noteName: string, freq: number) => {
    audioEngine.playInstrumentNote(instrument.id, freq);
    triggerVibration(1.2);
    setLastPlayedNote({ note: `${noteLabel} (${noteName})`, freq });
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Active Note Feedback Card */}
      <div className="p-4 rounded-xl glass-panel-accent border border-[var(--accent)]/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--muted)]">
            Acoustic Pitch State
          </span>
          <div className="text-xl font-heading font-semibold text-[var(--text)] mt-0.5">
            {lastPlayedNote ? lastPlayedNote.note : 'Ready to Play'}
          </div>
          <div className="text-xs font-mono text-[var(--accent)] mt-0.5">
            {lastPlayedNote ? `${lastPlayedNote.freq.toFixed(2)} Hz` : 'Touch triggers or 3D model'}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--accentSoft)] border border-[var(--accentBorder)] flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-[var(--accent)]" />
        </div>
      </div>

      {/* Live Waveform Oscilloscope */}
      <WaveformVisualizer height={100} />

      {/* 3D Model Interaction Guide */}
      <div className="p-3 rounded-xl bg-[var(--surface2)]/60 border border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--muted)]">
        <Hand className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <span>
          Click directly on the 3D model (strings, piano keys, drum batter head, or trumpet pistons) to trigger mechanical sound in 3D!
        </span>
      </div>

      {/* Direct Triggers Pad */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Interactive Trigger Board
          </span>
          <span className="text-[10px] text-[var(--accent)] font-mono">
            {controls.keysOrTriggers.length} Notes
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {controls.keysOrTriggers.map((trig) => (
            <button
              key={trig.id}
              onClick={() => handleTriggerClick(trig.label, trig.note, trig.freq)}
              className="flex flex-col items-start p-3 rounded-xl bg-[var(--surface2)] hover:bg-[var(--accentSoft)] border border-[var(--border)] hover:border-[var(--accent)] transition-all group active:scale-95 text-left"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {trig.label}
                </span>
                <PlayCircle className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)] mt-1">
                {trig.freq.toFixed(1)} Hz
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

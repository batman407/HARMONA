import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstrumentData } from '../../content/types';
import { WaveformVisualizer } from '../common/WaveformVisualizer';
import { SpectrumVisualizer } from '../common/SpectrumVisualizer';
import { audioEngine } from '../../audio/AudioEngine';
import { useViewerStore } from '../../store/useViewerStore';
import { INSTRUMENTS_CATALOG } from '../../content';
import { Play, Volume2, Info, Sparkles } from 'lucide-react';

interface SoundLabModeProps {
  instrument: InstrumentData;
}

interface NoteOption {
  label: string;
  note: string;
  freq: number;
}

const CONCERT_NOTES: NoteOption[] = [
  { label: 'C3 (130.8 Hz)', note: 'C3', freq: 130.81 },
  { label: 'G3 (196.0 Hz)', note: 'G3', freq: 196.00 },
  { label: 'C4 (Middle C 261.6 Hz)', note: 'C4', freq: 261.63 },
  { label: 'E4 (329.6 Hz)', note: 'E4', freq: 329.63 },
  { label: 'A4 (Concert Pitch 440 Hz)', note: 'A4', freq: 440.00 },
  { label: 'C5 (High C 523.3 Hz)', note: 'C5', freq: 523.25 },
];

export const SoundLabMode: React.FC<SoundLabModeProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const triggerVibration = useViewerStore((s) => s.triggerVibration);

  const [selectedNote, setSelectedNote] = useState<NoteOption>(CONCERT_NOTES[4]); // A4 default
  const [playingInstrumentId, setPlayingInstrumentId] = useState<string | null>(null);

  const handlePlaySameNote = (instId: string) => {
    setPlayingInstrumentId(instId);
    audioEngine.playInstrumentNote(instId, selectedNote.freq, 2.5);
    triggerVibration(1.2);
    setTimeout(() => {
      setPlayingInstrumentId(null);
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none">
      {/* Concert Pitch Selector */}
      <div className="p-3.5 rounded-xl bg-[var(--surface2)]/80 border border-[var(--border)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {t('soundLab.selectNote', 'Select Concert Pitch')}
          </span>
          <span className="text-xs font-mono font-bold text-[var(--accent)]">
            {selectedNote.freq.toFixed(2)} Hz
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {CONCERT_NOTES.map((note) => {
            const isSelected = selectedNote.note === note.note;
            return (
              <button
                key={note.note}
                onClick={() => setSelectedNote(note)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[var(--accent)] text-[#070A0F] font-bold shadow-sm'
                    : 'bg-[var(--surface)] hover:bg-white/5 border border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {note.note}
              </button>
            );
          })}
        </div>
      </div>

      {/* Play Across Instruments Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] block">
          Play {selectedNote.note} Across Instruments
        </span>

        <div className="grid grid-cols-2 gap-2">
          {INSTRUMENTS_CATALOG.map((inst) => {
            const isPlaying = playingInstrumentId === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => handlePlaySameNote(inst.id)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-left group ${
                  isPlaying
                    ? 'glass-panel-accent border-[var(--accent)] bg-[var(--accentSoft)]'
                    : 'bg-[var(--surface2)]/50 border-[var(--border)] hover:border-[var(--accentBorder)] hover:bg-[var(--surface2)]'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    {inst.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] font-mono">
                    {inst.familyName}
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isPlaying
                      ? 'bg-[var(--accent)] text-[#070A0F]'
                      : 'bg-[var(--surface)] text-[var(--muted)] group-hover:text-[var(--accent)]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Oscilloscope */}
      <WaveformVisualizer height={100} strokeColor="#F2C14E" />

      {/* Real-time Spectrum FFT with Harmonic Markers */}
      <SpectrumVisualizer height={120} fundamentalFreq={selectedNote.freq} />

      {/* Acoustic Timbre Insight */}
      <div className="p-3 rounded-xl bg-[var(--surface2)]/40 border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--muted)] leading-relaxed">
        <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <span>{t('soundLab.timbreExplanation')}</span>
      </div>
    </div>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { InstrumentData } from '../../content/types';
import { ExploreMode } from '../modes/ExploreMode';
import { DisassembleMode } from '../modes/DisassembleMode';
import { ActivateMode } from '../modes/ActivateMode';
import { VisualizeMode } from '../modes/VisualizeMode';
import { SoundLabMode } from '../modes/SoundLabMode';
import { CompareMode } from '../modes/CompareMode';
import { ExperimentMode } from '../modes/ExperimentMode';

interface ContextPanelProps {
  instrument: InstrumentData;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ instrument }) => {
  const { t } = useTranslation();
  const activeMode = useAppStore((s) => s.activeMode);

  const renderModeContent = () => {
    switch (activeMode) {
      case 'explore':
        return <ExploreMode instrument={instrument} />;
      case 'disassemble':
        return <DisassembleMode instrument={instrument} />;
      case 'activate':
        return <ActivateMode instrument={instrument} />;
      case 'visualize':
        return <VisualizeMode instrument={instrument} />;
      case 'soundLab':
        return <SoundLabMode instrument={instrument} />;
      case 'compare':
        return <CompareMode instrument={instrument} />;
      case 'experiment':
        return <ExperimentMode />;
      default:
        return <ExploreMode instrument={instrument} />;
    }
  };

  const getModeTitle = () => {
    switch (activeMode) {
      case 'explore':
        return t('tabs.explore', 'Acoustic Anatomy & DNA');
      case 'disassemble':
        return t('tabs.disassemble', 'Disassembly & Part Mechanics');
      case 'activate':
        return t('tabs.activate', 'Mechanism Activation');
      case 'visualize':
        return t('tabs.visualize', 'Acoustic Wave Dynamics');
      case 'soundLab':
        return t('tabs.soundLab', 'Harmonics & Timbre Lab');
      case 'compare':
        return t('tabs.compare', 'Timbral Fingerprint Comparison');
      case 'experiment':
        return t('tabs.experiment', 'Physical String Acoustics');
    }
  };

  return (
    <aside className="w-80 md:w-96 h-full border-l border-[var(--border)] glass-panel flex flex-col z-20 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text)] font-heading">
            {getModeTitle()}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface2)] border border-[var(--border)] text-[var(--accent)] font-mono uppercase">
          {activeMode}
        </span>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderModeContent()}
      </div>
    </aside>
  );
};

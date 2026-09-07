import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Wrench,
  PlayCircle,
  Activity,
  AudioWaveform,
  GitCompare,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Globe,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAppStore, AppMode, ThemeMode } from '../../store/useAppStore';
import { useViewerStore } from '../../store/useViewerStore';
import { SUPPORTED_LOCALES } from '../../i18n/translations';
import { setAppLanguage } from '../../i18n';

interface TabItem {
  id: AppMode;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  defaultLabel: string;
}

const TABS: TabItem[] = [
  { id: 'explore', icon: Compass, labelKey: 'tabs.explore', defaultLabel: 'Explore' },
  { id: 'disassemble', icon: Wrench, labelKey: 'tabs.disassemble', defaultLabel: 'Disassemble' },
  { id: 'activate', icon: PlayCircle, labelKey: 'tabs.activate', defaultLabel: 'Activate' },
  { id: 'visualize', icon: Activity, labelKey: 'tabs.visualize', defaultLabel: 'Visualize' },
  { id: 'soundLab', icon: AudioWaveform, labelKey: 'tabs.soundLab', defaultLabel: 'Sound Lab' },
  { id: 'compare', icon: GitCompare, labelKey: 'tabs.compare', defaultLabel: 'Compare' },
  { id: 'experiment', icon: Sliders, labelKey: 'tabs.experiment', defaultLabel: 'Experiment' },
];

export const TopNav: React.FC = () => {
  const { t, i18n } = useTranslation();
  const activeMode = useAppStore((s) => s.activeMode);
  const setActiveMode = useAppStore((s) => s.setActiveMode);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const resetCamera = useViewerStore((s) => s.resetCamera);
  const autoRotate = useViewerStore((s) => s.autoRotate);
  const toggleAutoRotate = useViewerStore((s) => s.toggleAutoRotate);

  return (
    <header className="h-16 border-b border-[var(--border)] glass-panel px-4 flex items-center justify-between gap-4 z-30 select-none relative">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-8 h-8 rounded-lg bg-[var(--surface2)] border border-[var(--border-hover)] flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div>
          <div className="font-heading font-semibold text-base tracking-[0.14em] text-[var(--text)] uppercase leading-none">
            {t('appName', 'HARMONA')}
          </div>
          <div className="text-[10px] tracking-wider text-[var(--muted)] mt-0.5">
            {t('tagline', 'Explore the World of Sound')}
          </div>
        </div>
      </div>

      {/* Center: Mode Tabs */}
      <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[var(--surface2)]/70 border border-[var(--border)] shadow-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[var(--accent)] text-[#070A0F] shadow-sm font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t(tab.labelKey, tab.defaultLabel)}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Search, View Tools, Theme, Language */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-xs text-[var(--text)] w-44 focus-within:w-56 focus-within:border-[var(--accent)] transition-all">
          <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
          <input
            type="text"
            placeholder={t('actions.searchInstruments', 'Search...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs placeholder-[var(--muted)]"
          />
        </div>

        {/* 3D Camera Reset & Auto-Rotate */}
        <div className="flex items-center rounded-lg bg-[var(--surface2)] border border-[var(--border)] p-0.5">
          <button
            onClick={resetCamera}
            title={t('actions.resetCamera', 'Reset Camera')}
            className="p-1.5 rounded hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleAutoRotate}
            title={t('actions.autoRotate', 'Auto Rotate')}
            className={`p-1.5 rounded transition-colors ${
              autoRotate
                ? 'bg-[var(--accentSoft)] text-[var(--accent)]'
                : 'hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center rounded-lg bg-[var(--surface2)] border border-[var(--border)] p-0.5">
          <button
            onClick={() => setTheme('dark')}
            title="Dark Mode"
            className={`p-1.5 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-[var(--accent)] text-[#070A0F]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('light')}
            title="Light Mode"
            className={`p-1.5 rounded transition-colors ${
              theme === 'light'
                ? 'bg-[var(--accent)] text-[#070A0F]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            title="System Mode"
            className={`p-1.5 rounded transition-colors ${
              theme === 'system'
                ? 'bg-[var(--accent)] text-[#070A0F]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-xs">
          <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
          <select
            value={i18n.language}
            onChange={(e) => setAppLanguage(e.target.value)}
            className="bg-transparent text-[var(--text)] outline-none cursor-pointer text-xs"
          >
            {Object.entries(SUPPORTED_LOCALES).map(([code, meta]) => (
              <option key={code} value={code} className="bg-[var(--surface)] text-[var(--text)]">
                {meta.nativeName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

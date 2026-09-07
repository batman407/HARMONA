import React, { useEffect } from 'react';
import { useAppStore, AppMode } from './store/useAppStore';
import { useViewerStore } from './store/useViewerStore';
import { getInstrumentById } from './content';
import { IntroSplash } from './components/intro/IntroSplash';
import { TopNav } from './components/layout/TopNav';
import { Sidebar } from './components/layout/Sidebar';
import { ContextPanel } from './components/layout/ContextPanel';
import { ViewerCanvas } from './components/viewer3d/ViewerCanvas';
import { ViewportOverlay } from './components/viewer3d/ViewportOverlay';

export const App: React.FC = () => {
  const introCompleted = useAppStore((s) => s.introCompleted);
  const selectedInstrumentId = useAppStore((s) => s.selectedInstrumentId);
  const setActiveMode = useAppStore((s) => s.setActiveMode);
  const setSelectedPartKey = useViewerStore((s) => s.setSelectedPartKey);
  const toggleAutoRotate = useViewerStore((s) => s.toggleAutoRotate);

  const instrument = getInstrumentById(selectedInstrumentId);

  // Keyboard Shortcuts (1-7 for Modes, Space for auto-rotate, Esc to deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const modeKeys: Record<string, AppMode> = {
        '1': 'explore',
        '2': 'disassemble',
        '3': 'activate',
        '4': 'visualize',
        '5': 'soundLab',
        '6': 'compare',
        '7': 'experiment',
      };

      if (modeKeys[e.key]) {
        setActiveMode(modeKeys[e.key]);
      } else if (e.key === 'Escape') {
        setSelectedPartKey(null);
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleAutoRotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveMode, setSelectedPartKey, toggleAutoRotate]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans">
      {/* Silent Intro Splash */}
      {!introCompleted && <IntroSplash />}

      {/* Top Bar */}
      <TopNav />

      {/* Main Studio Viewport Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Instrument Library Sidebar */}
        <Sidebar />

        {/* Center 3D Acoustic Viewport */}
        <main className="flex-1 relative h-full overflow-hidden bg-radial from-[var(--surface)] to-[var(--bg)]">
          <ViewerCanvas instrument={instrument} />
          <ViewportOverlay instrument={instrument} />
        </main>

        {/* Right Contextual Inspector & Lab Panel */}
        <ContextPanel instrument={instrument} />
      </div>
    </div>
  );
};

export default App;

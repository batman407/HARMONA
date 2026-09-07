import { create } from 'zustand';

interface ViewerState {
  explodeProgress: number; // 0 to 1
  selectedPartKey: string | null;
  hoveredPartKey: string | null;
  isGhostMode: boolean;
  isolatedPartKey: string | null;
  autoRotate: boolean;
  cameraResetTrigger: number;
  vibrationIntensity: number; // 0 to 1
  activeSoundStep: number | null; // For follow the sound mode

  // Actions
  setExplodeProgress: (progress: number) => void;
  setSelectedPartKey: (key: string | null) => void;
  setHoveredPartKey: (key: string | null) => void;
  setIsGhostMode: (ghost: boolean) => void;
  toggleGhostMode: () => void;
  setIsolatedPartKey: (key: string | null) => void;
  setAutoRotate: (rotate: boolean) => void;
  toggleAutoRotate: () => void;
  resetCamera: () => void;
  triggerVibration: (intensity?: number) => void;
  setActiveSoundStep: (step: number | null) => void;
  resetDisassembly: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  explodeProgress: 0,
  selectedPartKey: null,
  hoveredPartKey: null,
  isGhostMode: false,
  isolatedPartKey: null,
  autoRotate: false,
  cameraResetTrigger: 0,
  vibrationIntensity: 0,
  activeSoundStep: null,

  setExplodeProgress: (explodeProgress) => set({ explodeProgress }),
  setSelectedPartKey: (selectedPartKey) => set({ selectedPartKey }),
  setHoveredPartKey: (hoveredPartKey) => set({ hoveredPartKey }),
  setIsGhostMode: (isGhostMode) => set({ isGhostMode }),
  toggleGhostMode: () => set((state) => ({ isGhostMode: !state.isGhostMode })),
  setIsolatedPartKey: (isolatedPartKey) => set({ isolatedPartKey }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  resetCamera: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),

  triggerVibration: (intensity = 1) => {
    set({ vibrationIntensity: intensity });
    setTimeout(() => {
      set({ vibrationIntensity: 0 });
    }, 600);
  },

  setActiveSoundStep: (activeSoundStep) => set({ activeSoundStep }),

  resetDisassembly: () =>
    set({
      explodeProgress: 0,
      isolatedPartKey: null,
      isGhostMode: false,
      selectedPartKey: null,
      activeSoundStep: null,
    }),
}));

import { create } from 'zustand';
import { setAppLanguage } from '../i18n';

export type AppMode =
  | 'explore'
  | 'disassemble'
  | 'activate'
  | 'visualize'
  | 'soundLab'
  | 'compare'
  | 'experiment';

export type ThemeMode = 'dark' | 'light' | 'system';

interface AppState {
  selectedInstrumentId: string;
  activeMode: AppMode;
  theme: ThemeMode;
  introCompleted: boolean;
  searchQuery: string;
  favoriteIds: string[];
  compareInstrumentId: string;
  lastPlayedNote: { note: string; freq: number; timestamp: number } | null;

  // Actions
  setSelectedInstrumentId: (id: string) => void;
  setActiveMode: (mode: AppMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setIntroCompleted: (completed: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  setCompareInstrumentId: (id: string) => void;
  setLastPlayedNote: (note: { note: string; freq: number }) => void;
}

const getStoredTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem('harmona_theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  } catch (e) {
    // Ignore
  }
  return 'dark';
};

const getStoredFavorites = (): string[] => {
  try {
    const saved = localStorage.getItem('harmona_favorites');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore
  }
  return ['guitar', 'piano'];
};

export const useAppStore = create<AppState>((set, get) => ({
  selectedInstrumentId: 'guitar',
  activeMode: 'explore',
  theme: getStoredTheme(),
  introCompleted: false,
  searchQuery: '',
  favoriteIds: getStoredFavorites(),
  compareInstrumentId: 'piano',
  lastPlayedNote: null,

  setSelectedInstrumentId: (id) => set({ selectedInstrumentId: id }),
  setActiveMode: (mode) => set({ activeMode: mode }),

  setTheme: (theme) => {
    try {
      localStorage.setItem('harmona_theme', theme);
    } catch (e) {
      // Ignore
    }

    // Apply HTML class
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    set({ theme });
  },

  setIntroCompleted: (completed) => set({ introCompleted: completed }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleFavorite: (id) => {
    const favorites = get().favoriteIds;
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    try {
      localStorage.setItem('harmona_favorites', JSON.stringify(next));
    } catch (e) {
      // Ignore
    }
    set({ favoriteIds: next });
  },

  setCompareInstrumentId: (compareInstrumentId) => set({ compareInstrumentId }),

  setLastPlayedNote: (note) =>
    set({
      lastPlayedNote: { ...note, timestamp: Date.now() },
    }),
}));

// Initialize theme on app bootstrap
if (typeof window !== 'undefined') {
  const initialTheme = getStoredTheme();
  useAppStore.getState().setTheme(initialTheme);

  // Listen to OS system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (useAppStore.getState().theme === 'system') {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  });
}

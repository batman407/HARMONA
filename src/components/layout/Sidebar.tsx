import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Music,
  Star,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Disc,
  Piano,
  Flame,
  Volume2,
  Wind,
  Zap,
  Globe,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';
import { INSTRUMENTS_CATALOG, INSTRUMENT_FAMILIES, COMING_SOON_CATALOG } from '../../content';
import { useAppStore } from '../../store/useAppStore';
import { useViewerStore } from '../../store/useViewerStore';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const selectedInstrumentId = useAppStore((s) => s.selectedInstrumentId);
  const setSelectedInstrumentId = useAppStore((s) => s.setSelectedInstrumentId);
  const favoriteIds = useAppStore((s) => s.favoriteIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const resetDisassembly = useViewerStore((s) => s.resetDisassembly);
  const resetCamera = useViewerStore((s) => s.resetCamera);

  const [selectedFamily, setSelectedFamily] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter instruments
  const filteredInstruments = useMemo(() => {
    return INSTRUMENTS_CATALOG.filter((inst) => {
      const matchesSearch =
        searchQuery === '' ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.familyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(inst.parts).some((p) =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFamily = selectedFamily === 'all' || inst.family === selectedFamily;
      const matchesFav = !showOnlyFavorites || favoriteIds.includes(inst.id);

      return matchesSearch && matchesFamily && matchesFav;
    });
  }, [searchQuery, selectedFamily, showOnlyFavorites, favoriteIds]);

  const filteredComingSoon = useMemo(() => {
    return COMING_SOON_CATALOG.filter((inst) => {
      const matchesSearch =
        searchQuery === '' ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFamily = selectedFamily === 'all' || inst.family === selectedFamily;
      return matchesSearch && matchesFamily;
    });
  }, [searchQuery, selectedFamily]);

  const handleSelect = (id: string) => {
    if (id !== selectedInstrumentId) {
      setSelectedInstrumentId(id);
      resetDisassembly();
      resetCamera();
    }
  };

  const getFamilyIcon = (family: string) => {
    switch (family) {
      case 'strings':
        return Music;
      case 'keyboards':
        return Piano;
      case 'percussion':
        return Disc;
      case 'brass':
        return Flame;
      case 'woodwinds':
        return Wind;
      case 'electronic':
        return Zap;
      case 'world':
        return Globe;
      default:
        return Volume2;
    }
  };

  return (
    <aside className="w-72 md:w-84 h-full border-r border-[var(--border)] glass-panel flex flex-col z-20 select-none">
      {/* Sidebar Header: Filter Pills */}
      <div className="p-3 border-b border-[var(--border)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Acoustic Library
            </span>
          </div>
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
              showOnlyFavorites
                ? 'bg-[var(--accentSoft)] border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Star className={`w-3 h-3 ${showOnlyFavorites ? 'fill-[var(--accent)]' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Family Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {INSTRUMENT_FAMILIES.map((fam) => (
            <button
              key={fam.id}
              onClick={() => setSelectedFamily(fam.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                selectedFamily === fam.id
                  ? 'bg-[var(--accent)] text-[#070A0F] font-semibold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
              }`}
            >
              {fam.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instrument List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredInstruments.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--muted)]">
            No active instruments match criteria.
          </div>
        ) : (
          filteredInstruments.map((inst) => {
            const isSelected = selectedInstrumentId === inst.id;
            const isFav = favoriteIds.includes(inst.id);
            const Icon = getFamilyIcon(inst.family);

            return (
              <div
                key={inst.id}
                onClick={() => handleSelect(inst.id)}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'glass-panel-accent border-[var(--accent)]/60 bg-[var(--surface2)] shadow-lg'
                    : 'border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface2)]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[var(--accent)] text-[#070A0F]'
                          : 'bg-[var(--surface)] text-[var(--muted)] group-hover:text-[var(--accent)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text)] font-heading leading-tight">
                        {inst.name}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">
                        {inst.familyName}
                      </div>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(inst.id);
                    }}
                    className="p-1 rounded text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    title="Toggle Favorite"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'text-[var(--accent)] fill-[var(--accent)]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Description snippet */}
                <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-2 leading-relaxed">
                  {inst.shortDescription}
                </p>

                {/* Characteristics Badges */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[var(--border)]">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted)] border border-[var(--border)] font-mono">
                    {inst.characteristics.pitchRange.split('(')[0].trim()}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accentSoft)] text-[var(--accent)] border border-[var(--accentBorder)] font-medium">
                    {Object.keys(inst.parts).length} Parts
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted)] uppercase tracking-wider ml-auto">
                    {inst.family}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Coming Soon Section */}
        {filteredComingSoon.length > 0 && (
          <div className="pt-3 mt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 px-1 mb-2 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              <Clock className="w-3 h-3 text-[var(--muted)]" />
              <span>Expansion Roster (Coming Soon)</span>
            </div>
            <div className="space-y-1.5">
              {filteredComingSoon.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-dashed border-[var(--border)] bg-white/[0.02] opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text)]">{item.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[var(--muted)] border border-[var(--border)]">
                      {item.familyName}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted)] mt-1 line-clamp-1">
                    {item.shortDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[var(--border)] text-[10px] text-[var(--muted)] flex items-center justify-between">
        <span className="font-mono">{INSTRUMENTS_CATALOG.length} Instruments Active</span>
        <span className="text-[var(--accent)] font-medium">HARMONA Physical V1</span>
      </div>
    </aside>
  );
};

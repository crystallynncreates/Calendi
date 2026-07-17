import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutId, WidgetType, CalEvent, SkinId, Photo } from './types';
import { getAutoSkinForDate } from './data/holidays';

interface SlotMap { [slotId: string]: WidgetType | null }

interface Store {
  layoutId: LayoutId;
  setLayout: (id: LayoutId) => void;
  slots: SlotMap;
  setSlotWidget: (slotId: string, widget: WidgetType | null) => void;
  events: CalEvent[];
  addEvent: (e: CalEvent) => void;
  removeEvent: (id: string) => void;
  skin: SkinId;
  setSkin: (s: SkinId) => void;
  photos: Photo[];
  addPhoto: (p: Photo) => void;
  removePhoto: (id: string) => void;
  hasOnboarded: boolean;
  setOnboarded: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      layoutId: 2,
      setLayout: (id) => set({ layoutId: id }),
      slots: {},
      setSlotWidget: (slotId, widget) =>
        set((s) => ({ slots: { ...s.slots, [slotId]: widget } })),
      events: [],
      addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      skin: 'auto',
      setSkin: (skin) => set({ skin }),
      photos: [],
      addPhoto: (p) =>
        set((s) => ({ photos: s.photos.length >= 20 ? s.photos : [...s.photos, p] })),
      removePhoto: (id) => set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),
      hasOnboarded: false,
      setOnboarded: () => set({ hasOnboarded: true }),
    }),
    { name: 'calendi-v1' }
  )
);

export const LAYOUTS = [
  { id: 1 as LayoutId, name: 'focus',       slots: 0, areas: '"cal"',                          cols: '1fr',         rows: '1fr' },
  { id: 2 as LayoutId, name: 'split',        slots: 1, areas: '"cal s1"',                       cols: '2fr 1fr',     rows: '1fr' },
  { id: 3 as LayoutId, name: 'half',         slots: 1, areas: '"cal s1"',                       cols: '1fr 1fr',     rows: '1fr' },
  { id: 4 as LayoutId, name: 'trio',         slots: 2, areas: '"cal s1" "cal s2"',              cols: '2fr 1fr',     rows: '1fr 1fr' },
  { id: 5 as LayoutId, name: 'spotlight',    slots: 1, areas: '"s1" "cal"',                     cols: '1fr',         rows: '1fr 2fr' },
  { id: 6 as LayoutId, name: 'banner',       slots: 2, areas: '"s1 s2" "cal cal"',             cols: '1fr 1fr',     rows: '1fr 2fr' },
  { id: 7 as LayoutId, name: 'quad',         slots: 3, areas: '"cal s1" "s2 s3"',              cols: '1fr 1fr',     rows: '1fr 1fr' },
  { id: 8 as LayoutId, name: 'feature',      slots: 3, areas: '"cal s1" "cal s2" "s3 s3"',    cols: '2fr 1fr',     rows: '1fr 1fr 1fr' },
  { id: 9 as LayoutId, name: 'side by side', slots: 1, areas: '"cal s1"',                      cols: '1fr 1fr',     rows: '1fr' },
  { id: 10 as LayoutId, name: 'stack',       slots: 1, areas: '"cal" "s1"',                    cols: '1fr',         rows: '2fr 1fr' },
  { id: 11 as LayoutId, name: 'corner',      slots: 3, areas: '"s1 s1 s2" "cal cal s3"',      cols: '1fr 1fr 1fr', rows: '1fr 1fr' },
  { id: 12 as LayoutId, name: 'grid',        slots: 4, areas: '"cal s1 s2" "cal s3 s4"',      cols: '2fr 1fr 1fr', rows: '1fr 1fr' },
];

const SKIN_COLORS = {
  violet: { color: '#8B5CF6', glow: 'rgba(139,92,246,0.35)', dim: 'rgba(139,92,246,0.12)' },
  cyan:   { color: '#22D3EE', glow: 'rgba(34,211,238,0.35)',  dim: 'rgba(34,211,238,0.12)' },
  pink:   { color: '#EC4899', glow: 'rgba(236,72,153,0.35)',  dim: 'rgba(236,72,153,0.12)' },
  amber:  { color: '#F59E0B', glow: 'rgba(245,158,11,0.35)',  dim: 'rgba(245,158,11,0.12)' },
};

export function getSkinColors(skin: SkinId, date = new Date()) {
  const resolved = skin === 'auto' ? getAutoSkinForDate(date) : skin;
  return SKIN_COLORS[resolved] ?? SKIN_COLORS.violet;
}

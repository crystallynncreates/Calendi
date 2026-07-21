import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutId, WidgetType, CalEvent, SkinId, Photo, SkinColors } from './types';
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
  { id: 1  as LayoutId, name: 'focus',       slots: 0, areas: '"cal"',                       cols: '1fr',         rows: '1fr' },
  { id: 2  as LayoutId, name: 'split',        slots: 1, areas: '"cal s1"',                    cols: '2fr 1fr',     rows: '1fr' },
  { id: 3  as LayoutId, name: 'half',         slots: 1, areas: '"cal s1"',                    cols: '1fr 1fr',     rows: '1fr' },
  { id: 4  as LayoutId, name: 'trio',         slots: 2, areas: '"cal s1" "cal s2"',           cols: '2fr 1fr',     rows: '1fr 1fr' },
  { id: 5  as LayoutId, name: 'spotlight',    slots: 1, areas: '"s1" "cal"',                  cols: '1fr',         rows: '1fr 2fr' },
  { id: 6  as LayoutId, name: 'banner',       slots: 2, areas: '"s1 s2" "cal cal"',           cols: '1fr 1fr',     rows: '1fr 2fr' },
  { id: 7  as LayoutId, name: 'quad',         slots: 3, areas: '"cal s1" "s2 s3"',            cols: '1fr 1fr',     rows: '1fr 1fr' },
  { id: 8  as LayoutId, name: 'feature',      slots: 3, areas: '"cal s1" "cal s2" "s3 s3"',  cols: '2fr 1fr',     rows: '1fr 1fr 1fr' },
  { id: 9  as LayoutId, name: 'side by side', slots: 1, areas: '"cal s1"',                   cols: '1fr 1fr',     rows: '1fr' },
  { id: 10 as LayoutId, name: 'stack',        slots: 1, areas: '"cal" "s1"',                 cols: '1fr',         rows: '2fr 1fr' },
  { id: 11 as LayoutId, name: 'corner',       slots: 3, areas: '"s1 s1 s2" "cal cal s3"',   cols: '1fr 1fr 1fr', rows: '1fr 1fr' },
  { id: 12 as LayoutId, name: 'grid',         slots: 4, areas: '"cal s1 s2" "cal s3 s4"',   cols: '2fr 1fr 1fr', rows: '1fr 1fr' },
];

const COLOR_SKINS: Record<string, SkinColors> = {
  violet:  { color: '#8B5CF6', glow: 'rgba(139,92,246,0.35)',  dim: 'rgba(139,92,246,0.12)' },
  cyan:    { color: '#22D3EE', glow: 'rgba(34,211,238,0.35)',   dim: 'rgba(34,211,238,0.12)' },
  pink:    { color: '#EC4899', glow: 'rgba(236,72,153,0.35)',   dim: 'rgba(236,72,153,0.12)' },
  amber:   { color: '#F59E0B', glow: 'rgba(245,158,11,0.35)',   dim: 'rgba(245,158,11,0.12)' },
  emerald: { color: '#10B981', glow: 'rgba(16,185,129,0.35)',   dim: 'rgba(16,185,129,0.12)' },
  fire:    { color: '#EF4444', glow: 'rgba(239,68,68,0.35)',    dim: 'rgba(239,68,68,0.12)' },
  ocean:   { color: '#3B82F6', glow: 'rgba(59,130,246,0.35)',   dim: 'rgba(59,130,246,0.12)' },
  rose:    { color: '#F43F5E', glow: 'rgba(244,63,94,0.35)',    dim: 'rgba(244,63,94,0.12)' },
  gold:    { color: '#EAB308', glow: 'rgba(234,179,8,0.35)',    dim: 'rgba(234,179,8,0.12)' },
  indigo:  { color: '#6366F1', glow: 'rgba(99,102,241,0.35)',   dim: 'rgba(99,102,241,0.12)' },
};

const LANDSCAPE_SKINS: Record<string, SkinColors> = {
  'aurora':     { color: '#67E8F9', glow: 'rgba(103,232,249,0.35)', dim: 'rgba(103,232,249,0.12)', isLandscape: true, scene: 'aurora' },
  'sunset':     { color: '#FBBF24', glow: 'rgba(251,191,36,0.35)',  dim: 'rgba(251,191,36,0.12)',  isLandscape: true, scene: 'sunset' },
  'night-sky':  { color: '#A78BFA', glow: 'rgba(167,139,250,0.35)', dim: 'rgba(167,139,250,0.12)', isLandscape: true, scene: 'night-sky' },
  'deep-ocean': { color: '#38BDF8', glow: 'rgba(56,189,248,0.35)',  dim: 'rgba(56,189,248,0.12)',  isLandscape: true, scene: 'deep-ocean' },
  'galaxy':     { color: '#C084FC', glow: 'rgba(192,132,252,0.35)', dim: 'rgba(192,132,252,0.12)', isLandscape: true, scene: 'galaxy' },
  'forest':     { color: '#4ADE80', glow: 'rgba(74,222,128,0.35)',  dim: 'rgba(74,222,128,0.12)',  isLandscape: true, scene: 'forest' },
  'desert':     { color: '#FB923C', glow: 'rgba(251,146,60,0.35)',  dim: 'rgba(251,146,60,0.12)',  isLandscape: true, scene: 'desert' },
  'mountain':   { color: '#94A3B8', glow: 'rgba(148,163,184,0.35)', dim: 'rgba(148,163,184,0.12)', isLandscape: true, scene: 'mountain' },
};

export function getSkinColors(skin: SkinId, date = new Date()): SkinColors {
  if (skin in LANDSCAPE_SKINS) return LANDSCAPE_SKINS[skin];
  if (skin === 'auto') {
    const resolved = getAutoSkinForDate(date);
    return COLOR_SKINS[resolved] ?? COLOR_SKINS.violet;
  }
  return COLOR_SKINS[skin as string] ?? COLOR_SKINS.violet;
}

export const ALL_COLOR_SKINS = Object.keys(COLOR_SKINS) as SkinId[];
export const ALL_LANDSCAPE_SKINS = Object.keys(LANDSCAPE_SKINS) as SkinId[];

import { useState, lazy, Suspense } from 'react';
import { LayoutGrid, Palette, Plus, X, Clock, Calculator, Timer, Image, Tv, Video, Globe, FileText, Youtube, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, LAYOUTS, getSkinColors, ALL_COLOR_SKINS, ALL_LANDSCAPE_SKINS } from '../store';
import { logout, getSession } from '../auth';
import CalendarWidget from '../components/CalendarWidget';
import LayoutPicker from '../components/LayoutPicker';
import LandscapeScene from '../components/LandscapeScene';
import type { WidgetType, SkinId } from '../types';

const ClockWidget      = lazy(() => import('../components/widgets/ClockWidget'));
const CalculatorWidget = lazy(() => import('../components/widgets/CalculatorWidget'));
const TimerWidget      = lazy(() => import('../components/widgets/TimerWidget'));
const PhotoFrameWidget = lazy(() => import('../components/widgets/PhotoFrameWidget'));
const StreamWidget     = lazy(() => import('../components/widgets/StreamWidget'));
const YouTubeWidget    = lazy(() => import('../components/widgets/YouTubeWidget'));
const MeetWidget       = lazy(() => import('../components/widgets/MeetWidget'));
const BrowserWidget    = lazy(() => import('../components/widgets/BrowserWidget'));
const NotesWidget      = lazy(() => import('../components/widgets/NotesWidget'));

interface WidgetMeta { id: WidgetType; label: string; icon: React.ReactNode; desc: string }

const WIDGET_LIST: WidgetMeta[] = [
  { id: 'clock',       label: 'clock',      icon: <Clock size={18} />,      desc: 'live time display' },
  { id: 'calculator',  label: 'calculator', icon: <Calculator size={18} />, desc: 'quick math' },
  { id: 'timer',       label: 'timer',      icon: <Timer size={18} />,      desc: 'countdown + loud alarm' },
  { id: 'photo-frame', label: 'photos',     icon: <Image size={18} />,      desc: 'slideshow, up to 20' },
  { id: 'youtube',     label: 'youtube',    icon: <Youtube size={18} />,    desc: 'watch videos in-widget' },
  { id: 'streaming',   label: 'apps',       icon: <Tv size={18} />,         desc: 'netflix, disney+, prime, socials' },
  { id: 'meet',        label: 'meet/zoom',  icon: <Video size={18} />,      desc: 'google meet + zoom' },
  { id: 'browser',     label: 'browser',    icon: <Globe size={18} />,      desc: 'built-in web browser' },
  { id: 'notes',       label: 'notes',      icon: <FileText size={18} />,   desc: 'quick notes, auto-saves' },
];

function WidgetRenderer({ type }: { type: WidgetType }) {
  switch (type) {
    case 'clock':       return <ClockWidget />;
    case 'calculator':  return <CalculatorWidget />;
    case 'timer':       return <TimerWidget />;
    case 'photo-frame': return <PhotoFrameWidget />;
    case 'youtube':     return <YouTubeWidget />;
    case 'streaming':
    case 'netflix':
    case 'disney':
    case 'prime':
    case 'messaging':
    case 'phone':       return <StreamWidget />;
    case 'meet':
    case 'zoom':        return <MeetWidget />;
    case 'browser':     return <BrowserWidget />;
    case 'notes':       return <NotesWidget />;
    default:            return null;
  }
}

function EmptySlot({ slotId, onAdd, color }: { slotId: string; onAdd: (id: string) => void; color: string }) {
  return (
    <button
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(226,232,240,0.2)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.color = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(226,232,240,0.2)'; }}
      onClick={() => onAdd(slotId)}
    >
      <Plus size={20} />
      <span className="text-xs font-mono">add widget</span>
    </button>
  );
}

const LANDSCAPE_LABELS: Record<string, { label: string; preview: string }> = {
  'aurora':     { label: 'aurora',      preview: 'linear-gradient(135deg, #030b14, #0d2a1e, #1a0a3e)' },
  'sunset':     { label: 'sunset',      preview: 'linear-gradient(135deg, #1a0a2e, #8b1a4a, #e8752e)' },
  'night-sky':  { label: 'night sky',   preview: 'linear-gradient(135deg, #01020a, #02050f, #030a18)' },
  'deep-ocean': { label: 'deep ocean',  preview: 'linear-gradient(135deg, #000d1a, #002040, #003060)' },
  'galaxy':     { label: 'galaxy',      preview: 'linear-gradient(135deg, #050010, #0a0020, #180030)' },
  'forest':     { label: 'forest',      preview: 'linear-gradient(135deg, #050e08, #0a2010, #0c2812)' },
  'desert':     { label: 'desert',      preview: 'linear-gradient(135deg, #3d2810, #c07830, #f0c870)' },
  'mountain':   { label: 'mountain',    preview: 'linear-gradient(135deg, #060810, #121e35, #1a2c4a)' },
};

const COLOR_SWATCH: Record<string, string> = {
  violet: '#8B5CF6', cyan: '#22D3EE', pink: '#EC4899', amber: '#F59E0B',
  emerald: '#10B981', fire: '#EF4444', ocean: '#3B82F6', rose: '#F43F5E',
  gold: '#EAB308', indigo: '#6366F1',
};

function SkinPicker({ onClose }: { onClose: () => void }) {
  const { skin, setSkin } = useStore();
  const [tab, setTab] = useState<'color' | 'landscape'>(
    ALL_LANDSCAPE_SKINS.includes(skin) ? 'landscape' : 'color'
  );
  const { color: ac, glow: ag } = getSkinColors(skin);

  function pick(id: SkinId) { setSkin(id); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl anim-slide-up" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>skins</h2>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab */}
        <div className="flex gap-1 mx-5 mb-4 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {(['color', 'landscape'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
              style={{ background: tab === t ? ac : 'transparent', color: tab === t ? '#fff' : 'rgba(226,232,240,0.4)', boxShadow: tab === t ? `0 2px 8px ${ag}` : 'none' }}>
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 pb-6">
          {tab === 'color' && (
            <div>
              {/* Auto */}
              <button onClick={() => pick('auto')} className="w-full flex items-center gap-3 p-3 rounded-2xl mb-3 transition-all glass-hover"
                style={{ background: skin === 'auto' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${skin === 'auto' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'conic-gradient(#8B5CF6,#22D3EE,#EC4899,#F59E0B,#8B5CF6)', flexShrink: 0 }} />
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>auto</p>
                  <p className="text-xs" style={{ color: 'rgba(226,232,240,0.35)' }}>shifts with seasons & holidays</p>
                </div>
                {skin === 'auto' && <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: ac }} />}
              </button>

              <div className="grid grid-cols-5 gap-3">
                {ALL_COLOR_SKINS.map(id => (
                  <button key={id} onClick={() => pick(id)} className="flex flex-col items-center gap-1.5" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, background: COLOR_SWATCH[id as string] ?? '#8B5CF6',
                      outline: skin === id ? `2px solid ${COLOR_SWATCH[id as string]}` : '2px solid transparent',
                      outlineOffset: 3, transition: 'all 0.18s ease',
                      boxShadow: skin === id ? `0 0 16px ${COLOR_SWATCH[id as string]}80` : 'none',
                    }} />
                    <span className="text-xs font-mono" style={{ color: skin === id ? '#E2E8F0' : 'rgba(226,232,240,0.3)', fontSize: '0.6rem' }}>{id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'landscape' && (
            <div className="grid grid-cols-2 gap-3">
              {ALL_LANDSCAPE_SKINS.map(id => {
                const meta = LANDSCAPE_LABELS[id as string];
                if (!meta) return null;
                return (
                  <button key={id} onClick={() => pick(id)} style={{
                    background: skin === id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${skin === id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 16, padding: '10px', cursor: 'pointer', transition: 'all 0.18s ease',
                  }}>
                    <div style={{ width: '100%', height: 56, borderRadius: 10, background: meta.preview, marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
                      {skin === id && <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.4)', borderRadius: 10 }} />}
                    </div>
                    <p className="text-xs font-mono text-center" style={{ color: skin === id ? '#E2E8F0' : 'rgba(226,232,240,0.4)' }}>{meta.label}</p>
                    <p className="text-xs text-center mt-0.5" style={{ color: 'rgba(226,232,240,0.2)', fontSize: '0.6rem' }}>live animated</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddWidgetSheet({ onSelect, onClose, color }: { onSelect: (t: WidgetType) => void; onClose: () => void; color: string; glow: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg p-5 rounded-t-3xl anim-slide-up" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>add a widget</h2>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {WIDGET_LIST.map(w => (
            <button key={w.id} onClick={() => { onSelect(w.id); onClose(); }}
              className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all glass-hover"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>{w.icon}</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>{w.label}</p>
                <p className="text-xs" style={{ color: 'rgba(226,232,240,0.35)' }}>{w.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { layoutId, slots, setSlotWidget, skin } = useStore();
  const skinColors = getSkinColors(skin);
  const { color, glow, dim, isLandscape, scene } = skinColors;
  const layout = LAYOUTS.find(l => l.id === layoutId)!;
  const session = getSession();

  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [addingToSlot, setAddingToSlot] = useState<string | null>(null);

  const slotIds = Array.from({ length: layout.slots }, (_, i) => `s${i + 1}`);

  function handleLock() { logout(); navigate('/login'); }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: isLandscape ? 'transparent' : '#06060F', '--skin-color': color, '--skin-glow': glow, '--skin-dim': dim } as React.CSSProperties}
    >
      {/* Landscape background scene */}
      {isLandscape && scene && <LandscapeScene scene={scene} />}

      {/* Color skin orbs */}
      {!isLandscape && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div className="orb-drift" style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${color}12 0%, transparent 60%)`, filter: 'blur(80px)' }} />
          <div className="orb-drift-2" style={{ position: 'absolute', bottom: '-25%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${color}0A 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        </div>
      )}

      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isLandscape ? 'rgba(0,0,0,0.35)' : 'transparent', backdropFilter: isLandscape ? 'blur(12px)' : 'none' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-mono lowercase" style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            calendi
          </span>
          <span className="tag" style={{ background: dim, color, border: `1px solid ${color}30` }}>{layout.name}</span>
          {session && <span className="text-xs font-mono hidden sm:inline" style={{ color: 'rgba(226,232,240,0.25)' }}>{session}</span>}
        </div>

        <div className="flex gap-1.5">
          <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1.5" onClick={() => setShowSkinPicker(true)}>
            <Palette size={13} style={{ color }} /><span className="text-xs hidden sm:inline">skin</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1.5" onClick={() => setShowLayoutPicker(true)}>
            <LayoutGrid size={13} style={{ color }} /><span className="text-xs hidden sm:inline">layout</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={handleLock} title="Lock">
            <Lock size={13} style={{ color: 'rgba(226,232,240,0.4)' }} />
          </button>
        </div>
      </header>

      {/* Main grid */}
      <main className="flex-1 min-h-0 p-3 relative z-10"
        style={{ display: 'grid', gridTemplateAreas: layout.areas, gridTemplateColumns: layout.cols, gridTemplateRows: layout.rows, gap: 10 }}>
        <div style={{ gridArea: 'cal', minHeight: 0, minWidth: 0 }}>
          <CalendarWidget compact={layout.slots >= 3} />
        </div>

        {slotIds.map(slotId => {
          const widget = slots[slotId] ?? null;
          return (
            <div key={slotId} style={{ gridArea: slotId, minHeight: 0, minWidth: 0 }}>
              {widget ? (
                <div className="widget-card h-full relative group" style={{ borderColor: `${color}20` }}>
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-xs font-mono" style={{ color: 'rgba(226,232,240,0.15)' }}>loading</div>}>
                    <WidgetRenderer type={widget} />
                  </Suspense>
                  <button
                    className="absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(226,232,240,0.5)', display: 'flex', cursor: 'pointer' }}
                    onClick={() => setSlotWidget(slotId, null)}
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <EmptySlot slotId={slotId} onAdd={setAddingToSlot} color={color} />
              )}
            </div>
          );
        })}
      </main>

      {showLayoutPicker && <LayoutPicker onClose={() => setShowLayoutPicker(false)} />}
      {showSkinPicker && <SkinPicker onClose={() => setShowSkinPicker(false)} />}
      {addingToSlot && (
        <AddWidgetSheet color={color} glow={glow}
          onClose={() => setAddingToSlot(null)}
          onSelect={t => { setSlotWidget(addingToSlot, t); setAddingToSlot(null); }}
        />
      )}
    </div>
  );
}

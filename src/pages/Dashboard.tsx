import { useState, lazy, Suspense } from 'react';
import { LayoutGrid, Palette, Plus, X, Clock, Calculator, Timer, Image, Tv, Phone, MessageCircle, Video } from 'lucide-react';
import { useStore, LAYOUTS, getSkinColors } from '../store';
import CalendarWidget from '../components/CalendarWidget';
import LayoutPicker from '../components/LayoutPicker';
import type { WidgetType } from '../types';

const ClockWidget       = lazy(() => import('../components/widgets/ClockWidget'));
const CalculatorWidget  = lazy(() => import('../components/widgets/CalculatorWidget'));
const TimerWidget       = lazy(() => import('../components/widgets/TimerWidget'));
const PhotoFrameWidget  = lazy(() => import('../components/widgets/PhotoFrameWidget'));
const StreamWidget      = lazy(() => import('../components/widgets/StreamWidget'));

interface WidgetMeta { id: WidgetType; label: string; icon: React.ReactNode; desc: string }

const WIDGET_LIST: WidgetMeta[] = [
  { id: 'clock',      label: 'clock',       icon: <Clock size={20} />,         desc: 'live time display' },
  { id: 'calculator', label: 'calculator',  icon: <Calculator size={20} />,    desc: 'quick math' },
  { id: 'timer',      label: 'timer',       icon: <Timer size={20} />,         desc: 'countdown + alarm' },
  { id: 'photo-frame',label: 'photos',      icon: <Image size={20} />,         desc: 'slideshow, up to 20' },
  { id: 'netflix',    label: 'streaming',   icon: <Tv size={20} />,            desc: 'netflix, disney+, prime + more' },
  { id: 'messaging',  label: 'messaging',   icon: <MessageCircle size={20} />, desc: 'whatsapp web + messages' },
  { id: 'meet',       label: 'calls',       icon: <Video size={20} />,         desc: 'google meet + zoom' },
  { id: 'phone',      label: 'phone',       icon: <Phone size={20} />,         desc: 'dial a number' },
];

function WidgetRenderer({ type }: { type: WidgetType }) {
  switch (type) {
    case 'clock':       return <ClockWidget />;
    case 'calculator':  return <CalculatorWidget />;
    case 'timer':       return <TimerWidget />;
    case 'photo-frame': return <PhotoFrameWidget />;
    case 'netflix':
    case 'disney':
    case 'prime':
    case 'meet':
    case 'zoom':
    case 'messaging':
    case 'phone':       return <StreamWidget />;
    default:            return null;
  }
}

function EmptySlot({ slotId, onAdd, color }: { slotId: string; onAdd: (id: string) => void; color: string }) {
  return (
    <button
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
      style={{
        background: 'rgba(255,255,255,0.015)',
        border: `1px dashed rgba(255,255,255,0.1)`,
        cursor: 'pointer',
        color: 'rgba(226,232,240,0.2)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.color = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(226,232,240,0.2)'; }}
      onClick={() => onAdd(slotId)}
    >
      <Plus size={20} />
      <span className="text-xs font-mono">add widget</span>
    </button>
  );
}

function SkinPicker({ onClose }: { onClose: () => void }) {
  const { skin, setSkin } = useStore();
  const SKINS = [
    { id: 'violet' as const, label: 'void',  color: '#8B5CF6' },
    { id: 'cyan'   as const, label: 'ice',   color: '#22D3EE' },
    { id: 'pink'   as const, label: 'blush', color: '#EC4899' },
    { id: 'amber'  as const, label: 'solar', color: '#F59E0B' },
    { id: 'auto'   as const, label: 'auto',  color: 'conic-gradient(#8B5CF6,#22D3EE,#EC4899,#F59E0B,#8B5CF6)' },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg p-5 rounded-t-3xl anim-slide-up" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>pick your vibe</h2>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="flex gap-4 justify-center mb-2">
          {SKINS.map(s => (
            <button key={s.id} onClick={() => { setSkin(s.id); onClose(); }} className="flex flex-col items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: s.id === 'auto' ? 'conic-gradient(#8B5CF6,#22D3EE,#EC4899,#F59E0B,#8B5CF6)' : s.color,
                outline: skin === s.id ? `2px solid ${s.id === 'auto' ? '#8B5CF6' : s.color}` : '2px solid transparent',
                outlineOffset: 3, transition: 'all 0.2s ease',
                boxShadow: skin === s.id ? `0 0 20px ${s.id === 'auto' ? 'rgba(139,92,246,0.6)' : s.color + '80'}` : 'none',
              }} />
              <span className="text-xs font-mono" style={{ color: skin === s.id ? '#E2E8F0' : 'rgba(226,232,240,0.3)' }}>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}

function AddWidgetSheet({ onSelect, onClose, color, glow }: { onSelect: (t: WidgetType) => void; onClose: () => void; color: string; glow: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg p-5 rounded-t-3xl anim-slide-up" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>add a widget</h2>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {WIDGET_LIST.map(w => (
            <button
              key={w.id}
              onClick={() => { onSelect(w.id); onClose(); }}
              className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all glass-hover"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                {w.icon}
              </div>
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
  const { layoutId, slots, setSlotWidget, skin } = useStore();
  const skinColors = getSkinColors(skin);
  const { color, glow, dim } = skinColors;
  const layout = LAYOUTS.find(l => l.id === layoutId)!;

  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [addingToSlot, setAddingToSlot] = useState<string | null>(null);

  // Build slot IDs from layout
  const slotIds = Array.from({ length: layout.slots }, (_, i) => `s${i + 1}`);

  // CSS grid areas need slot IDs to match
  const gridTemplateAreas = layout.areas
    .split('" "')
    .map(row => row.replace(/"/g, '').trim().split(' ').map(cell => {
      // cal → 'cal', s1-s4 → slot IDs
      return cell;
    }).join(' '))
    .map(row => `"${row}"`)
    .join(' ');

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: '#06060F',
        '--skin-color': color,
        '--skin-glow': glow,
        '--skin-dim': dim,
      } as React.CSSProperties}
    >
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="orb-drift" style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${color}12 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        <div className="orb-drift-2" style={{ position: 'absolute', bottom: '-25%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${color}0A 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      </div>

      {/* Top bar */}
      <header
        className="shrink-0 flex items-center justify-between px-4 py-2 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-mono lowercase" style={{
            background: `linear-gradient(135deg, ${color}, ${color}AA)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          }}>
            calendi
          </span>
          <span className="tag text-xs" style={{ background: dim, color, border: `1px solid ${color}30` }}>
            {layout.name}
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            className="btn-ghost btn-pill !px-2 !py-1.5 gap-1.5"
            onClick={() => setShowSkinPicker(true)}
          >
            <Palette size={13} style={{ color }} />
            <span className="text-xs hidden sm:inline">skin</span>
          </button>
          <button
            className="btn-ghost btn-pill !px-2 !py-1.5 gap-1.5"
            onClick={() => setShowLayoutPicker(true)}
          >
            <LayoutGrid size={13} style={{ color }} />
            <span className="text-xs hidden sm:inline">layout</span>
          </button>
        </div>
      </header>

      {/* Main grid */}
      <main
        className="flex-1 min-h-0 p-3 relative z-10"
        style={{
          display: 'grid',
          gridTemplateAreas: layout.areas,
          gridTemplateColumns: layout.cols,
          gridTemplateRows: layout.rows,
          gap: 10,
        }}
      >
        {/* Calendar — always present */}
        <div style={{ gridArea: 'cal', minHeight: 0, minWidth: 0 }}>
          <CalendarWidget compact={layout.slots >= 3} />
        </div>

        {/* Widget slots */}
        {slotIds.map(slotId => {
          const widget = slots[slotId] ?? null;
          return (
            <div key={slotId} style={{ gridArea: slotId, minHeight: 0, minWidth: 0 }}>
              {widget ? (
                <div className="widget-card h-full relative group" style={{ borderColor: `${color}20` }}>
                  <Suspense fallback={<div className="flex items-center justify-center h-full" style={{ color: 'rgba(226,232,240,0.15)' }}>loading</div>}>
                    <WidgetRenderer type={widget} />
                  </Suspense>
                  <button
                    className="absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(226,232,240,0.5)', display: 'flex', cursor: 'pointer' }}
                    onClick={() => setSlotWidget(slotId, null)}
                    title="Remove widget"
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

      {/* Overlays */}
      {showLayoutPicker && <LayoutPicker onClose={() => setShowLayoutPicker(false)} />}
      {showSkinPicker && <SkinPicker onClose={() => setShowSkinPicker(false)} />}
      {addingToSlot && (
        <AddWidgetSheet
          color={color}
          glow={glow}
          onClose={() => setAddingToSlot(null)}
          onSelect={(t) => {
            setSlotWidget(addingToSlot, t);
            setAddingToSlot(null);
          }}
        />
      )}
    </div>
  );
}

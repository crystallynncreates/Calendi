import { useState, lazy, Suspense, useEffect, type ReactNode, type CSSProperties } from 'react';
import { LayoutGrid, Palette, Plus, X, Clock, Calculator, Timer, Image, Tv, Video, Globe, FileText, Youtube, Lock, Users, BookOpen, Sparkles, Moon, Sun, GraduationCap, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, LAYOUTS, getSkinColors, ALL_COLOR_SKINS, ALL_LANDSCAPE_SKINS, ALL_PHOTO_SKINS } from '../store';
import { logout, getSession } from '../auth';
import CalendarWidget from '../components/CalendarWidget';
import ContactsModal from '../components/ContactsModal';
import PlannerSheet from '../components/PlannerSheet';
import LayoutPicker from '../components/LayoutPicker';
import LandscapeScene from '../components/LandscapeScene';
import AdBanner from '../components/AdBanner';
import SubscribeModal from '../components/SubscribeModal';
import AppPanel from '../components/AppPanel';
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

interface WidgetMeta { id: WidgetType; label: string; icon: ReactNode; desc: string }

const WIDGET_LIST: WidgetMeta[] = [
  { id: 'clock',       label: 'clock',      icon: <Clock size={18} />,           desc: 'live time display' },
  { id: 'calculator',  label: 'calculator', icon: <Calculator size={18} />,      desc: 'quick math' },
  { id: 'timer',       label: 'timer',      icon: <Timer size={18} />,           desc: 'countdown + loud alarm' },
  { id: 'photo-frame', label: 'photos',     icon: <Image size={18} />,           desc: 'slideshow, up to 20' },
  { id: 'youtube',     label: 'youtube',    icon: <Youtube size={18} />,         desc: 'watch videos in-widget' },
  { id: 'streaming',   label: 'apps',       icon: <Tv size={18} />,              desc: 'netflix, disney+, prime, socials' },
  { id: 'canvas-lms',  label: 'canvas lms', icon: <GraduationCap size={18} />,  desc: 'canvas courses & assignments' },
  { id: 'study-game',  label: 'study game', icon: <Brain size={18} />,          desc: 'quizlet flashcards & study' },
  { id: 'meet',        label: 'meet/zoom',  icon: <Video size={18} />,           desc: 'google meet + zoom' },
  { id: 'browser',     label: 'browser',    icon: <Globe size={18} />,           desc: 'built-in web browser' },
  { id: 'notes',       label: 'notes',      icon: <FileText size={18} />,        desc: 'quick notes, auto-saves' },
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
    case 'canvas-lms':  return <BrowserWidget initialUrl="https://cloud.canvaslms.com/login/canvas" />;
    case 'study-game':  return <BrowserWidget initialUrl="https://quizlet.com" />;
    case 'browser':     return <BrowserWidget />;
    case 'notes':       return <NotesWidget />;
    default:            return null;
  }
}

function EmptySlot({ slotId, onAdd, color, isLight }: { slotId: string; onAdd: (id: string) => void; color: string; isLight: boolean }) {
  const idleBorder = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';
  const idleText   = isLight ? 'rgba(20,10,40,0.22)' : 'rgba(226,232,240,0.2)';
  return (
    <button
      className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
      style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.015)', border: `1px dashed ${idleBorder}`, cursor: 'pointer', color: idleText }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.color = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = idleBorder; e.currentTarget.style.color = idleText; }}
      onClick={() => onAdd(slotId)}
    >
      <Plus size={20} />
      <span className="text-xs font-mono">add widget</span>
    </button>
  );
}

const LANDSCAPE_LABELS: Record<string, { label: string; preview: string }> = {
  'aurora':          { label: 'aurora',          preview: 'linear-gradient(135deg, #030b14, #0d2a1e, #1a0a3e)' },
  'sunset':          { label: 'sunset',          preview: 'linear-gradient(135deg, #1a0a2e, #8b1a4a, #e8752e)' },
  'night-sky':       { label: 'night sky',       preview: 'linear-gradient(135deg, #01020a, #02050f, #030a18)' },
  'deep-ocean':      { label: 'deep ocean',      preview: 'linear-gradient(135deg, #000d1a, #002040, #003060)' },
  'galaxy':          { label: 'galaxy',          preview: 'linear-gradient(135deg, #050010, #0a0020, #180030)' },
  'forest':          { label: 'forest',          preview: 'linear-gradient(135deg, #050e08, #0a2010, #0c2812)' },
  'desert':          { label: 'desert',          preview: 'linear-gradient(135deg, #3d2810, #c07830, #f0c870)' },
  'mountain':        { label: 'mountain',        preview: 'linear-gradient(135deg, #060810, #121e35, #1a2c4a)' },
  'cherry-blossom':  { label: 'cherry blossom',  preview: 'linear-gradient(135deg, #2d0a1a, #6b1a3a, #f9a8d4)' },
  'winter-snow':     { label: 'winter snow',     preview: 'linear-gradient(135deg, #0a1628, #1a2a4a, #bae6fd)' },
  'tropical-beach':  { label: 'tropical beach',  preview: 'linear-gradient(135deg, #006994, #00b4d8, #34d399)' },
  'rainy-night':     { label: 'rainy night',     preview: 'linear-gradient(135deg, #050a14, #0d1a2e, #60a5fa)' },
  'fireflies':       { label: 'fireflies',       preview: 'linear-gradient(135deg, #050e08, #0a1a0c, #a3e635)' },
  'melted-skittles': { label: 'melted skittles', preview: 'linear-gradient(135deg, #0a0015, #FF00CC, #FF7A00, #00FF7A, #00AAFF)' },
};

const PHOTO_CATEGORIES = [
  {
    key: 'landscape', label: '🏔️ Landscapes',
    skins: ['photo-landscape-1','photo-landscape-2','photo-landscape-3','photo-landscape-4'] as const,
    names: ['Valley Mist','Alpine Lake','Rolling Hills','Mountain Peak'],
  },
  {
    key: 'christmas', label: '🎄 Christmas',
    skins: ['photo-christmas-1','photo-christmas-2','photo-christmas-3','photo-christmas-4'] as const,
    names: ['Snowy Pines','Christmas Tree','Holiday Lights','Festive Night'],
  },
  {
    key: 'easter', label: '🐣 Easter',
    skins: ['photo-easter-1','photo-easter-2','photo-easter-3','photo-easter-4'] as const,
    names: ['Spring Blooms','Flower Bokeh','Easter Garden','Pastel Morning'],
  },
  {
    key: 'spring', label: '🌸 Spring',
    skins: ['photo-spring-1','photo-spring-2','photo-spring-3','photo-spring-4'] as const,
    names: ['Cherry Blossoms','Spring Rain','Wildflower Field','Garden Path'],
  },
  {
    key: 'fall', label: '🍂 Fall',
    skins: ['photo-fall-1','photo-fall-2','photo-fall-3','photo-fall-4'] as const,
    names: ['Golden Leaves','Autumn Path','Harvest Colors','Fall Forest'],
  },
  {
    key: 'winter', label: '❄️ Winter',
    skins: ['photo-winter-1','photo-winter-2','photo-winter-3','photo-winter-4'] as const,
    names: ['Snowy Field','Frosted Pines','Winter Road','Ice Crystal'],
  },
];

const PHOTO_THUMB_URLS: Record<string, string> = {
  'photo-landscape-1': 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=200&q=60',
  'photo-landscape-2': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=60',
  'photo-landscape-3': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&q=60',
  'photo-landscape-4': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=60',
  'photo-christmas-1': 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=200&q=60',
  'photo-christmas-2': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=200&q=60',
  'photo-christmas-3': 'https://images.unsplash.com/photo-1481900694672-24c5370cff58?w=200&q=60',
  'photo-christmas-4': 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&q=60',
  'photo-easter-1':    'https://images.unsplash.com/photo-1490750967868-88df5691cc55?w=200&q=60',
  'photo-easter-2':    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=200&q=60',
  'photo-easter-3':    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200&q=60',
  'photo-easter-4':    'https://images.unsplash.com/photo-1618759287629-ca56e4e4f2d6?w=200&q=60',
  'photo-spring-1':    'https://images.unsplash.com/photo-1462275646964-a0e3386b89ae?w=200&q=60',
  'photo-spring-2':    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&q=60',
  'photo-spring-3':    'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=200&q=60',
  'photo-spring-4':    'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=200&q=60',
  'photo-fall-1':      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60',
  'photo-fall-2':      'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=200&q=60',
  'photo-fall-3':      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=200&q=60',
  'photo-fall-4':      'https://images.unsplash.com/photo-1531266591226-04c57a8b3e37?w=200&q=60',
  'photo-winter-1':    'https://images.unsplash.com/photo-1418985991994-5c90052f0084?w=200&q=60',
  'photo-winter-2':    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=200&q=60',
  'photo-winter-3':    'https://images.unsplash.com/photo-1511131341194-24e2e636b57b?w=200&q=60',
  'photo-winter-4':    'https://images.unsplash.com/photo-1547981609-c47a5a6f0c58?w=200&q=60',
};

const COLOR_SWATCH: Record<string, string> = {
  violet: '#8B5CF6', cyan: '#22D3EE', pink: '#EC4899', amber: '#F59E0B',
  emerald: '#10B981', fire: '#EF4444', ocean: '#3B82F6', rose: '#F43F5E',
  gold: '#EAB308', indigo: '#6366F1',
};

function SkinPicker({ onClose }: { onClose: () => void }) {
  const { skin, setSkin } = useStore();
  const isPhoto = ALL_PHOTO_SKINS.includes(skin);
  const [tab, setTab] = useState<'color' | 'landscape' | 'photos'>(
    isPhoto ? 'photos' : ALL_LANDSCAPE_SKINS.includes(skin) ? 'landscape' : 'color'
  );
  const { color: ac, glow: ag } = getSkinColors(skin);

  function pick(id: SkinId) { setSkin(id); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl anim-slide-up" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>skins</h2>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab */}
        <div className="flex gap-1 mx-5 mb-4 p-0.5 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {(['color', 'landscape', 'photos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
              style={{ background: tab === t ? ac : 'transparent', color: tab === t ? '#fff' : 'rgba(226,232,240,0.4)', boxShadow: tab === t ? `0 2px 8px ${ag}` : 'none' }}>
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 pb-6 overflow-y-auto flex-1">
          {tab === 'color' && (
            <div>
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

          {tab === 'photos' && (
            <div>
              {PHOTO_CATEGORIES.map(cat => (
                <div key={cat.key} className="mb-5">
                  <p className="text-xs font-mono font-bold mb-2" style={{ color: 'rgba(226,232,240,0.5)' }}>{cat.label}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {cat.skins.map((id, idx) => (
                      <button key={id} onClick={() => pick(id as SkinId)} style={{
                        background: skin === id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${skin === id ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 12, padding: 6, cursor: 'pointer', transition: 'all 0.18s ease',
                      }}>
                        <div style={{
                          width: '100%', height: 52, borderRadius: 8, marginBottom: 5,
                          backgroundImage: `url('${PHOTO_THUMB_URLS[id]}')`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          position: 'relative', overflow: 'hidden',
                        }}>
                          {skin === id && <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 8 }} />}
                        </div>
                        <p style={{ fontSize: '0.55rem', textAlign: 'center', color: skin === id ? '#E2E8F0' : 'rgba(226,232,240,0.35)', fontFamily: 'monospace', lineHeight: 1.2 }}>
                          {cat.names[idx]}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
  const { layoutId, slots, setSlotWidget, skin, isPremium, setIsPremium, activeApp, setActiveApp, colorMode, setColorMode } = useStore();
  const skinColors = getSkinColors(skin);
  const { color, glow, dim, isLandscape, scene } = skinColors;
  const isLight = colorMode === 'light';
  const layout = LAYOUTS.find(l => l.id === layoutId)!;
  const session = getSession();

  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showSkinPicker, setShowSkinPicker] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showPlanners, setShowPlanners] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [addingToSlot, setAddingToSlot] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub') === 'success') {
      setIsPremium(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const slotIds = Array.from({ length: layout.slots }, (_, i) => `s${i + 1}`);

  function handleLock() { logout(); navigate('/login'); }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      data-theme={isLight && !isLandscape ? 'light' : undefined}
      style={{ background: isLandscape ? 'transparent' : (isLight ? '#F7F7FC' : '#06060F'), '--skin-color': color, '--skin-glow': glow, '--skin-dim': dim } as CSSProperties}
    >
      {/* Landscape background scene */}
      {isLandscape && scene && <LandscapeScene scene={scene} />}

      {/* Color skin orbs */}
      {!isLandscape && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div className="orb-drift" style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${color}${isLight ? '20' : '12'} 0%, transparent 60%)`, filter: 'blur(80px)' }} />
          <div className="orb-drift-2" style={{ position: 'absolute', bottom: '-25%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${color}${isLight ? '16' : '0A'} 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        </div>
      )}

      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2 relative z-10"
        style={{
          borderBottom: isLight && !isLandscape ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.05)',
          background: isLandscape ? 'rgba(0,0,0,0.35)' : (isLight ? 'rgba(247,247,252,0.92)' : 'transparent'),
          backdropFilter: (isLandscape || isLight) ? 'blur(12px)' : 'none',
        }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-mono lowercase" style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            calendi
          </span>
          <span className="tag" style={{ background: dim, color, border: `1px solid ${color}30` }}>{layout.name}</span>
          {session && <span className="text-xs font-mono hidden sm:inline" style={{ color: isLight && !isLandscape ? 'rgba(20,10,40,0.35)' : 'rgba(226,232,240,0.25)' }}>{session}</span>}
        </div>

        <div className="flex gap-1.5">
          {!isPremium && (
            <button className="btn-pill !px-2 !py-1.5 gap-1" onClick={() => setShowSubscribe(true)}
              style={{ background: `linear-gradient(135deg,${color},${color}AA)`, color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
              <Sparkles size={11} /><span className="hidden sm:inline">Go Premium</span>
            </button>
          )}
          <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1" onClick={() => setShowContacts(true)} title="Contacts">
            <Users size={13} style={{ color }} /><span className="text-xs hidden sm:inline">contacts</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1" onClick={() => setShowPlanners(true)} title="Planners">
            <BookOpen size={13} style={{ color }} /><span className="text-xs hidden sm:inline">planners</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1.5" onClick={() => setShowSkinPicker(true)}>
            <Palette size={13} style={{ color }} /><span className="text-xs hidden sm:inline">skin</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1.5" onClick={() => setShowLayoutPicker(true)}>
            <LayoutGrid size={13} style={{ color }} /><span className="text-xs hidden sm:inline">layout</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={() => setColorMode(isLight ? 'dark' : 'light')} title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}>
            {isLight
              ? <Moon size={13} style={{ color: isLandscape ? 'rgba(226,232,240,0.5)' : 'rgba(20,10,40,0.5)' }} />
              : <Sun size={13} style={{ color: 'rgba(226,232,240,0.5)' }} />
            }
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={handleLock} title="Lock">
            <Lock size={13} style={{ color: isLight && !isLandscape ? 'rgba(20,10,40,0.4)' : 'rgba(226,232,240,0.4)' }} />
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
                <EmptySlot slotId={slotId} onAdd={setAddingToSlot} color={color} isLight={isLight} />
              )}
            </div>
          );
        })}
      </main>

      {/* Ad banner — shown when not premium */}
      {!isPremium && <AdBanner onSubscribe={() => setShowSubscribe(true)} />}

      {showLayoutPicker && <LayoutPicker onClose={() => setShowLayoutPicker(false)} />}
      {showSkinPicker && <SkinPicker onClose={() => setShowSkinPicker(false)} />}
      {showContacts && <ContactsModal onClose={() => setShowContacts(false)} />}
      {showPlanners && <PlannerSheet onClose={() => setShowPlanners(false)} />}
      {showSubscribe && <SubscribeModal onClose={() => setShowSubscribe(false)} />}
      {activeApp && <AppPanel app={activeApp} onClose={() => setActiveApp(null)} />}
      {addingToSlot && (
        <AddWidgetSheet color={color} glow={glow}
          onClose={() => setAddingToSlot(null)}
          onSelect={t => { setSlotWidget(addingToSlot, t); setAddingToSlot(null); }}
        />
      )}
    </div>
  );
}

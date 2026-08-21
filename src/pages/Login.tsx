import { useState, useRef, useEffect, type CSSProperties, type FormEvent, type RefObject, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';
import { CLCLogo } from '../components/CLCLogo';

type Mode = 'sign-in' | 'create';

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  black:       '#000000',
  white:       '#FFFFFF',
  lavender:    '#8B5CF6',
  lavLight:    '#C4B5FD',
  lavDim:      'rgba(139,92,246,0.15)',
  lavBorder:   'rgba(139,92,246,0.35)',
  textDim:     'rgba(255,255,255,0.55)',
  textFaint:   'rgba(255,255,255,0.25)',
  cardBg:      'rgba(255,255,255,0.04)',
  cardBorder:  'rgba(255,255,255,0.09)',
  sectionAlt:  '#0a0a0a',
};

const CANDY = 'linear-gradient(135deg,#C084FC,#A855F7,#7C3AED,#6D28D9)';
const FOOTER_CANDY = 'linear-gradient(90deg,#C4B5FD,#8B5CF6,#C4B5FD)';

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  { emoji: '📅', title: 'Smart Calendar',     desc: 'Todos, birthdays, payday, gym, shopping lists, self-care, appointments & more — with reminders.' },
  { emoji: '🎬', title: 'Streaming Apps',      desc: 'Netflix, Disney+, Prime Video, YouTube — all in a focused in-app window. No tab-switching.' },
  { emoji: '👥', title: 'Social & Messaging',  desc: 'Facebook, WhatsApp, Instagram in one click. Saved contacts with quick-dial.' },
  { emoji: '🎥', title: 'Video Calls',          desc: 'Google Meet and Zoom, ready to launch. One tap to join or start any meeting.' },
  { emoji: '🧘', title: 'Planners & Routines', desc: 'Date Night, Trip, and Special Event planners with checklists. Self-care & gym tracked.' },
  { emoji: '🌈', title: '19 Beautiful Skins',  desc: '10 neon colors + 9 live animated landscapes — aurora, cherry blossom, night sky & more.' },
  { emoji: '🌐', title: 'Built-in Browser',     desc: 'A full web browser inside your dashboard. Google, research, browse without leaving Calendi.' },
  { emoji: '🎮', title: 'Games & More',         desc: 'Chess, Solitaire, Poki, Wordle, Sudoku built right in. Plus notes, calculator, timer & clock.' },
];

const FREE_PERKS = ['All features — fully unlocked', 'Calendar, planners & contacts', '19 animated skins', 'Streaming, social, games & calls', 'Browser, notes, clock & more', 'Supported by ads'];
const PRO_PERKS  = ['Everything in Free', 'Completely ad-free experience', 'Support CLC Premier Studios', 'Priority access to new features', 'Cancel anytime'];

const CALENDAR_DAYS = [
  { d: 1,  dots: [] as string[] },
  { d: 2,  dots: ['#8B5CF6'] },
  { d: 3,  dots: [] },
  { d: 4,  dots: ['#EC4899', '#F59E0B'] },
  { d: 5,  dots: [] },
  { d: 6,  dots: [] },
  { d: 7,  dots: ['#22D3EE'] },
  { d: 8,  dots: [] },
  { d: 9,  dots: ['#10B981'] },
  { d: 10, dots: [] },
  { d: 11, dots: ['#F59E0B'] },
  { d: 12, dots: [] },
  { d: 13, dots: [] },
  { d: 14, dots: ['#EC4899', '#8B5CF6'] },
  { d: 15, dots: ['#EF4444'] },
  { d: 16, dots: [] },
  { d: 17, dots: [] },
  { d: 18, dots: ['#10B981'] },
  { d: 19, dots: [] },
  { d: 20, dots: ['#22D3EE', '#F59E0B'] },
  { d: 21, dots: [] },
  { d: 22, dots: ['#8B5CF6'] },
  { d: 23, dots: [] },
  { d: 24, dots: [] },
  { d: 25, dots: ['#EC4899'] },
  { d: 26, dots: [] },
  { d: 27, dots: ['#10B981', '#22D3EE'] },
  { d: 28, dots: [] },
  { d: 29, dots: [] },
  { d: 30, dots: ['#F59E0B'] },
  { d: 31, dots: [] },
];

const SAMPLE_EVENTS = [
  { emoji: '💪', title: 'Gym',              time: '7:00am',  color: '#10B981' },
  { emoji: '📍', title: 'Dr. Appointment',  time: '10:30am', color: '#8B5CF6' },
  { emoji: '💰', title: 'Payday',           time: 'all day', color: '#22D3EE' },
  { emoji: '🌹', title: 'Date Night',       time: '7:00pm',  color: '#EC4899' },
];

// ─── Product slider mockups ───────────────────────────────────────────────────
const SLIDES = [
  {
    id: 'calendar',
    label: 'Monthly Calendar',
    tag: 'PLAN',
    tagColor: '#8B5CF6',
    headline: 'Every day at a glance',
    sub: 'See all your events, reminders, and todos color-coded on a beautiful monthly grid.',
  },
  {
    id: 'events',
    label: 'Daily Events',
    tag: 'ORGANIZE',
    tagColor: '#EC4899',
    headline: '55+ event types',
    sub: 'Gym, Payday, Birthday, Date Night, Dr. Appointment, Self-care, Shopping & more.',
  },
  {
    id: 'apps',
    label: 'Built-in Apps',
    tag: 'STREAM',
    tagColor: '#22D3EE',
    headline: 'Your world in one place',
    sub: 'Netflix, Disney+, Instagram, Gmail, Zoom — all in a focused in-app panel.',
  },
  {
    id: 'skins',
    label: '19 Skins',
    tag: 'CUSTOMIZE',
    tagColor: '#F59E0B',
    headline: 'Make it yours',
    sub: 'From Aurora Borealis to Cherry Blossom — 19 animated themes to match your mood.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    tag: 'CONTROL',
    tagColor: '#10B981',
    headline: 'Everything you need',
    sub: 'Calendar, clock, notes, contacts, browser, planner — all visible at once.',
  },
];

// ─── Mockup renderers (CSS-drawn app screenshots) ────────────────────────────
function MockupCalendar() {
  const s: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 0, height: '100%' };
  const header: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px 6px', borderBottom: `1px solid ${C.cardBorder}` };
  const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, padding: '8px 8px 0' };
  const dayH: CSSProperties = { textAlign: 'center', fontSize: '0.5rem', color: C.textFaint, fontWeight: 600, letterSpacing: '0.05em' };
  const dayCell = (hasEvents: boolean): CSSProperties => ({ position: 'relative', aspectRatio: '1', borderRadius: 4, background: hasEvents ? 'rgba(139,92,246,0.1)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 });
  const num: CSSProperties = { fontSize: '0.5rem', color: C.textDim, lineHeight: 1 };
  const dot = (c: string): CSSProperties => ({ width: 3, height: 3, borderRadius: '50%', background: c });
  return (
    <div style={s}>
      <div style={header}>
        <span style={{ fontSize: '0.65rem', color: C.lavLight, fontWeight: 700 }}>August 2026</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '0.55rem', color: C.textFaint }}>‹</span>
          <span style={{ fontSize: '0.55rem', color: C.textFaint }}>›</span>
        </div>
      </div>
      <div style={grid}>
        {['S','M','T','W','T','F','S'].map(d => <div key={d} style={dayH}>{d}</div>)}
        {/* 4 blank start days */}
        {[0,1,2,3].map(i => <div key={`b${i}`} />)}
        {CALENDAR_DAYS.slice(0, 24).map(({ d, dots }) => (
          <div key={d} style={dayCell(dots.length > 0)}>
            <span style={{ ...num, color: d === 21 ? C.white : C.textDim, fontWeight: d === 21 ? 700 : 400 }}>{d}</span>
            {dots.length > 0 && (
              <div style={{ display: 'flex', gap: 1 }}>
                {dots.slice(0, 2).map((c, i) => <div key={i} style={dot(c)} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupEvents() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', height: '100%' }}>
      <div style={{ fontSize: '0.55rem', color: C.textFaint, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>TODAY — AUG 21</div>
      {SAMPLE_EVENTS.map(ev => (
        <div key={ev.title} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: `${ev.color}18`, borderLeft: `2px solid ${ev.color}` }}>
          <span style={{ fontSize: '0.75rem' }}>{ev.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6rem', color: C.white, fontWeight: 600 }}>{ev.title}</div>
            <div style={{ fontSize: '0.5rem', color: C.textFaint }}>{ev.time}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 'auto', padding: '6px 0' }}>
        <div style={{ fontSize: '0.55rem', color: C.textFaint, marginBottom: 6 }}>Add event type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[['🎂','Birthday','#EC4899'],['💪','Gym','#10B981'],['🛍️','Shopping','#F59E0B'],['✈️','Trip','#22D3EE'],['🧾','Bill','#F59E0B'],['🧘','Self-Care','#8B5CF6']].map(([em, la, c]) => (
            <div key={la as string} style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: 20, background: `${c}20`, border: `1px solid ${c}40`, color: la as string === 'Trip' ? '#22D3EE' : c as string }}>{em} {la}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupApps() {
  const tabs = ['Stream', 'Social', 'Work', 'Games'];
  const apps = [
    ['🎬','Netflix'],['🎭','Disney+'],['📦','Prime'],['▶️','YouTube'],
    ['📸','Insta'],['📘','Facebook'],['💬','WhatsApp'],['✉️','Gmail'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.cardBorder}`, padding: '0 8px' }}>
        {tabs.map((t, i) => (
          <div key={t} style={{ fontSize: '0.5rem', padding: '6px 8px', color: i === 0 ? C.lavLight : C.textFaint, borderBottom: i === 0 ? `1px solid ${C.lavender}` : 'none', fontWeight: i === 0 ? 700 : 400, cursor: 'pointer' }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, padding: '10px 10px', flex: 1 }}>
        {apps.map(([em, name]) => (
          <div key={name as string} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 8, background: C.cardBg, cursor: 'pointer' }}>
            <span style={{ fontSize: '1rem' }}>{em}</span>
            <span style={{ fontSize: '0.42rem', color: C.textDim, textAlign: 'center' }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupSkins() {
  const skins = [
    { name: 'Aurora',    colors: ['#0ff','#f0f','#00f'] },
    { name: 'Cherry',    colors: ['#FF9BAE','#FFD6E0','#FFEEF4'] },
    { name: 'Night Sky', colors: ['#0B1026','#1B2B6B','#6D5ACF'] },
    { name: 'Neon Mint', colors: ['#00FF9F','#00C9FF','#00FF9F'] },
    { name: 'Sunset',    colors: ['#FF6B6B','#FFA07A','#FFD700'] },
    { name: 'Cosmic',    colors: ['#4B0082','#9400D3','#FF69B4'] },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px 10px', gap: 8 }}>
      <div style={{ fontSize: '0.55rem', color: C.textFaint, fontWeight: 600, letterSpacing: '0.08em' }}>CHOOSE YOUR SKIN</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, flex: 1 }}>
        {skins.map((sk, i) => (
          <div key={sk.name} style={{ borderRadius: 8, overflow: 'hidden', border: i === 0 ? `2px solid ${C.lavender}` : `1px solid ${C.cardBorder}`, cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '70%', background: `linear-gradient(135deg,${sk.colors.join(',')})` }} />
            <div style={{ height: '30%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.38rem', color: C.textDim }}>{sk.name}</span>
            </div>
            {i === 0 && <div style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: C.lavender, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.3rem', color: C.white }}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, padding: 8, height: '100%' }}>
      {[
        { label: 'Calendar', emoji: '📅', col: C.lavender },
        { label: 'Clock',    emoji: '🕐', col: '#22D3EE'  },
        { label: 'Notes',    emoji: '📝', col: '#F59E0B'  },
        { label: 'Contacts', emoji: '👥', col: '#EC4899'  },
      ].map(({ label, emoji, col }) => (
        <div key={label} style={{ borderRadius: 8, background: `${col}15`, border: `1px solid ${col}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.42rem', color: C.textDim }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function SlideVisual({ id }: { id: string }) {
  const frame: CSSProperties = {
    width: '100%',
    height: 240,
    borderRadius: 12,
    background: 'rgba(20,10,40,0.85)',
    border: `1px solid ${C.lavBorder}`,
    overflow: 'hidden',
    position: 'relative',
  };
  const titleBar: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '7px 10px',
    borderBottom: `1px solid ${C.cardBorder}`,
    background: 'rgba(0,0,0,0.4)',
  };
  return (
    <div style={frame}>
      <div style={titleBar}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ width: 80, height: 6, borderRadius: 3, background: C.cardBorder, margin: '0 auto' }} />
        </div>
        <div style={{ width: 20, height: 6, borderRadius: 3, background: C.cardBorder }} />
      </div>
      <div style={{ height: 'calc(100% - 28px)', overflow: 'hidden' }}>
        {id === 'calendar'   && <MockupCalendar />}
        {id === 'events'     && <MockupEvents />}
        {id === 'apps'       && <MockupApps />}
        {id === 'skins'      && <MockupSkins />}
        {id === 'dashboard'  && <MockupDashboard />}
      </div>
    </div>
  );
}

// ─── Utility: password check ─────────────────────────────────────────────────
function PwCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: met ? '#A78BFA' : C.textFaint, transition: 'color 0.2s' }}>
      <span style={{ fontSize: '0.7rem' }}>{met ? '✓' : '○'}</span>
      {label}
    </div>
  );
}

// ─── Reveal-on-scroll hook ────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealBox({ children, style, delay = 0 }: { children: ReactNode; style?: CSSProperties; delay?: number }) {
  const [ref, visible] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Main Login component ─────────────────────────────────────────────────────
export default function Login() {
  const navigate    = useNavigate();
  const { setIsPremium } = useStore();
  const isFirstTime = !hasAnyUser();
  const [mode, setMode] = useState<Mode>(isFirstTime ? 'create' : 'sign-in');
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installable,   setInstallable]   = useState(false);
  const [installed,     setInstalled]     = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub') === 'success') {
      setIsPremium(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (window.matchMedia('(display-mode: standalone)').matches) { setInstalled(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setInstallable(true); };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallable(false); });
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    const { outcome } = await (installPrompt as any).userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null); setInstallable(false);
  }

  function scrollSlider(dir: -1 | 1) {
    const next = Math.max(0, Math.min(SLIDES.length - 1, slideIdx + dir));
    setSlideIdx(next);
    if (sliderRef.current) {
      const cards = sliderRef.current.querySelectorAll('[data-slide]');
      cards[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    if (mode === 'create') {
      const res = register(username, password);
      if (!res.ok) { setError(res.error ?? 'Registration failed'); setLoading(false); return; }
    } else {
      const res = login(username, password);
      if (!res.ok) { setError(res.error ?? 'Incorrect username or password'); setLoading(false); return; }
    }
    navigate('/');
  }

  const pwHasLen     = password.length >= 8;
  const pwHasUpper   = /[A-Z]/.test(password);
  const pwHasNum     = /[0-9]/.test(password);
  const pwHasSpecial = /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password);

  // ── Shared styles ────────────────────────────────────────────────────────
  const section = (bg = C.black): CSSProperties => ({
    width: '100%',
    background: bg,
    position: 'relative',
    overflow: 'hidden',
  });

  const container: CSSProperties = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px',
  };

  const input: CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 10,
    border: `1px solid ${C.cardBorder}`,
    background: 'rgba(255,255,255,0.06)',
    color: C.white,
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: C.black, color: C.white, fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* ── STICKY NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 32px',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.cardBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em', background: CANDY, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          calendi
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {installable && !installed && (
            <button onClick={handleInstall} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.lavBorder}`, background: C.lavDim, color: C.lavLight, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} /> Install App
            </button>
          )}
          {installed && <span style={{ fontSize: '0.75rem', color: C.textFaint }}>✓ Installed</span>}
          <button
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '9px 20px', borderRadius: 8, background: C.lavender, color: C.white, border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.02em' }}
          >
            {mode === 'create' ? 'Get Started' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ ...section(), minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, position: 'relative' }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `linear-gradient(${C.lavDim} 1px, transparent 1px), linear-gradient(90deg, ${C.lavDim} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.4,
        }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', zIndex: 0 }} />

        <div style={{ ...container, zIndex: 1, width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <CLCLogo size={72} />
          </div>
          <div style={{ fontSize: '0.75rem', color: C.textFaint, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>
            by CLC Premier Studios
          </div>

          {/* Big block "calendi" */}
          <h1 style={{
            fontSize: 'clamp(64px, 14vw, 180px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            margin: '0 0 24px',
            background: CANDY,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            calendi
          </h1>

          <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', color: C.textDim, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.5, fontWeight: 300 }}>
            The calendar that does everything. Stream, socialize, plan, and play — all in one beautiful place.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '16px 36px', borderRadius: 10, background: C.lavender, color: C.white, border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', letterSpacing: '0.02em' }}
            >
              {isFirstTime ? 'Create Free Account' : 'Sign In'}
            </button>
            <button
              onClick={() => document.getElementById('slider-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ padding: '16px 36px', borderRadius: 10, background: 'transparent', color: C.lavLight, border: `1px solid ${C.lavBorder}`, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
            >
              {"See What's Inside ↓"}
            </button>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4 }}>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${C.lavender}, transparent)` }} />
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textFaint }}>scroll</span>
          </div>
        </div>
      </section>

      {/* ── PRODUCT SLIDER ─────────────────────────────────────────────── */}
      <section id="slider-section" style={{ ...section(C.sectionAlt), padding: '100px 0' }}>
        <div style={container}>
          <RevealBox style={{ marginBottom: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: C.lavender, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>PRODUCT OVERVIEW</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              See Calendi in action
            </h2>
            <p style={{ fontSize: '1.05rem', color: C.textDim, maxWidth: 520, margin: '0 auto' }}>
              Built for modern life — five powerful features in one seamless experience.
            </p>
          </RevealBox>

          {/* Slider controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
            <button onClick={() => scrollSlider(-1)} disabled={slideIdx === 0}
              style={{ width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.lavBorder}`, background: C.lavDim, color: slideIdx === 0 ? C.textFaint : C.lavLight, cursor: slideIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollSlider(1)} disabled={slideIdx === SLIDES.length - 1}
              style={{ width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.lavBorder}`, background: C.lavDim, color: slideIdx === SLIDES.length - 1 ? C.textFaint : C.lavLight, cursor: slideIdx === SLIDES.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Scrollable slide track */}
          <div ref={sliderRef} style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {SLIDES.map((slide, i) => (
              <div key={slide.id} data-slide={i}
                onClick={() => setSlideIdx(i)}
                style={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  width: 'clamp(260px, 30vw, 320px)',
                  background: i === slideIdx ? C.lavDim : C.cardBg,
                  border: `1px solid ${i === slideIdx ? C.lavBorder : C.cardBorder}`,
                  borderRadius: 16,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'background 0.3s, border-color 0.3s',
                }}>
                <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: `${slide.tagColor}20`, border: `1px solid ${slide.tagColor}40`, color: slide.tagColor, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
                  {slide.tag}
                </div>
                <SlideVisual id={slide.id} />
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 6 }}>{slide.headline}</div>
                  <div style={{ fontSize: '0.82rem', color: C.textDim, lineHeight: 1.5 }}>{slide.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
            {SLIDES.map((_, i) => (
              <div key={i} onClick={() => setSlideIdx(i)}
                style={{ width: i === slideIdx ? 24 : 6, height: 6, borderRadius: 3, background: i === slideIdx ? C.lavender : C.textFaint, cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE 1: Calendar ───────────────────────────────────────── */}
      <section style={{ ...section(), padding: '100px 0', borderTop: `1px solid ${C.cardBorder}` }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 64, alignItems: 'center' }}>
          <RevealBox>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {CALENDAR_DAYS.filter(({ dots }) => dots.length > 0).slice(0, 3).map(({ d, dots }) => (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${dots[0]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: dots[0] }}>{d}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {dots.map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: C.textDim }}>Aug {d}</span>
                </div>
              ))}
            </div>
            {/* Mini calendar grid */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '16px', maxWidth: 340 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: C.lavLight }}>August 2026</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ChevronLeft size={14} style={{ color: C.textFaint }} />
                  <ChevronRight size={14} style={{ color: C.textFaint }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', color: C.textFaint, fontWeight: 600 }}>{d}</div>)}
                {[null,null,null,null].map((_, i) => <div key={`e${i}`} />)}
                {CALENDAR_DAYS.slice(0, 18).map(({ d, dots }) => (
                  <div key={d} style={{ aspectRatio: '1', borderRadius: 6, background: d === 21 ? C.lavender : dots.length ? `${dots[0]}18` : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: d === 21 ? 700 : 400, color: d === 21 ? C.white : C.textDim }}>{d}</span>
                    {dots.length > 0 && d !== 21 && <div style={{ display: 'flex', gap: 1 }}>{dots.slice(0,2).map(c => <div key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: c }} />)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </RevealBox>
          <RevealBox delay={0.15}>
            <div style={{ fontSize: '0.7rem', color: C.lavender, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>CALENDAR</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px' }}>
              Life organized.<br />Nothing missed.
            </h2>
            <p style={{ fontSize: '1.05rem', color: C.textDim, lineHeight: 1.7, marginBottom: 28 }}>
              55+ event types — birthdays, payday, gym, shopping, self-care, appointments, and more. Color-coded, reminder-ready, and always in view.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['📅 Events', '🔔 Reminders', '🎂 Birthdays', '💰 Payday', '💪 Gym', '🧘 Self-Care', '✈️ Trips', '🛍️ Shopping'].map(t => (
                <div key={t} style={{ padding: '6px 14px', borderRadius: 20, background: C.cardBg, border: `1px solid ${C.cardBorder}`, fontSize: '0.78rem', color: C.textDim }}>{t}</div>
              ))}
            </div>
          </RevealBox>
        </div>
      </section>

      {/* ── FEATURE 2: Apps ──────────────────────────────────────────── */}
      <section style={{ ...section(C.sectionAlt), padding: '100px 0' }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 64, alignItems: 'center' }}>
          <RevealBox delay={0.1}>
            <div style={{ fontSize: '0.7rem', color: '#22D3EE', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>BUILT-IN APPS</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px' }}>
              Every app.<br />One place.
            </h2>
            <p style={{ fontSize: '1.05rem', color: C.textDim, lineHeight: 1.7, marginBottom: 28 }}>
              No more tab-switching. Netflix, Disney+, Gmail, Instagram, Zoom — all open inside Calendi. Stream, chat, work, and call without ever leaving.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, maxWidth: 340 }}>
              {[['🎬','Netflix'],['🎭','Disney+'],['📦','Prime'],['▶️','YouTube'],['📸','Instagram'],['📘','Facebook'],['✉️','Gmail'],['🎥','Zoom']].map(([em, n]) => (
                <div key={n as string} style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '12px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{em}</div>
                  <div style={{ fontSize: '0.55rem', color: C.textFaint }}>{n}</div>
                </div>
              ))}
            </div>
          </RevealBox>
          <RevealBox delay={0.2}>
            <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, overflow: 'hidden', maxWidth: 380 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>{['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: C.textDim }}>Calendi — Apps</div>
              </div>
              <MockupApps />
            </div>
          </RevealBox>
        </div>
      </section>

      {/* ── FEATURE GRID ─────────────────────────────────────────────── */}
      <section style={{ ...section(), padding: '100px 0', borderTop: `1px solid ${C.cardBorder}` }}>
        <div style={container}>
          <RevealBox style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: '0.7rem', color: C.lavender, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>FEATURES</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Everything you need
            </h2>
            <p style={{ fontSize: '1.05rem', color: C.textDim, maxWidth: 520, margin: '0 auto' }}>
              One app that replaces your planner, your launcher, and your entertainment hub.
            </p>
          </RevealBox>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <RevealBox key={f.title} delay={i * 0.05} style={{
                background: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 16,
                padding: '28px 24px',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: '0.83rem', color: C.textDim, lineHeight: 1.6 }}>{f.desc}</div>
              </RevealBox>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section style={{ ...section(C.sectionAlt), padding: '100px 0' }}>
        <div style={container}>
          <RevealBox style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: '0.7rem', color: C.lavender, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>PRICING</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              Start free. Stay free.
            </h2>
          </RevealBox>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, maxWidth: 720, margin: '0 auto' }}>
            {/* Free */}
            <RevealBox style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: '32px 28px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>Free</div>
              <div style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.03em', margin: '8px 0 24px' }}>$0<span style={{ fontSize: '1rem', fontWeight: 400, color: C.textDim }}>/mo</span></div>
              {FREE_PERKS.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, fontSize: '0.88rem', color: C.textDim }}>
                  <span style={{ color: C.lavLight, marginTop: 2 }}>✓</span>{p}
                </div>
              ))}
              <button
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ width: '100%', padding: '13px', borderRadius: 10, border: `1px solid ${C.lavBorder}`, background: 'transparent', color: C.lavLight, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 16 }}>
                Get Started Free
              </button>
            </RevealBox>
            {/* Pro */}
            <RevealBox delay={0.1} style={{ background: `linear-gradient(145deg, rgba(139,92,246,0.2), rgba(139,92,246,0.06))`, border: `1px solid ${C.lavBorder}`, borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 20, background: C.lavender, color: C.white, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>PREMIUM</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>Premium</div>
              <div style={{ fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.03em', margin: '8px 0 24px' }}>$4.99<span style={{ fontSize: '1rem', fontWeight: 400, color: C.textDim }}>/mo</span></div>
              {PRO_PERKS.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, fontSize: '0.88rem', color: C.textDim }}>
                  <span style={{ color: '#A78BFA', marginTop: 2 }}>✓</span>{p}
                </div>
              ))}
              <button style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: C.lavender, color: C.white, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 16 }}>
                Upgrade to Premium
              </button>
            </RevealBox>
          </div>
        </div>
      </section>

      {/* ── AUTH FORM ────────────────────────────────────────────────── */}
      <section id="auth-section" style={{ ...section(), padding: '100px 0', borderTop: `1px solid ${C.cardBorder}` }}>
        <div style={{ ...container, maxWidth: 480, textAlign: 'center' }}>
          <RevealBox>
            <div style={{ marginBottom: 8 }}><CLCLogo size={56} /></div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>
              {mode === 'create' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ color: C.textDim, fontSize: '0.9rem', marginBottom: 32 }}>
              {mode === 'create' ? 'Free forever. No credit card required.' : 'Sign in to continue to Calendi.'}
            </p>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: C.textDim, letterSpacing: '0.05em' }}>USERNAME</label>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="yourname" required autoComplete="username"
                  style={input}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: C.textDim, letterSpacing: '0.05em' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'create' ? 'Min 8 chars, uppercase, number, special' : '••••••••'}
                    required autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                    style={{ ...input, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', padding: 4 }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'create' && password.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.07)', border: `1px solid ${C.lavDim}` }}>
                    <PwCheck label="8+ characters" met={pwHasLen} />
                    <PwCheck label="Uppercase letter" met={pwHasUpper} />
                    <PwCheck label="Number (0–9)" met={pwHasNum} />
                    <PwCheck label="Special character" met={pwHasSpecial} />
                  </div>
                )}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: '0.82rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ padding: '15px', borderRadius: 10, border: 'none', background: loading ? C.lavDim : C.lavender, color: loading ? C.textFaint : C.white, fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em', transition: 'background 0.2s' }}>
                {loading ? 'Just a moment…' : (mode === 'create' ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.83rem', color: C.textDim }}>
              {mode === 'create' ? 'Already have an account?' : 'New to Calendi?'}{' '}
              <button onClick={() => { setMode(mode === 'create' ? 'sign-in' : 'create'); setError(''); }}
                style={{ background: 'none', border: 'none', color: C.lavLight, fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem' }}>
                {mode === 'create' ? 'Sign in' : 'Create a free account'}
              </button>
            </div>
          </RevealBox>
        </div>
      </section>

      {/* ── BIG FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background: C.black, borderTop: `1px solid ${C.cardBorder}`, overflow: 'hidden' }}>
        {/* Footer links row */}
        <div style={{ ...container, padding: '48px 32px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <CLCLogo size={40} />
            <span style={{ fontSize: '0.8rem', color: C.textFaint }}>© 2026 CLC Premier Studios</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Support'].map(l => (
              <span key={l} style={{ fontSize: '0.8rem', color: C.textFaint, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* BIG BLOCK LETTERS */}
        <div style={{ padding: '20px 0 0', borderTop: `1px solid ${C.cardBorder}`, overflow: 'hidden' }}>
          {/* "calendi" */}
          <div style={{
            fontSize: 'clamp(48px, 11vw, 140px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 0.88,
            padding: '0 24px',
            background: CANDY,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            calendi
          </div>

          {/* "CLC PREMIER STUDIOS" */}
          <div style={{
            fontSize: 'clamp(22px, 5.5vw, 80px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            padding: '4px 24px 32px',
            background: FOOTER_CANDY,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            CLC PREMIER STUDIOS
          </div>
        </div>
      </footer>
    </div>
  );
}

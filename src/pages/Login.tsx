import { useState, useRef, useEffect, type CSSProperties, type FormEvent, type RefObject, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';
import { CLCLogo } from '../components/CLCLogo';

type Mode = 'sign-in' | 'create';

// ─── Palette: true black / true white / lavender ──────────────────────────────
const BLACK    = '#000000';
const WHITE    = '#FFFFFF';
const LAV      = '#7C3AED';
const LAV_MID  = '#8B5CF6';
const LAV_LITE = '#C4B5FD';
const LAV_PALE = '#EDE9FE';
const GREY     = '#6B7280';
const OFF_W    = '#F8F7FF';

const FREE_PERKS = ['All features — fully unlocked', 'Calendar, planners & contacts', '19 animated skins', 'Streaming, social, games & calls', 'Browser, notes, clock & more', 'Supported by ads'];
const PRO_PERKS  = ['Everything in Free', 'Completely ad-free experience', 'Support CLC Premier Studios', 'Priority access to new features', 'Cancel anytime'];

const FEATURES = [
  { emoji: '📅', title: 'Smart Calendar',     desc: 'Todos, birthdays, payday, gym, self-care, appointments & more — with color-coded reminders.' },
  { emoji: '🎬', title: 'Streaming Apps',      desc: 'Netflix, Disney+, Prime Video, YouTube — in a focused in-app panel. No tab-switching.' },
  { emoji: '👥', title: 'Social & Messaging',  desc: 'Facebook, WhatsApp, Instagram in one click. Saved contacts with quick-dial.' },
  { emoji: '🎥', title: 'Video Calls',          desc: 'Google Meet and Zoom built right in. One tap to join or start any meeting.' },
  { emoji: '🧘', title: 'Planners & Routines', desc: 'Date Night, Trip, and Special Event planners with checklists. Self-care & gym tracked.' },
  { emoji: '🌈', title: '19 Beautiful Skins',  desc: '10 neon colors + 9 live animated landscapes — aurora, cherry blossom, night sky & more.' },
  { emoji: '🌐', title: 'Built-in Browser',     desc: 'Full web browsing inside your dashboard. Google and research without leaving Calendi.' },
  { emoji: '🎮', title: 'Games & More',         desc: 'Chess, Solitaire, Poki, Wordle, Sudoku built in. Plus notes, calculator, timer & clock.' },
];

const CALENDAR_DAYS: { d: number; dots: string[] }[] = [
  { d: 1,  dots: [] },        { d: 2,  dots: ['#7C3AED'] }, { d: 3,  dots: [] },
  { d: 4,  dots: ['#EC4899','#F59E0B'] }, { d: 5, dots: [] }, { d: 6, dots: [] },
  { d: 7,  dots: ['#22D3EE'] }, { d: 8, dots: [] }, { d: 9, dots: ['#10B981'] },
  { d: 10, dots: [] }, { d: 11, dots: ['#F59E0B'] }, { d: 12, dots: [] },
  { d: 13, dots: [] }, { d: 14, dots: ['#EC4899','#7C3AED'] }, { d: 15, dots: ['#EF4444'] },
  { d: 16, dots: [] }, { d: 17, dots: [] }, { d: 18, dots: ['#10B981'] },
  { d: 19, dots: [] }, { d: 20, dots: ['#22D3EE','#F59E0B'] }, { d: 21, dots: [] },
  { d: 22, dots: ['#7C3AED'] }, { d: 23, dots: [] }, { d: 24, dots: [] },
  { d: 25, dots: ['#EC4899'] }, { d: 26, dots: [] }, { d: 27, dots: ['#10B981','#22D3EE'] },
  { d: 28, dots: [] }, { d: 29, dots: [] }, { d: 30, dots: ['#F59E0B'] }, { d: 31, dots: [] },
];

const SAMPLE_EVENTS = [
  { emoji: '💪', title: 'Gym',             time: '7:00am',  color: '#10B981' },
  { emoji: '📍', title: 'Dr. Appointment', time: '10:30am', color: '#7C3AED' },
  { emoji: '💰', title: 'Payday',          time: 'all day', color: '#22D3EE' },
  { emoji: '🌹', title: 'Date Night',      time: '7:00pm',  color: '#EC4899' },
];

const SLIDES = [
  { id: 'calendar',  label: 'Monthly View',  tag: 'PLAN',      desc: 'See every event color-coded on a beautiful monthly grid.' },
  { id: 'events',    label: 'Daily Events',  tag: 'ORGANIZE',  desc: '55+ event types — gym, payday, birthdays & more.' },
  { id: 'apps',      label: 'Built-in Apps', tag: 'STREAM',    desc: 'Netflix, Gmail, Zoom — all inside Calendi.' },
  { id: 'skins',     label: '19 Skins',      tag: 'CUSTOMIZE', desc: 'Aurora, Cherry Blossom, Night Sky & 16 more.' },
  { id: 'dashboard', label: 'Dashboard',     tag: 'CONTROL',   desc: 'Calendar, widgets, apps — everything at once.' },
];

// ─── CSS mockup components ────────────────────────────────────────────────────
function MockupCalendar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px 8px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: LAV }}>August 2026</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <ChevronLeft size={10} style={{ color: GREY, opacity: 0.5 }} />
          <ChevronRight size={10} style={{ color: GREY, opacity: 0.5 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, padding: '6px 8px' }}>
        {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.42rem', color: GREY, fontWeight: 600, opacity: 0.5 }}>{d}</div>)}
        {[0,1,2,3].map(i => <div key={`b${i}`} />)}
        {CALENDAR_DAYS.slice(0, 24).map(({ d, dots }) => (
          <div key={d} style={{ aspectRatio: '1', borderRadius: 4, background: d === 21 ? LAV : dots.length ? `${dots[0]}15` : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <span style={{ fontSize: '0.45rem', fontWeight: d === 21 ? 700 : 400, color: d === 21 ? WHITE : '#333' }}>{d}</span>
            {dots.length > 0 && d !== 21 && <div style={{ display: 'flex', gap: 1 }}>{dots.slice(0,2).map(c => <div key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: c }} />)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupEvents() {
  return (
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
      <div style={{ fontSize: '0.5rem', fontWeight: 700, color: GREY, letterSpacing: '0.08em', marginBottom: 2 }}>TODAY — AUG 21</div>
      {SAMPLE_EVENTS.map(ev => (
        <div key={ev.title} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: `${ev.color}12`, borderLeft: `2.5px solid ${ev.color}` }}>
          <span style={{ fontSize: '0.7rem' }}>{ev.emoji}</span>
          <div>
            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#111' }}>{ev.title}</div>
            <div style={{ fontSize: '0.44rem', color: GREY }}>{ev.time}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[['🎂','Birthday','#EC4899'],['💪','Gym','#10B981'],['🛍️','Shop','#F59E0B'],['✈️','Trip','#22D3EE']].map(([em, la, c]) => (
            <div key={la as string} style={{ fontSize: '0.42rem', padding: '2px 6px', borderRadius: 20, background: `${c}15`, border: `1px solid ${c}40`, color: c as string }}>{em} {la}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupApps() {
  const tabs = ['Stream','Social','Work','Games'];
  const apps: [string,string][] = [['🎬','Netflix'],['🎭','Disney+'],['📦','Prime'],['▶️','YouTube'],['📸','Insta'],['📘','Facebook'],['✉️','Gmail'],['🎥','Zoom']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '0 8px' }}>
        {tabs.map((t, i) => (
          <div key={t} style={{ fontSize: '0.44rem', padding: '6px 7px', color: i === 0 ? LAV : GREY, borderBottom: i === 0 ? `1.5px solid ${LAV}` : 'none', fontWeight: i === 0 ? 700 : 400 }}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, padding: '8px 10px' }}>
        {apps.map(([em, name]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '7px 4px', borderRadius: 8, background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '0.9rem' }}>{em}</span>
            <span style={{ fontSize: '0.36rem', color: GREY }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupSkins() {
  const skins = [
    { name: 'Aurora',    a: '#00f0ff', b: '#ff00f0' },
    { name: 'Cherry',    a: '#FFB7C5', b: '#FFDCE5' },
    { name: 'Night Sky', a: '#0B1026', b: '#6D5ACF' },
    { name: 'Neon Mint', a: '#00FF9F', b: '#00AAFF' },
    { name: 'Sunset',    a: '#FF6B6B', b: '#FFD700' },
    { name: 'Cosmic',    a: '#4B0082', b: '#FF69B4' },
  ];
  return (
    <div style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: '0.48rem', fontWeight: 700, color: GREY, letterSpacing: '0.08em' }}>CHOOSE YOUR SKIN</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
        {skins.map((sk, i) => (
          <div key={sk.name} style={{ borderRadius: 8, overflow: 'hidden', border: i === 0 ? `2px solid ${LAV}` : '1.5px solid rgba(0,0,0,0.1)', position: 'relative' }}>
            <div style={{ height: 44, background: `linear-gradient(135deg,${sk.a},${sk.b})` }} />
            <div style={{ padding: '3px 4px', background: WHITE, textAlign: 'center' }}>
              <span style={{ fontSize: '0.36rem', color: GREY }}>{sk.name}</span>
            </div>
            {i === 0 && <div style={{ position: 'absolute', top: 3, right: 3, width: 10, height: 10, borderRadius: '50%', background: LAV, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.35rem', color: WHITE }}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: 8, height: '100%' }}>
      {[
        { label: 'Calendar', emoji: '📅', col: LAV },
        { label: 'Clock',    emoji: '🕐', col: '#22D3EE' },
        { label: 'Notes',    emoji: '📝', col: '#F59E0B' },
        { label: 'Contacts', emoji: '👥', col: '#EC4899' },
      ].map(({ label, emoji, col }) => (
        <div key={label} style={{ borderRadius: 8, background: `${col}12`, border: `1px solid ${col}25`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <span style={{ fontSize: '1rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.4rem', color: GREY }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function SlideVisual({ id }: { id: string }) {
  return (
    <div style={{ width: '100%', height: 220, borderRadius: 14, background: WHITE, border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(124,58,237,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#FAFAFA' }}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
        <div style={{ flex: 1, textAlign: 'center' }}><div style={{ width: 70, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.08)', margin: '0 auto' }} /></div>
      </div>
      <div style={{ height: 'calc(100% - 26px)', overflow: 'hidden' }}>
        {id === 'calendar'  && <MockupCalendar />}
        {id === 'events'    && <MockupEvents />}
        {id === 'apps'      && <MockupApps />}
        {id === 'skins'     && <MockupSkins />}
        {id === 'dashboard' && <MockupDashboard />}
      </div>
    </div>
  );
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
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
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function PwCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: met ? LAV : GREY, transition: 'color 0.2s' }}>
      <span>{met ? '✓' : '○'}</span>{label}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  function goToSlide(idx: number) {
    setSlideIdx(idx);
    if (sliderRef.current) {
      const cards = sliderRef.current.querySelectorAll('[data-slide]');
      cards[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
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

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const inputStyle: CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 16px',
    borderRadius: 10,
    border: '1.5px solid rgba(0,0,0,0.12)',
    background: WHITE,
    color: '#111',
    fontSize: '0.95rem',
    outline: 'none',
  };

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', color: '#111', overflowX: 'hidden' }}>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: '14px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-0.03em', color: LAV }}>calendi</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {installable && !installed && (
            <button onClick={handleInstall} style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${LAV_MID}`, background: LAV_PALE, color: LAV, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} /> Install App
            </button>
          )}
          {installed && <span style={{ fontSize: '0.75rem', color: GREY }}>✓ Installed</span>}
          <button onClick={() => scrollTo('auth-section')}
            style={{ padding: '10px 22px', borderRadius: 8, background: LAV, color: WHITE, border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
            {mode === 'create' ? 'Get Started Free' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* ── HERO — BLACK ─────────────────────────────────────────────── */}
      <section style={{ background: BLACK, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}><CLCLogo size={68} /></div>
          <div style={{ fontSize: '0.7rem', color: LAV_LITE, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 32 }}>
            by CLC Premier Studios
          </div>

          {/* Big white block letters */}
          <h1 style={{ fontSize: 'clamp(72px,16vw,200px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.88, margin: '0 0 24px', color: WHITE }}>
            calendi
          </h1>

          {/* Lavender accent bar */}
          <div style={{ width: 72, height: 4, borderRadius: 2, background: LAV, margin: '0 auto 28px' }} />

          <p style={{ fontSize: 'clamp(1rem,2.2vw,1.4rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.65, fontWeight: 300 }}>
            The calendar that does everything. Stream, socialize, plan, and play — all in one beautiful place.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('auth-section')}
              style={{ padding: '16px 36px', borderRadius: 10, background: LAV, color: WHITE, border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
              {isFirstTime ? 'Create Free Account' : 'Sign In'}
            </button>
            <button onClick={() => scrollTo('slider-section')}
              style={{ padding: '16px 36px', borderRadius: 10, background: 'transparent', color: LAV_LITE, border: '1.5px solid rgba(196,181,253,0.4)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
              {"See What's Inside ↓"}
            </button>
          </div>
          <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom,${LAV},transparent)` }} />
          </div>
        </div>
      </section>

      {/* ── STATS — LAVENDER BAR ─────────────────────────────────────── */}
      <section style={{ background: LAV, padding: '36px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 24, textAlign: 'center' }}>
          {[['55+','Event Types'],['19','Beautiful Skins'],['10+','Built-in Apps'],['1','Dashboard']].map(([num, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: WHITE, letterSpacing: '-0.03em', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT SLIDER — WHITE ───────────────────────────────────── */}
      <section id="slider-section" style={{ background: WHITE, padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealBox style={{ marginBottom: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: LAV, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>PRODUCT TOUR</div>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 14px', color: BLACK }}>
              See Calendi in action
            </h2>
            <p style={{ fontSize: '1.05rem', color: GREY, maxWidth: 500, margin: '0 auto' }}>
              Five powerful features — one seamless experience.
            </p>
          </RevealBox>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
            {[{ dir: -1, dis: slideIdx === 0 }, { dir: 1, dis: slideIdx === SLIDES.length - 1 }].map(({ dir, dis }) => (
              <button key={dir} onClick={() => goToSlide(Math.max(0, Math.min(SLIDES.length - 1, slideIdx + dir)))} disabled={dis}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(124,58,237,0.3)', background: dis ? '#f5f5f7' : LAV_PALE, color: dis ? GREY : LAV, cursor: dis ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {dir === -1 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>

          <div ref={sliderRef} style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {SLIDES.map((slide, i) => (
              <div key={slide.id} data-slide={i} onClick={() => goToSlide(i)}
                style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 'clamp(250px,28vw,310px)', padding: 20, borderRadius: 16, background: i === slideIdx ? LAV_PALE : '#FAFAFA', border: `1.5px solid ${i === slideIdx ? LAV_MID : 'rgba(0,0,0,0.07)'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ display: 'inline-block', marginBottom: 14, padding: '3px 10px', borderRadius: 20, background: LAV_PALE, border: '1px solid rgba(124,58,237,0.3)', color: LAV, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  {slide.tag}
                </div>
                <SlideVisual id={slide.id} />
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 5, color: BLACK }}>{slide.label}</div>
                  <div style={{ fontSize: '0.82rem', color: GREY, lineHeight: 1.5 }}>{slide.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
            {SLIDES.map((_, i) => (
              <div key={i} onClick={() => goToSlide(i)} style={{ width: i === slideIdx ? 28 : 7, height: 7, borderRadius: 4, background: i === slideIdx ? LAV : 'rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE 1 — BLACK: Calendar ──────────────────────────────── */}
      <section style={{ background: BLACK, padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>
          <RevealBox>
            <div style={{ background: '#111127', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(196,181,253,0.2)', boxShadow: '0 24px 80px rgba(124,58,237,0.25)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: LAV_LITE, fontSize: '0.95rem' }}>August 2026</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ChevronLeft size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 8 }}>
                  {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
                  {[0,1,2,3].map(i => <div key={`e${i}`} />)}
                  {CALENDAR_DAYS.slice(0,28).map(({ d, dots }) => (
                    <div key={d} style={{ aspectRatio: '1', borderRadius: 8, background: d === 21 ? LAV : dots.length ? 'rgba(196,181,253,0.1)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: d === 21 ? 800 : 400, color: d === 21 ? WHITE : 'rgba(255,255,255,0.7)' }}>{d}</span>
                      {dots.length > 0 && d !== 21 && <div style={{ display: 'flex', gap: 2 }}>{dots.slice(0,2).map(c => <div key={c} style={{ width: 4, height: 4, borderRadius: '50%', background: c }} />)}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SAMPLE_EVENTS.slice(0,2).map(ev => (
                    <div key={ev.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', borderLeft: `2px solid ${ev.color}` }}>
                      <span>{ev.emoji}</span>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{ev.title}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{ev.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealBox>
          <RevealBox delay={0.15}>
            <div style={{ fontSize: '0.7rem', color: LAV_LITE, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>CALENDAR</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px', color: WHITE }}>
              Life organized.<br />Nothing missed.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 28 }}>
              55+ event types — birthdays, payday, gym, shopping, self-care, appointments. Color-coded, reminder-ready, and always in view.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['📅 Events','🔔 Reminders','🎂 Birthdays','💰 Payday','💪 Gym','🧘 Self-Care','✈️ Trips','🛍️ Shopping'].map(t => (
                <div key={t} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>{t}</div>
              ))}
            </div>
          </RevealBox>
        </div>
      </section>

      {/* ── FEATURE 2 — OFF-WHITE: Apps ──────────────────────────────── */}
      <section style={{ background: OFF_W, padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>
          <RevealBox delay={0.1}>
            <div style={{ fontSize: '0.7rem', color: LAV, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>BUILT-IN APPS</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px', color: BLACK }}>
              Every app.<br />One place.
            </h2>
            <p style={{ fontSize: '1.05rem', color: GREY, lineHeight: 1.7, marginBottom: 28 }}>
              No more tab-switching. Netflix, Disney+, Gmail, Instagram, Zoom — all open inside Calendi. Stream, chat, work, and call without ever leaving.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, maxWidth: 320 }}>
              {[['🎬','Netflix'],['🎭','Disney+'],['📦','Prime'],['▶️','YouTube'],['📸','Instagram'],['📘','Facebook'],['✉️','Gmail'],['🎥','Zoom']].map(([em, n]) => (
                <div key={n as string} style={{ background: WHITE, border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 6px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 5 }}>{em}</div>
                  <div style={{ fontSize: '0.55rem', color: GREY }}>{n}</div>
                </div>
              ))}
            </div>
          </RevealBox>
          <RevealBox delay={0.2}>
            <div style={{ background: WHITE, border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 80px rgba(124,58,237,0.1)' }}>
              <div style={{ background: '#FAFAFA', padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>{['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: GREY }}>Calendi — Stream</div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(0,0,0,0.07)', marginBottom: 12 }}>
                  {['Stream','Social','Work','Games'].map((t,i) => (
                    <div key={t} style={{ padding: '8px 14px', fontSize: '0.78rem', fontWeight: i===0?700:400, color: i===0?LAV:GREY, borderBottom: i===0?`2px solid ${LAV}`:'none', cursor: 'pointer' }}>{t}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {[['🎬','Netflix'],['🎭','Disney+'],['📦','Prime Video'],['▶️','YouTube'],['📸','Instagram'],['📘','Facebook'],['💬','WhatsApp'],['✉️','Gmail']].map(([em, name]) => (
                    <div key={name as string} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: LAV_PALE, border: '1px solid rgba(124,58,237,0.15)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{em}</div>
                      <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 500 }}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealBox>
        </div>
      </section>

      {/* ── FEATURE GRID — WHITE ─────────────────────────────────────── */}
      <section style={{ background: WHITE, padding: '100px 40px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealBox style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: '0.7rem', color: LAV, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>EVERYTHING INCLUDED</div>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 14px', color: BLACK }}>
              One app that does it all
            </h2>
            <p style={{ fontSize: '1.05rem', color: GREY, maxWidth: 500, margin: '0 auto' }}>
              No subscriptions to juggle, no apps to manage. Everything lives in Calendi.
            </p>
          </RevealBox>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <RevealBox key={f.title} delay={i * 0.05} style={{ background: i % 2 === 0 ? LAV_PALE : WHITE, border: `1.5px solid ${i % 2 === 0 ? 'rgba(124,58,237,0.15)' : 'rgba(0,0,0,0.07)'}`, borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8, color: BLACK }}>{f.title}</div>
                <div style={{ fontSize: '0.83rem', color: GREY, lineHeight: 1.6 }}>{f.desc}</div>
              </RevealBox>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING — PALE LAVENDER ───────────────────────────────────── */}
      <section style={{ background: LAV_PALE, padding: '100px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <RevealBox style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: '0.7rem', color: LAV, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>PRICING</div>
            <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: BLACK }}>Start free. Stay free.</h2>
          </RevealBox>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            <RevealBox style={{ background: WHITE, border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '36px 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 6, color: BLACK }}>Free</div>
              <div style={{ fontWeight: 900, fontSize: '2.8rem', letterSpacing: '-0.04em', color: BLACK, marginBottom: 28 }}>$0<span style={{ fontSize: '1.1rem', fontWeight: 400, color: GREY }}>/mo</span></div>
              {FREE_PERKS.map(p => (
                <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: '0.88rem', color: GREY }}>
                  <span style={{ color: LAV, fontWeight: 700 }}>✓</span>{p}
                </div>
              ))}
              <button onClick={() => scrollTo('auth-section')} style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 10, border: `1.5px solid ${LAV}`, background: WHITE, color: LAV, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                Get Started Free
              </button>
            </RevealBox>
            <RevealBox delay={0.1} style={{ background: LAV, border: `1.5px solid ${LAV}`, borderRadius: 20, padding: '36px 30px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: WHITE, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>PREMIUM</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 6, color: WHITE }}>Premium</div>
              <div style={{ fontWeight: 900, fontSize: '2.8rem', letterSpacing: '-0.04em', color: WHITE, marginBottom: 28 }}>$4.99<span style={{ fontSize: '1.1rem', fontWeight: 400, color: 'rgba(255,255,255,0.65)' }}>/mo</span></div>
              {PRO_PERKS.map(p => (
                <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ color: WHITE, fontWeight: 700 }}>✓</span>{p}
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 10, border: 'none', background: WHITE, color: LAV, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                Upgrade to Premium
              </button>
            </RevealBox>
          </div>
        </div>
      </section>

      {/* ── AUTH FORM — WHITE ─────────────────────────────────────────── */}
      <section id="auth-section" style={{ background: WHITE, padding: '100px 40px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
          <RevealBox>
            <div style={{ marginBottom: 16 }}><CLCLogo size={60} /></div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8, color: BLACK }}>
              {mode === 'create' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ color: GREY, fontSize: '0.9rem', marginBottom: 36 }}>
              {mode === 'create' ? 'Free forever. No credit card needed.' : 'Sign in to continue to Calendi.'}
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 7, color: '#333', letterSpacing: '0.05em' }}>USERNAME</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="yourname" required autoComplete="username" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 7, color: '#333', letterSpacing: '0.05em' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'create' ? '8+ chars, uppercase, number, special' : '••••••••'}
                    required autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                    style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: GREY, cursor: 'pointer', padding: 4 }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'create' && password.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 10, padding: '12px 14px', borderRadius: 10, background: LAV_PALE, border: '1px solid rgba(124,58,237,0.15)' }}>
                    <PwCheck label="8+ characters"    met={pwHasLen} />
                    <PwCheck label="Uppercase letter"  met={pwHasUpper} />
                    <PwCheck label="Number (0–9)"      met={pwHasNum} />
                    <PwCheck label="Special character" met={pwHasSpecial} />
                  </div>
                )}
              </div>
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', color: '#DC2626', fontSize: '0.83rem' }}>{error}</div>
              )}
              <button type="submit" disabled={loading}
                style={{ padding: '15px', borderRadius: 10, border: 'none', background: loading ? 'rgba(124,58,237,0.4)' : LAV, color: WHITE, fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: 4 }}>
                {loading ? 'Just a moment…' : (mode === 'create' ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: GREY }}>
              {mode === 'create' ? 'Already have an account?' : 'New to Calendi?'}{' '}
              <button onClick={() => { setMode(mode === 'create' ? 'sign-in' : 'create'); setError(''); }}
                style={{ background: 'none', border: 'none', color: LAV, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                {mode === 'create' ? 'Sign in' : 'Create a free account'}
              </button>
            </div>
          </RevealBox>
        </div>
      </section>

      {/* ── FOOTER — BLACK + BIG BLOCK LETTERS ───────────────────────── */}
      <footer style={{ background: BLACK, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 40px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CLCLogo size={38} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>© 2026 CLC Premier Studios</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Privacy','Terms','Support'].map(l => <span key={l} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{l}</span>)}
          </div>
        </div>

        {/* BIG BLOCK TEXT ─────────────────────────────────────────────── */}
        <div style={{ padding: '48px 32px 0', overflow: 'hidden', lineHeight: 0.85 }}>
          {/* calendi — huge WHITE letters */}
          <div style={{ fontSize: 'clamp(64px,18vw,220px)', fontWeight: 900, letterSpacing: '-0.05em', color: WHITE, whiteSpace: 'nowrap' }}>
            calendi
          </div>
          {/* Lavender divider */}
          <div style={{ height: 3, background: LAV, margin: '10px 0 0' }} />
          {/* CLC PREMIER STUDIOS — lavender */}
          <div style={{ fontSize: 'clamp(22px,6vw,90px)', fontWeight: 900, letterSpacing: '-0.02em', color: LAV_MID, whiteSpace: 'nowrap', paddingBottom: 40, marginTop: 8 }}>
            CLC PREMIER STUDIOS
          </div>
        </div>
      </footer>

    </div>
  );
}

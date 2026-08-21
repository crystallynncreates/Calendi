import { useState, useRef, useEffect, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Download, CheckCircle, Sparkles, Star, Crown, Shield, Check } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';
import { CLCLogo } from '../components/CLCLogo';
import LandscapeScene from '../components/LandscapeScene';

type Mode = 'sign-in' | 'create';

const BRAND_LOGOS = [
  { src: '/logos/netflix.svg',    label: 'Netflix',   w: 80 },
  { src: '/logos/youtube.svg',    label: 'YouTube',   w: 80 },
  { src: '/logos/disneyplus.svg', label: 'Disney+',   w: 80 },
  { src: '/logos/prime.svg',      label: 'Prime',     w: 76 },
  { src: '/logos/facebook.svg',   label: 'Facebook',  w: 50 },
  { src: '/logos/instagram.svg',  label: 'Instagram', w: 48 },
  { src: '/logos/whatsapp.svg',   label: 'WhatsApp',  w: 50 },
  { src: '/logos/zoom.svg',       label: 'Zoom',      w: 88 },
  { src: '/logos/google.svg',     label: 'Google',    w: 86 },
  { src: '/logos/chrome.svg',     label: 'Chrome',    w: 48 },
  { src: '/logos/maps.svg',       label: 'Maps',      w: 44 },
  { src: '/logos/meet.svg',       label: 'Meet',      w: 44 },
];

const FEATURES = [
  { emoji: '📅', title: 'Smart Calendar',        desc: 'Todos, birthdays, payday, gym, shopping lists, self-care, appointments & more — with reminders.' },
  { emoji: '🎬', title: 'Streaming Apps',         desc: 'Netflix, Disney+, Prime Video, YouTube — all in a focused in-app window. No tab-switching.' },
  { emoji: '👥', title: 'Social & Messaging',     desc: 'Facebook, WhatsApp, Instagram in one click. Saved contacts with quick-dial.' },
  { emoji: '🎥', title: 'Video Calls',             desc: 'Google Meet and Zoom, ready to launch. One tap to join or start any meeting.' },
  { emoji: '🧘', title: 'Planners & Routines',    desc: 'Date Night, Trip, and Special Event planners with checklists. Self-care & gym tracked.' },
  { emoji: '🌈', title: '19 Beautiful Skins',     desc: '10 neon colors + 9 live animated landscapes — aurora, cherry blossom, melted skittles & more.' },
  { emoji: '🌐', title: 'Built-in Browser',        desc: 'A full web browser inside your dashboard. Google, research, browse without leaving Calendi.' },
  { emoji: '🎮', title: 'Games & More',            desc: 'Chess, Solitaire, Poki, Wordle, Sudoku built right in. Plus notes, calculator, timer & clock.' },
];

const FREE_PERKS  = ['All features — fully unlocked', 'Calendar, planners & contacts', '19 animated skins', 'Streaming, social, games & calls', 'Browser, notes, clock & more', 'Supported by ads'];
const PRO_PERKS   = ['Everything in Free', 'Completely ad-free experience', 'Support CLC Premier Studios', 'Priority access to new features', 'Cancel anytime'];

const CALENDAR_DAYS = [
  { d: 1,  dots: [] },
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
  { emoji: '💪', title: 'Gym',              time: '7:00am', color: '#10B981' },
  { emoji: '📍', title: 'Dr. Appointment',  time: '10:30am', color: '#8B5CF6' },
  { emoji: '💰', title: 'Payday',           time: 'all day', color: '#22D3EE' },
  { emoji: '🌹', title: 'Date Night',       time: '7:00pm',  color: '#EC4899' },
];

const EVENT_CHIPS = [
  { emoji: '📅', label: 'Event',     c: '#8B5CF6' },
  { emoji: '🔔', label: 'Reminder',  c: '#22D3EE' },
  { emoji: '🎂', label: 'Birthday',  c: '#EC4899' },
  { emoji: '💰', label: 'Payday',    c: '#10B981' },
  { emoji: '🛍️', label: 'Shopping',  c: '#F59E0B' },
  { emoji: '💪', label: 'Gym',       c: '#10B981' },
  { emoji: '🧘', label: 'Self-Care', c: '#8B5CF6' },
  { emoji: '🧾', label: 'Bill',      c: '#F59E0B' },
  { emoji: '✈️', label: 'Trip',      c: '#22D3EE' },
  { emoji: '🌹', label: 'Date Night', c: '#EC4899' },
];

const light = '#F0E8FF';
const mid   = 'rgba(240,232,255,0.55)';
const faint = 'rgba(240,232,255,0.28)';
const card  = 'rgba(10,0,21,0.68)';
const cardBorder = 'rgba(255,255,255,0.1)';

function glassCard(extra?: CSSProperties): CSSProperties {
  return {
    background: card,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${cardBorder}`,
    borderRadius: 24,
    ...extra,
  };
}

function PwCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: met ? '#00FF7A' : faint, transition: 'color 0.2s' }}>
      <span style={{ fontSize: '0.7rem' }}>{met ? '✓' : '○'}</span>
      {label}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { setIsPremium } = useStore();
  const isFirstTime = !hasAnyUser();
  const [mode, setMode] = useState<Mode>(isFirstTime ? 'create' : 'sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installable, setInstallable]     = useState(false);
  const [installed, setInstalled]         = useState(false);

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

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    if (mode === 'create') {
      const result = register(username, password);
      if (!result.ok) { setError(result.error || 'Registration failed'); setLoading(false); return; }
    } else {
      const result = login(username, password);
      if (!result.ok) { setError(result.error || 'Login failed'); setLoading(false); return; }
    }
    navigate('/');
  }

  function handleStripeSubscribe() {
    const link = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (link) {
      window.open(`${link}?success_url=${encodeURIComponent(window.location.origin + '?sub=success')}`, '_blank');
    } else {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const marqueeLogos = [...BRAND_LOGOS, ...BRAND_LOGOS];

  const pwChecks = [
    { label: '8+ characters',      met: password.length >= 8 },
    { label: 'Uppercase (A–Z)',     met: /[A-Z]/.test(password) },
    { label: 'Number (0–9)',        met: /[0-9]/.test(password) },
    { label: 'Special char (!@#…)', met: /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password) },
  ];

  const candyGrad = 'linear-gradient(135deg,#FF00CC,#FF7A00,#FFE500,#00FF7A,#00AAFF,#AA00FF)';
  const candyText: CSSProperties = { background: candyGrad, backgroundSize: '300% 100%', animation: 'gradient-shift 5s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  return (
    <div style={{ background: '#0a0015', color: light, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Animated candy background */}
      <LandscapeScene scene="melted-skittles" />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══════ HERO ══════ */}
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 40px', textAlign: 'center' }}>

          {/* CLC Logo — inline SVG, no more broken image */}
          <div className="float-anim fade-in-up" style={{ display: 'inline-block', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 80px rgba(255,0,204,0.35), 0 8px 40px rgba(0,0,0,0.5)', border: '2.5px solid rgba(255,0,204,0.3)' }}>
                <CLCLogo size={200} />
              </div>
              <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '1.5px solid rgba(255,170,0,0.18)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1px solid rgba(0,255,122,0.1)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '0.15s' }}>
            <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: 6, textTransform: 'uppercase', color: '#FF00CC', marginBottom: 10 }}>by CLC Premier Studios</p>
            <h1 style={{ fontSize: 'clamp(3.6rem, 11vw, 7.5rem)', fontWeight: 900, fontFamily: 'monospace', lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 16, ...candyText }}>
              calendi
            </h1>
            <p style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', fontWeight: 800, color: light, marginBottom: 10, letterSpacing: '-0.01em' }}>
              The calendar that does everything.
            </p>
            <p style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)', color: mid, maxWidth: 520, margin: '0 auto 38px', lineHeight: 1.65 }}>
              Schedule, plan, stream, connect, browse & play — all from one beautiful personal dashboard.
            </p>
          </div>

          <div className="fade-in-up" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18, animationDelay: '0.3s' }}>
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg,#FF00CC,#FF7A00)', color: '#fff', boxShadow: '0 8px 32px rgba(255,0,204,0.4)', letterSpacing: 0.3 }}>
              {isFirstTime ? 'Start Free' : 'Sign In'} <ArrowRight size={16} />
            </button>
            <button onClick={handleStripeSubscribe}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 800, background: candyGrad, backgroundSize: '300% 100%', animation: 'gradient-shift 4s linear infinite', color: '#fff', boxShadow: '0 8px 28px rgba(170,0,255,0.35)' }}>
              <Crown size={15} /> Go Premium · $4.99/mo
            </button>
            {installable && !installed && (
              <button onClick={handleInstall}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 26px', borderRadius: 50, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', color: light, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                <Download size={15} /> Install App
              </button>
            )}
            {installed && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 22px', borderRadius: 50, background: 'rgba(0,255,122,0.1)', border: '1.5px solid rgba(0,255,122,0.3)', color: '#00FF7A', fontSize: '0.95rem', fontWeight: 700 }}>
                <CheckCircle size={15} /> Installed
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['🤖','Android — install from Chrome'],['🍎','iOS — Share → Add to Home Screen'],['💻','Desktop — install from browser bar']].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.95rem' }}>{icon}</span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: faint, letterSpacing: 0.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ CALENDAR SHOWCASE ══════ */}
        <section style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 24px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: '#FF00CC', marginBottom: 12 }}>AT THE HEART OF CALENDI</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 900, lineHeight: 1.1 }}>
              A calendar built for <span style={candyText}>real life.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>

            {/* Mini calendar grid */}
            <div style={{ ...glassCard({ padding: '22px' }) }}>
              <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: 4, color: '#FF00CC', textTransform: 'uppercase', marginBottom: 14 }}>MONTHLY VIEW</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: light }}>August 2026</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,0,204,0.15)', border: '1px solid rgba(255,0,204,0.3)', color: '#FF00CC', borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace' }}>today</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.55rem', fontFamily: 'monospace', color: faint, padding: '2px 0' }}>{d}</div>
                ))}
                {/* Aug 2026 starts on Saturday (offset 6) */}
                {Array.from({ length: 6 }, (_,i) => <div key={`e${i}`} />)}
                {CALENDAR_DAYS.map((day) => (
                  <div key={day.d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '2px 0' }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: day.d === 4 ? 800 : 400,
                      color: day.d === 4 ? '#FF00CC' : 'rgba(240,232,255,0.7)',
                      width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', background: day.d === 4 ? 'rgba(255,0,204,0.18)' : 'transparent',
                      boxShadow: day.d === 4 ? '0 0 8px rgba(255,0,204,0.5)' : 'none',
                    }}>{day.d}</span>
                    <div style={{ display: 'flex', gap: 1 }}>
                      {day.dots.slice(0,2).map((c,i) => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: c }} />)}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.62rem', color: faint, marginTop: 8, textAlign: 'center' }}>Color-coded events at a glance</p>
            </div>

            {/* Event chips */}
            <div style={{ ...glassCard({ padding: '22px' }) }}>
              <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: 4, color: '#00AAFF', textTransform: 'uppercase', marginBottom: 14 }}>55+ EVENT TYPES</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: light, marginBottom: 14 }}>Tap a chip, type a title, done.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {EVENT_CHIPS.map((chip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: `${chip.c}18`, border: `1px solid ${chip.c}40`, fontSize: '0.65rem', color: chip.c, fontWeight: 600 }}>
                    <span style={{ fontSize: '0.75rem' }}>{chip.emoji}</span>
                    {chip.label}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.65rem', color: faint }}>
                  +45 more...
                </div>
              </div>
              <p style={{ fontSize: '0.62rem', color: faint, marginTop: 14 }}>Birthdays, payday, chores, self-care, gym & more</p>
            </div>

            {/* Daily events */}
            <div style={{ ...glassCard({ padding: '22px' }) }}>
              <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: 4, color: '#00FF7A', textTransform: 'uppercase', marginBottom: 14 }}>TODAY AT A GLANCE</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: light, marginBottom: 14 }}>Monday, Aug 4</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SAMPLE_EVENTS.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, background: `${ev.color}0D`, border: `1px solid ${ev.color}22` }}>
                    <span style={{ fontSize: '1rem' }}>{ev.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: light, margin: 0 }}>{ev.title}</p>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: ev.color }}>{ev.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 12, background: 'rgba(255,0,204,0.08)', border: '1px solid rgba(255,0,204,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem' }}>🔔</span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(240,232,255,0.5)' }}>Reminder 10 min before events</span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════ LOGO MARQUEE ══════ */}
        <section style={{ padding: '40px 0', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <p style={{ textAlign: 'center', fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: faint, marginBottom: 26 }}>STREAM · CONNECT · BROWSE</p>
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <div className="marquee-track" style={{ display: 'flex', gap: 52, alignItems: 'center', width: 'max-content' }}>
              {marqueeLogos.map((logo, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, opacity: 0.7 }}>
                  <img src={logo.src} alt={logo.label} style={{ width: logo.w, height: 38, objectFit: 'contain', filter: 'brightness(10) saturate(0)', opacity: 0.6 }} />
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: faint, letterSpacing: 1 }}>{logo.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FEATURES ══════ */}
        <section style={{ maxWidth: 1040, margin: '0 auto', padding: '72px 24px 56px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: '#FF7A00', marginBottom: 14 }}>EVERYTHING IN ONE PLACE</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.1 }}>
              Every widget you need.<br />
              <span style={candyText}>Nothing you don't.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ ...glassCard({ padding: '22px 20px' }), transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 40px rgba(255,0,204,0.12)'; el.style.borderColor = 'rgba(255,0,204,0.2)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = cardBorder; }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.emoji}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.2, color: light }}>{f.title}</h3>
                <p style={{ fontSize: '0.78rem', color: mid, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ REAL LOGOS SHOWCASE ══════ */}
        <section style={{ background: 'rgba(0,0,0,0.45)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,0,204,0.6)', marginBottom: 14 }}>YOUR FAVORITE APPS</p>
            <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900, color: light, marginBottom: 44, lineHeight: 1.15 }}>
              All the apps you love,<br />
              <span style={candyText}>in one dashboard.</span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
              {BRAND_LOGOS.map((logo, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 18, padding: '14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, minWidth: 88, transition: 'background 0.2s, transform 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.1)'; el.style.transform = 'scale(1.07)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.transform = ''; }}>
                  <img src={logo.src} alt={logo.label} style={{ width: logo.w, height: 34, objectFit: 'contain', filter: 'brightness(10) saturate(0)', opacity: 0.8 }} />
                  <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: faint, letterSpacing: 1 }}>{logo.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ PRICING ══════ */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '76px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: '#FFE500', marginBottom: 14 }}>SIMPLE PRICING</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, lineHeight: 1.1 }}>
              Free forever.<br />
              <span style={candyText}>Premium for $4.99/mo.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>

            <div style={{ ...glassCard({ padding: 30 }), display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: 3, color: faint, textTransform: 'uppercase', marginBottom: 8 }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: light }}>$0</span>
                <span style={{ fontSize: '0.95rem', color: mid }}>/month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: mid, marginBottom: 24 }}>Supported by ads — keeps Calendi free for everyone</p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
                {FREE_PERKS.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <div style={{ width: 17, height: 17, borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={10} style={{ color: light }} />
                    </div>
                    <span style={{ fontSize: '0.83rem', color: mid, lineHeight: 1.4 }}>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: `2px solid rgba(255,255,255,0.3)`, background: 'transparent', color: light, fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer' }}>
                Start Free
              </button>
            </div>

            <div style={{ ...glassCard({ padding: 30, borderColor: 'rgba(255,0,204,0.3)' }), display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(255,0,204,0.15)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: candyGrad, backgroundSize: '300% 100%', animation: 'gradient-shift 3s linear infinite' }} />
              <div style={{ position: 'absolute', top: 18, right: 18, background: 'linear-gradient(135deg,#FF00CC,#FF7A00)', borderRadius: 20, padding: '3px 11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={9} style={{ color: '#fff' }} />
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fff', letterSpacing: 0.4 }}>POPULAR</span>
              </div>
              <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: 3, color: 'rgba(255,0,204,0.75)', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 }}>Premium</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: light, lineHeight: 1 }}>$4.99</span>
                <span style={{ fontSize: '0.95rem', color: mid }}>/month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: mid, marginBottom: 24 }}>Cancel anytime · billed monthly via Stripe</p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
                {PRO_PERKS.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <div style={{ width: 17, height: 17, borderRadius: 5, background: 'rgba(255,0,204,0.18)', border: '1px solid rgba(255,0,204,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={10} style={{ color: '#FF00CC' }} />
                    </div>
                    <span style={{ fontSize: '0.83rem', color: mid, lineHeight: 1.4 }}>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleStripeSubscribe}
                style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: 'none', background: candyGrad, backgroundSize: '300% 100%', animation: 'gradient-shift 3s linear infinite', color: '#fff', fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 28px rgba(255,0,204,0.3)', marginBottom: 10 }}>
                <Sparkles size={14} /> Subscribe Now
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Shield size={10} style={{ color: faint }} />
                <span style={{ fontSize: '0.62rem', color: faint, fontFamily: 'monospace' }}>Secure · Stripe · Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ AUTH FORM ══════ */}
        <section ref={formRef} style={{ maxWidth: 440, margin: '0 auto', padding: '10px 24px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 14px', overflow: 'hidden', border: '2px solid rgba(255,0,204,0.35)', boxShadow: '0 0 32px rgba(255,0,204,0.25)' }}>
              <CLCLogo size={72} />
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: 5, ...candyText }}>
              {isFirstTime ? 'Create Your Space' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: faint }}>
              {isFirstTime ? 'Your data stays on this device — private, always' : 'Your dashboard is waiting'}
            </p>
          </div>

          {!isFirstTime && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 18, padding: 4, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['sign-in', 'create'] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                  flex: 1, background: mode === m ? 'linear-gradient(135deg,#FF00CC,#FF7A00)' : 'transparent',
                  color: mode === m ? '#fff' : mid,
                  boxShadow: mode === m ? '0 2px 12px rgba(255,0,204,0.3)' : 'none',
                  fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: 12, padding: '9px 0', cursor: 'pointer',
                }}>
                  {m === 'sign-in' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} style={{ ...glassCard({ padding: '26px 26px 22px' }) }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'monospace', color: faint, marginBottom: 6, letterSpacing: 1 }}>USERNAME</label>
              <input style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: '10px 13px', color: light, fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                placeholder="your username" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                autoCapitalize="none" autoComplete={mode === 'create' ? 'new-password' : 'username'} />
            </div>
            <div style={{ marginBottom: mode === 'create' ? 10 : 22 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'monospace', color: faint, marginBottom: 6, letterSpacing: 1 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, padding: '10px 38px 10px 13px', color: light, fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'create' ? 'min 8 chars · uppercase · number · symbol' : 'your password'}
                  value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete={mode === 'create' ? 'new-password' : 'current-password'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: faint, padding: 2 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'create' && password.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 16, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {pwChecks.map(c => <PwCheck key={c.label} label={c.label} met={c.met} />)}
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 14, padding: '7px 11px', borderRadius: 10, background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.25)', color: '#FF6B6B', fontSize: '0.78rem' }}>{error}</div>
            )}
            <button type="submit" disabled={loading || !username || !password} style={{
              width: '100%', padding: '12px 0', borderRadius: 13, border: 'none',
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              background: loading || !username || !password ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#FF00CC,#FF7A00)',
              color: loading || !username || !password ? faint : '#fff',
              fontSize: '0.92rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading || !username || !password ? 'none' : '0 6px 24px rgba(255,0,204,0.3)',
            }}>
              {loading ? 'Unlocking...' : <>{mode === 'create' ? 'Create Account' : 'Sign In'} <ArrowRight size={14} /></>}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.66rem', marginTop: 13, color: faint, fontFamily: 'monospace' }}>
            🔒 Data stored locally · Never sent anywhere
          </p>
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '34px 24px 50px', textAlign: 'center', background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 14px', border: '1.5px solid rgba(255,0,204,0.3)', boxShadow: '0 0 32px rgba(255,0,204,0.2), 0 4px 18px rgba(0,0,0,0.4)' }}>
            <CLCLogo size={80} />
          </div>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 3, color: light }}>calendi</p>
          <p style={{ fontSize: '0.72rem', color: mid, marginBottom: 7 }}>by Crystal Lynn Creates · CLC Premier Studios</p>
          <a href="mailto:crystallynncreates@gmail.com" style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: faint, letterSpacing: 0.8, textDecoration: 'none' }}>crystallynncreates@gmail.com</a>
          <p style={{ fontSize: '0.62rem', color: 'rgba(240,232,255,0.15)', marginTop: 16 }}>© 2026 CLC Premier Studios · All rights reserved</p>
        </footer>

      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Download, CheckCircle, Sparkles, Star, Crown, Shield, Check, Zap } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';

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
  { emoji: '📅', title: 'Smart Calendar', bg: 'linear-gradient(135deg,#F9E8F0,#FEF3F8)', desc: 'Quick-add todos, birthdays, payday, gym, shopping lists, self-care, appointments & more — with reminders on Apple Watch & Wear OS.' },
  { emoji: '🎬', title: 'Streaming Apps',  bg: 'linear-gradient(135deg,#FDF3E0,#FEF7ED)', desc: 'Netflix, Disney+, Prime Video, YouTube — all in a focused in-app window. No more switching tabs.' },
  { emoji: '👥', title: 'Social & Messaging', bg: 'linear-gradient(135deg,#E0F0F8,#EBF5FB)', desc: 'Facebook, WhatsApp, Instagram in one click. Saved contacts with quick-dial straight to your phone.' },
  { emoji: '🎥', title: 'Video Calls', bg: 'linear-gradient(135deg,#EEE8F8,#F5F0FB)', desc: 'Google Meet and Zoom, ready to launch from your dashboard. One tap to join or start any meeting.' },
  { emoji: '🧘', title: 'Planners & Routines', bg: 'linear-gradient(135deg,#E0F5F3,#E8F8F6)', desc: 'Date Night, Trip, and Special Event planners with checklists. Self-care, chores, gym — tracked beautifully.' },
  { emoji: '🌅', title: '18 Beautiful Skins', bg: 'linear-gradient(135deg,#FBF0DA,#FDF5E6)', desc: '10 neon color themes + 8 live animated landscapes: aurora, cherry blossom, winter snow, tropical beach & more. Holiday skins auto-apply.' },
  { emoji: '🌐', title: 'Built-in Browser', bg: 'linear-gradient(135deg,#E5F3E8,#EBF6EE)', desc: 'A full web browser right inside your dashboard. Google, research, browse — without ever leaving your workspace.' },
  { emoji: '📝', title: 'Notes & Widgets', bg: 'linear-gradient(135deg,#FBE8E6,#FCEAE8)', desc: 'Quick notes, a calculator, countdown timer, clock, photo slideshow — snap any widget into your layout.' },
];

const FREE_PERKS  = ['All features — fully unlocked', 'Calendar, planners & contacts', '18 animated skins', 'Streaming, social & video apps', 'Browser, notes, clock & more', 'Supported by ads'];
const PRO_PERKS   = ['Everything in Free', 'Completely ad-free experience', 'Support CLC Premier Studios', 'Priority access to new features', 'Cancel anytime'];

function Spark({ style }: { style: React.CSSProperties }) {
  return <span className="sparkle-anim" style={{ position: 'absolute', fontSize: '1.3rem', pointerEvents: 'none', zIndex: 0, color: '#C9A84C', ...style }}>✦</span>;
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

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    if (mode === 'create') {
      const result = register(username, password);
      if (!result.ok) { setError(result.error || 'registration failed'); setLoading(false); return; }
    } else {
      const result = login(username, password);
      if (!result.ok) { setError(result.error || 'login failed'); setLoading(false); return; }
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
  const cream = '#EDE8DC';
  const dark  = '#1C1A16';
  const mid   = 'rgba(28,26,22,0.55)';
  const faint = 'rgba(28,26,22,0.28)';

  return (
    <div style={{ background: cream, color: dark, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="orb-drift"   style={{ position: 'absolute', top: '-20%', left: '-15%',  width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,160,184,0.18) 0%,transparent 60%)', filter: 'blur(80px)' }} />
        <div className="orb-drift-2" style={{ position: 'absolute', top: '20%',  right: '-18%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(137,204,197,0.13) 0%,transparent 60%)', filter: 'blur(80px)' }} />
        <div className="orb-drift-3" style={{ position: 'absolute', bottom: '-10%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.11) 0%,transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══════ HERO ══════ */}
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px 48px', textAlign: 'center', position: 'relative' }}>
          <Spark style={{ top: 36,  left: '6%',   color: '#E8B0C5', animationDelay: '0s',    animationDuration: '3.6s' }} />
          <Spark style={{ top: 72,  right: '9%',  color: '#C9A84C', animationDelay: '1s',    animationDuration: '4.2s' }} />
          <Spark style={{ top: 200, left: '3%',   color: '#89CCC5', animationDelay: '2s',    animationDuration: '3.1s' }} />
          <Spark style={{ top: 150, right: '4%',  color: '#D4A0B8', animationDelay: '0.6s',  animationDuration: '4.6s' }} />
          <Spark style={{ top: 310, left: '11%',  color: '#C9A84C', animationDelay: '1.4s',  animationDuration: '3.8s' }} />
          <Spark style={{ top: 280, right: '13%', color: '#89CCC5', animationDelay: '0.9s',  animationDuration: '4.3s' }} />

          {/* CLC Logo — hero */}
          <div className="float-anim fade-in-up" style={{ display: 'inline-block', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 56px rgba(212,160,184,0.32), 0 2px 12px rgba(0,0,0,0.07)', border: '2.5px solid rgba(201,168,76,0.28)', background: cream }}>
                <img src="/clc-logo.svg" alt="CLC Premier Studios" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {/* Outer glow ring */}
              <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.18)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '0.15s' }}>
            <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: 6, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 10 }}>by CLC Premier Studios</p>
            <h1 style={{
              fontSize: 'clamp(3.6rem, 11vw, 7.5rem)', fontWeight: 900, fontFamily: 'monospace',
              lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 20,
              background: 'linear-gradient(135deg,#7C3AED 0%,#D4A0B8 28%,#C9A84C 56%,#89CCC5 82%,#7C3AED 100%)',
              backgroundSize: '200% 100%', animation: 'gradient-shift 6s ease infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>calendi</h1>
            <p style={{ fontSize: 'clamp(1rem, 2.8vw, 1.35rem)', color: mid, maxWidth: 520, margin: '0 auto 38px', lineHeight: 1.65 }}>
              Your beautiful, private, all-in-one dashboard. Stream. Plan. Connect. Browse — all in one place.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="fade-in-up" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18, animationDelay: '0.3s' }}>
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 800, background: dark, color: cream, boxShadow: '0 8px 28px rgba(28,26,22,0.18)', letterSpacing: 0.3 }}>
              {isFirstTime ? 'Start Free' : 'Sign In'} <ArrowRight size={16} />
            </button>
            <button onClick={handleStripeSubscribe}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg,#E8B0C5,#C9A84C,#89CCC5)', backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite', color: '#fff', boxShadow: '0 8px 28px rgba(212,160,184,0.36)' }}>
              <Crown size={15} /> Go Premium · $4.99/mo
            </button>
            {installable && !installed && (
              <button onClick={handleInstall}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 26px', borderRadius: 50, background: 'rgba(28,26,22,0.07)', border: '1.5px solid rgba(28,26,22,0.14)', color: dark, fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                <Download size={15} /> Install App
              </button>
            )}
            {installed && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 22px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.28)', color: '#059669', fontSize: '0.95rem', fontWeight: 700 }}>
                <CheckCircle size={15} /> Installed
              </div>
            )}
          </div>

          {/* Platform hints */}
          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['🤖','Android — install from Chrome'],['🍎','iOS — Share → Add to Home Screen'],['💻','Desktop — install from browser bar']].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.95rem' }}>{icon}</span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: faint, letterSpacing: 0.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ LOGO MARQUEE ══════ */}
        <section style={{ padding: '44px 0', background: 'rgba(28,26,22,0.04)', borderTop: '1px solid rgba(28,26,22,0.08)', borderBottom: '1px solid rgba(28,26,22,0.08)', overflow: 'hidden' }}>
          <p style={{ textAlign: 'center', fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: faint, marginBottom: 26 }}>STREAM · CONNECT · BROWSE</p>
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <div className="marquee-track" style={{ display: 'flex', gap: 52, alignItems: 'center', width: 'max-content' }}>
              {marqueeLogos.map((logo, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, opacity: 0.72 }}>
                  <img src={logo.src} alt={logo.label} style={{ width: logo.w, height: 38, objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: faint, letterSpacing: 1 }}>{logo.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FEATURES ══════ */}
        <section style={{ maxWidth: 1040, margin: '0 auto', padding: '80px 24px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 14 }}>EVERYTHING IN ONE PLACE</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Every widget you need.<br />
              <span style={{ background: 'linear-gradient(135deg,#D4A0B8,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nothing you don't.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: f.bg, border: '1px solid rgba(28,26,22,0.07)', borderRadius: 24, padding: '26px 22px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 36px rgba(28,26,22,0.1)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.emoji}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 9, lineHeight: 1.2 }}>{f.title}</h3>
                <p style={{ fontSize: '0.8rem', color: mid, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ REAL LOGOS SHOWCASE ══════ */}
        <section style={{ background: dark, padding: '68px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(212,160,184,0.65)', marginBottom: 14 }}>YOUR FAVORITE APPS</p>
            <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900, color: '#E2E8F0', marginBottom: 44, lineHeight: 1.15 }}>
              All the apps you love,<br />
              <span style={{ background: 'linear-gradient(135deg,#E8B0C5,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in one dashboard.</span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
              {BRAND_LOGOS.map((logo, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, minWidth: 88, transition: 'background 0.2s, transform 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.13)'; el.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.07)'; el.style.transform = 'none'; }}>
                  <img src={logo.src} alt={logo.label} style={{ width: logo.w, height: 34, objectFit: 'contain', filter: 'brightness(1.08)' }} />
                  <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: 'rgba(226,232,240,0.38)', letterSpacing: 1 }}>{logo.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ PRICING ══════ */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: 5, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 14 }}>SIMPLE PRICING</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, lineHeight: 1.1 }}>
              Free forever.<br />
              <span style={{ background: 'linear-gradient(135deg,#D4A0B8,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Premium for $4.99/mo.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>

            {/* FREE card */}
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(28,26,22,0.1)', borderRadius: 28, padding: 30, display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: 3, color: faint, textTransform: 'uppercase', marginBottom: 8 }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>$0</span>
                <span style={{ fontSize: '0.95rem', color: mid }}>/month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: mid, marginBottom: 24 }}>Supported by ads — keep calendi free for everyone</p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
                {FREE_PERKS.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <div style={{ width: 17, height: 17, borderRadius: 5, background: 'rgba(28,26,22,0.08)', border: '1px solid rgba(28,26,22,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={10} />
                    </div>
                    <span style={{ fontSize: '0.83rem', color: mid, lineHeight: 1.4 }}>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: `2px solid ${dark}`, background: 'transparent', color: dark, fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer' }}>
                Start Free
              </button>
            </div>

            {/* PREMIUM card */}
            <div style={{ background: dark, border: '1.5px solid rgba(201,168,76,0.3)', borderRadius: 28, padding: 30, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 56px rgba(28,26,22,0.18)' }}>
              {/* Rainbow top bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#E8B0C5,#C9A84C,#89CCC5)', backgroundSize: '200% 100%', animation: 'gradient-shift 3s linear infinite' }} />
              {/* Badge */}
              <div style={{ position: 'absolute', top: 18, right: 18, background: 'linear-gradient(135deg,#C9A84C,#E8C870)', borderRadius: 20, padding: '3px 11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={9} style={{ color: '#1C1A16' }} />
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1C1A16', letterSpacing: 0.4 }}>MOST POPULAR</span>
              </div>
              <p style={{ fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: 3, color: 'rgba(201,168,76,0.75)', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 }}>Premium</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#E2E8F0', lineHeight: 1 }}>$4.99</span>
                <span style={{ fontSize: '0.95rem', color: 'rgba(226,232,240,0.4)' }}>/month</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(226,232,240,0.38)', marginBottom: 24 }}>Cancel anytime · billed monthly via Stripe</p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
                {PRO_PERKS.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <div style={{ width: 17, height: 17, borderRadius: 5, background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Check size={10} style={{ color: '#C9A84C' }} />
                    </div>
                    <span style={{ fontSize: '0.83rem', color: 'rgba(226,232,240,0.7)', lineHeight: 1.4 }}>{p}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleStripeSubscribe}
                style={{ width: '100%', padding: '13px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#E8B0C5,#C9A84C,#89CCC5)', backgroundSize: '200% 100%', animation: 'gradient-shift 3s linear infinite', color: '#fff', fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 28px rgba(201,168,76,0.28)', marginBottom: 10 }}>
                <Sparkles size={14} /> Subscribe Now
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Shield size={10} style={{ color: 'rgba(226,232,240,0.22)' }} />
                <span style={{ fontSize: '0.62rem', color: 'rgba(226,232,240,0.22)', fontFamily: 'monospace' }}>Secure · Stripe · Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ AUTH FORM ══════ */}
        <section ref={formRef} style={{ maxWidth: 440, margin: '0 auto', padding: '10px 24px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', margin: '0 auto 14px', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.28)', boxShadow: '0 4px 22px rgba(212,160,184,0.22)', background: cream }}>
              <img src="/clc-logo.svg" alt="CLC Premier Studios" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, background: 'linear-gradient(135deg,#D4A0B8,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 5 }}>
              {isFirstTime ? 'Create Your Space' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: faint }}>
              {isFirstTime ? 'Your data stays on this device — private, always' : 'Your dashboard is waiting'}
            </p>
          </div>

          {!isFirstTime && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 18, padding: 4, borderRadius: 16, background: 'rgba(28,26,22,0.06)' }}>
              {(['sign-in', 'create'] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                  flex: 1, background: mode === m ? dark : 'transparent', color: mode === m ? cream : mid,
                  boxShadow: mode === m ? '0 2px 10px rgba(28,26,22,0.18)' : 'none',
                  fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: 12, padding: '9px 0', cursor: 'pointer',
                }}>
                  {m === 'sign-in' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(28,26,22,0.1)', borderRadius: 24, padding: '26px 26px 22px', boxShadow: '0 8px 36px rgba(28,26,22,0.07)' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'monospace', color: faint, marginBottom: 6, letterSpacing: 1 }}>USERNAME</label>
              <input style={{ background: 'rgba(28,26,22,0.05)', border: '1.5px solid rgba(28,26,22,0.12)', borderRadius: 12, padding: '10px 13px', color: dark, fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                placeholder="your username" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                autoCapitalize="none" autoComplete={mode === 'create' ? 'new-password' : 'username'} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: 'monospace', color: faint, marginBottom: 6, letterSpacing: 1 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input style={{ background: 'rgba(28,26,22,0.05)', border: '1.5px solid rgba(28,26,22,0.12)', borderRadius: 12, padding: '10px 38px 10px 13px', color: dark, fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  type={showPw ? 'text' : 'password'} placeholder={mode === 'create' ? 'min 4 characters' : 'your password'}
                  value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete={mode === 'create' ? 'new-password' : 'current-password'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: faint, padding: 2 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ marginBottom: 14, padding: '7px 11px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626', fontSize: '0.78rem' }}>{error}</div>
            )}
            <button type="submit" disabled={loading || !username || !password} style={{
              width: '100%', padding: '12px 0', borderRadius: 13, border: 'none',
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              background: loading || !username || !password ? 'rgba(28,26,22,0.18)' : dark,
              color: cream, fontSize: '0.92rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? 'Unlocking...' : <>{mode === 'create' ? 'Create Account' : 'Sign In'} <ArrowRight size={14} /></>}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.66rem', marginTop: 13, color: faint, fontFamily: 'monospace' }}>
            🔒 Data stored locally · Never sent anywhere
          </p>
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer style={{ borderTop: '1px solid rgba(28,26,22,0.1)', padding: '34px 24px 50px', textAlign: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 14px', border: '1.5px solid rgba(201,168,76,0.22)', boxShadow: '0 4px 18px rgba(212,160,184,0.18)' }}>
            <img src="/clc-logo.svg" alt="CLC Premier Studios" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 3 }}>calendi</p>
          <p style={{ fontSize: '0.72rem', color: mid, marginBottom: 7 }}>by Crystal Lynn Creates · CLC Premier Studios</p>
          <a href="mailto:crystallynncreates@gmail.com" style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: faint, letterSpacing: 0.8, textDecoration: 'none' }}>crystallynncreates@gmail.com</a>
          <p style={{ fontSize: '0.62rem', color: 'rgba(28,26,22,0.18)', marginTop: 16 }}>© 2026 CLC Premier Studios · All rights reserved</p>
        </footer>

      </div>
    </div>
  );
}

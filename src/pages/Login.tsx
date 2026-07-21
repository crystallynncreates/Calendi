import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Sparkles, Youtube, Globe, FileText, Video, Tv, Palette, Lock, Clock, Download, CheckCircle } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';

type Mode = 'sign-in' | 'create';

/* ─── Mini Widget Mockups ──────────────────────────────────────────── */

function MockDashboard() {
  return (
    <div style={{
      background: '#06060F',
      borderRadius: 20,
      padding: 14,
      width: '100%',
      aspectRatio: '16/10',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 10,
      boxSizing: 'border-box',
      border: '1px solid rgba(139,92,246,0.2)',
      boxShadow: '0 0 60px rgba(139,92,246,0.15)',
    }}>
      {/* Clock card */}
      <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: '#C4B5FD', letterSpacing: 2 }}>10:42</div>
        <div style={{ fontSize: 8, color: 'rgba(196,181,253,0.4)', letterSpacing: 3, textTransform: 'uppercase' }}>wednesday</div>
        <div style={{ width: 30, height: 2, background: 'linear-gradient(90deg, #8B5CF6, #22D3EE)', borderRadius: 1, marginTop: 4 }} />
      </div>
      {/* YouTube card */}
      <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 18, height: 18, background: '#EF4444', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderLeft: '6px solid white', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', marginLeft: 2 }} />
          </div>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(239,68,68,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>youtube</span>
        </div>
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: '14px solid rgba(239,68,68,0.6)', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', marginLeft: 3 }} />
        </div>
      </div>
      {/* Notes card */}
      <div style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.18)', borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(34,211,238,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>notes</span>
        </div>
        {[100, 80, 60].map((w, i) => (
          <div key={i} style={{ height: 4, width: `${w}%`, background: 'rgba(34,211,238,0.2)', borderRadius: 2 }} />
        ))}
        <div style={{ height: 4, width: '35%', background: 'rgba(34,211,238,0.12)', borderRadius: 2 }} />
        <div style={{ marginTop: 'auto', height: 16, background: 'rgba(34,211,238,0.06)', borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 6px' }}>
          <div style={{ height: 3, width: '70%', background: 'rgba(34,211,238,0.25)', borderRadius: 1 }} />
          <div style={{ height: 12, width: 1, background: 'rgba(34,211,238,0.6)', marginLeft: 2, animation: 'none' }} />
        </div>
      </div>
      {/* Apps card */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 10 }}>
        <div style={{ fontSize: 7, fontFamily: 'monospace', color: 'rgba(226,232,240,0.25)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 7 }}>apps</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {[
            { emoji: '🎬', color: 'rgba(229,9,20,0.35)' },
            { emoji: '✨', color: 'rgba(17,60,207,0.35)' },
            { emoji: '📦', color: 'rgba(0,168,225,0.35)' },
            { emoji: '👥', color: 'rgba(24,119,242,0.35)' },
          ].map((a, i) => (
            <div key={i} style={{ background: a.color, borderRadius: 8, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{a.emoji}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockSkins() {
  const skins = [
    { bg: 'linear-gradient(135deg, #030b14, #0d2a1e, #1a0a3e)', label: 'aurora' },
    { bg: 'linear-gradient(135deg, #1a0a2e, #8b1a4a, #e8752e)', label: 'sunset' },
    { bg: 'linear-gradient(135deg, #01020a, #02050f)', label: 'night sky' },
    { bg: 'linear-gradient(135deg, #000d1a, #002040)', label: 'deep ocean' },
    { bg: 'linear-gradient(135deg, #050010, #180030)', label: 'galaxy' },
    { bg: 'linear-gradient(135deg, #050e08, #0c2812)', label: 'forest' },
    { bg: 'linear-gradient(135deg, #3d2810, #f0c870)', label: 'desert' },
    { bg: 'linear-gradient(135deg, #060810, #1a2c4a)', label: 'mountain' },
  ];
  const colors = ['#8B5CF6', '#22D3EE', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#F43F5E', '#EAB308', '#6366F1'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {skins.map((s, i) => (
          <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ background: s.bg, height: 44 }} />
            <div style={{ background: '#0D0D1A', padding: '4px 6px', fontSize: 8, fontFamily: 'monospace', color: 'rgba(226,232,240,0.35)', textAlign: 'center' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {colors.map((c, i) => (
          <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: c, boxShadow: `0 2px 8px ${c}60` }} />
        ))}
      </div>
    </div>
  );
}

function MockBrowser() {
  return (
    <div style={{ background: '#06060F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ flex: 1, height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 20, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(34,211,238,0.4)' }} />
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(226,232,240,0.25)' }}>google.com</div>
        </div>
        <div style={{ fontSize: 14 }}>🔒</div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { emoji: '🔍', label: 'Google' },
            { emoji: '📺', label: 'YouTube' },
            { emoji: '🗺️', label: 'Maps' },
            { emoji: '🌐', label: 'Wikipedia' },
            { emoji: '🌤️', label: 'Weather' },
            { emoji: '🌍', label: 'Translate' },
          ].map((l, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, marginBottom: 3 }}>{l.emoji}</div>
              <div style={{ fontSize: 7, fontFamily: 'monospace', color: 'rgba(226,232,240,0.3)' }}>{l.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Feature data ─────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: <Tv size={20} />,
    color: '#EF4444',
    title: 'streaming & social apps',
    desc: 'Launch Netflix, Disney+, Prime Video, Facebook, WhatsApp, Instagram, and more — each opens in a focused in-app window so you never leave Calendi.',
    mockup: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { emoji: '🎬', label: 'Netflix', color: 'rgba(229,9,20,0.15)', border: 'rgba(229,9,20,0.3)' },
          { emoji: '✨', label: 'Disney+', color: 'rgba(17,60,207,0.15)', border: 'rgba(17,60,207,0.3)' },
          { emoji: '📦', label: 'Prime', color: 'rgba(0,168,225,0.15)', border: 'rgba(0,168,225,0.3)' },
          { emoji: '👥', label: 'Facebook', color: 'rgba(24,119,242,0.15)', border: 'rgba(24,119,242,0.3)' },
          { emoji: '📱', label: 'WhatsApp', color: 'rgba(37,211,102,0.15)', border: 'rgba(37,211,102,0.3)' },
          { emoji: '📸', label: 'Instagram', color: 'rgba(193,53,132,0.15)', border: 'rgba(193,53,132,0.3)' },
          { emoji: '💬', label: 'Messages', color: 'rgba(52,168,83,0.15)', border: 'rgba(52,168,83,0.3)' },
          { emoji: '📞', label: 'Phone', color: 'rgba(52,168,83,0.15)', border: 'rgba(52,168,83,0.3)' },
        ].map((a, i) => (
          <div key={i} style={{ background: a.color, border: `1px solid ${a.border}`, borderRadius: 12, padding: '10px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{a.emoji}</div>
            <div style={{ fontSize: 7, fontFamily: 'monospace', color: 'rgba(226,232,240,0.5)' }}>{a.label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: <Youtube size={20} />,
    color: '#EF4444',
    title: 'youtube — in the widget',
    desc: 'Paste any YouTube link or search directly. Videos play right inside your dashboard — no new tab, no interruptions.',
    mockup: (
      <div style={{ background: '#06060F', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ background: 'rgba(239,68,68,0.06)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
          <div style={{ width: 20, height: 20, background: '#EF4444', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderLeft: '7px solid white', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', marginLeft: 2 }} />
          </div>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(226,232,240,0.5)', letterSpacing: 2 }}>YOUTUBE</span>
        </div>
        <div style={{ padding: 10 }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 10, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{ width: 0, height: 0, borderLeft: '22px solid rgba(239,68,68,0.8)', borderTop: '14px solid transparent', borderBottom: '14px solid transparent', marginLeft: 5 }} />
          </div>
          <div style={{ height: 22, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
            <div style={{ flex: 1, fontSize: 8, fontFamily: 'monospace', color: 'rgba(226,232,240,0.2)' }}>paste a youtube link...</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Globe size={20} />,
    color: '#22D3EE',
    title: 'built-in browser',
    desc: 'A full web browser lives right in your dashboard. Google, look things up, navigate anywhere — without leaving your workspace.',
    mockup: <MockBrowser />,
  },
  {
    icon: <Video size={20} />,
    color: '#8B5CF6',
    title: 'google meet & zoom',
    desc: 'Start or join video calls from your dashboard. One click to launch Google Meet or Zoom in a dedicated app window.',
    mockup: (
      <div style={{ background: '#06060F', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: '6px 10px', background: 'rgba(139,92,246,0.2)', borderRadius: 20, textAlign: 'center', fontSize: 9, fontFamily: 'monospace', color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.3)' }}>google meet</div>
          <div style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, textAlign: 'center', fontSize: 9, fontFamily: 'monospace', color: 'rgba(226,232,240,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>zoom</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🎥</div>
            <div style={{ fontSize: 7, fontFamily: 'monospace', color: 'rgba(196,181,253,0.6)' }}>new meeting</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🔗</div>
            <div style={{ fontSize: 7, fontFamily: 'monospace', color: 'rgba(226,232,240,0.3)' }}>join meeting</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <FileText size={20} />,
    color: '#22D3EE',
    title: 'notes — always there',
    desc: 'Quick notes that auto-save as you type. Organize multiple notes in a sidebar. Word count, instant access, stored locally on your device.',
    mockup: (
      <div style={{ background: '#06060F', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, height: 110 }}>
          <div style={{ width: 70, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['today', 'ideas', 'shopping'].map((n, i) => (
              <div key={i} style={{ padding: '5px 7px', background: i === 0 ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 7, fontSize: 8, fontFamily: 'monospace', color: i === 0 ? '#22D3EE' : 'rgba(226,232,240,0.3)' }}>{n}</div>
            ))}
            <div style={{ marginTop: 'auto', padding: '4px 7px', background: 'rgba(34,211,238,0.05)', border: '1px dashed rgba(34,211,238,0.2)', borderRadius: 7, fontSize: 8, fontFamily: 'monospace', color: 'rgba(34,211,238,0.35)', textAlign: 'center' }}>+ new</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[100, 90, 75, 60, 45].map((w, i) => (
              <div key={i} style={{ height: 4, width: `${w}%`, background: 'rgba(34,211,238,0.15)', borderRadius: 2 }} />
            ))}
            <div style={{ height: 4, width: '30%', background: 'rgba(34,211,238,0.08)', borderRadius: 2, marginTop: 2 }} />
            <div style={{ marginTop: 'auto', fontSize: 8, fontFamily: 'monospace', color: 'rgba(34,211,238,0.3)' }}>auto-saved · 47 words</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Palette size={20} />,
    color: '#EC4899',
    title: '18 skins — color & landscape',
    desc: '10 neon color themes + 8 live animated landscape scenes: aurora borealis, sunset mountains, galaxy, deep ocean, and more. Your dashboard, your vibe.',
    mockup: <MockSkins />,
  },
  {
    icon: <Clock size={20} />,
    color: '#8B5CF6',
    title: 'clock, timer & calculator',
    desc: 'A live clock with the current date, a countdown timer with a loud alarm, and a full calculator — all as snappable widgets.',
    mockup: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: '#C4B5FD', letterSpacing: 1 }}>10:42</div>
          <div style={{ fontSize: 7, color: 'rgba(196,181,253,0.4)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 2 }}>Wed · Jul</div>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: '#FCA5A5', letterSpacing: 1 }}>05:00</div>
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 14, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 4, fontSize: 7, fontFamily: 'monospace', color: '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
            <div style={{ width: 20, height: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, fontSize: 7, fontFamily: 'monospace', color: 'rgba(226,232,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↺</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(226,232,240,0.4)', textAlign: 'right', marginBottom: 4 }}>42</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {['7','8','9','4','5','6'].map((n, i) => (
              <div key={i} style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontFamily: 'monospace', color: 'rgba(226,232,240,0.4)' }}>{n}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Lock size={20} />,
    color: '#10B981',
    title: 'private by default',
    desc: 'No accounts, no cloud, no tracking. Your data lives on your device only. The app is invisible to search engines — only those you invite can find it.',
    mockup: (
      <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { icon: '🔒', label: 'stored on device', desc: 'no cloud, no servers' },
          { icon: '🕵️', label: 'hidden from search', desc: 'noindex + nofollow tags' },
          { icon: '🚫', label: 'no tracking', desc: 'zero analytics or ads' },
          { icon: '🔑', label: 'password protected', desc: 'your own private login' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(52,211,153,0.8)', letterSpacing: 1, textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ fontSize: 8, color: 'rgba(226,232,240,0.3)', marginTop: 1 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

/* ─── Main Component ───────────────────────────────────────────────── */

export default function Login() {
  const navigate = useNavigate();
  const isFirstTime = !hasAnyUser();
  const [mode, setMode] = useState<Mode>(isFirstTime ? 'create' : 'sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
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
    setInstallPrompt(null);
    setInstallable(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (mode === 'create') {
      const result = register(username, password);
      if (!result.ok) { setError(result.error || 'registration failed'); setLoading(false); return; }
    } else {
      const result = login(username, password);
      if (!result.ok) { setError(result.error || 'login failed'); setLoading(false); return; }
    }
    navigate('/');
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div style={{ background: '#06060F', color: '#E2E8F0', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Ambient background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-drift" style={{ position: 'absolute', top: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-drift-2" style={{ position: 'absolute', top: '30%', right: '-15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-drift-3" style={{ position: 'absolute', bottom: '-10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 9999, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', marginBottom: 28 }}>
            <Sparkles size={12} style={{ color: '#8B5CF6' }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(196,181,253,0.8)', letterSpacing: 2, textTransform: 'uppercase' }}>your personal dashboard</span>
          </div>

          {/* Wordmark */}
          <h1 style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', fontWeight: 900, fontFamily: 'monospace', lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: 24, background: 'linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 40%, #22D3EE 70%, #67E8F9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            calendi
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: 'rgba(226,232,240,0.55)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 400 }}>
            Everything you need — streaming, notes, meetings, browsing — in one beautiful, private dashboard that belongs only to you.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 70 }}>
            <button onClick={scrollToForm} className="btn-pill" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', padding: '14px 32px', fontSize: 15 }}>
              {isFirstTime ? 'get started — free' : 'sign in'} <ArrowRight size={16} />
            </button>

            {installable && !installed && (
              <button onClick={handleInstall} className="btn-pill" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', padding: '14px 28px', fontSize: 15, gap: 8 }}>
                <Download size={15} /> install app
              </button>
            )}

            {installed && (
              <div className="btn-pill" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', padding: '14px 24px', fontSize: 14, gap: 8, cursor: 'default' }}>
                <CheckCircle size={15} /> app installed
              </div>
            )}

            {!installable && !installed && (
              <button onClick={scrollToForm} className="btn-ghost btn-pill" style={{ padding: '14px 28px', fontSize: 15, borderColor: 'rgba(255,255,255,0.12)' }}>
                see what it can do ↓
              </button>
            )}
          </div>

          {/* Platform install hints */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 70, marginTop: -56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>🤖</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(226,232,240,0.25)', letterSpacing: 1 }}>android — install from chrome</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>🍎</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(226,232,240,0.25)', letterSpacing: 1 }}>ios — share → add to home screen</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>💻</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(226,232,240,0.25)', letterSpacing: 1 }}>desktop — install from browser bar</span>
            </div>
          </div>

          {/* Hero dashboard mockup */}
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <MockDashboard />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', marginBottom: 12 }}>everything in one place</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#E2E8F0' }}>
              every widget you need.<br />
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>nothing you don't.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 28,
                alignItems: 'center',
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
              }}>
                <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 9999, background: `${f.color}15`, border: `1px solid ${f.color}30`, marginBottom: 14 }}>
                    <span style={{ color: f.color }}>{f.icon}</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: f.color, letterSpacing: 2, textTransform: 'uppercase' }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: 15, color: 'rgba(226,232,240,0.55)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
                <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  {f.mockup}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SIGN IN / CREATE ACCOUNT ── */}
        <section ref={formRef} style={{ maxWidth: 420, margin: '0 auto', padding: '60px 24px 100px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}>
              <Lock size={26} style={{ color: '#8B5CF6' }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
              {isFirstTime ? 'create your space' : 'welcome back'}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.3)' }}>
              {isFirstTime ? 'your data stays on this device — private, always' : 'your dashboard is waiting'}
            </p>
          </div>

          {!isFirstTime && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 3, borderRadius: 14, background: 'rgba(255,255,255,0.03)' }}>
              {(['sign-in', 'create'] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }} className="btn-pill" style={{
                  flex: 1, background: mode === m ? '#8B5CF6' : 'transparent', color: mode === m ? '#fff' : 'rgba(226,232,240,0.35)',
                  boxShadow: mode === m ? '0 2px 12px rgba(139,92,246,0.45)' : 'none', fontSize: 12, border: 'none', padding: '9px 0',
                }}>
                  {m === 'sign-in' ? 'sign in' : 'create account'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="glass anim-scale-in" style={{ borderRadius: 24, padding: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', color: 'rgba(226,232,240,0.4)', marginBottom: 6, letterSpacing: 1 }}>username</label>
              <input className="input-dark" placeholder="your username" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} autoCapitalize="none" autoComplete={mode === 'create' ? 'new-password' : 'username'} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', color: 'rgba(226,232,240,0.4)', marginBottom: 6, letterSpacing: 1 }}>password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-dark" style={{ paddingRight: 40 }} type={showPw ? 'text' : 'password'} placeholder={mode === 'create' ? 'min 4 characters' : 'your password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.3)', padding: 2 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 12 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !username || !password} className="btn-pill" style={{
              width: '100%', justifyContent: 'center', background: loading || !username || !password ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff',
              boxShadow: '0 6px 24px rgba(139,92,246,0.4)', opacity: loading || !username || !password ? 0.6 : 1, fontSize: 14, padding: '13px 0',
            }}>
              {loading ? <span style={{ fontFamily: 'monospace' }}>unlocking...</span> : <><span style={{ fontFamily: 'monospace' }}>{mode === 'create' ? 'create account' : 'sign in'}</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 11, marginTop: 16, color: 'rgba(226,232,240,0.18)', fontFamily: 'monospace' }}>
            🔒 data stored locally · never sent anywhere
          </p>
        </section>

      </div>
    </div>
  );
}

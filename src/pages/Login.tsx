import {
  useState, useEffect, useRef,
  type CSSProperties, type FormEvent, type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Download, ChevronDown } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';

type Mode = 'sign-in' | 'create';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const LAV  = '#7C3AED';
const LAV2 = '#8B5CF6';
const LAV3 = '#C4B5FD';
const LAV4 = '#EDE9FE';
const W    = '#FFFFFF';
const B    = '#000000';
const GRY  = '#6B7280';
const DRK  = '#06060F';
const OFF  = '#F5F5F5';

// ─── Paint-splatter CLC logo ──────────────────────────────────────────────────
function CLCPaintLogo({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="400" height="400" fill="white" rx="12"/>
      <ellipse cx="72" cy="88" rx="44" ry="32" fill="#5B9BD5" transform="rotate(-20,72,88)"/>
      <ellipse cx="42" cy="110" rx="22" ry="14" fill="#5B9BD5" transform="rotate(15,42,110)"/>
      <circle cx="95" cy="68" r="10" fill="#5B9BD5"/>
      <circle cx="30" cy="78" r="7" fill="#CE2130"/>
      <circle cx="18" cy="94" r="5" fill="#CE2130"/>
      <circle cx="110" cy="52" r="4" fill="#5B9BD5"/>
      <circle cx="88" cy="42" r="3" fill="#5B9BD5"/>
      <circle cx="60" cy="40" r="5" fill="#5B9BD5"/>
      <ellipse cx="330" cy="70" rx="38" ry="26" fill="#FF69B4" transform="rotate(15,330,70)"/>
      <ellipse cx="362" cy="95" rx="24" ry="16" fill="#FF69B4" transform="rotate(-10,362,95)"/>
      <circle cx="350" cy="48" r="5" fill="#000"/>
      <circle cx="320" cy="50" r="4" fill="#000"/>
      <circle cx="375" cy="65" r="3" fill="#000"/>
      <circle cx="340" cy="100" r="4" fill="#000"/>
      <circle cx="380" cy="110" r="5" fill="#000"/>
      <circle cx="310" cy="80" r="4" fill="#FF69B4"/>
      <circle cx="355" cy="112" r="3" fill="#FF69B4"/>
      <circle cx="385" cy="80" r="5" fill="#FF69B4"/>
      <ellipse cx="55" cy="220" rx="40" ry="28" fill="#FFD700" transform="rotate(-10,55,220)"/>
      <ellipse cx="28" cy="252" rx="22" ry="14" fill="#FFD700" transform="rotate(20,28,252)"/>
      <circle cx="18" cy="195" r="5" fill="#FFD700"/>
      <circle cx="75" cy="200" r="4" fill="#FFD700"/>
      <circle cx="20" cy="270" r="4" fill="#FFD700"/>
      <ellipse cx="190" cy="350" rx="55" ry="32" fill="#CE2130" transform="rotate(-5,190,350)"/>
      <ellipse cx="242" cy="370" rx="38" ry="22" fill="#FF6600" transform="rotate(10,242,370)"/>
      <circle cx="170" cy="340" r="5" fill="#CE2130"/>
      <circle cx="220" cy="342" r="4" fill="#CE2130"/>
      <circle cx="260" cy="360" r="5" fill="#CE2130"/>
      <circle cx="145" cy="355" r="3" fill="#CE2130"/>
      <ellipse cx="330" cy="340" rx="42" ry="26" fill="#9B59B6" transform="rotate(15,330,340)"/>
      <circle cx="310" cy="360" r="5" fill="#FF0000"/>
      <circle cx="350" cy="365" r="4" fill="#FF6600"/>
      <circle cx="370" cy="345" r="5" fill="#FFD700"/>
      <circle cx="355" cy="320" r="4" fill="#00BB00"/>
      <circle cx="380" cy="365" r="3" fill="#0066FF"/>
      <defs><path id="arc-clc" d="M 75,205 A 125,125 0 0,1 325,205"/></defs>
      <text fill="#FF69B4" fontSize="17" fontWeight="700" fontFamily="Georgia,serif" letterSpacing="3">
        <textPath href="#arc-clc">CRYSTAL LYNN CREATES</textPath>
      </text>
      <text x="200" y="268" textAnchor="middle" fill="white" stroke="#FF1493" strokeWidth="7" paintOrder="stroke"
        fontSize="74" fontWeight="900" fontFamily="Georgia,'Times New Roman',serif" letterSpacing="-2" style={{fontStyle:'italic'}}>
        PREMIER
      </text>
      <text x="200" y="268" textAnchor="middle" fill="#FF69B4"
        fontSize="74" fontWeight="900" fontFamily="Georgia,'Times New Roman',serif" letterSpacing="-2" style={{fontStyle:'italic'}}>
        PREMIER
      </text>
      <text x="200" y="302" textAnchor="middle" fill="#FF1493"
        fontSize="27" fontWeight="800" fontFamily="Georgia,serif" letterSpacing="5">
        STUDIOS
      </text>
      <path d="M 100,318 Q 160,302 200,310 Q 255,322 310,310" stroke="#FF69B4" strokeWidth="8" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Calendar data ─────────────────────────────────────────────────────────────
const CAL_DAYS: { d: number; dots: string[] }[] = [
  {d:1,dots:[]},{d:2,dots:['#AA00FF']},{d:3,dots:[]},{d:4,dots:['#FF00CC','#FF7A00']},
  {d:5,dots:[]},{d:6,dots:[]},{d:7,dots:['#00AAFF']},{d:8,dots:[]},{d:9,dots:['#00FF7A']},
  {d:10,dots:[]},{d:11,dots:['#FFE500']},{d:12,dots:[]},{d:13,dots:[]},
  {d:14,dots:['#FF00CC','#AA00FF']},{d:15,dots:['#FF7A00']},{d:16,dots:[]},
  {d:17,dots:[]},{d:18,dots:['#00FF7A']},{d:19,dots:[]},{d:20,dots:['#00AAFF','#FFE500']},
  {d:21,dots:[]},{d:22,dots:['#AA00FF']},{d:23,dots:[]},{d:24,dots:[]},
  {d:25,dots:['#FF00CC']},{d:26,dots:[]},{d:27,dots:['#00FF7A','#00AAFF']},
  {d:28,dots:[]},{d:29,dots:[]},{d:30,dots:['#FFE500']},{d:31,dots:[]},
];

// ─── App frame ────────────────────────────────────────────────────────────────
function AppFrame({ children, h = 420 }: { children: ReactNode; h?: number }) {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 24px 80px rgba(124,58,237,0.12)', height: h, background: DRK }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>)}
        <div style={{ flex: 1, textAlign: 'center' }}><div style={{ width: 100, height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.08)', margin: '0 auto' }}/></div>
      </div>
      <div style={{ height: 'calc(100% - 33px)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// ─── Mockups ──────────────────────────────────────────────────────────────────
function MockDashboard() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 0.7fr',gridTemplateRows:'1fr 1fr',gap:2,padding:2,height:'100%',background:DRK}}>
      <div style={{gridRow:'1/3',background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'10px',display:'flex',flexDirection:'column',gap:5,overflow:'hidden'}}>
        <div style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',fontWeight:700}}>CALENDAR</div>
        <div style={{fontSize:'0.82rem',fontWeight:800,color:W}}>August 2026</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1.5}}>
          {['S','M','T','W','T','F','S'].map(d=><div key={d} style={{textAlign:'center',fontSize:'0.3rem',color:'rgba(255,255,255,0.2)',fontWeight:600}}>{d}</div>)}
          {[0,1,2,3].map(i=><div key={i}/>)}
          {CAL_DAYS.slice(0,24).map(({d,dots})=>(
            <div key={d} style={{aspectRatio:'1',borderRadius:2,background:d===21?LAV:dots.length?'rgba(139,92,246,0.12)':'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1}}>
              <span style={{fontSize:'0.36rem',color:d===21?W:'rgba(255,255,255,0.55)',fontWeight:d===21?700:400}}>{d}</span>
              {dots.length>0&&d!==21&&<div style={{display:'flex',gap:1}}>{dots.slice(0,2).map(c=><div key={c} style={{width:2.5,height:2.5,borderRadius:'50%',background:c}}/>)}</div>}
            </div>
          ))}
        </div>
        {[{e:'💪',t:'Gym',ti:'7:00am',c:'#00FF7A'},{e:'📍',t:'Dr. Appt',ti:'10:30am',c:'#AA00FF'},{e:'💰',t:'Payday',ti:'all day',c:'#00AAFF'}].map(ev=>(
          <div key={ev.t} style={{display:'flex',alignItems:'center',gap:4,padding:'3px 5px',borderRadius:4,background:`${ev.c}12`,borderLeft:`1.5px solid ${ev.c}`}}>
            <span style={{fontSize:'0.4rem'}}>{ev.e}</span>
            <span style={{fontSize:'0.36rem',color:'rgba(255,255,255,0.7)'}}>{ev.t}</span>
            <span style={{marginLeft:'auto',fontSize:'0.3rem',color:'rgba(255,255,255,0.3)'}}>{ev.ti}</span>
          </div>
        ))}
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'8px',display:'flex',flexDirection:'column',gap:3}}>
        <div style={{fontSize:'0.3rem',color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em'}}>NOTES</div>
        <div style={{fontSize:'0.5rem',fontWeight:700,color:W}}>Today is a great day!</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{fontSize:'0.3rem',color:'rgba(255,255,255,0.2)',padding:'5px 6px'}}>PHOTOS</div>
        <div style={{flex:1,background:'linear-gradient(135deg,#1a1a2e,#2d1b69)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'1.2rem',opacity:0.3}}>🖼️</span></div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
        <div style={{fontSize:'0.28rem',color:'rgba(255,255,255,0.18)',letterSpacing:'0.08em'}}>CLOCK</div>
        <div style={{fontSize:'1.3rem',fontWeight:700,color:'#00AAFF',letterSpacing:'-0.04em',lineHeight:1}}>11:10</div>
        <div style={{fontSize:'0.33rem',color:'rgba(255,255,255,0.25)'}}>Sunday, Aug 24</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'5px',display:'flex',flexDirection:'column',gap:2}}>
        <div style={{fontSize:'0.28rem',color:'rgba(255,255,255,0.18)',letterSpacing:'0.06em',marginBottom:1}}>CALC</div>
        <div style={{textAlign:'right',fontSize:'0.6rem',color:W,padding:'0 3px'}}>0</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1.5}}>
          {['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='].map((k,i)=>(
            <div key={i} style={{aspectRatio:'1',borderRadius:3,background:['÷','×','−','+','='].includes(k)?LAV:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.34rem',color:W}}>{k}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockApps() {
  const apps=[{n:'Netflix',e:'🎬',c:'rgba(229,9,20,0.15)'},{n:'Disney+',e:'✨',c:'rgba(17,60,207,0.15)'},{n:'Prime',e:'📦',c:'rgba(0,168,224,0.1)'},{n:'Facebook',e:'👥',c:'rgba(24,119,242,0.12)'},{n:'WhatsApp',e:'💬',c:'rgba(37,211,102,0.1)'},{n:'Instagram',e:'📸',c:'rgba(225,48,108,0.1)'},{n:'Zoom',e:'📹',c:'rgba(45,140,255,0.1)'},{n:'Canvas',e:'🎓',c:'rgba(230,96,0,0.1)'}];
  return (
    <div style={{padding:'10px',height:'100%',display:'flex',flexDirection:'column',gap:6,background:DRK}}>
      <div style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',fontWeight:700}}>APPS</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,flex:1}}>
        {apps.map(a=>(
          <div key={a.n} style={{background:a.c,borderRadius:10,border:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4}}>
            <span style={{fontSize:'1.4rem'}}>{a.e}</span>
            <span style={{fontSize:'0.4rem',color:'rgba(255,255,255,0.7)',fontWeight:600}}>{a.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockBrowser() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:DRK}}>
      <div style={{padding:'7px 12px',background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:7}}>
        <div style={{display:'flex',gap:4}}>{['◀','▶','↻'].map(a=><div key={a} style={{fontSize:'0.52rem',color:'rgba(255,255,255,0.25)'}}>{a}</div>)}</div>
        <div style={{flex:1,padding:'3px 10px',background:'rgba(255,255,255,0.06)',borderRadius:20,fontSize:'0.4rem',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>https://cloud.canvaslms.net</div>
      </div>
      <div style={{flex:1,background:W,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,padding:'20px'}}>
        <div style={{fontWeight:800,fontSize:'1.4rem',color:'#E66000'}}>Canvas</div>
        <div style={{fontSize:'0.55rem',color:'rgba(0,0,0,0.45)'}}>Log in with your institution</div>
        <div style={{width:'75%',padding:'8px 12px',borderRadius:8,border:'1.5px solid rgba(230,96,0,0.4)',fontSize:'0.45rem',color:'rgba(0,0,0,0.3)'}}>Email</div>
        <div style={{width:'75%',padding:'8px 12px',borderRadius:8,border:'1.5px solid rgba(0,0,0,0.18)',fontSize:'0.45rem',color:'rgba(0,0,0,0.3)'}}>Password</div>
        <div style={{width:'75%',padding:'8px 12px',borderRadius:8,background:'#E66000',textAlign:'center',fontSize:'0.48rem',color:W,fontWeight:700}}>Log In</div>
      </div>
    </div>
  );
}

function MockSkins() {
  const skins=[{n:'Aurora',a:'#00f0ff',b:'#ff00f0'},{n:'Night Sky',a:'#0B1026',b:'#6D5ACF'},{n:'Cherry',a:'#FFB7C5',b:'#FF69B4'},{n:'Neon Mint',a:'#00FF9F',b:'#00AAFF'},{n:'Sunset',a:'#FF6B6B',b:'#FFD700'},{n:'Cosmic',a:'#4B0082',b:'#FF69B4'},{n:'Ocean',a:'#006994',b:'#00BFFF'},{n:'Lavender',a:LAV,b:LAV3},{n:'Forest',a:'#228B22',b:'#90EE90'}];
  return (
    <div style={{padding:'12px',height:'100%',display:'flex',flexDirection:'column',gap:8,background:DRK}}>
      <div style={{fontSize:'0.78rem',fontWeight:800,color:W}}>choose your skin</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,flex:1}}>
        {skins.map((sk,i)=>(
          <div key={sk.n} style={{borderRadius:8,overflow:'hidden',border:i===0?`2px solid ${LAV}`:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',position:'relative'}}>
            <div style={{height:'70%',background:`linear-gradient(135deg,${sk.a},${sk.b})`}}/>
            <div style={{height:'30%',background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.7)'}}>{sk.n}</span>
            </div>
            {i===0&&<div style={{position:'absolute',top:3,right:3,width:11,height:11,borderRadius:'50%',background:LAV,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.35rem',color:W}}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(28px)', transition: `opacity .65s ease ${delay}s, transform .65s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ─── Password check ────────────────────────────────────────────────────────────
function PwCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: met ? '#16A34A' : GRY, transition: 'color 0.2s' }}>
      <span>{met ? '✓' : '○'}</span>{label}
    </div>
  );
}

// ─── Product card (Adobe-style) ────────────────────────────────────────────────
function ProductCard({ icon, title, desc, color, delay = 0 }: { icon: string; title: string; desc: string; color: string; delay?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: W, border: `1.5px solid ${hov ? color : 'rgba(0,0,0,0.09)'}`,
          borderRadius: 12, padding: '28px 24px', cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
          transform: hov ? 'translateY(-4px)' : 'none',
          boxShadow: hov ? `0 12px 40px ${color}20` : '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 16 }}>
          {icon}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: B, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: GRY, lineHeight: 1.6 }}>{desc}</div>
        <div style={{ marginTop: 16, fontSize: '0.82rem', color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          Learn more <span style={{ fontSize: '0.9rem' }}>›</span>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Spotlight section (Adobe alternating) ────────────────────────────────────
function Spotlight({
  visual, eyebrow, headline, body, chips = [], cta, reverse = false, bg = W, dark = false, className = '', id,
}: {
  visual: ReactNode; eyebrow: string; headline: string; body: string;
  chips?: string[]; cta?: string; reverse?: boolean; bg?: string; dark?: boolean; className?: string; id?: string;
}) {
  return (
    <section id={id} className={className} style={{ background: bg, padding: '100px 0' }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto', padding: '0 48px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center',
        direction: reverse ? 'rtl' : 'ltr',
      } as CSSProperties}>
        <Reveal style={{ direction: 'ltr' } as CSSProperties}>{visual}</Reveal>
        <Reveal delay={0.1} style={{ direction: 'ltr' } as CSSProperties}>
          <div style={{ fontSize: '0.62rem', color: dark ? LAV3 : LAV, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{eyebrow}</div>
          <h2 style={{ fontSize: 'clamp(2rem,3.2vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '0 0 20px', color: dark ? W : B }} dangerouslySetInnerHTML={{ __html: headline }}/>
          <p style={{ fontSize: '1.05rem', color: dark ? 'rgba(255,255,255,0.54)' : GRY, lineHeight: 1.78, marginBottom: chips.length || cta ? 24 : 0 }}>{body}</p>
          {chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: cta ? 24 : 0 }}>
              {chips.map(c => <div key={c} style={{ padding: '5px 14px', borderRadius: 20, background: dark ? 'rgba(196,181,253,.08)' : LAV4, border: `1px solid ${dark ? 'rgba(196,181,253,.28)' : LAV2 + '30'}`, fontSize: '0.78rem', color: dark ? LAV3 : LAV, fontWeight: 500 }}>{c}</div>)}
            </div>
          )}
          {cta && (
            <button style={{ padding: '12px 28px', borderRadius: 8, background: dark ? LAV2 : LAV, color: W, border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>{cta}</button>
          )}
        </Reveal>
      </div>
    </section>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate         = useNavigate();
  const { setIsPremium } = useStore();
  const isFirstTime      = !hasAnyUser();
  const [mode,     setMode]     = useState<Mode>(isFirstTime ? 'create' : 'sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const STEP = 320;
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installable,   setInstallable]   = useState(false);
  const [installed,     setInstalled]     = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub') === 'success') { setIsPremium(true); window.history.replaceState({}, '', window.location.pathname); }
    if (window.matchMedia('(display-mode: standalone)').matches) { setInstalled(true); return; }
    const beforeInstall = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setInstallable(true); };
    window.addEventListener('beforeinstallprompt', beforeInstall as EventListener);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallable(false); });
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall as EventListener);
      window.removeEventListener('scroll', onScroll);
    };
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
  const pwHasSpecial = /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password);

  const inp: CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 16px',
    borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.14)',
    background: W, color: '#111', fontSize: '0.93rem', outline: 'none',
  };

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  function slideLeft() {
    if (!sliderRef.current) return;
    sliderRef.current.scrollLeft = Math.max(0, sliderRef.current.scrollLeft - STEP);
  }
  function slideRight() {
    if (!sliderRef.current) return;
    const max = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
    sliderRef.current.scrollLeft = Math.min(max, sliderRef.current.scrollLeft + STEP);
  }

  const products = [
    { icon: '📅', title: 'Smart Calendar',       desc: '55+ event types — birthdays, payday, gym, appointments, trips and more.',       color: LAV },
    { icon: '🎬', title: 'Streaming & Social',   desc: 'Netflix, Disney+, Prime, Facebook, Instagram, WhatsApp — all in one panel.',   color: '#E50914' },
    { icon: '🌐', title: 'Built-in Browser',     desc: 'Full web browser. Google, Canvas LMS, YouTube — no tab-switching needed.',     color: '#4285F4' },
    { icon: '🎥', title: 'Google Meet & Zoom',   desc: 'Start or join meetings instantly. Both video platforms built right in.',        color: '#00897B' },
    { icon: '📝', title: 'Notes',                desc: 'Sticky notes always on your dashboard. No app to open — just type.',           color: '#F59E0B' },
    { icon: '🌈', title: '19 Beautiful Skins',   desc: '10 color themes and 9 animated landscapes. Switch with one tap.',             color: '#EC4899' },
    { icon: '🕐', title: 'Clock, Timer & Calc', desc: 'Live clock, countdown timer, and calculator always at your fingertips.',       color: '#06B6D4' },
    { icon: '🔒', title: 'Private by Default',   desc: 'Data stays on your device. No tracking, no selling. Secure from day one.',     color: '#64748B' },
  ];

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', color: B, background: W }}>
      <style>{`
        html, body { overflow-x: clip; }
        @keyframes iri { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .calendi-iri {
          background: linear-gradient(135deg,#FF00CC,#FF7A00,#FFE500,#00FF7A,#00AAFF,#AA00FF,#FF00CC);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: iri 5s ease infinite;
          display: block;
        }
        .layer-black {
          position: relative; z-index: 20;
          border-radius: 32px 32px 0 0;
          box-shadow: 0 -20px 60px rgba(0,0,0,.6);
          overflow: hidden;
        }
        .layer-white {
          position: sticky; top: 0; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
        }
        .feat-slider::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ══ NAV — Adobe-style sticky top ════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: scrolled ? 'rgba(255,255,255,0.97)' : W,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.07)'}`,
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center' }}>
          {/* Wordmark */}
          <span style={{ fontWeight: 900, fontSize: '1.45rem', letterSpacing: '-0.04em', WebkitTextStroke: `1.5px ${LAV}`, color: 'transparent', marginRight: 36, flexShrink: 0 }}>
            calendi
          </span>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {([['What is Calendi?','about'],['Features','features'],['Apps','apps'],['Skins','skins'],['Pricing','pricing']] as [string,string][]).map(([label, id]) => (
              <button key={id} onClick={() => go(id)} style={{ background: 'none', border: 'none', padding: '8px 14px', borderRadius: 6, fontSize: '0.87rem', color: '#333', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.background = OFF)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right CTA */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            {installed && <span style={{ fontSize: '0.72rem', color: GRY }}>✓ Installed</span>}
            {installable && !installed && (
              <button onClick={handleInstall} style={{ padding: '8px 14px', borderRadius: 7, border: `1px solid rgba(0,0,0,0.15)`, background: W, color: '#333', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Download size={13}/> Install
              </button>
            )}
            <button onClick={() => { setMode('sign-in'); go('auth'); }} style={{ padding: '9px 18px', borderRadius: 7, background: 'none', border: `1px solid rgba(0,0,0,0.18)`, color: '#333', fontWeight: 600, fontSize: '0.87rem', cursor: 'pointer' }}>
              Sign in
            </button>
            <button onClick={() => { setMode('create'); go('auth'); }} style={{ padding: '9px 18px', borderRadius: 7, background: LAV, color: W, border: 'none', fontWeight: 700, fontSize: '0.87rem', cursor: 'pointer' }}>
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO — two column, headline + auth form ══════════════════════════ */}
      <section id="about" className="layer-white" style={{ paddingTop: 60, background: W }}>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '80px 48px 80px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 64, alignItems: 'center', boxSizing: 'border-box' }}>

          {/* Left */}
          <div>
            <div style={{ fontSize: '0.65rem', color: GRY, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>CLC Premier Studios</div>

            {/* Iridescent block letters */}
            <h1 className="calendi-iri" style={{ fontSize: 'clamp(64px,11vw,152px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.88, margin: 0 }}>
              calendi
            </h1>
            <h1 aria-hidden="true" style={{ fontSize: 'clamp(64px,11vw,152px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.88, margin: '-0.88em 0 28px', WebkitTextStroke: '2px rgba(124,58,237,.22)', color: 'transparent', pointerEvents: 'none', userSelect: 'none' }}>
              calendi
            </h1>

            <p style={{ fontSize: 'clamp(1.1rem,1.8vw,1.35rem)', color: '#1a1a1a', lineHeight: 1.55, maxWidth: 520, marginBottom: 12, fontWeight: 500 }}>
              The calendar that does everything.
            </p>
            <p style={{ fontSize: '1rem', color: GRY, lineHeight: 1.78, maxWidth: 500, marginBottom: 36 }}>
              Stream, socialize, plan, work, and play — all in one beautiful dashboard. Free forever, or upgrade to remove ads for $4.99/mo.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
              <button onClick={() => { setMode('create'); go('auth'); }} style={{ padding: '14px 32px', borderRadius: 8, background: LAV, color: W, border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                Get started free
              </button>
              <button onClick={() => go('features')} style={{ padding: '14px 32px', borderRadius: 8, background: 'none', color: B, border: '1.5px solid rgba(0,0,0,0.2)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                See what{"'"}s inside <ChevronDown size={16}/>
              </button>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 44, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              {[['55+','Event types'],['19','Beautiful skins'],['12+','Built-in apps'],['Free','Forever plan']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 'clamp(1.5rem,2.5vw,2.2rem)', fontWeight: 900, color: LAV, letterSpacing: '-0.03em', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: '0.78rem', color: GRY, marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: auth form */}
          <div id="auth">
            <div style={{ background: W, border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: '38px 34px', boxShadow: '0 8px 40px rgba(124,58,237,0.10)' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', background: OFF, borderRadius: 9, padding: 3, marginBottom: 24 }}>
                {(['create', 'sign-in'] as Mode[]).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                    flex: 1, padding: '10px', borderRadius: 7, border: 'none',
                    background: mode === m ? W : 'transparent',
                    color: mode === m ? B : GRY,
                    fontWeight: mode === m ? 700 : 500,
                    fontSize: '0.85rem', cursor: 'pointer',
                    boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {m === 'create' ? 'Create account' : 'Sign in'}
                  </button>
                ))}
              </div>

              {mode === 'create' && (
                <p style={{ textAlign: 'center', color: GRY, fontSize: '0.82rem', marginTop: -12, marginBottom: 20 }}>Free forever. No credit card needed.</p>
              )}

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 6, color: '#444', letterSpacing: '0.05em' }}>USERNAME</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="yourname" required autoComplete="username" style={inp}/>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: 6, color: '#444', letterSpacing: '0.05em' }}>PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'create' ? '8+ chars, A-Z, 0-9, special' : '••••••••'}
                      required autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                      style={{ ...inp, paddingRight: 46 }}/>
                    <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: GRY, cursor: 'pointer', padding: 4 }}>
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {mode === 'create' && password.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', marginTop: 10, padding: '10px 12px', borderRadius: 8, background: LAV4, border: '1px solid rgba(124,58,237,0.15)' }}>
                      <PwCheck label="8+ characters"   met={pwHasLen}/>
                      <PwCheck label="Uppercase letter" met={pwHasUpper}/>
                      <PwCheck label="Number (0–9)"     met={pwHasNum}/>
                      <PwCheck label="Special char"     met={pwHasSpecial}/>
                    </div>
                  )}
                </div>
                {error && <div style={{ padding: '10px 13px', borderRadius: 8, background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', color: '#DC2626', fontSize: '0.82rem' }}>{error}</div>}
                <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 8, border: 'none', background: loading ? 'rgba(124,58,237,0.4)' : LAV, color: W, fontWeight: 800, fontSize: '0.97rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 2 }}>
                  {loading ? 'Just a moment…' : mode === 'create' ? 'Create free account' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURE SLIDER — black section with square cards ════════════════ */}
      <section id="features" className="layer-black" style={{ background: B, padding: '96px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px' }}>
          <Reveal style={{ marginBottom: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: LAV3, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>EVERYTHING INSIDE</div>
              <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 14px', color: W }}>Explore what{"'"}s inside Calendi</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 540, lineHeight: 1.7, margin: 0 }}>Every feature you need in one place — no tab-switching, no extra subscriptions.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={slideLeft} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: W, fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={slideRight} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: W, fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </div>
          </Reveal>
          <div ref={sliderRef} className="feat-slider" style={{ display: 'flex', gap: 20, overflowX: 'auto', scrollBehavior: 'smooth', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {products.map((p) => (
              <div key={p.title} style={{ width: 300, minWidth: 300, height: 300, flexShrink: 0, borderRadius: 20, padding: '32px 28px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(196,181,253,.18)', display: 'flex', flexDirection: 'column', gap: 18, boxSizing: 'border-box' }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{p.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: W }}>{p.title}</div>
                <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{p.desc}</div>
                <div style={{ marginTop: 'auto', fontSize: '0.82rem', color: p.color, fontWeight: 600 }}>Learn more ›</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SPOTLIGHT SECTIONS — alternating sticky-white / scrolling-black ══ */}
      <Spotlight
        id="apps"
        visual={<AppFrame h={440}><MockDashboard/></AppFrame>}
        eyebrow="YOUR DASHBOARD"
        headline="Everything you need,<br/>beautifully organized."
        body="Your calendar, notes, clock, browser, apps, and calculator — all visible at once on one gorgeous dashboard. No more hunting through apps or switching tabs."
        chips={['📅 Calendar','📝 Notes','🕐 Clock','🧮 Calculator','🖼️ Photos']}
        cta="See the dashboard"
        bg={W}
        className="layer-white"
      />
      <Spotlight
        visual={<AppFrame h={440}><MockApps/></AppFrame>}
        eyebrow="BUILT-IN APPS"
        headline="Every app.<br/>One place."
        body="Netflix, Disney+, Prime Video, Facebook, Instagram, WhatsApp, Gmail, Zoom, Canvas LMS — all open inside Calendi in a focused panel. No tab-switching, ever."
        chips={['🎬 Netflix','🎭 Disney+','📘 Facebook','📸 Instagram','💬 WhatsApp','🎓 Canvas']}
        cta="See all apps"
        reverse
        bg={B}
        dark
        className="layer-black"
      />
      <Spotlight
        id="skins"
        visual={<AppFrame h={400}><MockBrowser/></AppFrame>}
        eyebrow="BUILT-IN BROWSER"
        headline="Browse without<br/>leaving Calendi."
        body="A full web browser built right into your dashboard. Google, Canvas LMS for classroom learning, YouTube, and any site — all without switching tabs or apps."
        chips={['🌐 Google','🎓 Canvas LMS','▶️ YouTube','🗺️ Maps','🔍 Any website']}
        cta="Try the browser"
        bg={W}
        className="layer-white"
      />
      <Spotlight
        visual={<AppFrame h={400}><MockSkins/></AppFrame>}
        eyebrow="19 BEAUTIFUL SKINS"
        headline="Make it yours.<br/>Change it anytime."
        body="10 neon color themes and 9 live animated landscape skins — Aurora Borealis, Cherry Blossom, Night Sky, Melted Skittles, Cosmic, and more. Switch in one tap."
        chips={['🌌 Aurora','🌸 Cherry Blossom','🌃 Night Sky','🍬 Melted Skittles','🪐 Cosmic']}
        reverse
        bg={B}
        dark
        className="layer-black"
      />

      {/* ══ PRICING ══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="layer-white" style={{ background: W, padding: '100px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 48px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: '0.65rem', color: LAV, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>PRICING</div>
            <h2 style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 14px', color: B }}>Start free. Stay free.</h2>
            <p style={{ fontSize: '1rem', color: GRY, margin: 0 }}>Upgrade only if you want an ad-free experience.</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <Reveal style={{ background: W, border: '1.5px solid rgba(0,0,0,0.09)', borderRadius: 16, padding: '40px 36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.7rem', color: GRY, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>FREE</div>
              <div style={{ fontWeight: 900, fontSize: 'clamp(2.4rem,4vw,3.2rem)', letterSpacing: '-0.04em', color: B, lineHeight: 1, marginBottom: 6 }}>$0</div>
              <div style={{ fontSize: '0.85rem', color: GRY, marginBottom: 28 }}>per month, forever</div>
              {['Full calendar, planners & contacts','19 animated skins','Streaming, social & games','Browser, notes, clock & more','Supported by small ads'].map(p => (
                <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 13, fontSize: '0.9rem', color: '#444' }}>
                  <span style={{ color: LAV, fontWeight: 700, flexShrink: 0 }}>✓</span>{p}
                </div>
              ))}
              <button onClick={() => { setMode('create'); go('auth'); }} style={{ width: '100%', marginTop: 24, padding: '14px', borderRadius: 8, border: `1.5px solid ${LAV}`, background: W, color: LAV, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                Get started free
              </button>
            </Reveal>
            <Reveal delay={0.1} style={{ background: LAV, borderRadius: 16, padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, padding: '4px 13px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', color: W, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>RECOMMENDED</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>PREMIUM</div>
              <div style={{ fontWeight: 900, fontSize: 'clamp(2.4rem,4vw,3.2rem)', letterSpacing: '-0.04em', color: W, lineHeight: 1, marginBottom: 6 }}>$4.99</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>per month</div>
              {['Everything in Free','Completely ad-free','Support CLC Premier Studios','Priority access to new features'].map(p => (
                <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 13, fontSize: '0.9rem', color: 'rgba(255,255,255,0.88)' }}>
                  <span style={{ color: W, fontWeight: 700, flexShrink: 0 }}>✓</span>{p}
                </div>
              ))}
              <button style={{ width: '100%', marginTop: 24, padding: '14px', borderRadius: 8, border: 'none', background: W, color: LAV, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
                Upgrade to Premium
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer className="layer-black" style={{ background: B, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '60px 48px 48px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 40 }}>
            {[
              { heading: 'Calendi',       links: ['What is Calendi?','Features','Pricing','Install App'] },
              { heading: 'Built-in Apps', links: ['Netflix & Disney+','YouTube','Browser','Google Meet','Zoom','Canvas LMS'] },
              { heading: 'Calendar',      links: ['Event Types','Planners','Contacts','Reminders','Holidays'] },
              { heading: 'Company',       links: ['CLC Premier Studios','Privacy Policy','Terms of Use','Support'] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.5)', marginBottom: 10, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.color = W)}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >{l}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: logo + calendi block letters */}
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 48px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <CLCPaintLogo size={88}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(3rem,8vw,7.5rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, WebkitTextStroke: `3px ${LAV2}`, color: 'transparent', userSelect: 'none' }}>
              calendi
            </div>
            <div style={{ fontSize: '0.65rem', color: LAV3, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>
              CLC PREMIER STUDIOS
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', marginBottom: 5 }}>© 2026 CLC Premier Studios</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)' }}>All rights reserved.</div>
          </div>
        </div>
      </footer>

    </div>
  );
}

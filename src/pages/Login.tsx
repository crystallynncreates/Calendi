import { useState, useEffect, useRef, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';

type Mode = 'sign-in' | 'create';

const LAV  = '#7C3AED';
const LAV2 = '#8B5CF6';
const LAV3 = '#C4B5FD';
const LAV4 = '#EDE9FE';
const W    = '#FFFFFF';
const B    = '#000000';
const GRY  = '#6B7280';
const DRK  = '#06060F';

// ─── Paint-splatter CLC logo (SVG recreation) ────────────────────────────────
function CLCPaintLogo({size=200}: {size?: number}) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
      {/* White background */}
      <rect width="400" height="400" fill="white"/>

      {/* Blue splatter top-left */}
      <ellipse cx="72" cy="88" rx="44" ry="32" fill="#5B9BD5" transform="rotate(-20,72,88)"/>
      <ellipse cx="42" cy="110" rx="22" ry="14" fill="#5B9BD5" transform="rotate(15,42,110)"/>
      <circle cx="95" cy="68" r="10" fill="#5B9BD5"/>
      <circle cx="30" cy="78" r="7" fill="#CE2130"/>
      <circle cx="18" cy="94" r="5" fill="#CE2130"/>
      <ellipse cx="48" cy="58" rx="12" ry="7" fill="#5B9BD5" transform="rotate(-30,48,58)"/>
      {/* Blue splatter drops */}
      {[[110,52,4],[88,42,3],[60,40,5],[120,80,3],[18,110,4]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#5B9BD5"/>
      ))}

      {/* Pink/black splatter top-right */}
      <ellipse cx="330" cy="70" rx="38" ry="26" fill="#FF69B4" transform="rotate(15,330,70)"/>
      <ellipse cx="360" cy="95" rx="24" ry="16" fill="#FF69B4" transform="rotate(-10,360,95)"/>
      {[[350,48,5],[320,50,4],[375,65,3],[340,100,4],[380,110,5]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#000"/>
      ))}
      {[[310,80,4],[355,112,3],[385,80,5]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#FF69B4"/>
      ))}

      {/* Yellow splatter left */}
      <ellipse cx="55" cy="220" rx="40" ry="28" fill="#FFD700" transform="rotate(-10,55,220)"/>
      <ellipse cx="28" cy="250" rx="22" ry="14" fill="#FFD700" transform="rotate(20,28,250)"/>
      {[[18,195,5],[75,200,4],[20,270,4],[65,240,3]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#FFD700"/>
      ))}

      {/* Red/orange splatter bottom-center */}
      <ellipse cx="190" cy="350" rx="55" ry="32" fill="#CE2130" transform="rotate(-5,190,350)"/>
      <ellipse cx="240" cy="370" rx="38" ry="22" fill="#FF6600" transform="rotate(10,240,370)"/>
      <ellipse cx="155" cy="368" rx="28" ry="16" fill="#CE2130" transform="rotate(-15,155,368)"/>
      {[[170,340,5],[220,342,4],[260,360,5],[145,355,3],[285,368,4]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#CE2130"/>
      ))}

      {/* Purple/rainbow splatter bottom-right */}
      <ellipse cx="330" cy="340" rx="42" ry="26" fill="#9B59B6" transform="rotate(15,330,340)"/>
      {[[310,360,5,'#FF0000'],[350,365,4,'#FF6600'],[370,345,5,'#FFD700'],[355,320,4,'#00BB00'],[380,365,3,'#0066FF']].map(([x,y,r,c],i)=>(
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string}/>
      ))}

      {/* Pink blob right side */}
      <ellipse cx="385" cy="200" rx="18" ry="28" fill="#FF69B4" transform="rotate(-20,385,200)"/>
      <circle cx="374" cy="175" r="8" fill="#FF69B4"/>
      <circle cx="390" cy="225" r="6" fill="#FF69B4"/>

      {/* Arc text "CRYSTAL LYNN CREATES" */}
      <defs>
        <path id="arc" d="M 80,210 A 120,120 0 0,1 320,210"/>
      </defs>
      <text fill="#FF69B4" fontSize="18" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="3">
        <textPath href="#arc">CRYSTAL LYNN CREATES</textPath>
      </text>

      {/* "PREMIER" — bubbly white with pink stroke */}
      <text x="200" y="265" textAnchor="middle" fill="white" stroke="#FF1493" strokeWidth="6" paintOrder="stroke"
        fontSize="74" fontWeight="900" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="-2" style={{fontStyle:'italic'}}>
        PREMIER
      </text>
      <text x="200" y="265" textAnchor="middle" fill="#FF69B4" strokeWidth="0"
        fontSize="74" fontWeight="900" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="-2" style={{fontStyle:'italic'}}>
        PREMIER
      </text>

      {/* "STUDIOS" */}
      <text x="200" y="300" textAnchor="middle" fill="#FF1493"
        fontSize="28" fontWeight="800" fontFamily="Georgia, serif" letterSpacing="6">
        STUDIOS
      </text>

      {/* Pink swoosh brush stroke */}
      <path d="M 100,315 Q 160,300 200,308 Q 255,320 310,308" stroke="#FF69B4" strokeWidth="9" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Calendar data ────────────────────────────────────────────────────────────
const CAL_DAYS: {d:number;dots:string[]}[] = [
  {d:1,dots:[]},{d:2,dots:['#AA00FF']},{d:3,dots:[]},{d:4,dots:['#FF00CC','#FF7A00']},
  {d:5,dots:[]},{d:6,dots:[]},{d:7,dots:['#00AAFF']},{d:8,dots:[]},{d:9,dots:['#00FF7A']},
  {d:10,dots:[]},{d:11,dots:['#FFE500']},{d:12,dots:[]},{d:13,dots:[]},
  {d:14,dots:['#FF00CC','#AA00FF']},{d:15,dots:['#FF7A00']},{d:16,dots:[]},
  {d:17,dots:[]},{d:18,dots:['#00FF7A']},{d:19,dots:[]},{d:20,dots:['#00AAFF','#FFE500']},
  {d:21,dots:[]},{d:22,dots:['#AA00FF']},{d:23,dots:[]},{d:24,dots:[]},
  {d:25,dots:['#FF00CC']},{d:26,dots:[]},{d:27,dots:['#00FF7A','#00AAFF']},
  {d:28,dots:[]},{d:29,dots:[]},{d:30,dots:['#FFE500']},{d:31,dots:[]},
];

// ─── App frame wrapper ────────────────────────────────────────────────────────
function AppFrame({children, h=360}: {children: ReactNode; h?: number}) {
  return (
    <div style={{borderRadius:20,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)',boxShadow:'0 20px 70px rgba(124,58,237,0.15)',height:h,background:DRK}}>
      <div style={{display:'flex',alignItems:'center',gap:5,padding:'9px 14px',background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c=><div key={c} style={{width:9,height:9,borderRadius:'50%',background:c}}/>)}
        <div style={{flex:1,textAlign:'center'}}><div style={{width:90,height:4,borderRadius:2,background:'rgba(255,255,255,0.1)',margin:'0 auto'}}/></div>
      </div>
      <div style={{height:'calc(100% - 31px)',overflow:'hidden'}}>{children}</div>
    </div>
  );
}

// ─── Mockups ──────────────────────────────────────────────────────────────────
function MockDashboard() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 0.7fr',gridTemplateRows:'1fr 1fr',gap:2,padding:2,height:'100%',background:DRK}}>
      <div style={{gridRow:'1/3',background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'10px',display:'flex',flexDirection:'column',gap:5,overflow:'hidden'}}>
        <div style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',fontWeight:700}}>CALENDAR</div>
        <div style={{fontSize:'0.8rem',fontWeight:800,color:W}}>August 2026</div>
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
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'8px',border:'1px solid rgba(255,255,255,0.05)',display:'flex',flexDirection:'column',gap:3}}>
        <div style={{fontSize:'0.3rem',color:'rgba(255,255,255,0.2)',letterSpacing:'0.1em'}}>NOTES</div>
        <div style={{fontSize:'0.5rem',fontWeight:700,color:W}}>Today is a great day!</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,border:'1px solid rgba(255,255,255,0.05)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{fontSize:'0.3rem',color:'rgba(255,255,255,0.2)',padding:'5px 6px'}}>PHOTOS</div>
        <div style={{flex:1,background:'linear-gradient(135deg,#1a1a2e,#2d1b69)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'1.2rem',opacity:0.3}}>🖼️</span></div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,border:'1px solid rgba(255,255,255,0.05)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
        <div style={{fontSize:'0.28rem',color:'rgba(255,255,255,0.18)',letterSpacing:'0.08em'}}>CLOCK</div>
        <div style={{fontSize:'1.3rem',fontWeight:700,color:'#00AAFF',letterSpacing:'-0.04em',lineHeight:1}}>11:10</div>
        <div style={{fontSize:'0.33rem',color:'rgba(255,255,255,0.25)'}}>Friday, Aug 21</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,border:'1px solid rgba(255,255,255,0.05)',padding:'5px',display:'flex',flexDirection:'column',gap:2}}>
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
  const apps=[{n:'Netflix',e:'🎬',c:'rgba(229,9,20,0.15)'},{n:'Disney+',e:'✨',c:'rgba(17,60,207,0.15)'},{n:'Prime',e:'📦',c:'rgba(0,168,224,0.1)'},{n:'Facebook',e:'👥',c:'rgba(24,119,242,0.12)'},{n:'Messages',e:'💬',c:'rgba(76,175,80,0.1)'},{n:'WhatsApp',e:'📱',c:'rgba(37,211,102,0.1)'},{n:'Phone',e:'📞',c:'rgba(255,92,92,0.1)'},{n:'Instagram',e:'📸',c:'rgba(225,48,108,0.1)'}];
  return (
    <div style={{padding:'8px',height:'100%',display:'flex',flexDirection:'column',gap:4,background:DRK}}>
      <div style={{fontSize:'0.36rem',color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',fontWeight:700}}>APPS</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,flex:1}}>
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

function MockCalendar() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'10px',gap:6,background:DRK}}>
      <div style={{fontSize:'0.76rem',fontWeight:800,color:W}}>August 2026</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {['S','M','T','W','T','F','S'].map(d=><div key={d} style={{textAlign:'center',fontSize:'0.36rem',color:'rgba(255,255,255,0.25)',fontWeight:600}}>{d}</div>)}
        {[0,1,2,3].map(i=><div key={i}/>)}
        {CAL_DAYS.slice(0,27).map(({d,dots})=>(
          <div key={d} style={{aspectRatio:'1',borderRadius:5,background:d===21?LAV:dots.length?'rgba(139,92,246,0.12)':'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1}}>
            <span style={{fontSize:'0.43rem',color:d===21?W:'rgba(255,255,255,0.65)',fontWeight:d===21?700:400}}>{d}</span>
            {dots.length>0&&d!==21&&<div style={{display:'flex',gap:1}}>{dots.slice(0,2).map(c=><div key={c} style={{width:3,height:3,borderRadius:'50%',background:c}}/>)}</div>}
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {[['📅','Event',LAV],['🔔','Reminder','#F59E0B'],['🎂','Birthday','#FF00CC'],['💰','Payday','#00FF7A'],['💪','Gym','#00AAFF']].map(([em,la,c])=>(
          <div key={la as string} style={{padding:'3px 7px',borderRadius:20,background:`${c}18`,border:`1px solid ${c}40`,fontSize:'0.38rem',color:c as string}}>{em} {la}</div>
        ))}
      </div>
    </div>
  );
}

function MockBrowser() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:DRK}}>
      <div style={{padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:6}}>
        <div style={{display:'flex',gap:3}}>{['◀','▶','↻'].map(a=><div key={a} style={{fontSize:'0.5rem',color:'rgba(255,255,255,0.25)'}}>{a}</div>)}</div>
        <div style={{flex:1,padding:'3px 8px',background:'rgba(255,255,255,0.06)',borderRadius:20,fontSize:'0.38rem',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>https://www.google.com</div>
      </div>
      <div style={{flex:1,background:W,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:'16px'}}>
        <div style={{fontSize:'1.6rem',fontWeight:700}}>
          <span style={{color:'#4285F4'}}>G</span><span style={{color:'#EA4335'}}>o</span><span style={{color:'#FBBC05'}}>o</span><span style={{color:'#4285F4'}}>g</span><span style={{color:'#34A853'}}>l</span><span style={{color:'#EA4335'}}>e</span>
        </div>
        <div style={{width:'80%',padding:'7px 14px',borderRadius:24,border:'1px solid rgba(0,0,0,0.18)',display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:'0.5rem',color:'rgba(0,0,0,0.35)',flex:1}}>Search Google</span>
          <span style={{fontSize:'0.55rem'}}>🎤</span>
        </div>
      </div>
    </div>
  );
}

function MockSkins() {
  const skins=[{n:'Aurora',a:'#00f0ff',b:'#ff00f0'},{n:'Night Sky',a:'#0B1026',b:'#6D5ACF'},{n:'Cherry',a:'#FFB7C5',b:'#FF69B4'},{n:'Neon Mint',a:'#00FF9F',b:'#00AAFF'},{n:'Sunset',a:'#FF6B6B',b:'#FFD700'},{n:'Cosmic',a:'#4B0082',b:'#FF69B4'},{n:'Ocean',a:'#006994',b:'#00BFFF'},{n:'Lavender',a:LAV,b:LAV3},{n:'Forest',a:'#228B22',b:'#90EE90'}];
  return (
    <div style={{padding:'10px',height:'100%',display:'flex',flexDirection:'column',gap:8,background:DRK}}>
      <div style={{fontSize:'0.76rem',fontWeight:800,color:W}}>choose your skin</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,flex:1}}>
        {skins.map((sk,i)=>(
          <div key={sk.n} style={{borderRadius:8,overflow:'hidden',border:i===0?`2px solid ${LAV}`:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',position:'relative'}}>
            <div style={{height:'72%',background:`linear-gradient(135deg,${sk.a},${sk.b})`}}/>
            <div style={{height:'28%',background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:'0.36rem',color:'rgba(255,255,255,0.7)'}}>{sk.n}</span>
            </div>
            {i===0&&<div style={{position:'absolute',top:3,right:3,width:10,height:10,borderRadius:'50%',background:LAV,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.32rem',color:W}}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Password check ───────────────────────────────────────────────────────────
function PwCheck({label,met}: {label:string;met:boolean}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.7rem',color:met?'#16A34A':GRY,transition:'color 0.2s'}}>
      <span>{met?'✓':'○'}</span>{label}
    </div>
  );
}

// ─── Slide definition ─────────────────────────────────────────────────────────
interface SlideData {
  id: string;
  label: string;
}
const SLIDES: SlideData[] = [
  {id:'hero',    label:'Home'},
  {id:'dash',    label:'Dashboard'},
  {id:'calendar',label:'Calendar'},
  {id:'apps',    label:'Apps'},
  {id:'browser', label:'Browser'},
  {id:'skins',   label:'Skins'},
  {id:'features',label:'Features'},
  {id:'pricing', label:'Pricing'},
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate   = useNavigate();
  const {setIsPremium} = useStore();
  const isFirstTime = !hasAnyUser();
  const [mode,     setMode]     = useState<Mode>(isFirstTime ? 'create' : 'sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installable,   setInstallable]   = useState(false);
  const [installed,     setInstalled]     = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub') === 'success') { setIsPremium(true); window.history.replaceState({}, '', window.location.pathname); }
    if (window.matchMedia('(display-mode: standalone)').matches) { setInstalled(true); return; }
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setInstallable(true); };
    window.addEventListener('beforeinstallprompt', h as EventListener);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallable(false); });
    return () => window.removeEventListener('beforeinstallprompt', h as EventListener);
  }, []);

  // Touch/drag swipe support
  const touchStart = useRef<number|null>(null);
  function onTouchStart(x: number) { touchStart.current = x; }
  function onTouchEnd(x: number) {
    if (touchStart.current === null) return;
    const diff = touchStart.current - x;
    if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev();
    touchStart.current = null;
  }

  function goPrev() { setCurrent(c => Math.max(0, c-1)); }
  function goNext() { setCurrent(c => Math.min(SLIDES.length-1, c+1)); }

  async function handleInstall() {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    const {outcome} = await (installPrompt as any).userChoice;
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
    width:'100%', boxSizing:'border-box', padding:'13px 16px',
    borderRadius:10, border:'1.5px solid rgba(0,0,0,0.13)',
    background:W, color:'#111', fontSize:'0.93rem', outline:'none',
  };

  // ─── SLIDES CONTENT ──────────────────────────────────────────────────────────

  // Hero slide
  const heroSlide = (
    <div style={{display:'flex',height:'100%',alignItems:'center',justifyContent:'center',gap:60,padding:'40px 80px',background:W}}>
      {/* Left: block letters */}
      <div style={{flex:'1.2',minWidth:0}}>
        <div style={{fontSize:'0.6rem',color:GRY,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:16}}>by CLC Premier Studios</div>
        <h1 style={{fontSize:'clamp(56px,12vw,160px)',fontWeight:900,letterSpacing:'-0.05em',lineHeight:0.88,margin:'0 0 10px',WebkitTextStroke:`3px ${LAV}`,color:'transparent'}}>
          calendi
        </h1>
        <h1 style={{fontSize:'clamp(56px,12vw,160px)',fontWeight:900,letterSpacing:'-0.05em',lineHeight:0.88,margin:'-0.82em 0 24px',color:LAV,opacity:0.07,pointerEvents:'none',userSelect:'none'}}>
          calendi
        </h1>
        <div style={{width:56,height:4,borderRadius:2,background:LAV,marginBottom:20}}/>
        <p style={{fontSize:'clamp(0.95rem,1.6vw,1.2rem)',color:GRY,maxWidth:460,lineHeight:1.7,marginBottom:32,fontWeight:300}}>
          The calendar that does everything. Stream, socialize, plan, work, and play — all in one place.
        </p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button onClick={()=>setCurrent(0)} style={{padding:'13px 28px',borderRadius:10,background:LAV,color:W,border:'none',fontWeight:800,fontSize:'0.92rem',cursor:'pointer'}}>
            {isFirstTime?'Create Free Account':'Sign In'}
          </button>
          <button onClick={()=>setCurrent(1)} style={{padding:'13px 28px',borderRadius:10,background:'transparent',color:LAV,border:`1.5px solid ${LAV2}50`,fontWeight:600,fontSize:'0.92rem',cursor:'pointer'}}>
            Explore →
          </button>
        </div>
      </div>
      {/* Right: auth form */}
      <div style={{flex:'0.9',minWidth:0,maxWidth:400}}>
        <div style={{background:W,border:'1.5px solid rgba(0,0,0,0.09)',borderRadius:20,padding:'34px 30px',boxShadow:'0 16px 60px rgba(124,58,237,0.12)'}}>
          <h3 style={{fontSize:'1.35rem',fontWeight:900,letterSpacing:'-0.03em',margin:'0 0 5px',textAlign:'center',color:B}}>
            {mode==='create'?'Create your account':'Welcome back'}
          </h3>
          <p style={{textAlign:'center',color:GRY,fontSize:'0.82rem',marginBottom:22}}>
            {mode==='create'?'Free forever. No credit card needed.':'Sign in to continue.'}
          </p>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:13}}>
            <div>
              <label style={{display:'block',fontSize:'0.7rem',fontWeight:700,marginBottom:5,color:'#333',letterSpacing:'0.06em'}}>USERNAME</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="yourname" required autoComplete="username" style={inp}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.7rem',fontWeight:700,marginBottom:5,color:'#333',letterSpacing:'0.06em'}}>PASSWORD</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder={mode==='create'?'8+ chars, A-Z, 0-9, special':'••••••••'}
                  required autoComplete={mode==='create'?'new-password':'current-password'}
                  style={{...inp,paddingRight:44}}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:GRY,cursor:'pointer',padding:4}}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
              {mode==='create'&&password.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 10px',marginTop:8,padding:'9px 11px',borderRadius:9,background:LAV4,border:'1px solid rgba(124,58,237,0.15)'}}>
                  <PwCheck label="8+ characters"   met={pwHasLen}/>
                  <PwCheck label="Uppercase"        met={pwHasUpper}/>
                  <PwCheck label="Number (0–9)"     met={pwHasNum}/>
                  <PwCheck label="Special char"     met={pwHasSpecial}/>
                </div>
              )}
            </div>
            {error&&<div style={{padding:'9px 12px',borderRadius:8,background:'#FEF2F2',border:'1px solid rgba(239,68,68,0.25)',color:'#DC2626',fontSize:'0.8rem'}}>{error}</div>}
            <button type="submit" disabled={loading} style={{padding:'13px',borderRadius:10,border:'none',background:loading?'rgba(124,58,237,0.4)':LAV,color:W,fontWeight:800,fontSize:'0.95rem',cursor:loading?'not-allowed':'pointer',marginTop:2}}>
              {loading?'Just a moment…':(mode==='create'?'Create Account — Free':'Sign In')}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:14,fontSize:'0.8rem',color:GRY}}>
            {mode==='create'?'Already have an account?':'New to Calendi?'}{' '}
            <button onClick={()=>{setMode(mode==='create'?'sign-in':'create');setError('');}} style={{background:'none',border:'none',color:LAV,fontWeight:700,cursor:'pointer',fontSize:'0.8rem'}}>
              {mode==='create'?'Sign in':'Create free account'}
            </button>
          </div>
          {installable&&!installed&&(
            <button onClick={handleInstall} style={{width:'100%',marginTop:12,padding:'10px',borderRadius:10,border:`1.5px solid rgba(124,58,237,0.3)`,background:LAV4,color:LAV,fontWeight:600,fontSize:'0.82rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <Download size={13}/> Install Calendi as an App
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Feature slide template (mockup + description, alternating)
  function featureSlide(visual: ReactNode, tag: string, headline: string, body: string, chips: string[], reverse = false) {
    const items = [
      <div key="visual" style={{flex:1,minWidth:0}}>{visual}</div>,
      <div key="text" style={{flex:1,minWidth:0,paddingLeft:reverse?0:20,paddingRight:reverse?20:0}}>
        <div style={{display:'inline-block',padding:'3px 12px',borderRadius:20,background:LAV4,border:`1px solid ${LAV2}40`,color:LAV,fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.1em',marginBottom:16}}>{tag}</div>
        <h2 style={{fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1.15,margin:'0 0 16px',color:B}} dangerouslySetInnerHTML={{__html:headline}}/>
        <p style={{fontSize:'0.95rem',color:GRY,lineHeight:1.75,marginBottom:chips.length?20:0}}>{body}</p>
        {chips.length>0&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {chips.map(c=><div key={c} style={{padding:'5px 14px',borderRadius:20,background:LAV4,border:`1px solid ${LAV2}30`,fontSize:'0.76rem',color:LAV,fontWeight:500}}>{c}</div>)}
          </div>
        )}
      </div>,
    ];
    return (
      <div style={{display:'flex',height:'100%',alignItems:'center',gap:60,padding:'40px 80px',background:W}}>
        {reverse ? items.reverse() : items}
      </div>
    );
  }

  // 8 promo features slide (black bg)
  const promoFeatures = [
    {icon:'🎬',title:'Streaming & Social Apps',desc:'Netflix, Disney+, Prime Video, YouTube, Facebook, Instagram, WhatsApp — all inside Calendi. One place, no tab-hopping.'},
    {icon:'▶️',title:'YouTube — In the Widget',desc:'Browse and watch YouTube directly in your Calendi dashboard. Full playback without ever switching apps.'},
    {icon:'🌐',title:'Built-in Browser',desc:'A full web browser inside your dashboard. Google, Canvas LMS, any site — no switching tabs or apps ever.'},
    {icon:'🎥',title:'Google Meet & Zoom',desc:'Start or join meetings instantly. Both Google Meet and Zoom are built right in — one tap to connect.'},
    {icon:'📝',title:'Notes — Always There',desc:'Sticky notes live right on your dashboard, always visible. No app to open. Just type and it stays.'},
    {icon:'🌈',title:'18 Skins — Color & Landscape',desc:'10 neon color themes and 8 animated landscapes — Aurora Borealis, Cherry Blossom, Night Sky & more.'},
    {icon:'🕐',title:'Clock, Timer & Calculator',desc:'Live clock, countdown timer, and a full calculator always on your dashboard. Everything you reach for.'},
    {icon:'🔒',title:'Private by Default',desc:'Your data stays on your device. No tracking, no selling data. Private and secure from sign-in.'},
  ];
  const featuresSlide = (
    <div style={{height:'100%',background:B,padding:'40px 60px',display:'flex',flexDirection:'column',justifyContent:'center',gap:24}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'0.65rem',color:LAV3,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:10}}>EVERYTHING INSIDE</div>
        <h2 style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:900,letterSpacing:'-0.03em',color:W,margin:0}}>Built for the way you actually live</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {promoFeatures.map(f=>(
          <div key={f.title} style={{border:'1.5px solid rgba(196,181,253,0.2)',borderRadius:14,padding:'20px 16px',background:'rgba(255,255,255,0.03)',display:'flex',flexDirection:'column',gap:10}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'4px 10px',borderRadius:7,border:'1.5px solid rgba(196,181,253,0.3)',background:'rgba(196,181,253,0.05)',alignSelf:'flex-start'}}>
              <span style={{fontSize:'0.85rem'}}>{f.icon}</span>
              <span style={{fontWeight:800,fontSize:'0.66rem',color:LAV3}}>{f.title}</span>
            </div>
            <p style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',lineHeight:1.6,margin:0}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Pricing slide
  const pricingSlide = (
    <div style={{height:'100%',background:LAV4,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 80px',gap:36}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'0.65rem',color:LAV,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:12}}>PRICING</div>
        <h2 style={{fontSize:'clamp(2rem,4vw,3.2rem)',fontWeight:900,letterSpacing:'-0.03em',margin:'0 0 10px',color:B}}>Start free. Stay free.</h2>
        <p style={{color:GRY,fontSize:'0.95rem',margin:0}}>Upgrade only if you want an ad-free experience.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,width:'100%',maxWidth:700}}>
        <div style={{background:W,border:'1.5px solid rgba(0,0,0,0.07)',borderRadius:20,padding:'34px 28px',boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
          <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:5,color:B}}>Free</div>
          <div style={{fontWeight:900,fontSize:'2.6rem',letterSpacing:'-0.04em',color:B,marginBottom:24}}>$0<span style={{fontSize:'1rem',fontWeight:400,color:GRY}}>/mo</span></div>
          {['Full calendar, planners & contacts','19 animated skins','Streaming, social & games','Browser, notes, clock & more','Supported by small ads'].map(p=>(
            <div key={p} style={{display:'flex',gap:10,marginBottom:11,fontSize:'0.85rem',color:GRY}}><span style={{color:LAV,fontWeight:700}}>✓</span>{p}</div>
          ))}
          <button onClick={()=>setCurrent(0)} style={{width:'100%',marginTop:16,padding:'13px',borderRadius:10,border:`1.5px solid ${LAV}`,background:W,color:LAV,fontWeight:700,fontSize:'0.92rem',cursor:'pointer'}}>
            Get Started Free
          </button>
        </div>
        <div style={{background:LAV,borderRadius:20,padding:'34px 28px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:14,right:14,padding:'3px 11px',borderRadius:20,background:'rgba(255,255,255,0.2)',color:W,fontSize:'0.55rem',fontWeight:700,letterSpacing:'0.12em'}}>PREMIUM</div>
          <div style={{fontWeight:800,fontSize:'1.1rem',marginBottom:5,color:W}}>Premium</div>
          <div style={{fontWeight:900,fontSize:'2.6rem',letterSpacing:'-0.04em',color:W,marginBottom:24}}>$4.99<span style={{fontSize:'1rem',fontWeight:400,color:'rgba(255,255,255,0.6)'}}>/mo</span></div>
          {['Everything in Free','Completely ad-free','Support CLC Premier Studios','Priority access to new features'].map(p=>(
            <div key={p} style={{display:'flex',gap:10,marginBottom:11,fontSize:'0.85rem',color:'rgba(255,255,255,0.82)'}}><span style={{color:W,fontWeight:700}}>✓</span>{p}</div>
          ))}
          <button style={{width:'100%',marginTop:16,padding:'13px',borderRadius:10,border:'none',background:W,color:LAV,fontWeight:800,fontSize:'0.92rem',cursor:'pointer'}}>
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );

  const slideContents: ReactNode[] = [
    heroSlide,
    featureSlide(<AppFrame h={360}><MockDashboard/></AppFrame>, 'YOUR DASHBOARD', 'Everything you need,<br/>beautifully organized', 'Your calendar, notes, clock, browser, apps, and calculator — all visible at once. No more hunting through apps.', ['📅 Calendar','📝 Notes','🕐 Clock','🧮 Calculator','🖼️ Photos']),
    featureSlide(<AppFrame h={360}><MockCalendar/></AppFrame>, 'SMART CALENDAR', 'Life organized.<br/>Nothing missed.', '55+ event types — birthdays, payday, gym, self-care, appointments, Date Night, trips and more. Color-coded and reminder-ready.', ['🎂 Birthdays','💰 Payday','💪 Gym','🌹 Date Night','✈️ Trips'], true),
    featureSlide(<AppFrame h={360}><MockApps/></AppFrame>, 'BUILT-IN APPS', 'Every app.<br/>One place.', 'Netflix, Disney+, Prime, Facebook, Instagram, WhatsApp, Gmail, Zoom — all open inside Calendi. No tab-switching ever.', ['🎬 Netflix','🎭 Disney+','📘 Facebook','📸 Instagram','💬 WhatsApp']),
    featureSlide(<AppFrame h={340}><MockBrowser/></AppFrame>, 'BUILT-IN BROWSER', 'Browse without<br/>leaving Calendi', 'A full web browser built right in. Google, Canvas LMS for classroom learning, YouTube, and any site — without switching tabs.', ['🌐 Google','🎓 Canvas LMS','▶️ YouTube','🔍 Any website'], true),
    featureSlide(<AppFrame h={340}><MockSkins/></AppFrame>, '19 BEAUTIFUL SKINS', 'Make it yours.<br/>Change it anytime.', '10 neon color themes and 9 animated landscape skins — Aurora Borealis, Cherry Blossom, Night Sky, Melted Skittles & more. One tap.', ['🌌 Aurora','🌸 Cherry Blossom','🌃 Night Sky','🍬 Melted Skittles']),
    featuresSlide,
    pricingSlide,
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',color:B,height:'100dvh',display:'flex',flexDirection:'column',overflow:'hidden',background:W}}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{flexShrink:0,zIndex:200,background:W,borderBottom:'1px solid rgba(0,0,0,0.07)',padding:'12px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontWeight:900,fontSize:'1.3rem',letterSpacing:'-0.04em',WebkitTextStroke:`1.5px ${LAV}`,color:'transparent'}}>calendi</span>

        {/* Dot navigation */}
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {SLIDES.map((s,i)=>(
            <button key={s.id} onClick={()=>setCurrent(i)} title={s.label} style={{
              width: i===current?28:8, height:8, borderRadius:4, border:'none', cursor:'pointer',
              background: i===current?LAV:`rgba(124,58,237,0.25)`,
              transition:'all 0.25s ease', padding:0,
            }}/>
          ))}
        </div>

        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {installed&&<span style={{fontSize:'0.72rem',color:GRY}}>✓ Installed</span>}
          <button onClick={()=>setCurrent(0)} style={{padding:'9px 20px',borderRadius:8,background:LAV,color:W,border:'none',fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>
            {mode==='create'?'Get Started':'Sign In'}
          </button>
        </div>
      </nav>

      {/* ── SLIDER ──────────────────────────────────────────────────────────── */}
      <div style={{flex:1,position:'relative',overflow:'hidden',minHeight:0}}
        onTouchStart={e=>onTouchStart(e.touches[0].clientX)}
        onTouchEnd={e=>onTouchEnd(e.changedTouches[0].clientX)}
        onMouseDown={e=>onTouchStart(e.clientX)}
        onMouseUp={e=>onTouchEnd(e.clientX)}
      >
        {/* Track */}
        <div ref={trackRef} style={{
          display:'flex', height:'100%',
          transform:`translateX(-${current * 100}%)`,
          transition:'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          willChange:'transform',
        }}>
          {slideContents.map((content, i) => (
            <div key={i} style={{width:'100%',flexShrink:0,height:'100%',overflow:'hidden'}}>
              {content}
            </div>
          ))}
        </div>

        {/* Left arrow */}
        {current > 0 && (
          <button onClick={goPrev} style={{
            position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',
            width:44,height:44,borderRadius:'50%',border:'1.5px solid rgba(124,58,237,0.25)',
            background:'rgba(255,255,255,0.92)',backdropFilter:'blur(8px)',
            color:LAV,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 4px 20px rgba(0,0,0,0.1)',zIndex:10,
          }}>
            <ChevronLeft size={22}/>
          </button>
        )}

        {/* Right arrow */}
        {current < SLIDES.length - 1 && (
          <button onClick={goNext} style={{
            position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',
            width:44,height:44,borderRadius:'50%',border:'1.5px solid rgba(124,58,237,0.25)',
            background:'rgba(255,255,255,0.92)',backdropFilter:'blur(8px)',
            color:LAV,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 4px 20px rgba(0,0,0,0.1)',zIndex:10,
          }}>
            <ChevronRight size={22}/>
          </button>
        )}

        {/* Slide label */}
        <div style={{position:'absolute',bottom:16,left:'50%',transform:'translateX(-50%)',fontSize:'0.7rem',color:GRY,letterSpacing:'0.12em',fontWeight:500,textTransform:'uppercase',zIndex:10,pointerEvents:'none'}}>
          {current+1} / {SLIDES.length} — {SLIDES[current].label}
        </div>
      </div>

      {/* ── LOGO BOTTOM BAR — always visible ────────────────────────────────── */}
      <div style={{
        flexShrink:0,
        background:W,
        borderTop:'1px solid rgba(0,0,0,0.07)',
        padding:'10px 40px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        gap:16,
        zIndex:200,
      }}>
        {/* Paint splatter logo */}
        <CLCPaintLogo size={72}/>

        {/* Outlined "calendi" lockup */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'clamp(1.2rem,3vw,2rem)',fontWeight:900,letterSpacing:'-0.04em',WebkitTextStroke:`2px ${LAV}`,color:'transparent',lineHeight:1}}>calendi</div>
          <div style={{fontSize:'0.58rem',color:LAV2,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',marginTop:2}}>CLC PREMIER STUDIOS</div>
        </div>

        {/* Copyright + install */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
          <span style={{fontSize:'0.68rem',color:GRY}}>© 2026 CLC Premier Studios. All rights reserved.</span>
          {installable&&!installed&&(
            <button onClick={handleInstall} style={{padding:'5px 14px',borderRadius:7,border:`1px solid ${LAV2}50`,background:LAV4,color:LAV,fontSize:'0.7rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
              <Download size={11}/> Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

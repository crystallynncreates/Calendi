import { useState, useRef, useEffect, type CSSProperties, type FormEvent, type RefObject, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';
import { useStore } from '../store';
import { CLCLogo } from '../components/CLCLogo';

type Mode = 'sign-in' | 'create';

// ─── Palette: WHITE base, BLACK accents, LAVENDER highlight ─────────────────
const B   = '#000000';
const W   = '#FFFFFF';
const LAV = '#7C3AED';
const LAV2 = '#8B5CF6';
const LAV3 = '#C4B5FD';
const LAV4 = '#EDE9FE';
const GRY = '#6B7280';
const DRK = '#06060F';   // app dark bg

// ─── Data ────────────────────────────────────────────────────────────────────
const FREE_PERKS = ['Full calendar, planners & contacts', '19 animated skins', 'Streaming, social, games & calls', 'Browser, notes, clock & more', 'Supported by small ads'];
const PRO_PERKS  = ['Everything in Free', 'Completely ad-free', 'Support CLC Premier Studios', 'Priority access to new features'];

const CALENDAR_DAYS: { d: number; dots: string[] }[] = [
  {d:1,dots:[]},{d:2,dots:['#AA00FF']},{d:3,dots:[]},{d:4,dots:['#FF00CC','#FF7A00']},
  {d:5,dots:[]},{d:6,dots:[]},{d:7,dots:['#00AAFF']},{d:8,dots:[]},{d:9,dots:['#00FF7A']},
  {d:10,dots:[]},{d:11,dots:['#FFE500']},{d:12,dots:[]},{d:13,dots:[]},
  {d:14,dots:['#FF00CC','#AA00FF']},{d:15,dots:['#FF7A00']},{d:16,dots:[]},
  {d:17,dots:[]},{d:18,dots:['#00FF7A']},{d:19,dots:[]},{d:20,dots:['#00AAFF','#FFE500']},
  {d:21,dots:[]},{d:22,dots:['#AA00FF']},{d:23,dots:[]},{d:24,dots:[]},
  {d:25,dots:['#FF00CC']},{d:26,dots:[]},{d:27,dots:['#00FF7A','#00AAFF']},
  {d:28,dots:[]},{d:29,dots:[]},{d:30,dots:['#FFE500']},{d:31,dots:[]},
];

const SAMPLE_EVENTS = [
  {emoji:'💪',title:'Gym',         time:'7:00am', color:'#00FF7A'},
  {emoji:'📍',title:'Dr. Appt',    time:'10:30am',color:'#AA00FF'},
  {emoji:'💰',title:'Payday',      time:'all day',color:'#00AAFF'},
  {emoji:'🌹',title:'Date Night',  time:'7:00pm', color:'#FF00CC'},
];

const PROMO_FEATURES = [
  {icon:'🎬',title:'Streaming & Social Apps',    desc:'Netflix, Disney+, Prime Video, YouTube, Facebook, Instagram, WhatsApp — all inside Calendi. One place, no bouncing between tabs.'},
  {icon:'▶️',title:'YouTube — In the Widget',     desc:'Browse and watch YouTube directly in your Calendi dashboard. Full playback, no switching apps, right where your day lives.'},
  {icon:'🌐',title:'Built-in Browser',            desc:'A full web browser inside your dashboard. Google, Canvas, research, any site — browse without ever leaving Calendi.'},
  {icon:'🎥',title:'Google Meet & Zoom',          desc:'Start or join meetings instantly. Google Meet and Zoom are built in — one click to a new meeting or join with a code.'},
  {icon:'📝',title:'Notes — Always There',        desc:'Sticky notes that live right on your dashboard, always visible. No app to open, no tab to find. Just type and it stays.'},
  {icon:'🌈',title:'18 Skins — Color & Landscape',desc:'10 neon color themes and 8 live animated landscapes — Aurora Borealis, Cherry Blossom, Night Sky, Melted Skittles & more.'},
  {icon:'🕐',title:'Clock, Timer & Calculator',   desc:'Live clock with date, countdown timer, and a full calculator always on your dashboard. Everything you reach for, right here.'},
  {icon:'🔒',title:'Private by Default',          desc:'Your data stays on your device. No tracking, no selling your data. Calendi is private and secure from the moment you sign in.'},
];

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, {threshold: 0.08});
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function Reveal({children, style, delay=0}: {children: ReactNode; style?: CSSProperties; delay?: number}) {
  const [ref, v] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{opacity: v?1:0, transform: v?'none':'translateY(32px)', transition:`opacity .7s ease ${delay}s,transform .7s ease ${delay}s`, ...style}}>
      {children}
    </div>
  );
}

// ─── App "window" frame wrapper ───────────────────────────────────────────────
function AppFrame({children, h=360}: {children: ReactNode; h?: number}) {
  return (
    <div style={{borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 24px 80px rgba(0,0,0,0.5)', height:h}}>
      <div style={{display:'flex',alignItems:'center',gap:5,padding:'8px 12px',background:'rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c=><div key={c} style={{width:8,height:8,borderRadius:'50%',background:c}}/>)}
        <div style={{flex:1,textAlign:'center'}}><div style={{width:80,height:4,borderRadius:2,background:'rgba(255,255,255,0.1)',margin:'0 auto'}}/></div>
      </div>
      <div style={{height:'calc(100% - 29px)',background:DRK,overflow:'hidden'}}>{children}</div>
    </div>
  );
}

// ─── Screenshot mockups ───────────────────────────────────────────────────────
function MockDashboard() {
  const wb = 'rgba(255,255,255,0.04)';
  const bd = 'rgba(255,255,255,0.07)';
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 0.75fr',gridTemplateRows:'1fr 1fr',gap:2,padding:2,height:'100%'}}>
      {/* Calendar spans both rows */}
      <div style={{gridRow:'1/3',background:wb,borderRadius:8,padding:'10px 10px',display:'flex',flexDirection:'column',gap:6,overflow:'hidden'}}>
        <div style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',fontWeight:700}}>CALENDAR</div>
        <div style={{fontSize:'0.82rem',fontWeight:800,color:W}}>August 2026</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1.5,marginBottom:2}}>
          {['S','M','T','W','T','F','S'].map(d=><div key={d} style={{textAlign:'center',fontSize:'0.33rem',color:'rgba(255,255,255,0.2)',fontWeight:600}}>{d}</div>)}
          {[0,1,2,3].map(i=><div key={i}/>)}
          {CALENDAR_DAYS.slice(0,24).map(({d,dots})=>(
            <div key={d} style={{aspectRatio:'1',borderRadius:2,background:d===21?LAV:dots.length?'rgba(139,92,246,0.12)':'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1}}>
              <span style={{fontSize:'0.38rem',color:d===21?W:'rgba(255,255,255,0.6)',fontWeight:d===21?700:400}}>{d}</span>
              {dots.length>0&&d!==21&&<div style={{display:'flex',gap:1}}>{dots.slice(0,2).map(c=><div key={c} style={{width:2.5,height:2.5,borderRadius:'50%',background:c}}/>)}</div>}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:2,flexWrap:'wrap',marginBottom:4}}>
          {[['Event',LAV],['Reminder','#F59E0B'],['Birthday','#FF00CC'],['Payday','#00FF7A']].map(([l,c])=>(
            <div key={l} style={{padding:'1px 5px',borderRadius:10,background:`${c}20`,fontSize:'0.3rem',color:c}}>{l}</div>
          ))}
        </div>
        <div style={{fontSize:'0.33rem',color:'rgba(255,255,255,0.25)',fontWeight:700,marginBottom:2}}>Today, Aug 21</div>
        {SAMPLE_EVENTS.slice(0,3).map(ev=>(
          <div key={ev.title} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 6px',borderRadius:4,background:`${ev.color}12`,borderLeft:`1.5px solid ${ev.color}`}}>
            <span style={{fontSize:'0.45rem'}}>{ev.emoji}</span>
            <span style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.7)',fontWeight:600}}>{ev.title}</span>
            <span style={{marginLeft:'auto',fontSize:'0.33rem',color:'rgba(255,255,255,0.3)'}}>{ev.time}</span>
          </div>
        ))}
      </div>
      {/* Notes top */}
      <div style={{background:wb,borderRadius:8,padding:'10px',border:`1px solid ${bd}`,overflow:'hidden'}}>
        <div style={{fontSize:'0.33rem',color:'rgba(255,255,255,0.2)',letterSpacing:'0.1em',fontWeight:700,marginBottom:4}}>NOTES</div>
        <div style={{fontSize:'0.55rem',fontWeight:700,color:W,marginBottom:4}}>untitled note</div>
        <div style={{fontSize:'0.4rem',color:'rgba(255,255,255,0.5)',lineHeight:1.5}}>Today is going to be a great day!</div>
      </div>
      {/* Photos top right */}
      <div style={{background:wb,borderRadius:8,border:`1px solid ${bd}`,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{fontSize:'0.33rem',color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em',fontWeight:700,padding:'6px 8px 0'}}>PHOTOS (1/20)</div>
        <div style={{flex:1,background:'linear-gradient(135deg,#1a1a2e 0%,#2d1b69 50%,#1a2a4a 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:'1.4rem',opacity:0.4}}>🖼️</span>
        </div>
      </div>
      {/* Clock bottom */}
      <div style={{background:wb,borderRadius:8,border:`1px solid ${bd}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
        <div style={{fontSize:'0.33rem',color:'rgba(255,255,255,0.18)',letterSpacing:'0.1em'}}>CLOCK</div>
        <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00AAFF',letterSpacing:'-0.04em',lineHeight:1}}>11:10</div>
        <div style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.3)'}}>Friday, Aug 21</div>
      </div>
      {/* Calculator bottom right */}
      <div style={{background:wb,borderRadius:8,border:`1px solid ${bd}`,padding:'6px',display:'flex',flexDirection:'column',gap:2}}>
        <div style={{fontSize:'0.3rem',color:'rgba(255,255,255,0.18)',letterSpacing:'0.08em',marginBottom:2}}>CALCULATOR</div>
        <div style={{textAlign:'right',fontSize:'0.7rem',color:W,padding:'1px 4px'}}>0</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
          {['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='].map((k,i)=>(
            <div key={i} style={{aspectRatio:'1',borderRadius:3,background:['÷','×','−','+','='].includes(k)?LAV:'rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.38rem',color:W}}>{k}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockApps() {
  const apps = [
    {n:'Netflix',  e:'🎬',c:'rgba(229,9,20,0.15)'},
    {n:'Disney+',  e:'✨',c:'rgba(17,60,207,0.15)'},
    {n:'Prime',    e:'📦',c:'rgba(0,168,224,0.1)'},
    {n:'Facebook', e:'👥',c:'rgba(24,119,242,0.12)'},
    {n:'Messages', e:'💬',c:'rgba(76,175,80,0.1)'},
    {n:'WhatsApp', e:'📱',c:'rgba(37,211,102,0.1)'},
    {n:'Phone',    e:'📞',c:'rgba(255,92,92,0.1)'},
    {n:'Instagram',e:'📸',c:'rgba(225,48,108,0.1)'},
  ];
  return (
    <div style={{padding:'8px',height:'100%',display:'flex',flexDirection:'column',gap:4}}>
      <div style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em',fontWeight:700}}>APPS</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,flex:1}}>
        {apps.map(a=>(
          <div key={a.n} style={{background:a.c,borderRadius:10,border:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,cursor:'pointer'}}>
            <span style={{fontSize:'1.5rem'}}>{a.e}</span>
            <span style={{fontSize:'0.42rem',color:'rgba(255,255,255,0.7)',fontWeight:600}}>{a.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCalendar() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column',padding:'10px',gap:6}}>
      <div style={{fontSize:'0.78rem',fontWeight:800,color:W}}>August 2026</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {['S','M','T','W','T','F','S'].map(d=><div key={d} style={{textAlign:'center',fontSize:'0.38rem',color:'rgba(255,255,255,0.25)',fontWeight:600}}>{d}</div>)}
        {[0,1,2,3].map(i=><div key={i}/>)}
        {CALENDAR_DAYS.slice(0,28).map(({d,dots})=>(
          <div key={d} style={{aspectRatio:'1',borderRadius:5,background:d===21?LAV:dots.length?'rgba(139,92,246,0.12)':'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1}}>
            <span style={{fontSize:'0.45rem',color:d===21?W:'rgba(255,255,255,0.65)',fontWeight:d===21?700:400}}>{d}</span>
            {dots.length>0&&d!==21&&<div style={{display:'flex',gap:1}}>{dots.slice(0,2).map(c=><div key={c} style={{width:3,height:3,borderRadius:'50%',background:c}}/>)}</div>}
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {[['📅','Event',LAV],['🔔','Reminder','#F59E0B'],['🎂','Birthday','#FF00CC'],['💰','Payday','#00FF7A'],['💪','Gym','#00AAFF'],['🛍️','Shopping','#FFE500']].map(([em,la,c])=>(
          <div key={la as string} style={{padding:'3px 8px',borderRadius:20,background:`${c}18`,border:`1px solid ${c}40`,fontSize:'0.4rem',color:c as string}}>{em} {la}</div>
        ))}
      </div>
      {/* Add event form */}
      <div style={{marginTop:'auto',background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'8px 10px',border:'1px solid rgba(139,92,246,0.3)',display:'flex',flexDirection:'column',gap:5}}>
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',background:'rgba(255,255,255,0.06)',borderRadius:6,border:'1px solid rgba(139,92,246,0.4)'}}>
          <span style={{fontSize:'0.7rem'}}>📅</span>
          <span style={{fontSize:'0.5rem',color:'rgba(255,255,255,0.35)'}}>Event title</span>
        </div>
        <div style={{display:'flex',gap:4}}>
          <div style={{padding:'4px 8px',borderRadius:6,background:'rgba(255,255,255,0.05)',fontSize:'0.42rem',color:'rgba(255,255,255,0.35)'}}>once</div>
          <div style={{display:'flex',alignItems:'center',gap:3,fontSize:'0.42rem',color:'rgba(255,255,255,0.35)'}}>☑ all day</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
          <div style={{padding:'4px 12px',borderRadius:6,background:'rgba(255,255,255,0.06)',fontSize:'0.42rem',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}>cancel</div>
          <div style={{padding:'4px 12px',borderRadius:6,background:'#2D8CFF',fontSize:'0.42rem',color:W,cursor:'pointer',fontWeight:700}}>save</div>
        </div>
      </div>
    </div>
  );
}

function MockBrowser() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'6px 10px',background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:6}}>
        <div style={{display:'flex',gap:3}}>{['◀','▶','↻'].map(a=><div key={a} style={{fontSize:'0.5rem',color:'rgba(255,255,255,0.25)',cursor:'pointer'}}>{a}</div>)}</div>
        <div style={{flex:1,padding:'3px 8px',background:'rgba(255,255,255,0.06)',borderRadius:20,fontSize:'0.4rem',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.08)'}}>
          https://www.google.com
        </div>
      </div>
      <div style={{flex:1,background:W,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:'16px'}}>
        <div style={{fontSize:'1.8rem',fontWeight:700,letterSpacing:'-0.02em'}}>
          <span style={{color:'#4285F4'}}>G</span>
          <span style={{color:'#EA4335'}}>o</span>
          <span style={{color:'#FBBC05'}}>o</span>
          <span style={{color:'#4285F4'}}>g</span>
          <span style={{color:'#34A853'}}>l</span>
          <span style={{color:'#EA4335'}}>e</span>
        </div>
        <div style={{width:'80%',padding:'8px 14px',borderRadius:24,border:'1px solid rgba(0,0,0,0.2)',background:W,display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:'0.55rem',color:'rgba(0,0,0,0.35)',flex:1}}>Search Google</span>
          <span style={{fontSize:'0.6rem'}}>🎤</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{padding:'5px 12px',borderRadius:4,background:'#F8F9FA',border:'1px solid rgba(0,0,0,0.1)',fontSize:'0.4rem',color:'rgba(0,0,0,0.5)',cursor:'pointer'}}>Google Search</div>
          <div style={{padding:'5px 12px',borderRadius:4,background:'#F8F9FA',border:'1px solid rgba(0,0,0,0.1)',fontSize:'0.4rem',color:'rgba(0,0,0,0.5)',cursor:'pointer'}}>{`I'm Feeling Lucky`}</div>
        </div>
      </div>
    </div>
  );
}

function MockMeet() {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        {['google meet','zoom'].map((t,i)=>(
          <div key={t} style={{flex:1,padding:'8px',textAlign:'center',fontSize:'0.5rem',fontWeight:700,color:i===0?W:'rgba(255,255,255,0.35)',background:i===0?'rgba(45,140,255,0.3)':'transparent',borderBottom:i===0?'2px solid #2D8CFF':'none',cursor:'pointer',textTransform:'capitalize'}}>{t}</div>
        ))}
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,padding:'20px'}}>
        <div style={{width:52,height:52,borderRadius:12,background:'linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>📹</div>
        <div style={{fontWeight:700,fontSize:'0.7rem',color:W}}>Google Meet</div>
        <div style={{fontSize:'0.45rem',color:'rgba(255,255,255,0.35)'}}>opens in a dedicated window</div>
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:6,marginTop:4}}>
          <div style={{padding:'8px',borderRadius:8,background:'rgba(0,137,123,0.25)',border:'1px solid rgba(0,137,123,0.4)',textAlign:'center',fontSize:'0.5rem',color:'rgba(255,255,255,0.8)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            📹 new meeting
          </div>
          <div style={{padding:'8px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',textAlign:'center',fontSize:'0.5rem',color:'rgba(255,255,255,0.6)',cursor:'pointer'}}>
            ↗ join a meeting
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPlanners() {
  return (
    <div style={{padding:'10px 12px',height:'100%',display:'flex',flexDirection:'column',gap:8}}>
      <div style={{fontSize:'0.78rem',fontWeight:800,color:W}}>planners</div>
      <div style={{display:'flex',gap:4,padding:'3px',background:'rgba(255,255,255,0.04)',borderRadius:8}}>
        {[['💕','Date Night'],['✈️','Trip Planner'],['⭐','Special Event']].map(([em,la],i)=>(
          <div key={la as string} style={{flex:1,padding:'5px 4px',borderRadius:6,background:i===1?'#2D8CFF':'transparent',textAlign:'center',fontSize:'0.4rem',color:i===1?W:'rgba(255,255,255,0.45)',fontWeight:i===1?700:400,cursor:'pointer'}}>{em} {la}</div>
        ))}
      </div>
      <div style={{fontSize:'0.42rem',color:'#2D8CFF',fontWeight:600}}>✈️ Plan travel & adventures</div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {[['title *','text'],['mm/dd/yyyy','text'],['📍 location','text'],['$ budget','text'],['notes...','textarea']].map(([ph,_t],i)=>(
          <div key={i} style={{padding:'7px 10px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',fontSize:'0.45rem',color:'rgba(255,255,255,0.3)'}}>{ph}</div>
        ))}
      </div>
      <div style={{display:'flex',gap:6,marginTop:'auto'}}>
        <div style={{flex:1,padding:'7px',borderRadius:8,background:'rgba(255,255,255,0.06)',textAlign:'center',fontSize:'0.48rem',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}>cancel</div>
        <div style={{flex:2,padding:'7px',borderRadius:8,background:'#2D8CFF',textAlign:'center',fontSize:'0.48rem',color:W,fontWeight:700,cursor:'pointer'}}>create</div>
      </div>
    </div>
  );
}

function MockSkins() {
  const skins = [
    {n:'Aurora',    a:'#00f0ff',b:'#ff00f0'},
    {n:'Night Sky', a:'#0B1026',b:'#6D5ACF'},
    {n:'Cherry',    a:'#FFB7C5',b:'#FF69B4'},
    {n:'Neon Mint', a:'#00FF9F',b:'#00AAFF'},
    {n:'Sunset',    a:'#FF6B6B',b:'#FFD700'},
    {n:'Cosmic',    a:'#4B0082',b:'#FF69B4'},
    {n:'Ocean',     a:'#006994',b:'#00BFFF'},
    {n:'Lavender',  a:LAV,      b:LAV3},
    {n:'Forest',    a:'#228B22',b:'#90EE90'},
  ];
  return (
    <div style={{padding:'10px',height:'100%',display:'flex',flexDirection:'column',gap:8}}>
      <div style={{fontSize:'0.78rem',fontWeight:800,color:W}}>choose your skin</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,flex:1}}>
        {skins.map((sk,i)=>(
          <div key={sk.n} style={{borderRadius:8,overflow:'hidden',border:i===0?`2px solid ${LAV}`:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',position:'relative'}}>
            <div style={{height:'72%',background:`linear-gradient(135deg,${sk.a},${sk.b})`}}/>
            <div style={{height:'28%',background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:'0.38rem',color:'rgba(255,255,255,0.7)'}}>{sk.n}</span>
            </div>
            {i===0&&<div style={{position:'absolute',top:3,right:3,width:10,height:10,borderRadius:'50%',background:LAV,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.35rem',color:W}}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Password check ───────────────────────────────────────────────────────────
function PwCheck({label, met}: {label: string; met: boolean}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.7rem',color:met?'#16A34A':GRY,transition:'color 0.2s'}}>
      <span>{met?'✓':'○'}</span>{label}
    </div>
  );
}

// ─── Feature section (alternating L/R) ───────────────────────────────────────
function FeatureSection({visual, tag, headline, body, chips=[], reverse=false, delay=0}: {
  visual: ReactNode; tag: string; tagColor: string; headline: string; body: string;
  chips?: string[]; reverse?: boolean; delay?: number;
}) {
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'0 40px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:60,alignItems:'center',direction: reverse ? 'rtl' as const : 'ltr' as const}}>
      <Reveal style={{direction:'ltr'}}>{visual}</Reveal>
      <Reveal delay={delay} style={{direction:'ltr'}}>
        <div style={{display:'inline-block',padding:'3px 12px',borderRadius:20,background:LAV4,border:`1px solid ${LAV2}40`,color:LAV,fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.1em',marginBottom:16}}>{tag}</div>
        <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1.15,margin:'0 0 18px',color:B}} dangerouslySetInnerHTML={{__html:headline}}/>
        <p style={{fontSize:'1rem',color:GRY,lineHeight:1.75,marginBottom:chips.length?24:0}}>{body}</p>
        {chips.length>0&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {chips.map(c=><div key={c} style={{padding:'5px 14px',borderRadius:20,background:LAV4,border:`1px solid ${LAV2}30`,fontSize:'0.78rem',color:LAV,fontWeight:500}}>{c}</div>)}
          </div>
        )}
      </Reveal>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const {setIsPremium} = useStore();
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sub') === 'success') { setIsPremium(true); window.history.replaceState({}, '', window.location.pathname); }
    if (window.matchMedia('(display-mode: standalone)').matches) { setInstalled(true); return; }
    const h = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setInstallable(true); };
    window.addEventListener('beforeinstallprompt', h as EventListener);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallable(false); });
    return () => window.removeEventListener('beforeinstallprompt', h as EventListener);
  }, []);

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
  const pwHasSpecial = /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

  const inp: CSSProperties = {
    width:'100%', boxSizing:'border-box', padding:'13px 16px',
    borderRadius:10, border:'1.5px solid rgba(0,0,0,0.13)',
    background:W, color:'#111', fontSize:'0.93rem', outline:'none',
  };

  // Section spacer
  const sec = (bg=W, pt=100, pb=100): CSSProperties => ({background:bg, padding:`${pt}px 0 ${pb}px`});

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',color:B,overflowX:'hidden',background:W}}>

      {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,background:'rgba(255,255,255,0.94)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,0.07)',padding:'14px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontWeight:900,fontSize:'1.35rem',letterSpacing:'-0.04em',color:LAV}}>calendi</span>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          {installable&&!installed&&(
            <button onClick={handleInstall} style={{padding:'8px 16px',borderRadius:8,border:`1.5px solid ${LAV2}`,background:LAV4,color:LAV,fontSize:'0.8rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              <Download size={13}/> Install App
            </button>
          )}
          {installed&&<span style={{fontSize:'0.75rem',color:GRY}}>✓ Installed</span>}
          <button onClick={()=>go('get-started')} style={{padding:'10px 22px',borderRadius:8,background:LAV,color:W,border:'none',fontWeight:700,fontSize:'0.88rem',cursor:'pointer'}}>
            {mode==='create'?'Get Started Free':'Sign In'}
          </button>
        </div>
      </nav>

      {/* ══ HERO — white bg, outlined block "calendi" + auth form ═══════════ */}
      <section style={{...sec(W,120,80),borderTop:'none'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 40px',display:'grid',gridTemplateColumns:'minmax(0,1.3fr) minmax(0,1fr)',gap:60,alignItems:'center',marginTop:80}}>

          {/* Left: block letters + tagline */}
          <div>
            <div style={{marginBottom:16}}><CLCLogo size={56}/></div>
            <div style={{fontSize:'0.65rem',color:GRY,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:20}}>by CLC Premier Studios</div>

            {/* Outlined block letters — art style */}
            <h1 style={{
              fontSize:'clamp(72px,14vw,180px)',
              fontWeight:900,
              letterSpacing:'-0.05em',
              lineHeight:0.88,
              margin:'0 0 12px',
              WebkitTextStroke:`3px ${LAV}`,
              color:'transparent',
            }}>
              calendi
            </h1>
            {/* Filled version below — layered effect */}
            <h1 style={{
              fontSize:'clamp(72px,14vw,180px)',
              fontWeight:900,
              letterSpacing:'-0.05em',
              lineHeight:0.88,
              margin:'-0.82em 0 28px',
              color:LAV,
              opacity:0.08,
              pointerEvents:'none',
              userSelect:'none',
            }}>
              calendi
            </h1>

            <div style={{width:60,height:4,borderRadius:2,background:LAV,marginBottom:24}}/>
            <p style={{fontSize:'clamp(1rem,2vw,1.3rem)',color:GRY,maxWidth:500,lineHeight:1.7,marginBottom:36,fontWeight:300}}>
              The calendar that does everything. Stream, socialize, plan, work, and play — all in one beautiful place.
            </p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <button onClick={()=>go('get-started')} style={{padding:'15px 32px',borderRadius:10,background:LAV,color:W,border:'none',fontWeight:800,fontSize:'1rem',cursor:'pointer'}}>
                {isFirstTime?'Create Free Account':'Sign In'}
              </button>
              <button onClick={()=>go('features')} style={{padding:'15px 32px',borderRadius:10,background:'transparent',color:LAV,border:`1.5px solid ${LAV2}50`,fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>
                Explore Features ↓
              </button>
            </div>
          </div>

          {/* Right: auth form */}
          <div id="get-started">
            <div style={{background:W,border:'1.5px solid rgba(0,0,0,0.09)',borderRadius:20,padding:'36px 32px',boxShadow:'0 16px 60px rgba(124,58,237,0.12)'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:14}}><CLCLogo size={48}/></div>
              <h3 style={{fontSize:'1.45rem',fontWeight:900,letterSpacing:'-0.03em',margin:'0 0 6px',textAlign:'center',color:B}}>
                {mode==='create'?'Create your account':'Welcome back'}
              </h3>
              <p style={{textAlign:'center',color:GRY,fontSize:'0.84rem',marginBottom:26}}>
                {mode==='create'?'Free forever. No credit card needed.':'Sign in to continue to Calendi.'}
              </p>

              <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
                <div>
                  <label style={{display:'block',fontSize:'0.72rem',fontWeight:700,marginBottom:6,color:'#333',letterSpacing:'0.06em'}}>USERNAME</label>
                  <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="yourname" required autoComplete="username" style={inp}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'0.72rem',fontWeight:700,marginBottom:6,color:'#333',letterSpacing:'0.06em'}}>PASSWORD</label>
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
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px 12px',marginTop:9,padding:'10px 12px',borderRadius:9,background:LAV4,border:'1px solid rgba(124,58,237,0.15)'}}>
                      <PwCheck label="8+ characters"    met={pwHasLen}/>
                      <PwCheck label="Uppercase letter"  met={pwHasUpper}/>
                      <PwCheck label="Number (0–9)"      met={pwHasNum}/>
                      <PwCheck label="Special character" met={pwHasSpecial}/>
                    </div>
                  )}
                </div>
                {error&&<div style={{padding:'10px 13px',borderRadius:8,background:'#FEF2F2',border:'1px solid rgba(239,68,68,0.25)',color:'#DC2626',fontSize:'0.82rem'}}>{error}</div>}
                <button type="submit" disabled={loading} style={{padding:'14px',borderRadius:10,border:'none',background:loading?'rgba(124,58,237,0.4)':LAV,color:W,fontWeight:800,fontSize:'0.98rem',cursor:loading?'not-allowed':'pointer',transition:'background 0.2s',marginTop:2}}>
                  {loading?'Just a moment…':(mode==='create'?'Create Account — Free':'Sign In')}
                </button>
              </form>

              <div style={{textAlign:'center',marginTop:16,fontSize:'0.83rem',color:GRY}}>
                {mode==='create'?'Already have an account?':'New to Calendi?'}{' '}
                <button onClick={()=>{setMode(mode==='create'?'sign-in':'create');setError('');}} style={{background:'none',border:'none',color:LAV,fontWeight:700,cursor:'pointer',fontSize:'0.83rem'}}>
                  {mode==='create'?'Sign in':'Create a free account'}
                </button>
              </div>
              {installable&&!installed&&(
                <button onClick={handleInstall} style={{width:'100%',marginTop:14,padding:'11px',borderRadius:10,border:`1.5px solid rgba(124,58,237,0.3)`,background:LAV4,color:LAV,fontWeight:600,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <Download size={14}/> Install Calendi as an App
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS — LAVENDER BAND ═════════════════════════════════════════════ */}
      <section style={{background:LAV,padding:'36px 40px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:24,textAlign:'center'}}>
          {[['55+','Event Types'],['19','Beautiful Skins'],['12+','Built-in Apps'],['1','Unified Dashboard']].map(([num,lbl])=>(
            <div key={lbl}>
              <div style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:W,letterSpacing:'-0.03em',lineHeight:1}}>{num}</div>
              <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.72)',fontWeight:500,marginTop:4}}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURE SECTIONS — white bg, alternating ═════════════════════════ */}
      <div id="features">

        {/* 1. Dashboard */}
        <section style={sec(W,80,80)}>
          <FeatureSection
            visual={<AppFrame h={380}><MockDashboard/></AppFrame>}
            tag="YOUR DASHBOARD"
            tagColor={LAV}
            headline="Everything you need,<br/>beautifully organized"
            body="Your calendar, notes, clock, browser, apps, and calculator — all visible at once on one gorgeous dashboard. No more hunting through apps."
            chips={['📅 Calendar','📝 Notes','🕐 Clock','🧮 Calculator','🖼️ Photos']}
          />
        </section>

        {/* 2. Apps — reversed */}
        <section style={sec('#F8F7FF',80,80)}>
          <FeatureSection reverse
            visual={<AppFrame h={380}><MockApps/></AppFrame>}
            tag="BUILT-IN APPS"
            tagColor={LAV}
            headline="Every app.<br/>One place."
            body="Netflix, Disney+, Prime Video, Facebook, Instagram, WhatsApp, Gmail, Zoom — all open inside Calendi in a focused panel. No tab-switching, ever."
            chips={['🎬 Netflix','🎭 Disney+','📘 Facebook','📸 Instagram','💬 WhatsApp','✉️ Gmail']}
            delay={0.1}
          />
        </section>

        {/* 3. Calendar */}
        <section style={sec(W,80,80)}>
          <FeatureSection
            visual={<AppFrame h={420}><MockCalendar/></AppFrame>}
            tag="SMART CALENDAR"
            tagColor={LAV}
            headline="Life organized.<br/>Nothing missed."
            body="55+ event types — birthdays, payday, gym, self-care, appointments, shopping, Date Night, trips and more. Color-coded, reminder-ready, and always in view."
            chips={['🎂 Birthdays','💰 Payday','💪 Gym','🧘 Self-Care','✈️ Trips','🌹 Date Night']}
            delay={0.1}
          />
        </section>

        {/* 4. Browser + Canvas — reversed */}
        <section style={sec('#F8F7FF',80,80)}>
          <FeatureSection reverse
            visual={<AppFrame h={360}><MockBrowser/></AppFrame>}
            tag="BUILT-IN BROWSER"
            tagColor={LAV}
            headline="Browse without<br/>leaving Calendi"
            body="A full web browser built right into your dashboard. Google, Canvas LMS for classroom learning, YouTube, and any site — all without switching tabs or apps."
            chips={['🌐 Google','🎓 Canvas LMS','▶️ YouTube','🗺️ Google Maps','🔍 Any website']}
            delay={0.1}
          />
        </section>

        {/* 5. Meet & Zoom */}
        <section style={sec(W,80,80)}>
          <FeatureSection
            visual={<AppFrame h={340}><MockMeet/></AppFrame>}
            tag="VIDEO CALLS"
            tagColor={LAV}
            headline="Google Meet & Zoom,<br/>always ready"
            body="Start or join meetings instantly. Both Google Meet and Zoom are built right in — one tap to start a new meeting or join with a code. No separate app needed."
            chips={['🎥 Google Meet','📹 Zoom','📋 New meeting','🔗 Join by code']}
            delay={0.1}
          />
        </section>

        {/* 6. Planners — reversed */}
        <section style={sec('#F8F7FF',80,80)}>
          <FeatureSection reverse
            visual={<AppFrame h={380}><MockPlanners/></AppFrame>}
            tag="PLANNERS"
            tagColor={LAV}
            headline="Plan the moments<br/>that matter"
            body="Date Night, Trip Planner, and Special Event planners with full forms — title, dates, location, budget, and notes. Your big moments, beautifully organized."
            chips={['🌹 Date Night','✈️ Trip Planner','⭐ Special Event']}
            delay={0.1}
          />
        </section>

        {/* 7. Skins */}
        <section style={sec(W,80,80)}>
          <FeatureSection
            visual={<AppFrame h={340}><MockSkins/></AppFrame>}
            tag="19 BEAUTIFUL SKINS"
            tagColor={LAV}
            headline="Make it yours.<br/>Change it anytime."
            body="10 neon color themes and 9 live animated landscape skins — Aurora Borealis, Cherry Blossom, Night Sky, Melted Skittles, Cosmic and more. Switch in one tap."
            chips={['🌌 Aurora','🌸 Cherry Blossom','🌃 Night Sky','🍬 Melted Skittles','🪐 Cosmic']}
            delay={0.1}
          />
        </section>

      </div>

      {/* ══ BLACK PROMO GRID — outlined feature cards ════════════════════════ */}
      <section style={{background:B,padding:'100px 40px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <Reveal style={{textAlign:'center',marginBottom:60}}>
            <div style={{fontSize:'0.68rem',color:LAV3,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:14}}>EVERYTHING INSIDE</div>
            <h2 style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:900,letterSpacing:'-0.03em',color:W,margin:'0 0 16px'}}>
              Built for the way you actually live
            </h2>
            <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.5)',maxWidth:520,margin:'0 auto'}}>
              Every feature you need — no downloads, no subscriptions for the basics, no hopping between apps.
            </p>
          </Reveal>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:20}}>
            {PROMO_FEATURES.map((f,i)=>(
              <Reveal key={f.title} delay={i*0.04} style={{
                border:'1.5px solid rgba(196,181,253,0.2)',
                borderRadius:16,
                padding:'26px 22px',
                background:'rgba(255,255,255,0.03)',
                display:'flex',flexDirection:'column',gap:12,
              }}>
                {/* Outlined header badge */}
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 12px',borderRadius:8,border:'1.5px solid rgba(196,181,253,0.35)',background:'rgba(196,181,253,0.06)',alignSelf:'flex-start'}}>
                  <span style={{fontSize:'0.9rem'}}>{f.icon}</span>
                  <span style={{fontWeight:800,fontSize:'0.72rem',color:LAV3,letterSpacing:'0.01em'}}>{f.title}</span>
                </div>
                <p style={{fontSize:'0.84rem',color:'rgba(255,255,255,0.55)',lineHeight:1.65,margin:0}}>{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING — pale lavender ══════════════════════════════════════════ */}
      <section style={sec(LAV4,100,100)}>
        <div style={{maxWidth:780,margin:'0 auto',padding:'0 40px'}}>
          <Reveal style={{textAlign:'center',marginBottom:52}}>
            <div style={{fontSize:'0.68rem',color:LAV,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:12}}>PRICING</div>
            <h2 style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:900,letterSpacing:'-0.03em',margin:0,color:B}}>Start free. Stay free.</h2>
          </Reveal>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
            <Reveal style={{background:W,border:'1.5px solid rgba(0,0,0,0.07)',borderRadius:20,padding:'36px 30px',boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
              <div style={{fontWeight:800,fontSize:'1.2rem',marginBottom:6,color:B}}>Free</div>
              <div style={{fontWeight:900,fontSize:'2.8rem',letterSpacing:'-0.04em',color:B,marginBottom:28}}>$0<span style={{fontSize:'1.1rem',fontWeight:400,color:GRY}}>/mo</span></div>
              {FREE_PERKS.map(p=>(
                <div key={p} style={{display:'flex',gap:10,marginBottom:12,fontSize:'0.87rem',color:GRY}}>
                  <span style={{color:LAV,fontWeight:700}}>✓</span>{p}
                </div>
              ))}
              <button onClick={()=>go('get-started')} style={{width:'100%',marginTop:20,padding:'14px',borderRadius:10,border:`1.5px solid ${LAV}`,background:W,color:LAV,fontWeight:700,fontSize:'0.95rem',cursor:'pointer'}}>
                Get Started Free
              </button>
            </Reveal>
            <Reveal delay={0.1} style={{background:LAV,border:`1.5px solid ${LAV}`,borderRadius:20,padding:'36px 30px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:16,right:16,padding:'3px 12px',borderRadius:20,background:'rgba(255,255,255,0.2)',color:W,fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.12em'}}>PREMIUM</div>
              <div style={{fontWeight:800,fontSize:'1.2rem',marginBottom:6,color:W}}>Premium</div>
              <div style={{fontWeight:900,fontSize:'2.8rem',letterSpacing:'-0.04em',color:W,marginBottom:28}}>$4.99<span style={{fontSize:'1.1rem',fontWeight:400,color:'rgba(255,255,255,0.6)'}}>/mo</span></div>
              {PRO_PERKS.map(p=>(
                <div key={p} style={{display:'flex',gap:10,marginBottom:12,fontSize:'0.87rem',color:'rgba(255,255,255,0.82)'}}>
                  <span style={{color:W,fontWeight:700}}>✓</span>{p}
                </div>
              ))}
              <button style={{width:'100%',marginTop:20,padding:'14px',borderRadius:10,border:'none',background:W,color:LAV,fontWeight:800,fontSize:'0.95rem',cursor:'pointer'}}>
                Upgrade to Premium
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FOOTER — black + BIG outlined block letters ══════════════════════ */}
      <footer style={{background:B,overflow:'hidden'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'52px 40px 36px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <CLCLogo size={38}/>
            <span style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.28)'}}>© 2026 CLC Premier Studios</span>
          </div>
          <div style={{display:'flex',gap:28}}>
            {['Privacy','Terms','Support'].map(l=><span key={l} style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.28)',cursor:'pointer'}}>{l}</span>)}
          </div>
        </div>

        {/* Art-style block letters — outlined / stroke */}
        <div style={{padding:'52px 32px 0',overflow:'hidden',lineHeight:0.85}}>
          {/* "calendi" — outlined stroke art block letters */}
          <div style={{
            fontSize:'clamp(72px,19vw,240px)',
            fontWeight:900,
            letterSpacing:'-0.05em',
            WebkitTextStroke:`4px ${LAV}`,
            color:'transparent',
            whiteSpace:'nowrap',
          }}>
            calendi
          </div>
          <div style={{height:3,background:`linear-gradient(90deg,${LAV},${LAV3},${LAV})`,margin:'8px 0 0'}}/>
          <div style={{
            fontSize:'clamp(18px,5.5vw,80px)',
            fontWeight:900,
            letterSpacing:'-0.02em',
            color:LAV2,
            whiteSpace:'nowrap',
            paddingBottom:44,
            marginTop:8,
          }}>
            CLC PREMIER STUDIOS
          </div>
        </div>
      </footer>

    </div>
  );
}

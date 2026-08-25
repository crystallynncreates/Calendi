import { useState, type ReactNode } from 'react';
import { useStore, getSkinColors } from '../../store';
import type { AppEntry } from '../../types';

type Tab = 'stream' | 'social' | 'work' | 'games' | 'food';
type GameEntry = AppEntry & { tag: string };

/* ── Brand SVG logos ── */
function NetflixLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M5.398 0v24l3.386-9.291L12 24V0h-2.216v13.14L7.614 0H5.398zm11.204 0v24l-3.386-9.291L9.784 0v24H12V9.14l2.17 5.569V24h2.432V0z" fill="#E50914"/>
    </svg>
  );
}
function DisneyLogo() {
  return (
    <svg width="32" height="18" viewBox="0 0 60 24" fill="none">
      <text x="0" y="20" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill="#113CCF">Disney+</text>
    </svg>
  );
}
function PrimeLogo() {
  return (
    <svg width="32" height="18" viewBox="0 0 60 24" fill="none">
      <text x="0" y="18" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#00A8E0">prime</text>
      <text x="0" y="26" fontFamily="Arial,sans-serif" fontSize="8" fill="#00A8E0">video</text>
    </svg>
  );
}
function HuluLogo() {
  return (
    <svg width="32" height="18" viewBox="0 0 48 20" fill="none">
      <text x="0" y="16" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="bold" fill="#1CE783">hulu</text>
    </svg>
  );
}
function InstagramLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="25%" stopColor="#e6683c"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="75%" stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-g)"/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
      <circle cx="17" cy="7" r="1" fill="white"/>
    </svg>
  );
}
function FacebookLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z"/>
    </svg>
  );
}
function TikTokLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.05-7.91a8.12 8.12 0 004.77 1.52V5.46a4.85 4.85 0 01-1-.77z" fill="white"/>
    </svg>
  );
}
function XLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.262 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function PlayhopLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#FF5C5C"/>
      <polygon points="9,7 19,12 9,17" fill="white"/>
    </svg>
  );
}
function StarbucksLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#00704A"/>
      <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
      <text x="12" y="14.5" textAnchor="middle" fill="white" fontSize="5.5" fontFamily="Arial" fontWeight="bold">☕</text>
    </svg>
  );
}
function DunkinLogo() {
  return (
    <svg width="30" height="20" viewBox="0 0 60 24" fill="none">
      <text x="0" y="18" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#FF671F">Dunkin'</text>
    </svg>
  );
}
function UberEatsLogo() {
  return (
    <svg width="30" height="20" viewBox="0 0 60 24" fill="none">
      <text x="0" y="17" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="900" fill="#142328">Uber</text>
      <text x="0" y="27" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="700" fill="#06C167">Eats</text>
    </svg>
  );
}
function ShopRiteLogo() {
  return (
    <svg width="30" height="20" viewBox="0 0 60 24" fill="none">
      <text x="0" y="17" fontFamily="Arial,sans-serif" fontSize="10" fontWeight="900" fill="#CC0000">ShopRite</text>
    </svg>
  );
}

/* ── App entries ── */
const STREAM_APPS: AppEntry[] = [
  { id:'netflix',  name:'Netflix',   url:'https://netflix.com',       emoji:'N', color:'#E50914', bgColor:'rgba(229,9,20,0.1)',   borderColor:'rgba(229,9,20,0.3)',   canEmbed:false },
  { id:'disney',   name:'Disney+',   url:'https://disneyplus.com',    emoji:'D', color:'#113CCF', bgColor:'rgba(17,60,207,0.12)', borderColor:'rgba(17,60,207,0.3)',  canEmbed:false },
  { id:'prime',    name:'Prime',     url:'https://primevideo.com',    emoji:'P', color:'#00A8E0', bgColor:'rgba(0,168,224,0.1)',  borderColor:'rgba(0,168,224,0.3)',  canEmbed:false },
  { id:'hulu',     name:'Hulu',      url:'https://hulu.com',          emoji:'H', color:'#1CE783', bgColor:'rgba(28,231,131,0.1)', borderColor:'rgba(28,231,131,0.3)', canEmbed:false },
  { id:'youtube',  name:'YouTube',   url:'https://youtube.com',       emoji:'Y', color:'#FF0000', bgColor:'rgba(255,0,0,0.1)',   borderColor:'rgba(255,0,0,0.3)',    canEmbed:false },
  { id:'peacock',  name:'Peacock',   url:'https://peacocktv.com',     emoji:'🦚',color:'#F5A623', bgColor:'rgba(245,166,35,0.1)', borderColor:'rgba(245,166,35,0.3)', canEmbed:false },
];

const SOCIAL_APPS: AppEntry[] = [
  { id:'instagram',name:'Instagram', url:'https://instagram.com',     emoji:'I', color:'#E1306C', bgColor:'rgba(225,48,108,0.1)', borderColor:'rgba(225,48,108,0.3)', canEmbed:false },
  { id:'facebook', name:'Facebook',  url:'https://facebook.com',      emoji:'F', color:'#1877F2', bgColor:'rgba(24,119,242,0.1)', borderColor:'rgba(24,119,242,0.3)', canEmbed:false },
  { id:'tiktok',   name:'TikTok',    url:'https://tiktok.com',        emoji:'T', color:'#000000', bgColor:'rgba(0,0,0,0.15)',    borderColor:'rgba(255,255,255,0.15)',canEmbed:false },
  { id:'x',        name:'X',         url:'https://x.com',             emoji:'X', color:'#000000', bgColor:'rgba(0,0,0,0.15)',    borderColor:'rgba(255,255,255,0.15)',canEmbed:false },
  { id:'whatsapp', name:'WhatsApp',  url:'https://web.whatsapp.com',  emoji:'W', color:'#25D366', bgColor:'rgba(37,211,102,0.1)', borderColor:'rgba(37,211,102,0.3)', canEmbed:false },
  { id:'messages', name:'Messages',  url:'https://messages.google.com',emoji:'💬',color:'#4CAF50',bgColor:'rgba(76,175,80,0.1)', borderColor:'rgba(76,175,80,0.3)',  canEmbed:false },
];

const WORK_APPS: AppEntry[] = [
  { id:'gmail',    name:'Gmail',     url:'https://mail.google.com',   emoji:'G', color:'#EA4335', bgColor:'rgba(234,67,53,0.1)', borderColor:'rgba(234,67,53,0.3)',  canEmbed:false },
  { id:'outlook',  name:'Outlook',   url:'https://outlook.live.com',  emoji:'O', color:'#0078D4', bgColor:'rgba(0,120,212,0.12)',borderColor:'rgba(0,120,212,0.3)',  canEmbed:false },
  { id:'teams',    name:'Teams',     url:'https://teams.microsoft.com',emoji:'T', color:'#6264A7', bgColor:'rgba(98,100,167,0.12)',borderColor:'rgba(98,100,167,0.3)',canEmbed:false },
  { id:'meet',     name:'Meet',      url:'https://meet.google.com',   emoji:'M', color:'#00897B', bgColor:'rgba(0,137,123,0.1)', borderColor:'rgba(0,137,123,0.3)',  canEmbed:false },
  { id:'zoom',     name:'Zoom',      url:'https://zoom.us',           emoji:'Z', color:'#2D8CFF', bgColor:'rgba(45,140,255,0.1)', borderColor:'rgba(45,140,255,0.3)', canEmbed:false },
  { id:'canvas',   name:'Canvas',    url:'https://canvas.instructure.com/login/canvas',emoji:'🎓',color:'#E66000',bgColor:'rgba(230,96,0,0.1)',borderColor:'rgba(230,96,0,0.3)',canEmbed:true },
  { id:'hsw',      name:'HowStuffWorks',url:'https://www.howstuffworks.com',emoji:'🔬',color:'#e25c04',bgColor:'rgba(226,92,4,0.1)',borderColor:'rgba(226,92,4,0.3)',canEmbed:true },
];

const GAME_ENTRIES: GameEntry[] = [
  { id:'playhop',   name:'Playhop',      tag:'Featured', url:'https://playhop.com',                              emoji:'🎮', color:'#FF5C5C', bgColor:'rgba(255,92,92,0.12)',  borderColor:'rgba(255,92,92,0.3)',   canEmbed:true  },
  { id:'krunker',   name:'Krunker.io',   tag:'Action',   url:'https://krunker.io',                               emoji:'🎯', color:'#F59E0B', bgColor:'rgba(245,158,11,0.1)', borderColor:'rgba(245,158,11,0.3)', canEmbed:true  },
  { id:'poki',      name:'Poki',         tag:'Action',   url:'https://poki.com',                                 emoji:'🕹️', color:'#FF9800', bgColor:'rgba(255,152,0,0.1)',   borderColor:'rgba(255,152,0,0.3)',   canEmbed:true  },
  { id:'chess',     name:'Chess',        tag:'Strategy', url:'https://lichess.org',                              emoji:'♟️', color:'#A0A0A0', bgColor:'rgba(160,160,160,0.1)', borderColor:'rgba(160,160,160,0.3)', canEmbed:true  },
  { id:'backgammon',name:'Backgammon',   tag:'Strategy', url:'https://backgammongalaxy.com',                     emoji:'🎲', color:'#8B5CF6', bgColor:'rgba(139,92,246,0.1)', borderColor:'rgba(139,92,246,0.3)', canEmbed:true  },
  { id:'2048',      name:'2048',         tag:'Puzzle',   url:'https://play2048.co',                              emoji:'🧮', color:'#FF7043', bgColor:'rgba(255,112,67,0.1)', borderColor:'rgba(255,112,67,0.3)', canEmbed:true  },
  { id:'jigsaw',    name:'Jigsaw',       tag:'Puzzle',   url:'https://www.jigsawplanet.com',                     emoji:'🧩', color:'#7C3AED', bgColor:'rgba(124,58,237,0.1)', borderColor:'rgba(124,58,237,0.3)', canEmbed:true  },
  { id:'wordle',    name:'Wordle',       tag:'Word',     url:'https://www.nytimes.com/games/wordle',             emoji:'🟩', color:'#6AAA64', bgColor:'rgba(106,170,100,0.1)', borderColor:'rgba(106,170,100,0.3)', canEmbed:false },
  { id:'spellbee',  name:'Spelling Bee', tag:'Word',     url:'https://www.nytimes.com/puzzles/spelling-bee',     emoji:'🐝', color:'#F5C518', bgColor:'rgba(245,197,24,0.1)', borderColor:'rgba(245,197,24,0.3)', canEmbed:false },
  { id:'solitaire', name:'Solitaire',    tag:'Classic',  url:'https://solitaired.com',                           emoji:'🃏', color:'#E91E63', bgColor:'rgba(233,30,99,0.1)',   borderColor:'rgba(233,30,99,0.3)',   canEmbed:true  },
  { id:'sudoku',    name:'Sudoku',       tag:'Classic',  url:'https://sudoku.com',                               emoji:'🔢', color:'#7B68EE', bgColor:'rgba(123,104,238,0.1)', borderColor:'rgba(123,104,238,0.3)', canEmbed:false },
  { id:'jstris',    name:'Jstris',       tag:'Classic',  url:'https://jstris.jezevec10.com',                     emoji:'🟦', color:'#00BCD4', bgColor:'rgba(0,188,212,0.1)',  borderColor:'rgba(0,188,212,0.3)',  canEmbed:true  },
];

const FOOD_APPS: AppEntry[] = [
  { id:'starbucks',name:'Starbucks', url:'https://www.starbucks.com/menu',emoji:'☕',color:'#00704A',bgColor:'rgba(0,112,74,0.1)',  borderColor:'rgba(0,112,74,0.3)',   canEmbed:false },
  { id:'dunkin',   name:"Dunkin'",   url:'https://www.dunkindonuts.com/en/menu',emoji:'🍩',color:'#FF671F',bgColor:'rgba(255,103,31,0.1)',borderColor:'rgba(255,103,31,0.3)',canEmbed:false },
  { id:'ubereats', name:'Uber Eats', url:'https://www.ubereats.com',      emoji:'🛵', color:'#06C167', bgColor:'rgba(6,193,103,0.1)', borderColor:'rgba(6,193,103,0.3)',  canEmbed:false },
  { id:'shoprite', name:'ShopRite',  url:'https://www.shoprite.com',      emoji:'🛒', color:'#CC0000', bgColor:'rgba(204,0,0,0.1)',   borderColor:'rgba(204,0,0,0.3)',    canEmbed:false },
];

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id:'stream', label:'Stream', emoji:'🎬' },
  { id:'social', label:'Social', emoji:'💬' },
  { id:'work',   label:'Work',   emoji:'💼' },
  { id:'games',  label:'Games',  emoji:'🎮' },
  { id:'food',   label:'Food',   emoji:'🍔' },
];

const LOGOS: Record<string, ReactNode> = {
  netflix:   <NetflixLogo />,
  disney:    <DisneyLogo />,
  prime:     <PrimeLogo />,
  hulu:      <HuluLogo />,
  instagram: <InstagramLogo />,
  facebook:  <FacebookLogo />,
  tiktok:    <TikTokLogo />,
  x:         <XLogo />,
  playhop:   <PlayhopLogo />,
  starbucks: <StarbucksLogo />,
  dunkin:    <DunkinLogo />,
  ubereats:  <UberEatsLogo />,
  shoprite:  <ShopRiteLogo />,
};

const GAME_CATEGORIES = ['Action', 'Strategy', 'Puzzle', 'Word', 'Classic'] as const;

export default function StreamWidget() {
  const skin = useStore(s => s.skin);
  const setActiveApp = useStore(s => s.setActiveApp);
  const { color, glow } = getSkinColors(skin);
  const [tab, setTab] = useState<Tab>('stream');

  const apps: AppEntry[] =
    tab === 'stream' ? STREAM_APPS :
    tab === 'social' ? SOCIAL_APPS :
    tab === 'work'   ? WORK_APPS :
    tab === 'food'   ? FOOD_APPS : [];

  const playhopEntry = GAME_ENTRIES.find(g => g.id === 'playhop')!;

  return (
    <div className="widget-card h-full flex flex-col p-2.5">
      {/* Tab bar */}
      <div style={{ display:'flex', gap:2, marginBottom:8, padding:3, borderRadius:12, background:'rgba(255,255,255,0.03)', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'4px 1px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab===t.id ? color : 'transparent',
            color: tab===t.id ? '#fff' : 'rgba(226,232,240,0.4)',
            fontSize:'0.52rem', fontWeight:700, fontFamily:'monospace',
            boxShadow: tab===t.id ? `0 2px 8px ${glow}` : 'none',
            display:'flex', flexDirection:'column', alignItems:'center', gap:1,
            transition:'all 0.15s',
          }}>
            <span style={{ fontSize:'0.85rem' }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Games tab — featured banner + categories */}
      {tab === 'games' ? (
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Playhop featured banner */}
          <button
            onClick={() => setActiveApp(playhopEntry)}
            style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
              borderRadius:14, border:'1px solid rgba(255,92,92,0.35)',
              background:'linear-gradient(135deg,rgba(255,92,92,0.18) 0%,rgba(255,92,92,0.06) 100%)',
              cursor:'pointer', width:'100%', textAlign:'left',
              boxShadow:'0 2px 16px rgba(255,92,92,0.15)',
              transition:'transform 0.15s, box-shadow 0.15s',
              flexShrink:0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(255,92,92,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 16px rgba(255,92,92,0.15)';
            }}
          >
            <div style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <PlayhopLogo />
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'0.78rem', fontWeight:800, color:'#FF5C5C', fontFamily:'monospace', margin:'0 0 3px' }}>🎮 Playhop</p>
              <p style={{ fontSize:'0.58rem', color:'rgba(226,232,240,0.45)', margin:0 }}>Hundreds of free browser games</p>
            </div>
            <span style={{ fontSize:'0.58rem', color:'#FF5C5C', fontFamily:'monospace', fontWeight:800, flexShrink:0 }}>PLAY →</span>
          </button>

          {/* Category rows */}
          {GAME_CATEGORIES.map(cat => {
            const catGames = GAME_ENTRIES.filter(g => g.tag === cat);
            if (!catGames.length) return null;
            return (
              <div key={cat}>
                <p style={{ fontSize:'0.5rem', fontFamily:'monospace', color:'rgba(226,232,240,0.22)', textTransform:'uppercase', letterSpacing:2, margin:'0 0 5px 2px' }}>
                  {cat}
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
                  {catGames.map(app => (
                    <button key={app.id} onClick={() => setActiveApp(app)}
                      style={{
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        gap:4, padding:'8px 3px', borderRadius:12, border:`1px solid ${app.borderColor}`,
                        background:app.bgColor, cursor:'pointer',
                        transition:'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${app.color}30`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {LOGOS[app.id] ?? <span style={{ fontSize:'1.3rem', lineHeight:1 }}>{app.emoji}</span>}
                      </div>
                      <span style={{ fontSize:'0.5rem', fontWeight:700, color:'rgba(226,232,240,0.65)', fontFamily:'monospace', letterSpacing:0.3, textAlign:'center', lineHeight:1.2 }}>
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Generic app grid for all other tabs */
        <div style={{
          flex:1, display:'grid',
          gridTemplateColumns: apps.length <= 4 ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
          gap:5, overflowY:'auto',
        }}>
          {apps.map(app => (
            <button key={app.id} onClick={() => setActiveApp(app)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:4, padding:'8px 3px', borderRadius:12, border:`1px solid ${app.borderColor}`,
                background:app.bgColor, cursor:'pointer',
                transition:'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${app.color}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {LOGOS[app.id] ?? <span style={{ fontSize:'1.5rem', lineHeight:1 }}>{app.emoji}</span>}
              </div>
              <span style={{ fontSize:'0.52rem', fontWeight:700, color:'rgba(226,232,240,0.65)', fontFamily:'monospace', letterSpacing:0.3, textAlign:'center', lineHeight:1.2 }}>
                {app.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

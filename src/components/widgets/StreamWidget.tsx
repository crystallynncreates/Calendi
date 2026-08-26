import { useState } from 'react';
import { useStore, getSkinColors } from '../../store';
import type { AppEntry } from '../../types';
import {
  NetflixLogo, DisneyPlusLogo, PrimeLogo, HuluLogo, YouTubeLogo, PeacockLogo,
  InstagramLogo, FacebookLogo, TikTokLogo, XLogo, WhatsAppLogo, MessagesLogo,
  GmailLogo, OutlookLogo, TeamsLogo, GoogleMeetLogo, ZoomLogo, CanvasLMSLogo,
  StarbucksLogo, DunkinLogo, UberEatsLogo, ShopRiteLogo,
  PlayhopLogo, KrunkerLogo, PokiLogo, ChessLogo, BackgammonLogo, Game2048Logo, JigsawLogo,
  WordleLogo, SpellingBeeLogo, SolitaireLogo, SudokuLogo, JstrisLogo,
} from '../BrandLogos';

type Tab = 'stream' | 'social' | 'work' | 'games' | 'food';
type MiniGame = null | 'memory' | 'math';
type GameEntry = AppEntry & { tag: string };

/* ── App entries ── */
const STREAM_APPS: AppEntry[] = [
  { id:'netflix',  name:'Netflix',   url:'https://netflix.com',        emoji:'N', color:'#E50914', bgColor:'rgba(229,9,20,0.1)',   borderColor:'rgba(229,9,20,0.3)',   canEmbed:true },
  { id:'disney',   name:'Disney+',   url:'https://disneyplus.com',     emoji:'D', color:'#113CCF', bgColor:'rgba(17,60,207,0.12)', borderColor:'rgba(17,60,207,0.3)',  canEmbed:true },
  { id:'prime',    name:'Prime',     url:'https://primevideo.com',     emoji:'P', color:'#00A8E0', bgColor:'rgba(0,168,224,0.1)',  borderColor:'rgba(0,168,224,0.3)',  canEmbed:true },
  { id:'hulu',     name:'Hulu',      url:'https://hulu.com',           emoji:'H', color:'#1CE783', bgColor:'rgba(28,231,131,0.1)', borderColor:'rgba(28,231,131,0.3)', canEmbed:true },
  { id:'youtube',  name:'YouTube',   url:'https://youtube.com',        emoji:'Y', color:'#FF0000', bgColor:'rgba(255,0,0,0.1)',   borderColor:'rgba(255,0,0,0.3)',    canEmbed:true },
  { id:'peacock',  name:'Peacock',   url:'https://peacocktv.com',      emoji:'🦚',color:'#F5A623', bgColor:'rgba(245,166,35,0.1)', borderColor:'rgba(245,166,35,0.3)', canEmbed:true },
];

const SOCIAL_APPS: AppEntry[] = [
  { id:'instagram',name:'Instagram', url:'https://instagram.com',      emoji:'I', color:'#E1306C', bgColor:'rgba(225,48,108,0.1)', borderColor:'rgba(225,48,108,0.3)', canEmbed:true },
  { id:'facebook', name:'Facebook',  url:'https://www.facebook.com',   emoji:'F', color:'#1877F2', bgColor:'rgba(24,119,242,0.1)', borderColor:'rgba(24,119,242,0.3)', canEmbed:true },
  { id:'tiktok',   name:'TikTok',    url:'https://www.tiktok.com',     emoji:'T', color:'#69C9D0', bgColor:'rgba(0,0,0,0.15)',    borderColor:'rgba(105,201,208,0.3)',canEmbed:true },
  { id:'x',        name:'X',         url:'https://x.com',              emoji:'X', color:'#e2e8f0', bgColor:'rgba(0,0,0,0.15)',    borderColor:'rgba(255,255,255,0.15)',canEmbed:true },
  { id:'whatsapp', name:'WhatsApp',  url:'https://web.whatsapp.com',   emoji:'W', color:'#25D366', bgColor:'rgba(37,211,102,0.1)', borderColor:'rgba(37,211,102,0.3)', canEmbed:true },
  { id:'messages', name:'Messages',  url:'sms:',                       emoji:'💬',color:'#4CAF50', bgColor:'rgba(76,175,80,0.1)', borderColor:'rgba(76,175,80,0.3)',  canEmbed:false },
];

const WORK_APPS: AppEntry[] = [
  { id:'gmail',    name:'Gmail',     url:'https://mail.google.com',    emoji:'G', color:'#EA4335', bgColor:'rgba(234,67,53,0.1)', borderColor:'rgba(234,67,53,0.3)',  canEmbed:true },
  { id:'outlook',  name:'Outlook',   url:'https://outlook.live.com',   emoji:'O', color:'#0078D4', bgColor:'rgba(0,120,212,0.12)',borderColor:'rgba(0,120,212,0.3)',  canEmbed:true },
  { id:'teams',    name:'Teams',     url:'https://teams.microsoft.com',emoji:'T', color:'#6264A7', bgColor:'rgba(98,100,167,0.12)',borderColor:'rgba(98,100,167,0.3)',canEmbed:true },
  { id:'meet',     name:'Meet',      url:'https://meet.google.com',    emoji:'M', color:'#00897B', bgColor:'rgba(0,137,123,0.1)', borderColor:'rgba(0,137,123,0.3)',  canEmbed:true },
  { id:'zoom',     name:'Zoom',      url:'https://zoom.us',            emoji:'Z', color:'#2D8CFF', bgColor:'rgba(45,140,255,0.1)', borderColor:'rgba(45,140,255,0.3)', canEmbed:true },
  { id:'canvas',   name:'Canvas',    url:'https://canvas.instructure.com/login/canvas',emoji:'🎓',color:'#E66000',bgColor:'rgba(230,96,0,0.1)',borderColor:'rgba(230,96,0,0.3)',canEmbed:true },
  { id:'wiki',     name:'Wikipedia',    url:'https://en.m.wikipedia.org',   emoji:'📖',color:'#6B7280',bgColor:'rgba(107,114,128,0.1)',borderColor:'rgba(107,114,128,0.3)',canEmbed:true },
];

const GAME_ENTRIES: GameEntry[] = [
  { id:'playhop',   name:'Playhop',      tag:'Featured', url:'https://playhop.com',                          emoji:'🎮', color:'#FF5C5C', bgColor:'rgba(255,92,92,0.12)',  borderColor:'rgba(255,92,92,0.3)',   canEmbed:true },
  { id:'krunker',   name:'Krunker.io',   tag:'Action',   url:'https://krunker.io',                           emoji:'🎯', color:'#F59E0B', bgColor:'rgba(245,158,11,0.1)', borderColor:'rgba(245,158,11,0.3)', canEmbed:true },
  { id:'poki',      name:'Poki',         tag:'Action',   url:'https://poki.com',                             emoji:'🕹️', color:'#FF9800', bgColor:'rgba(255,152,0,0.1)',   borderColor:'rgba(255,152,0,0.3)',   canEmbed:true },
  { id:'chess',     name:'Chess',        tag:'Strategy', url:'https://lichess.org',                          emoji:'♟️', color:'#A0A0A0', bgColor:'rgba(160,160,160,0.1)', borderColor:'rgba(160,160,160,0.3)', canEmbed:true },
  { id:'backgammon',name:'Backgammon',   tag:'Strategy', url:'https://backgammongalaxy.com',                 emoji:'🎲', color:'#8B5CF6', bgColor:'rgba(139,92,246,0.1)', borderColor:'rgba(139,92,246,0.3)', canEmbed:true },
  { id:'2048',      name:'2048',         tag:'Puzzle',   url:'https://play2048.co',                          emoji:'🧮', color:'#FF7043', bgColor:'rgba(255,112,67,0.1)', borderColor:'rgba(255,112,67,0.3)', canEmbed:true },
  { id:'jigsaw',    name:'Jigsaw',       tag:'Puzzle',   url:'https://www.jigsawplanet.com',                 emoji:'🧩', color:'#7C3AED', bgColor:'rgba(124,58,237,0.1)', borderColor:'rgba(124,58,237,0.3)', canEmbed:true },
  { id:'wordle',    name:'Wordle',       tag:'Word',     url:'https://wordlegame.org',                       emoji:'🟩', color:'#6AAA64', bgColor:'rgba(106,170,100,0.1)', borderColor:'rgba(106,170,100,0.3)', canEmbed:true },
  { id:'spellbee',  name:'Spelling Bee', tag:'Word',     url:'https://www.nytgames.com/spelling-bee/',       emoji:'🐝', color:'#F5C518', bgColor:'rgba(245,197,24,0.1)', borderColor:'rgba(245,197,24,0.3)', canEmbed:true },
  { id:'solitaire', name:'Solitaire',    tag:'Classic',  url:'https://solitaired.com',                       emoji:'🃏', color:'#E91E63', bgColor:'rgba(233,30,99,0.1)',   borderColor:'rgba(233,30,99,0.3)',   canEmbed:true },
  { id:'sudoku',    name:'Sudoku',       tag:'Classic',  url:'https://sudoku.game',                          emoji:'🔢', color:'#7B68EE', bgColor:'rgba(123,104,238,0.1)', borderColor:'rgba(123,104,238,0.3)', canEmbed:true },
  { id:'jstris',    name:'Jstris',       tag:'Classic',  url:'https://jstris.jezevec10.com',                 emoji:'🟦', color:'#00BCD4', bgColor:'rgba(0,188,212,0.1)',  borderColor:'rgba(0,188,212,0.3)',  canEmbed:true },
];

const FOOD_APPS: AppEntry[] = [
  { id:'starbucks',name:'Starbucks', url:'https://www.starbucks.com/menu',          emoji:'☕', color:'#00704A', bgColor:'rgba(0,112,74,0.1)',   borderColor:'rgba(0,112,74,0.3)',   canEmbed:true },
  { id:'dunkin',   name:"Dunkin'",   url:'https://www.dunkindonuts.com/en/menu',    emoji:'🍩', color:'#FF671F', bgColor:'rgba(255,103,31,0.1)', borderColor:'rgba(255,103,31,0.3)', canEmbed:true },
  { id:'ubereats', name:'Uber Eats', url:'https://www.ubereats.com',               emoji:'🛵', color:'#06C167', bgColor:'rgba(6,193,103,0.1)', borderColor:'rgba(6,193,103,0.3)',  canEmbed:true },
  { id:'shoprite', name:'ShopRite',  url:'https://www.shoprite.com',               emoji:'🛒', color:'#CC0000', bgColor:'rgba(204,0,0,0.1)',   borderColor:'rgba(204,0,0,0.3)',    canEmbed:true },
];

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id:'stream', label:'Stream', emoji:'🎬' },
  { id:'social', label:'Social', emoji:'💬' },
  { id:'work',   label:'Work',   emoji:'💼' },
  { id:'games',  label:'Games',  emoji:'🎮' },
  { id:'food',   label:'Food',   emoji:'🍔' },
];

const LOGO_MAP: Record<string, JSX.Element> = {
  netflix:    <NetflixLogo size={30} />,
  disney:     <DisneyPlusLogo size={30} />,
  prime:      <PrimeLogo size={30} />,
  hulu:       <HuluLogo size={30} />,
  youtube:    <YouTubeLogo size={28} />,
  peacock:    <PeacockLogo size={28} />,
  instagram:  <InstagramLogo size={28} />,
  facebook:   <FacebookLogo size={28} />,
  tiktok:     <TikTokLogo size={28} />,
  x:          <XLogo size={26} />,
  whatsapp:   <WhatsAppLogo size={28} />,
  messages:   <MessagesLogo size={28} />,
  gmail:      <GmailLogo size={28} />,
  outlook:    <OutlookLogo size={28} />,
  teams:      <TeamsLogo size={28} />,
  meet:       <GoogleMeetLogo size={28} />,
  zoom:       <ZoomLogo size={28} />,
  canvas:     <CanvasLMSLogo size={28} />,
  starbucks:  <StarbucksLogo size={28} />,
  dunkin:     <DunkinLogo size={28} />,
  ubereats:   <UberEatsLogo size={28} />,
  shoprite:   <ShopRiteLogo size={28} />,
  playhop:    <PlayhopLogo size={28} />,
  krunker:    <KrunkerLogo size={28} />,
  poki:       <PokiLogo size={28} />,
  chess:      <ChessLogo size={28} />,
  backgammon: <BackgammonLogo size={28} />,
  '2048':     <Game2048Logo size={28} />,
  jigsaw:     <JigsawLogo size={28} />,
  wordle:     <WordleLogo size={28} />,
  spellbee:   <SpellingBeeLogo size={28} />,
  solitaire:  <SolitaireLogo size={28} />,
  sudoku:     <SudokuLogo size={28} />,
  jstris:     <JstrisLogo size={28} />,
};

const GAME_CATEGORIES = ['Action', 'Strategy', 'Puzzle', 'Word', 'Classic'] as const;

/* ── Memory Match mini-game ── */
const MEM_EMOJIS = ['🎯','🎪','🎨','🎭','🎬','🎤','🎸','🎹'];
interface MemCard { id: number; emoji: string; flipped: boolean; matched: boolean }
function initMemCards(): MemCard[] {
  return [...MEM_EMOJIS, ...MEM_EMOJIS]
    .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

/* ── Quick Math mini-game ── */
function genMath() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const ops = ['+', '−', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === '+' ? a + b : op === '−' ? a - b : a * b;
  return { question: `${a} ${op} ${b} = ?`, answer };
}

export default function StreamWidget() {
  const skin = useStore(s => s.skin);
  const setActiveApp = useStore(s => s.setActiveApp);
  const { color, glow } = getSkinColors(skin);
  const [tab, setTab] = useState<Tab>('stream');
  const [miniGame, setMiniGame] = useState<MiniGame>(null);

  /* Memory Match state */
  const [memCards, setMemCards] = useState<MemCard[]>(initMemCards);
  const [memFlipped, setMemFlipped] = useState<number[]>([]);
  const [memMoves, setMemMoves] = useState(0);
  const [memLocked, setMemLocked] = useState(false);
  const memDone = memCards.every(c => c.matched);

  /* Quick Math state */
  const [mathQ, setMathQ] = useState(genMath);
  const [mathInput, setMathInput] = useState('');
  const [mathScore, setMathScore] = useState(0);
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'wrong' | null>(null);

  function flipMemCard(id: number) {
    if (memLocked) return;
    const card = memCards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const newFlipped = [...memFlipped, id];
    const newCards = memCards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setMemCards(newCards);
    setMemFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMemLocked(true);
      setMemMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => newCards.find(c => c.id === fid)!);
      if (a.emoji === b.emoji) {
        setMemCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
        setMemFlipped([]);
        setMemLocked(false);
      } else {
        setTimeout(() => {
          setMemCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setMemFlipped([]);
          setMemLocked(false);
        }, 900);
      }
    }
  }

  function resetMemory() {
    setMemCards(initMemCards());
    setMemFlipped([]);
    setMemMoves(0);
    setMemLocked(false);
  }

  function checkMath() {
    const answer = parseInt(mathInput, 10);
    if (answer === mathQ.answer) {
      setMathScore(s => s + 1);
      setMathFeedback('correct');
    } else {
      setMathFeedback('wrong');
    }
    setTimeout(() => {
      setMathQ(genMath());
      setMathInput('');
      setMathFeedback(null);
    }, 800);
  }

  const apps: AppEntry[] =
    tab === 'stream' ? STREAM_APPS :
    tab === 'social' ? SOCIAL_APPS :
    tab === 'work'   ? WORK_APPS :
    tab === 'food'   ? FOOD_APPS : [];

  const playhopEntry = GAME_ENTRIES[0];

  const DIM = 'var(--w-text-dim)';
  const FAINT = 'var(--w-text-faint)';

  return (
    <div className="widget-card h-full flex flex-col p-2.5">
      {/* Header */}
      <div style={{ paddingBottom:6, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:'1rem' }}>📡</span>
          <div>
            <p style={{ fontSize:'0.58rem', fontFamily:'monospace', fontWeight:700, textTransform:'uppercase', letterSpacing:1, color, margin:0 }}>hub</p>
            <p style={{ fontSize:'0.52rem', color:FAINT, margin:0, letterSpacing:0.3 }}>Every service in one place — stream, social, work, games &amp; food</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:2, marginBottom:8, padding:3, borderRadius:12, background:'rgba(255,255,255,0.03)', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMiniGame(null); }} style={{
            flex:1, padding:'4px 1px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab===t.id ? color : 'transparent',
            color: tab===t.id ? '#fff' : DIM,
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

      {/* ── GAMES TAB ── */}
      {tab === 'games' && (
        miniGame === 'memory' ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <button onClick={() => setMiniGame(null)} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${color}30`, borderRadius:8, padding:'3px 10px', cursor:'pointer', color, fontSize:'0.6rem', fontFamily:'monospace' }}>← Back</button>
              <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:DIM }}>Moves: {memMoves}</span>
              <button onClick={resetMemory} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'3px 10px', cursor:'pointer', color:DIM, fontSize:'0.6rem', fontFamily:'monospace' }}>Reset</button>
            </div>
            {memDone && <div style={{ textAlign:'center', color, fontFamily:'monospace', fontSize:'0.75rem', fontWeight:700 }}>🏆 Done in {memMoves} moves!</div>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, flex:1 }}>
              {memCards.map(card => (
                <button key={card.id} onClick={() => flipMemCard(card.id)}
                  style={{
                    aspectRatio:'1', borderRadius:10, border:`1px solid ${card.matched ? color+'50' : 'rgba(255,255,255,0.08)'}`,
                    background: card.flipped || card.matched ? `${color}20` : 'rgba(255,255,255,0.04)',
                    cursor:'pointer', fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.2s',
                  }}>
                  {card.flipped || card.matched ? card.emoji : ''}
                </button>
              ))}
            </div>
          </div>
        ) : miniGame === 'math' ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10, alignItems:'center', justifyContent:'center' }}>
            <button onClick={() => setMiniGame(null)} style={{ alignSelf:'flex-start', background:'rgba(255,255,255,0.06)', border:`1px solid ${color}30`, borderRadius:8, padding:'3px 10px', cursor:'pointer', color, fontSize:'0.6rem', fontFamily:'monospace' }}>← Back</button>
            <div style={{ fontSize:'0.65rem', fontFamily:'monospace', color, fontWeight:700 }}>Score: {mathScore}</div>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--w-text-main)', fontFamily:'monospace', textAlign:'center' }}>{mathQ.question}</div>
            {mathFeedback && <div style={{ fontSize:'1rem', color: mathFeedback === 'correct' ? '#86efac' : '#fca5a5' }}>{mathFeedback === 'correct' ? '✓ Correct!' : `✗ Answer: ${mathQ.answer}`}</div>}
            <div style={{ display:'flex', gap:6 }}>
              <input
                type="number"
                value={mathInput}
                onChange={e => setMathInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && mathInput !== '' && checkMath()}
                className="input-dark"
                style={{ width:90, textAlign:'center', fontSize:'1rem', fontWeight:700 }}
                placeholder="?"
              />
              <button onClick={() => mathInput !== '' && checkMath()}
                style={{ background:color, color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', cursor:'pointer', fontSize:'0.7rem', fontWeight:700, fontFamily:'monospace' }}>
                Check
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
            {/* Built-in arcade */}
            <div style={{ display:'flex', gap:5, flexShrink:0 }}>
              {([
                { game:'memory' as MiniGame, icon:'🎴', name:'Memory Match', sub:'play in-widget' },
                { game:'math'   as MiniGame, icon:'🧮', name:'Quick Math',   sub:'play in-widget' },
              ]).map(({ game, icon, name, sub }) => (
                <button key={name} onClick={() => setMiniGame(game)}
                  style={{ flex:1, padding:'10px 6px', borderRadius:12, border:`1px solid ${color}30`, background:`${color}12`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:'1.4rem' }}>{icon}</span>
                  <span style={{ fontSize:'0.5rem', fontWeight:700, color, fontFamily:'monospace' }}>{name}</span>
                  <span style={{ fontSize:'0.45rem', color:FAINT, fontFamily:'monospace' }}>{sub}</span>
                </button>
              ))}
            </div>

            {/* Playhop featured */}
            <button onClick={() => setActiveApp(playhopEntry)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:14, border:'1px solid rgba(255,92,92,0.35)', background:'linear-gradient(135deg,rgba(255,92,92,0.18) 0%,rgba(255,92,92,0.06) 100%)', cursor:'pointer', width:'100%', textAlign:'left', flexShrink:0 }}>
              <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><PlayhopLogo size={32} /></div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'0.72rem', fontWeight:800, color:'#FF5C5C', fontFamily:'monospace', margin:'0 0 2px' }}>🎮 Playhop</p>
                <p style={{ fontSize:'0.55rem', color:FAINT, margin:0 }}>Hundreds of free browser games</p>
              </div>
              <span style={{ fontSize:'0.58rem', color:'#FF5C5C', fontFamily:'monospace', fontWeight:800, flexShrink:0 }}>OPEN →</span>
            </button>

            {/* Categorized game links */}
            {GAME_CATEGORIES.map(cat => {
              const catGames = GAME_ENTRIES.filter(g => g.tag === cat);
              if (!catGames.length) return null;
              return (
                <div key={cat}>
                  <p style={{ fontSize:'0.5rem', fontFamily:'monospace', color:FAINT, textTransform:'uppercase', letterSpacing:2, margin:'0 0 5px 2px' }}>{cat}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
                    {catGames.map(app => (
                      <button key={app.id} onClick={() => setActiveApp(app)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:'7px 3px', borderRadius:12, border:`1px solid ${app.borderColor}`, background:app.bgColor, cursor:'pointer' }}>
                        <div style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {LOGO_MAP[app.id] ?? <span style={{ fontSize:'1.2rem' }}>{app.emoji}</span>}
                        </div>
                        <span style={{ fontSize:'0.48rem', fontWeight:700, color:DIM, fontFamily:'monospace', letterSpacing:0.3, textAlign:'center', lineHeight:1.2 }}>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── OTHER TABS ── */}
      {tab !== 'games' && (
        <div style={{ flex:1, display:'grid', gridTemplateColumns: apps.length <= 4 ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap:5, overflowY:'auto' }}>
          {apps.map(app => (
            <button key={app.id} onClick={() => setActiveApp(app)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:'8px 3px', borderRadius:12, border:`1px solid ${app.borderColor}`, background:app.bgColor, cursor:'pointer' }}>
              <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {LOGO_MAP[app.id] ?? <span style={{ fontSize:'1.5rem' }}>{app.emoji}</span>}
              </div>
              <span style={{ fontSize:'0.52rem', fontWeight:700, color:DIM, fontFamily:'monospace', letterSpacing:0.3, textAlign:'center', lineHeight:1.2 }}>{app.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { Search, X, RefreshCw, ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';
import { YouTubeLogo } from '../BrandLogos';

function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) { const m = input.match(p); if (m) return m[1]; }
  return null;
}

type Mode = 'home' | 'player';

export default function YouTubeWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('home');
  const [embedSrc, setEmbedSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function search() {
    const q = input.trim();
    if (!q) return;
    const vid = extractVideoId(q);
    if (vid) {
      setEmbedSrc(`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`);
    } else {
      setEmbedSrc(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`);
    }
    setMode('player');
    setLoading(true);
  }

  function reset() { setMode('home'); setEmbedSrc(''); setInput(''); }

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor:`${color}25` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <YouTubeLogo size={22} />
          <div>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color:'var(--w-text-dim)' }}>youtube</span>
            <p style={{ fontSize:'0.45rem', color:'var(--w-text-faint)', margin:'1px 0 0', fontFamily:'monospace' }}>paste a link or search — watch right here</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {mode === 'player' && (
            <>
              <button onClick={() => { setLoading(true); setEmbedSrc(s => s + (s.includes('?') ? '&_r=1' : '?_r=1')); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--w-text-dim)', padding:2 }}>
                <RefreshCw size={11} />
              </button>
              <button onClick={reset} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--w-text-dim)', padding:2 }}>
                <X size={12} />
              </button>
            </>
          )}
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
            title="Open YouTube.com"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--w-text-dim)', padding:2, display:'flex' }}>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2 shrink-0">
        <form onSubmit={e => { e.preventDefault(); search(); }} style={{ display:'flex', gap:6 }}>
          <input
            className="input-dark flex-1 !py-1.5 text-xs"
            placeholder="paste YouTube URL or search…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="btn-pill !px-3 !py-1.5"
            style={{ background:color, color:'#fff', boxShadow:`0 2px 10px ${glow}`, flexShrink:0 }}>
            <Search size={12} />
          </button>
        </form>
      </div>

      {/* Player or home */}
      <div className="flex-1 relative overflow-hidden mx-3 mb-3 rounded-xl" style={{ background:'#000' }}>
        {mode === 'player' ? (
          <>
            {loading && (
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:10,
                background:`linear-gradient(90deg,transparent,${color},transparent)`,
                animation:'shimmer 1.5s ease-in-out infinite' }} />
            )}
            <iframe
              ref={iframeRef}
              src={embedSrc}
              title="YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setLoading(false)}
              style={{ width:'100%', height:'100%', border:'none', display:'block' }}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background:'linear-gradient(135deg,#0d0d0d 0%,#1a0a0a 100%)', padding:12 }}>
            <YouTubeLogo size={44} />
            <p className="text-xs text-center leading-relaxed px-2" style={{ color:'var(--w-text-dim)' }}>
              Search for any video above, or paste a YouTube URL.<br />
              Sign in to YouTube using the button below.
            </p>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill !text-xs !py-1.5"
              style={{ background:'rgba(255,0,0,0.18)', color:'#FF6666', border:'1px solid rgba(255,0,0,0.35)' }}>
              <ExternalLink size={10} /> Open YouTube & Sign In
            </a>
            <div style={{ display:'flex', flexDirection:'column', gap:4, width:'100%', marginTop:4 }}>
              {['Trending','Music','Gaming','News'].map(cat => (
                <button key={cat} onClick={() => { setInput(cat); setEmbedSrc(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cat)}`); setMode('player'); setLoading(true); }}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'5px 10px', cursor:'pointer', color:'var(--w-text-dim)', fontSize:'0.7rem', fontFamily:'monospace', textAlign:'left' }}>
                  🔍 {cat} videos
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

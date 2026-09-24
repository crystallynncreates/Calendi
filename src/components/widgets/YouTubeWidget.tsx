import { useState, useRef } from 'react';
import { Search, X, RefreshCw, ExternalLink, Play, ChevronLeft } from 'lucide-react';
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

type VideoResult = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
};

type Mode = 'home' | 'results' | 'player';

const QUICK_SEARCHES = ['Trending', 'Music', 'Gaming', 'News', 'Comedy', 'Sports'];

export default function YouTubeWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('home');
  const [embedSrc, setEmbedSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<VideoResult[]>([]);
  const [searchErr, setSearchErr] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function play(videoId: string) {
    setEmbedSrc(`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
    setMode('player');
    setLoading(true);
  }

  async function search(q?: string) {
    const query = (q ?? input).trim();
    if (!query) return;
    setInput(query);
    setSearchErr('');

    const vid = extractVideoId(query);
    if (vid) { play(vid); return; }

    setMode('results');
    setSearching(true);
    setResults([]);

    try {
      const r = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
      const data = await r.json();
      if (data.error) {
        setSearchErr(data.error + (data.setup ? '\n\n' + data.setup : ''));
        setMode('home');
      } else {
        setResults(data.items || []);
      }
    } catch {
      // Fallback to embed search
      setEmbedSrc(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`);
      setMode('player');
      setLoading(true);
    }
    setSearching(false);
  }

  function reset() { setMode('home'); setEmbedSrc(''); setInput(''); setResults([]); setSearchErr(''); }

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${color}25` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          {mode !== 'home' && (
            <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-dim)', padding: 2 }}>
              <ChevronLeft size={14} />
            </button>
          )}
          <YouTubeLogo size={22} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--w-text-dim)' }}>youtube</span>
        </div>
        <div className="flex items-center gap-1.5">
          {mode === 'player' && (
            <button onClick={() => { setLoading(true); setEmbedSrc(s => s.replace(/&_r=\d+/, '') + '&_r=' + Date.now()); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-dim)', padding: 2 }}>
              <RefreshCw size={11} />
            </button>
          )}
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
            title="Open YouTube.com"
            style={{ color: 'var(--w-text-dim)', padding: 2, display: 'flex' }}>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2 shrink-0">
        <form onSubmit={e => { e.preventDefault(); search(); }} style={{ display: 'flex', gap: 6 }}>
          <input
            className="input-dark flex-1 !py-1.5 text-xs"
            placeholder="search YouTube or paste a URL…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="btn-pill !px-3 !py-1.5"
            style={{ background: color, color: '#fff', boxShadow: `0 2px 10px ${glow}`, flexShrink: 0 }}>
            <Search size={12} />
          </button>
        </form>
        {searchErr && (
          <p style={{ fontSize: '0.6rem', color: '#EF4444', marginTop: 4, fontFamily: 'monospace', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {searchErr}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden mx-3 mb-3 rounded-xl" style={{ background: '#000' }}>
        {mode === 'player' ? (
          <>
            {loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 10, background: `linear-gradient(90deg,transparent,${color},transparent)`, animation: 'shimmer 1.5s ease-in-out infinite' }} />
            )}
            <iframe
              ref={iframeRef}
              src={embedSrc}
              title="YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setLoading(false)}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </>
        ) : mode === 'results' ? (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#0d0d0d', padding: 8 }}>
            {searching ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace', gap: 6 }}>
                <div style={{ width: 14, height: 14, border: `2px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                searching…
              </div>
            ) : results.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                No results found
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {results.map(v => (
                  <button
                    key={v.id}
                    onClick={() => play(v.id)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      overflow: 'hidden',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}50`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111' }}>
                      <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s', background: 'rgba(0,0,0,0.4)' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                      >
                        <Play size={22} fill="#fff" color="#fff" />
                      </div>
                    </div>
                    <div style={{ padding: '5px 6px 6px' }}>
                      <p style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#e2e8f0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.title}</p>
                      <p style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#64748b', marginTop: 2 }}>{v.channel}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#1a0a0a 100%)', padding: 12 }}>
            <YouTubeLogo size={44} />
            <p className="text-xs text-center leading-relaxed px-2" style={{ color: 'var(--w-text-dim)' }}>
              Search for videos above or paste a YouTube URL.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: '100%', marginTop: 4 }}>
              {QUICK_SEARCHES.map(cat => (
                <button key={cat} onClick={() => search(cat)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: 'var(--w-text-dim)', fontSize: '0.65rem', fontFamily: 'monospace', textAlign: 'left' }}>
                  🔍 {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

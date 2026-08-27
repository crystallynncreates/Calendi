import { useState, useRef, type FC } from 'react';
import { RefreshCw, Globe, X, ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';
import { GoogleLogo, YouTubeLogo, GoogleMapsLogo } from '../BrandLogos';

type QuickLink = {
  label: string;
  url: string;
  Logo?: FC<{ size: number }>;
  emoji?: string;
};

const QUICK_LINKS: QuickLink[] = [
  { label: 'Google',      url: '/api/search',                                   Logo: GoogleLogo },
  { label: 'YouTube',     url: 'https://piped.video',                           Logo: YouTubeLogo },
  { label: 'Maps',        url: 'https://maps.google.com/maps?q=&output=embed',  Logo: GoogleMapsLogo },
  { label: 'Translate',   url: 'https://lingva.ml',                             emoji: '🌐' },
  { label: 'Wikipedia',   url: 'https://en.m.wikipedia.org',                    emoji: '📖' },
  { label: 'Weather',     url: 'https://forecast.weather.gov/',                 emoji: '🌤️' },
];

interface BrowserProps { initialUrl?: string }

export default function BrowserWidget({ initialUrl }: BrowserProps) {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [url, setUrl] = useState(initialUrl ?? '');
  const [activeUrl, setActiveUrl] = useState(initialUrl ?? '');
  const [loading, setLoading] = useState(!!initialUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function navigate(target: string) {
    let full = target.trim();
    if (!full) return;
    if (!full.startsWith('http://') && !full.startsWith('https://') && !full.startsWith('/')) {
      full = full.includes('.')
        ? `https://${full}`
        : `/api/search?q=${encodeURIComponent(full)}`;
    }
    setActiveUrl(full);
    setUrl(full);
    setLoading(true);
  }

  function refresh() {
    if (!activeUrl) return;
    setActiveUrl('');
    setTimeout(() => setActiveUrl(activeUrl), 50);
  }

  function openExternal() {
    window.open(activeUrl, '_blank', 'noopener');
  }

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${color}25` }}>
      {/* Header tagline */}
      <div style={{ padding:'6px 10px 2px', flexShrink:0 }}>
        <p style={{ fontSize:'0.5rem', color:'var(--w-text-faint)', margin:0, fontFamily:'monospace', letterSpacing:0.3 }}>🌐 browser — search the web, open any site, explore quick links</p>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-1.5 px-2 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Globe size={12} style={{ color: 'var(--w-text-faint)', flexShrink: 0 }} />
        <form
          className="flex-1"
          onSubmit={e => { e.preventDefault(); navigate(url); }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
            style={{ color: 'var(--w-text-dim)' }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="search or enter URL"
            onFocus={e => e.target.select()}
          />
          <button type="submit" style={{ display: 'none' }} />
        </form>
        {activeUrl && (
          <>
            <button onClick={refresh} title="Refresh" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-faint)', padding: 2 }}>
              <RefreshCw size={11} />
            </button>
            <button onClick={openExternal} title="Open in new tab" style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 2 }}>
              <ExternalLink size={11} />
            </button>
            <button onClick={() => { setActiveUrl(''); setUrl(''); }} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-faint)', padding: 2 }}>
              <X size={11} />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {activeUrl ? (
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, animation: 'shimmer 1.5s ease-in-out infinite' }} />
          )}
          <iframe
            ref={iframeRef}
            key={activeUrl}
            src={activeUrl}
            title="browser"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fff' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
            allow="accelerometer; camera; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; payment; autoplay"
          />
        </div>
      ) : (
        <div className="flex-1 p-3 overflow-y-auto">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--w-text-faint)' }}>quick links</p>
          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_LINKS.map(q => (
              <button
                key={q.label}
                onClick={() => navigate(q.url)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all glass-hover"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
              >
                {q.Logo
                  ? <q.Logo size={28} />
                  : <span style={{ fontSize: 20 }}>{q.emoji}</span>
                }
                <span className="text-xs font-mono" style={{ color: 'var(--w-text-dim)' }}>{q.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs mt-4 text-center leading-relaxed" style={{ color: 'var(--w-text-faint)' }}>
            type any URL or search above — tap the <ExternalLink size={9} style={{ display:'inline', verticalAlign:'middle' }} /> icon to open blocked sites in a full tab
          </p>
        </div>
      )}
    </div>
  );
}

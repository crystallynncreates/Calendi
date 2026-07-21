import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Globe, X } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';
import { GoogleLogo, YouTubeLogo, GoogleMapsLogo } from '../BrandLogos';

type QuickLink = {
  label: string;
  url: string;
  Logo?: React.FC<{ size: number }>;
  emoji?: string;
};

const QUICK_LINKS: QuickLink[] = [
  { label: 'Google',    url: 'https://www.google.com/webhp?igu=1', Logo: GoogleLogo },
  { label: 'Wikipedia', url: 'https://en.m.wikipedia.org',         emoji: '📖' },
  { label: 'YouTube',   url: 'https://www.youtube.com',            Logo: YouTubeLogo },
  { label: 'Maps',      url: 'https://maps.google.com',            Logo: GoogleMapsLogo },
  { label: 'Translate', url: 'https://translate.google.com',       emoji: '🌐' },
  { label: 'Weather',   url: 'https://weather.com',                emoji: '🌤️' },
];

export default function BrowserWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function navigate(target: string) {
    let full = target.trim();
    if (!full) return;
    if (!full.startsWith('http://') && !full.startsWith('https://')) {
      full = full.includes('.') ? `https://${full}` : `https://www.google.com/search?q=${encodeURIComponent(full)}`;
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

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${color}25` }}>
      {/* Address bar */}
      <div className="flex items-center gap-1.5 px-2 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Globe size={12} style={{ color: 'rgba(226,232,240,0.3)', flexShrink: 0 }} />
        <form
          className="flex-1"
          onSubmit={e => { e.preventDefault(); navigate(url); }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
            style={{ color: 'rgba(226,232,240,0.7)' }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="search or enter URL"
            onFocus={e => e.target.select()}
          />
          <button type="submit" style={{ display: 'none' }} />
        </form>
        {activeUrl && (
          <>
            <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.3)', padding: 2 }}>
              <RefreshCw size={11} />
            </button>
            <button onClick={() => { setActiveUrl(''); setUrl(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.3)', padding: 2 }}>
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
            src={activeUrl}
            title="browser"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      ) : (
        <div className="flex-1 p-3 overflow-y-auto">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(226,232,240,0.25)' }}>quick links</p>
          <div className="grid grid-cols-3 gap-2">
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
                <span className="text-xs font-mono" style={{ color: 'rgba(226,232,240,0.5)' }}>{q.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs mt-4 text-center leading-relaxed" style={{ color: 'rgba(226,232,240,0.18)' }}>
            type a URL or search term above<br />some sites block embedding by design
          </p>
        </div>
      )}
    </div>
  );
}

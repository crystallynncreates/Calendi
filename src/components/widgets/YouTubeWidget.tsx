import { useState } from 'react';
import { Play, Search, X, ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

const DEFAULT_CHANNEL = 'clc4321';

function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function YouTubeWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  function load() {
    const id = extractVideoId(input.trim());
    if (id) { setVideoId(id); return; }
    // If it looks like a search term, open YouTube search in the player
    if (input.trim()) {
      const searchEmbed = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(input.trim())}`;
      setVideoId('__search__' + input.trim());
    }
  }

  const embedSrc = videoId
    ? videoId.startsWith('__search__')
      ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoId.replace('__search__', ''))}`
      : `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${color}25` }}>
      <div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(226,232,240,0.3)' }}>
          youtube
        </span>
        {videoId && (
          <button onClick={() => { setVideoId(null); setInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.3)', padding: 2 }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2 shrink-0">
        <form onSubmit={e => { e.preventDefault(); load(); }} style={{ display: 'flex', gap: 6 }}>
          <input
            className="input-dark flex-1 !py-1.5 text-xs"
            placeholder="paste URL or search..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="btn-pill !px-3 !py-1.5"
            style={{ background: color, color: '#fff', boxShadow: `0 2px 10px ${glow}`, flexShrink: 0 }}
          >
            <Search size={12} />
          </button>
        </form>
      </div>

      {/* Player or placeholder */}
      <div className="flex-1 relative overflow-hidden mx-3 mb-3 rounded-xl" style={{ background: '#000' }}>
        {embedSrc ? (
          <iframe
            src={embedSrc}
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 100%)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)' }}>
              <Play size={24} fill="#FF4444" style={{ color: '#FF4444' }} />
            </div>
            <p className="text-xs text-center leading-relaxed px-4" style={{ color: 'rgba(226,232,240,0.3)' }}>
              paste a YouTube URL above<br />or search for a video
            </p>
            <a
              href={`https://youtube.com/@${DEFAULT_CHANNEL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill !text-xs !py-1.5"
              style={{ background: 'rgba(255,0,0,0.15)', color: '#FF6666', border: '1px solid rgba(255,0,0,0.3)' }}
            >
              <ExternalLink size={10} /> @{DEFAULT_CHANNEL}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

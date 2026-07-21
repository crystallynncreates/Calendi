import { useState } from 'react';
import { Video, ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

function openInPopup(url: string, name: string) {
  const w = Math.min(1280, window.screen.width - 100);
  const h = Math.min(800, window.screen.height - 100);
  const left = (window.screen.width - w) / 2;
  const top = (window.screen.height - h) / 2;
  window.open(url, `calendi-${name}`, `width=${w},height=${h},left=${left},top=${top},resizable=yes`);
}

export default function MeetWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [zoomId, setZoomId] = useState('');
  const [tab, setTab] = useState<'meet' | 'zoom'>('meet');

  return (
    <div className="widget-card h-full flex flex-col p-3">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 p-0.5 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {(['meet', 'zoom'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
            style={{
              background: tab === t ? color : 'transparent',
              color: tab === t ? '#fff' : 'rgba(226,232,240,0.4)',
              boxShadow: tab === t ? `0 2px 8px ${glow}` : 'none',
            }}
          >
            {t === 'meet' ? 'google meet' : 'zoom'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {tab === 'meet' ? (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.3)' }}>
              <span style={{ fontSize: 28 }}>📹</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>Google Meet</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.35)', lineHeight: 1.5 }}>
                opens in a dedicated window
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full px-2">
              <button
                className="btn-pill w-full"
                style={{ background: 'rgba(52,168,83,0.15)', color: '#4ADE80', border: '1px solid rgba(52,168,83,0.3)' }}
                onClick={() => openInPopup('https://meet.google.com/new', 'meet')}
              >
                <Video size={13} /> new meeting
              </button>
              <button
                className="btn-pill w-full btn-ghost"
                onClick={() => openInPopup('https://meet.google.com', 'meet')}
              >
                <ExternalLink size={13} /> join a meeting
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,140,255,0.12)', border: '1px solid rgba(45,140,255,0.3)' }}>
              <span style={{ fontSize: 28 }}>💬</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>Zoom</p>
            <div className="w-full px-2">
              <input
                className="input-dark mb-2 text-xs"
                placeholder="meeting ID (optional)"
                value={zoomId}
                onChange={e => setZoomId(e.target.value.replace(/\D/g, ''))}
              />
              <button
                className="btn-pill w-full"
                style={{ background: 'rgba(45,140,255,0.15)', color: '#60A5FA', border: '1px solid rgba(45,140,255,0.3)' }}
                onClick={() => openInPopup(
                  zoomId ? `https://zoom.us/wc/${zoomId}/join` : 'https://zoom.us/join',
                  'zoom'
                )}
              >
                <Video size={13} /> {zoomId ? `join ${zoomId}` : 'open zoom'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

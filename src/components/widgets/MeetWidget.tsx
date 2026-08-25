import { useState } from 'react';
import { Video, ExternalLink, Maximize2 } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';
import { GoogleMeetLogo, ZoomLogo } from '../BrandLogos';
import type { AppEntry } from '../../types';

const MEET_APP: AppEntry = { id:'meet', name:'Google Meet', url:'https://meet.google.com', emoji:'🎥', color:'#00897B', bgColor:'rgba(0,137,123,0.1)', borderColor:'rgba(0,137,123,0.3)', canEmbed:false };
const ZOOM_APP: AppEntry = { id:'zoom', name:'Zoom',        url:'https://zoom.us',         emoji:'📹', color:'#2D8CFF', bgColor:'rgba(45,140,255,0.1)', borderColor:'rgba(45,140,255,0.3)', canEmbed:false };

export default function MeetWidget() {
  const skin = useStore(s => s.skin);
  const setActiveApp = useStore(s => s.setActiveApp);
  const { color, glow } = getSkinColors(skin);
  const [zoomId, setZoomId] = useState('');
  const [tab, setTab] = useState<'meet' | 'zoom'>('meet');

  function openInFrame(app: AppEntry, url?: string) {
    setActiveApp(url ? { ...app, url } : app);
  }

  function openExternal(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="widget-card h-full flex flex-col p-3">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-3 p-0.5 rounded-xl shrink-0" style={{ background:'rgba(255,255,255,0.03)' }}>
        {(['meet','zoom'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
            style={{ background: tab===t ? color : 'transparent', color: tab===t ? '#fff' : 'rgba(226,232,240,0.4)', boxShadow: tab===t ? `0 2px 8px ${glow}` : 'none' }}>
            {t === 'meet' ? 'google meet' : 'zoom'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        {tab === 'meet' ? (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:'rgba(0,137,123,0.1)', border:'1px solid rgba(0,137,123,0.3)' }}>
              <GoogleMeetLogo size={48} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color:'#E2E8F0' }}>Google Meet</p>
              <p className="text-xs mt-1 px-2" style={{ color:'rgba(226,232,240,0.35)', lineHeight:1.5 }}>
                Sign in required. Open in the Calendi app frame or a new tab.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full px-2">
              <button className="btn-pill w-full"
                style={{ background:'rgba(0,137,123,0.18)', color:'#4DB6AC', border:'1px solid rgba(0,137,123,0.3)' }}
                onClick={() => openInFrame(MEET_APP, 'https://meet.google.com/new')}>
                <Video size={13} /> new meeting in frame
              </button>
              <button className="btn-pill w-full"
                style={{ background:'rgba(0,137,123,0.1)', color:'#4DB6AC', border:'1px solid rgba(0,137,123,0.2)' }}
                onClick={() => openInFrame(MEET_APP)}>
                <Maximize2 size={13} /> join — open in app frame
              </button>
              <button className="btn-pill w-full btn-ghost"
                onClick={() => openExternal('https://meet.google.com')}>
                <ExternalLink size={13} /> open in new tab
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:'rgba(45,140,255,0.1)', border:'1px solid rgba(45,140,255,0.3)' }}>
              <ZoomLogo size={48} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color:'#E2E8F0' }}>Zoom</p>
              <p className="text-xs mt-1 px-2" style={{ color:'rgba(226,232,240,0.35)', lineHeight:1.5 }}>
                Sign in required. Open in app frame to stay in Calendi.
              </p>
            </div>
            <div className="w-full px-2 flex flex-col gap-2">
              <input className="input-dark text-xs" placeholder="Meeting ID (optional)"
                value={zoomId}
                onChange={e => setZoomId(e.target.value.replace(/\D/g, ''))} />
              <button className="btn-pill w-full"
                style={{ background:'rgba(45,140,255,0.18)', color:'#60A5FA', border:'1px solid rgba(45,140,255,0.3)' }}
                onClick={() => openInFrame(ZOOM_APP, zoomId ? `https://zoom.us/wc/${zoomId}/join` : 'https://zoom.us/join')}>
                <Maximize2 size={13} /> {zoomId ? `join ${zoomId}` : 'open zoom'} — in frame
              </button>
              <button className="btn-pill w-full btn-ghost"
                onClick={() => openExternal(zoomId ? `https://zoom.us/wc/${zoomId}/join` : 'https://zoom.us/join')}>
                <ExternalLink size={13} /> open in new tab
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

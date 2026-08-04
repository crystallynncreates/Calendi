import { useState } from 'react';
import { Video } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';
import { GoogleMeetLogo, ZoomLogo } from '../BrandLogos';
import type { AppEntry } from '../../types';

const MEET_APP: AppEntry = {
  id: 'meet', name: 'Google Meet', url: 'https://meet.google.com',
  emoji: '🎥', color: '#00897B', bgColor: 'rgba(0,137,123,0.1)', borderColor: 'rgba(0,137,123,0.3)', canEmbed: true,
};
const ZOOM_APP: AppEntry = {
  id: 'zoom', name: 'Zoom', url: 'https://zoom.us/join',
  emoji: '📹', color: '#2D8CFF', bgColor: 'rgba(45,140,255,0.1)', borderColor: 'rgba(45,140,255,0.3)', canEmbed: true,
};

export default function MeetWidget() {
  const skin = useStore(s => s.skin);
  const setActiveApp = useStore(s => s.setActiveApp);
  const { color, glow } = getSkinColors(skin);
  const [zoomId, setZoomId] = useState('');
  const [tab, setTab] = useState<'meet' | 'zoom'>('meet');

  function openMeet(url: string) {
    setActiveApp({ ...MEET_APP, url });
  }

  function openZoom(url: string) {
    setActiveApp({ ...ZOOM_APP, url });
  }

  return (
    <div className="widget-card h-full flex flex-col p-3">
      <div className="flex gap-1 mb-3 p-0.5 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {(['meet', 'zoom'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
            style={{
              background: tab === t ? color : 'transparent',
              color: tab === t ? '#fff' : 'rgba(226,232,240,0.4)',
              boxShadow: tab === t ? `0 2px 8px ${glow}` : 'none',
            }}>
            {t === 'meet' ? 'google meet' : 'zoom'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {tab === 'meet' ? (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,137,123,0.1)', border: '1px solid rgba(0,137,123,0.3)' }}>
              <GoogleMeetLogo size={48} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>Google Meet</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.35)', lineHeight: 1.5 }}>opens inside Calendi</p>
            </div>
            <div className="flex flex-col gap-2 w-full px-2">
              <button className="btn-pill w-full"
                style={{ background: 'rgba(0,137,123,0.15)', color: '#4DB6AC', border: '1px solid rgba(0,137,123,0.3)' }}
                onClick={() => openMeet('https://meet.google.com/new')}>
                <Video size={13} /> new meeting
              </button>
              <button className="btn-pill w-full btn-ghost"
                onClick={() => openMeet('https://meet.google.com')}>
                join a meeting
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(45,140,255,0.1)', border: '1px solid rgba(45,140,255,0.3)' }}>
              <ZoomLogo size={48} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>Zoom</p>
            <div className="w-full px-2">
              <input className="input-dark mb-2 text-xs" placeholder="meeting ID (optional)"
                value={zoomId}
                onChange={e => setZoomId(e.target.value.replace(/\D/g, ''))} />
              <button className="btn-pill w-full"
                style={{ background: 'rgba(45,140,255,0.15)', color: '#60A5FA', border: '1px solid rgba(45,140,255,0.3)' }}
                onClick={() => openZoom(zoomId ? `https://zoom.us/wc/${zoomId}/join` : 'https://zoom.us/join')}>
                <Video size={13} /> {zoomId ? `join ${zoomId}` : 'open zoom'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

interface Service {
  id: string;
  name: string;
  emoji: string;
  url: string;
  bg: string;
  border: string;
}

const SERVICES: Service[] = [
  { id: 'netflix',   name: 'Netflix',       emoji: '🎬', url: 'https://netflix.com/login',          bg: 'rgba(229,9,20,0.1)',    border: 'rgba(229,9,20,0.3)' },
  { id: 'disney',    name: 'Disney+',       emoji: '✨', url: 'https://disneyplus.com',             bg: 'rgba(17,60,207,0.1)',   border: 'rgba(17,60,207,0.3)' },
  { id: 'prime',     name: 'Prime Video',   emoji: '📦', url: 'https://primevideo.com',             bg: 'rgba(0,168,225,0.1)',   border: 'rgba(0,168,225,0.3)' },
  { id: 'meet',      name: 'Google Meet',   emoji: '📹', url: 'https://meet.google.com',            bg: 'rgba(52,168,83,0.1)',   border: 'rgba(52,168,83,0.3)' },
  { id: 'zoom',      name: 'Zoom',          emoji: '💬', url: 'https://zoom.us/join',               bg: 'rgba(45,140,255,0.1)',  border: 'rgba(45,140,255,0.3)' },
  { id: 'messages',  name: 'Messages',      emoji: '💬', url: 'https://messages.google.com',        bg: 'rgba(52,168,83,0.1)',   border: 'rgba(52,168,83,0.3)' },
  { id: 'whatsapp',  name: 'WhatsApp',      emoji: '📱', url: 'https://web.whatsapp.com',           bg: 'rgba(37,211,102,0.1)',  border: 'rgba(37,211,102,0.3)' },
  { id: 'phone',     name: 'Phone',         emoji: '📞', url: 'tel:',                               bg: 'rgba(52,168,83,0.1)',   border: 'rgba(52,168,83,0.3)' },
];

export default function StreamWidget() {
  const skin = useStore(s => s.skin);
  const { color } = getSkinColors(skin);

  return (
    <div className="widget-card h-full flex flex-col p-3">
      <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(226,232,240,0.3)' }}>apps</div>
      <div className="grid grid-cols-2 gap-2 flex-1 auto-rows-fr">
        {SERVICES.map(s => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition-all group"
            style={{ background: s.bg, border: `1px solid ${s.border}`, textDecoration: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight" style={{ color: 'rgba(226,232,240,0.65)', fontSize: '0.6rem' }}>
              {s.name}
            </span>
            <ExternalLink size={9} style={{ color: 'rgba(226,232,240,0.2)' }} />
          </a>
        ))}
      </div>
    </div>
  );
}

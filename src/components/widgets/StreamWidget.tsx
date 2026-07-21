import { ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

const SERVICES = [
  { id: 'netflix',   name: 'Netflix',   emoji: '🎬', url: 'https://netflix.com',         bg: 'rgba(229,9,20,0.1)',   border: 'rgba(229,9,20,0.3)',   textColor: '#FF4444' },
  { id: 'disney',    name: 'Disney+',   emoji: '✨', url: 'https://disneyplus.com',      bg: 'rgba(17,60,207,0.1)',  border: 'rgba(17,60,207,0.3)',  textColor: '#4488FF' },
  { id: 'prime',     name: 'Prime',     emoji: '📦', url: 'https://primevideo.com',      bg: 'rgba(0,168,225,0.1)', border: 'rgba(0,168,225,0.3)', textColor: '#00AAFF' },
  { id: 'facebook',  name: 'Facebook',  emoji: '👥', url: 'https://facebook.com',        bg: 'rgba(24,119,242,0.1)', border: 'rgba(24,119,242,0.3)', textColor: '#4488EE' },
  { id: 'messages',  name: 'Messages',  emoji: '💬', url: 'https://messages.google.com', bg: 'rgba(52,168,83,0.1)',  border: 'rgba(52,168,83,0.3)',  textColor: '#44AA66' },
  { id: 'whatsapp',  name: 'WhatsApp',  emoji: '📱', url: 'https://web.whatsapp.com',    bg: 'rgba(37,211,102,0.1)', border: 'rgba(37,211,102,0.3)', textColor: '#25D366' },
  { id: 'phone',     name: 'Phone',     emoji: '📞', url: 'tel:',                        bg: 'rgba(52,168,83,0.1)',  border: 'rgba(52,168,83,0.3)',  textColor: '#44AA66' },
  { id: 'instagram', name: 'Instagram', emoji: '📸', url: 'https://instagram.com',       bg: 'rgba(193,53,132,0.1)', border: 'rgba(193,53,132,0.3)', textColor: '#E1306C' },
];

function openInPopup(url: string, name: string) {
  const w = Math.min(1280, window.screen.width - 100);
  const h = Math.min(800, window.screen.height - 100);
  const left = (window.screen.width - w) / 2;
  const top  = (window.screen.height - h) / 2;
  window.open(url, `calendi-${name}`, `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=yes,location=yes`);
}

export default function StreamWidget() {
  const skin = useStore(s => s.skin);
  getSkinColors(skin);

  return (
    <div className="widget-card h-full flex flex-col p-3">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(226,232,240,0.3)' }}>apps</span>
        <span style={{ color: 'rgba(226,232,240,0.2)', fontSize: '0.6rem' }}>opens in window</span>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1 auto-rows-fr">
        {SERVICES.map(s => (
          <button
            key={s.id}
            onClick={() => s.url.startsWith('tel:') ? (window.location.href = s.url) : openInPopup(s.url, s.id)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition-all"
            style={{ background: s.bg, border: `1px solid ${s.border}`, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <span style={{ color: s.textColor, fontSize: '0.65rem', fontWeight: 600 }}>{s.name}</span>
            <ExternalLink size={8} style={{ color: 'rgba(226,232,240,0.2)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

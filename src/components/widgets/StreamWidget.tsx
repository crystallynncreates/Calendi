import { ExternalLink } from 'lucide-react';
import {
  NetflixLogo, DisneyPlusLogo, PrimeLogo, FacebookLogo,
  WhatsAppLogo, InstagramLogo,
} from '../BrandLogos';

const SERVICES = [
  { id: 'netflix',   name: 'Netflix',   url: 'https://netflix.com',         Logo: NetflixLogo,   border: 'rgba(229,9,20,0.3)',    bg: 'rgba(229,9,20,0.08)'   },
  { id: 'disney',    name: 'Disney+',   url: 'https://disneyplus.com',      Logo: DisneyPlusLogo,border: 'rgba(4,14,54,0.6)',     bg: 'rgba(4,14,54,0.25)'    },
  { id: 'prime',     name: 'Prime',     url: 'https://primevideo.com',      Logo: PrimeLogo,     border: 'rgba(0,168,225,0.3)',   bg: 'rgba(0,168,225,0.08)'  },
  { id: 'facebook',  name: 'Facebook',  url: 'https://facebook.com',        Logo: FacebookLogo,  border: 'rgba(24,119,242,0.3)', bg: 'rgba(24,119,242,0.08)' },
  { id: 'messages',  name: 'Messages',  url: 'https://messages.google.com', Logo: null,          border: 'rgba(52,168,83,0.3)',  bg: 'rgba(52,168,83,0.08)'  },
  { id: 'whatsapp',  name: 'WhatsApp',  url: 'https://web.whatsapp.com',    Logo: WhatsAppLogo,  border: 'rgba(37,211,102,0.3)', bg: 'rgba(37,211,102,0.08)' },
  { id: 'phone',     name: 'Phone',     url: 'tel:',                        Logo: null,          border: 'rgba(52,168,83,0.3)',  bg: 'rgba(52,168,83,0.08)'  },
  { id: 'instagram', name: 'Instagram', url: 'https://instagram.com',       Logo: InstagramLogo, border: 'rgba(193,53,132,0.3)', bg: 'rgba(193,53,132,0.08)' },
];

const EMOJI_FALLBACK: Record<string, string> = {
  messages: '💬',
  phone:    '📞',
};

function openInPopup(url: string, name: string) {
  const w = Math.min(1280, window.screen.width - 100);
  const h = Math.min(800, window.screen.height - 100);
  const left = (window.screen.width - w) / 2;
  const top  = (window.screen.height - h) / 2;
  window.open(url, `calendi-${name}`, `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=yes,location=yes`);
}

export default function StreamWidget() {
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
            {s.Logo
              ? <s.Logo size={34} />
              : <span style={{ fontSize: 22 }}>{EMOJI_FALLBACK[s.id]}</span>
            }
            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(226,232,240,0.6)', fontFamily: 'monospace', letterSpacing: 1 }}>
              {s.name}
            </span>
            <ExternalLink size={8} style={{ color: 'rgba(226,232,240,0.15)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState, useRef, type FC } from 'react';
import { RefreshCw, Globe, X, ExternalLink } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';
import {
  GoogleLogo, GoogleMapsLogo,
  GmailLogo, OutlookLogo, TeamsLogo, GoogleMeetLogo, ZoomLogo, CanvasLMSLogo,
} from '../BrandLogos';

type AppDef = {
  id: string;
  label: string;
  Logo?: FC<{ size: number }>;
  emoji?: string;
  url: string;
  mode: 'frame' | 'popup';
  win?: string;
};

type Category = {
  name: string;
  note?: string;
  apps: AppDef[];
};

const POPUP_OPTS = 'width=1400,height=900,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=yes';

const CATEGORIES: Category[] = [
  {
    name: 'Search & Browse',
    apps: [
      { id: 'google',    label: 'Google',    Logo: GoogleLogo,     url: '/api/search',                                                         mode: 'frame' },
      { id: 'wikipedia', label: 'Wikipedia', emoji: '📖',           url: '/api/proxy?url=https%3A%2F%2Fen.m.wikipedia.org%2Fwiki%2FMain_Page', mode: 'frame' },
      { id: 'maps',      label: 'Maps',      Logo: GoogleMapsLogo, url: 'https://maps.google.com/maps?q=&output=embed',                        mode: 'frame' },
      { id: 'nitrotype', label: 'NitroType', emoji: '🏎️',          url: '/api/proxy?url=https%3A%2F%2Fwww.nitrotype.com',                     mode: 'frame' },
    ],
  },
  {
    name: 'Social',
    apps: [
      { id: 'instagram', label: 'Instagram', emoji: '📷', url: '/api/social?platform=instagram', mode: 'frame' },
      { id: 'tiktok',    label: 'TikTok',    emoji: '🎵', url: '/api/social?platform=tiktok',    mode: 'frame' },
      { id: 'x',         label: 'X',         emoji: '✕',  url: '/api/social?platform=twitter',   mode: 'frame' },
      { id: 'facebook',  label: 'Facebook',  emoji: '🔵', url: '/api/social?platform=facebook',  mode: 'frame' },
    ],
  },
  {
    name: 'Calendars',
    apps: [
      { id: 'gcal',        label: 'Google Cal',  Logo: GoogleLogo,  url: '/api/proxy?url=https%3A%2F%2Fcalendar.google.com%2Fcalendar%2Fr',  mode: 'frame' },
      { id: 'outlook-cal', label: 'Outlook Cal', Logo: OutlookLogo, url: 'https://outlook.live.com/calendar/0/view/month',                    mode: 'popup', win: 'calendi-outlook' },
      { id: 'icloud-cal',  label: 'iCloud Cal',  emoji: '☁️',       url: 'https://www.icloud.com/calendar',                                  mode: 'popup', win: 'calendi-icloud' },
    ],
  },
  {
    name: 'Work',
    note: 'companion window',
    apps: [
      { id: 'gmail',   label: 'Gmail',   Logo: GmailLogo,      url: 'https://mail.google.com/mail/u/0/', mode: 'popup', win: 'calendi-gmail' },
      { id: 'outlook', label: 'Outlook', Logo: OutlookLogo,    url: 'https://outlook.live.com',          mode: 'popup', win: 'calendi-outlook' },
      { id: 'canvas',  label: 'Canvas',  Logo: CanvasLMSLogo,  url: '/api/proxy?url=https%3A%2F%2Fcanvas.instructure.com', mode: 'frame' },
      { id: 'teams',   label: 'Teams',   Logo: TeamsLogo,      url: 'https://teams.microsoft.com',       mode: 'popup', win: 'calendi-teams' },
      { id: 'meet',    label: 'Meet',    Logo: GoogleMeetLogo, url: 'https://meet.google.com',           mode: 'popup', win: 'calendi-meet' },
      { id: 'zoom',    label: 'Zoom',    Logo: ZoomLogo,       url: 'https://zoom.us',                   mode: 'popup', win: 'calendi-zoom' },
    ],
  },
];

interface BrowserProps { initialUrl?: string }

export default function BrowserWidget({ initialUrl }: BrowserProps) {
  const skin = useStore(s => s.skin);
  const { color } = getSkinColors(skin);
  const [url, setUrl] = useState(initialUrl ?? '');
  const [activeUrl, setActiveUrl] = useState(initialUrl ?? '');
  const [loading, setLoading] = useState(!!initialUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function navigateTo(target: string) {
    let full = target.trim();
    if (!full) return;
    if (!full.startsWith('http://') && !full.startsWith('https://') && !full.startsWith('/')) {
      full = full.includes('.')
        ? `https://${full}`
        : `/api/search?q=${encodeURIComponent(full)}`;
    }
    if (
      (full.startsWith('http://') || full.startsWith('https://')) &&
      !full.includes('maps.google.com')
    ) {
      full = `/api/proxy?url=${encodeURIComponent(full)}`;
    }
    setActiveUrl(full);
    setUrl(full);
    setLoading(true);
  }

  function openApp(app: AppDef) {
    if (app.mode === 'popup') {
      window.open(app.url, app.win ?? 'calendi-popup', POPUP_OPTS);
    } else {
      navigateTo(app.url);
    }
  }

  function refresh() {
    if (!activeUrl) return;
    setActiveUrl('');
    setTimeout(() => setActiveUrl(activeUrl), 50);
  }

  function openExternal() {
    let target = activeUrl;
    try {
      if (activeUrl.startsWith('/api/proxy')) {
        const params = new URL(activeUrl, location.href).searchParams;
        target = params.get('url') ?? activeUrl;
      }
    } catch {}
    window.open(target, '_blank', 'noopener');
  }

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${color}25` }}>
      {/* Address bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Globe size={11} style={{ color: 'var(--w-text-faint)', flexShrink: 0 }} />
        <form
          className="flex-1"
          onSubmit={e => { e.preventDefault(); navigateTo(url); }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
            style={{ color: 'var(--w-text-dim)' }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="search or enter any URL…"
            onFocus={e => e.target.select()}
          />
          <button type="submit" style={{ display: 'none' }} />
        </form>
        {activeUrl && (
          <>
            <button onClick={refresh} title="Refresh" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-faint)', padding: 2 }}>
              <RefreshCw size={10} />
            </button>
            <button onClick={openExternal} title="Open in new tab" style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 2 }}>
              <ExternalLink size={10} />
            </button>
            <button onClick={() => { setActiveUrl(''); setUrl(''); }} title="Back to apps" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-faint)', padding: 2 }}>
              <X size={10} />
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
        <div className="flex-1 overflow-y-auto" style={{ padding: '8px 10px 10px' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} style={{ marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color, fontWeight: 700, flexShrink: 0 }}>
                  {cat.name}
                </span>
                {cat.note && (
                  <span style={{ fontSize: '0.48rem', fontFamily: 'monospace', color: 'var(--w-text-faint)', whiteSpace: 'nowrap' }}>
                    · opens in companion window ↗
                  </span>
                )}
                <div style={{ flex: 1, height: 1, background: `${color}20` }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                {cat.apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => openApp(app)}
                    title={app.mode === 'popup' ? `${app.label} — opens in companion window` : app.label}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: '7px 4px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      minHeight: 60,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}50`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    {app.mode === 'popup' && (
                      <span style={{ position: 'absolute', top: 3, right: 4, fontSize: '0.45rem', color: 'var(--w-text-faint)', lineHeight: 1, opacity: 0.7 }}>↗</span>
                    )}
                    {app.Logo
                      ? <app.Logo size={26} />
                      : <span style={{ fontSize: 22, lineHeight: 1 }}>{app.emoji}</span>
                    }
                    <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--w-text-dim)', letterSpacing: 0.3, textAlign: 'center', lineHeight: 1.2 }}>
                      {app.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <p style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: 'var(--w-text-faint)', textAlign: 'center', marginTop: 4, lineHeight: 1.7 }}>
            type any URL or search above · ↗ work apps open in a companion window with full login
          </p>
        </div>
      )}
    </div>
  );
}

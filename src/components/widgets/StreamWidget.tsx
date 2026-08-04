import { useState } from 'react';
import { useStore, getSkinColors } from '../../store';
import type { AppEntry } from '../../types';

type Tab = 'stream' | 'social' | 'work' | 'games';

const STREAM_APPS: AppEntry[] = [
  { id: 'netflix',   name: 'Netflix',    url: 'https://netflix.com',          emoji: '🎬', color: '#E50914', bgColor: 'rgba(229,9,20,0.1)',    borderColor: 'rgba(229,9,20,0.3)',    canEmbed: false },
  { id: 'disney',    name: 'Disney+',    url: 'https://disneyplus.com',       emoji: '✨', color: '#113CCF', bgColor: 'rgba(17,60,207,0.15)',   borderColor: 'rgba(17,60,207,0.35)',  canEmbed: false },
  { id: 'prime',     name: 'Prime',      url: 'https://primevideo.com',       emoji: '📦', color: '#00A8E0', bgColor: 'rgba(0,168,224,0.1)',    borderColor: 'rgba(0,168,224,0.3)',   canEmbed: false },
  { id: 'youtube',   name: 'YouTube',    url: 'https://youtube.com',          emoji: '▶️', color: '#FF0000', bgColor: 'rgba(255,0,0,0.1)',      borderColor: 'rgba(255,0,0,0.3)',     canEmbed: false },
];

const SOCIAL_APPS: AppEntry[] = [
  { id: 'instagram', name: 'Instagram',  url: 'https://instagram.com',        emoji: '📸', color: '#E1306C', bgColor: 'rgba(225,48,108,0.1)',   borderColor: 'rgba(225,48,108,0.3)',  canEmbed: false },
  { id: 'facebook',  name: 'Facebook',   url: 'https://facebook.com',         emoji: '👥', color: '#1877F2', bgColor: 'rgba(24,119,242,0.1)',   borderColor: 'rgba(24,119,242,0.3)',  canEmbed: false },
  { id: 'whatsapp',  name: 'WhatsApp',   url: 'https://web.whatsapp.com',     emoji: '💬', color: '#25D366', bgColor: 'rgba(37,211,102,0.1)',   borderColor: 'rgba(37,211,102,0.3)',  canEmbed: false },
  { id: 'messages',  name: 'Messages',   url: 'https://messages.google.com',  emoji: '📱', color: '#4CAF50', bgColor: 'rgba(76,175,80,0.1)',    borderColor: 'rgba(76,175,80,0.3)',   canEmbed: false },
];

const WORK_APPS: AppEntry[] = [
  { id: 'gmail',     name: 'Gmail',      url: 'https://mail.google.com',      emoji: '📧', color: '#EA4335', bgColor: 'rgba(234,67,53,0.1)',    borderColor: 'rgba(234,67,53,0.3)',   canEmbed: false },
  { id: 'outlook',   name: 'Outlook',    url: 'https://outlook.live.com',     emoji: '📨', color: '#0078D4', bgColor: 'rgba(0,120,212,0.12)',   borderColor: 'rgba(0,120,212,0.3)',   canEmbed: true  },
  { id: 'teams',     name: 'Teams',      url: 'https://teams.microsoft.com',  emoji: '🏢', color: '#6264A7', bgColor: 'rgba(98,100,167,0.12)',  borderColor: 'rgba(98,100,167,0.3)',  canEmbed: false },
  { id: 'meet',      name: 'Meet',       url: 'https://meet.google.com',      emoji: '🎥', color: '#00897B', bgColor: 'rgba(0,137,123,0.1)',    borderColor: 'rgba(0,137,123,0.3)',   canEmbed: true  },
  { id: 'zoom',      name: 'Zoom',       url: 'https://zoom.us/join',         emoji: '📹', color: '#2D8CFF', bgColor: 'rgba(45,140,255,0.1)',   borderColor: 'rgba(45,140,255,0.3)',  canEmbed: true  },
];

const GAME_APPS: AppEntry[] = [
  { id: 'chess',     name: 'Chess',      url: 'https://lichess.org',          emoji: '♟️', color: '#A0A0A0', bgColor: 'rgba(160,160,160,0.1)',  borderColor: 'rgba(160,160,160,0.3)', canEmbed: true  },
  { id: 'poki',      name: 'Poki',       url: 'https://poki.com',             emoji: '🎮', color: '#FF5C5C', bgColor: 'rgba(255,92,92,0.1)',    borderColor: 'rgba(255,92,92,0.3)',   canEmbed: true  },
  { id: 'solitaire', name: 'Solitaire',  url: 'https://solitaired.com',       emoji: '🃏', color: '#E91E63', bgColor: 'rgba(233,30,99,0.1)',    borderColor: 'rgba(233,30,99,0.3)',   canEmbed: true  },
  { id: 'sudoku',    name: 'Sudoku',     url: 'https://sudoku.com',           emoji: '🔢', color: '#7B68EE', bgColor: 'rgba(123,104,238,0.1)',  borderColor: 'rgba(123,104,238,0.3)', canEmbed: false },
  { id: 'wordle',    name: 'Wordle',     url: 'https://www.nytimes.com/games/wordle', emoji: '🟩', color: '#6AAA64', bgColor: 'rgba(106,170,100,0.1)', borderColor: 'rgba(106,170,100,0.3)', canEmbed: false },
  { id: 'coolmath',  name: 'Cool Math',  url: 'https://www.coolmathgames.com',emoji: '🧮', color: '#FF9800', bgColor: 'rgba(255,152,0,0.1)',    borderColor: 'rgba(255,152,0,0.3)',   canEmbed: false },
];

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'stream', label: 'Stream', emoji: '🎬' },
  { id: 'social', label: 'Social', emoji: '💬' },
  { id: 'work',   label: 'Work',   emoji: '💼' },
  { id: 'games',  label: 'Games',  emoji: '🎮' },
];

export default function StreamWidget() {
  const skin = useStore(s => s.skin);
  const setActiveApp = useStore(s => s.setActiveApp);
  const { color, glow } = getSkinColors(skin);
  const [tab, setTab] = useState<Tab>('stream');

  const apps =
    tab === 'stream' ? STREAM_APPS :
    tab === 'social' ? SOCIAL_APPS :
    tab === 'work'   ? WORK_APPS   : GAME_APPS;

  return (
    <div className="widget-card h-full flex flex-col p-2.5">
      <div style={{ display: 'flex', gap: 3, marginBottom: 8, padding: 3, borderRadius: 12, background: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '5px 2px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t.id ? color : 'transparent',
            color: tab === t.id ? '#fff' : 'rgba(226,232,240,0.4)',
            fontSize: '0.58rem', fontWeight: 700, fontFamily: 'monospace',
            boxShadow: tab === t.id ? `0 2px 8px ${glow}` : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}>
            <span style={{ fontSize: '0.9rem' }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: apps.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 6, overflowY: 'auto',
      }}>
        {apps.map(app => (
          <button key={app.id} onClick={() => setActiveApp(app)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 5, padding: '10px 4px', borderRadius: 14, border: `1px solid ${app.borderColor}`,
              background: app.bgColor, cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${app.color}30`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{app.emoji}</span>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(226,232,240,0.65)', fontFamily: 'monospace', letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.2 }}>
              {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

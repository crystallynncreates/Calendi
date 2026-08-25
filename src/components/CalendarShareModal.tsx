import { X, Printer, Download, Share2, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { useStore, getSkinColors } from '../store';
import type { CalEvent } from '../types';
import { format } from 'date-fns';

function buildICS(events: CalEvent[]): string {
  const esc = (s: string) => s.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Calendi//EN',
    ...events.flatMap(e => {
      const d = e.date.replace(/-/g, '');
      const dt = e.time ? `${d}T${e.time.replace(':', '')}00` : d;
      return [
        'BEGIN:VEVENT',
        `UID:${e.id}@calendi`,
        `SUMMARY:${esc(e.title)}`,
        `DTSTART:${dt}`, `DTEND:${dt}`,
        ...(e.notes ? [`DESCRIPTION:${esc(e.notes)}`] : []),
        ...(e.address ? [`LOCATION:${esc(e.address)}`] : []),
        'END:VEVENT',
      ];
    }),
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

interface Props { onClose: () => void }

export default function CalendarShareModal({ onClose }: Props) {
  const { events, skin } = useStore();
  const { color, glow } = getSkinColors(skin);
  const [copied, setCopied] = useState(false);

  const monthLabel = format(new Date(), 'MMMM yyyy');

  function handlePrint() {
    const root = document.createElement('div');
    root.id = 'cal-print-root';

    const title = document.createElement('h1');
    title.style.cssText = 'font-size:22px;font-weight:700;margin:0 0 16px;color:#111;font-family:system-ui,sans-serif';
    title.textContent = `Calendi — ${monthLabel}`;
    root.appendChild(title);

    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.style.cssText = 'color:#666;font-size:14px;font-family:system-ui,sans-serif';
      empty.textContent = 'No events saved.';
      root.appendChild(empty);
    } else {
      const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
      sorted.forEach(e => {
        const row = document.createElement('div');
        row.style.cssText = 'border-bottom:1px solid #eee;padding:8px 0;font-family:system-ui,sans-serif';
        row.innerHTML = `<strong style="font-size:13px;color:#111">${e.title}</strong> <span style="font-size:12px;color:#666">— ${e.date}${e.time ? ' ' + e.time : ''}</span>${e.notes ? `<br><span style="font-size:11px;color:#888">${e.notes}</span>` : ''}`;
        root.appendChild(row);
      });
    }

    document.body.appendChild(root);
    window.print();
    document.body.removeChild(root);
  }

  function handleDownload() {
    const ics = buildICS(events);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `calendi-${format(new Date(), 'yyyy-MM')}.ics`; a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  async function handleShare() {
    const text = events.length === 0
      ? 'My Calendi calendar — no events yet.'
      : events.slice(0, 8).map(e => `• ${e.title} (${e.date})`).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: `My Calendi — ${monthLabel}`, text });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const actions = [
    {
      icon: <Printer size={22} />,
      label: 'Print calendar',
      sub: 'Opens print dialog',
      onClick: handlePrint,
      col: '#6B7280',
    },
    {
      icon: <Download size={22} />,
      label: 'Download .ics',
      sub: 'Import into any calendar app',
      onClick: handleDownload,
      col: color,
    },
    {
      icon: <Share2 size={22} />,
      label: 'Share via phone',
      sub: typeof navigator.share === 'function' ? 'Native share sheet' : 'Copies event list',
      onClick: handleShare,
      col: '#34D399',
    },
    {
      icon: copied ? <Check size={22} /> : <Link2 size={22} />,
      label: copied ? 'Copied!' : 'Copy link',
      sub: 'Share your Calendi URL',
      onClick: handleCopyLink,
      col: '#F59E0B',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl anim-slide-up"
        style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>share & download</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.3)' }}>{events.length} event{events.length !== 1 ? 's' : ''} · {monthLabel}</p>
          </div>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-8">
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)`, cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${a.col}12`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${a.col}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16, background: `${a.col}18`,
                border: `1px solid ${a.col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.col,
                boxShadow: `0 0 20px ${a.col}20`,
              }}>
                {a.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0', marginBottom: 2 }}>{a.label}</p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(226,232,240,0.35)' }}>{a.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

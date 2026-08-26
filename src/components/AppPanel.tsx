import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Maximize2 } from 'lucide-react';
import type { AppEntry } from '../types';

interface Props { app: AppEntry; onClose: () => void }

export default function AppPanel({ app, onClose }: Props) {
  const [showFallback, setShowFallback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isProtocol = !app.url.startsWith('http://') && !app.url.startsWith('https://');

  useEffect(() => {
    if (isProtocol) {
      window.open(app.url, '_self');
    }
  }, [app.url, isProtocol]);

  useEffect(() => {
    if (isProtocol) return;
    timerRef.current = setTimeout(() => setShowFallback(true), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [app.url, isProtocol]);

  function openExternal() {
    window.open(app.url, '_blank', 'noopener');
  }

  if (isProtocol) {
    return (
      <div className="panel-slide-in" style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#06060F',
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: app.bgColor, border: `2px solid ${app.borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', marginBottom: 24,
          boxShadow: `0 0 60px ${app.color}40`,
        }}>
          {app.emoji}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E2E8F0', marginBottom: 10 }}>Opening {app.name}…</h2>
        <p style={{ fontSize: '0.82rem', color: 'rgba(226,232,240,0.45)', marginBottom: 28 }}>Your device is handling this link.</p>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 50, padding: '10px 28px', cursor: 'pointer', color: '#E2E8F0',
          fontSize: '0.82rem', fontWeight: 600,
        }}>
          <X size={13} style={{ display: 'inline', marginRight: 6 }} /> Back to Calendi
        </button>
      </div>
    );
  }

  return (
    <div className="panel-slide-in" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column',
      background: '#06060F',
    }}>
      {/* Header bar */}
      <div style={{
        height: 48, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
        background: `linear-gradient(90deg, ${app.bgColor}, rgba(6,6,15,0.95))`,
        borderBottom: `1px solid ${app.borderColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#E2E8F0',
            display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600,
          }}>
            <X size={12} /> Back to Calendi
          </button>
          <span style={{ fontSize: '0.9rem' }}>{app.emoji}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>{app.name}</span>
        </div>
        <button onClick={openExternal} style={{
          background: 'rgba(255,255,255,0.06)', border: `1px solid ${app.borderColor}`,
          borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: app.color,
          display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600,
        }}>
          <Maximize2 size={11} /> Open full tab
        </button>
      </div>

      {/* iframe content — always try, circumventing X-Frame-Options where possible */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          key={app.url}
          src={app.url}
          title={app.name}
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
          allow="accelerometer; camera; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; payment; autoplay"
          onLoad={() => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } setShowFallback(false); }}
        />

        {/* Soft fallback banner — shows if site didn't respond in 5s */}
        {showFallback && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(6,6,15,0.92)', border: `1px solid ${app.borderColor}`,
            borderRadius: 14, padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            backdropFilter: 'blur(12px)', boxShadow: `0 4px 24px ${app.color}30`,
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.7)' }}>Site not loading inside the frame?</span>
            <button onClick={openExternal} style={{
              background: app.color, border: 'none', borderRadius: 8, padding: '5px 14px',
              cursor: 'pointer', color: '#fff', fontSize: '0.7rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <ExternalLink size={11} /> Open in browser
            </button>
            <button onClick={() => setShowFallback(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(226,232,240,0.4)', fontSize: '0.7rem', padding: '4px',
            }}>
              <X size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

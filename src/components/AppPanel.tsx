import { useState } from 'react';
import { X, ExternalLink, AlertCircle, Maximize2 } from 'lucide-react';
import type { AppEntry } from '../types';

interface Props { app: AppEntry; onClose: () => void }

/* Services that always block iframe embedding */
const NO_EMBED = new Set([
  'netflix', 'disney', 'prime', 'facebook', 'instagram',
  'whatsapp', 'gmail', 'phone', 'messages',
]);

export default function AppPanel({ app, onClose }: Props) {
  const [iframeError, setIframeError] = useState(false);
  const blocked = NO_EMBED.has(app.id) || !app.canEmbed;

  function openExternal() {
    window.open(app.url, '_blank', 'noopener');
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

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!blocked && !iframeError ? (
          <iframe
            src={app.url}
            title={app.name}
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            onError={() => setIframeError(true)}
          />
        ) : (
          /* Branded launch screen for services that block iframe */
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(ellipse at center, ${app.bgColor} 0%, #06060F 65%)`,
            gap: 28, padding: 32, textAlign: 'center',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: 28,
              background: app.bgColor, border: `2px solid ${app.borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3.5rem',
              boxShadow: `0 0 60px ${app.color}40`,
            }}>
              {app.emoji}
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E2E8F0', marginBottom: 10 }}>{app.name}</h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(226,232,240,0.45)', maxWidth: 340, lineHeight: 1.6 }}>
                {app.name} keeps its content secure and can't be shown inside another app.
                Tap below to open it — your browser keeps it separate from Calendi.
              </p>
            </div>
            <button onClick={openExternal} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '15px 36px', borderRadius: 50, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${app.color}, ${app.color}BB)`,
              color: '#fff', fontSize: '1rem', fontWeight: 800,
              boxShadow: `0 8px 32px ${app.color}50`,
            }}>
              <ExternalLink size={17} /> Open {app.name}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.3 }}>
              <AlertCircle size={11} style={{ color: '#E2E8F0' }} />
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#E2E8F0' }}>
                security policy set by {app.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

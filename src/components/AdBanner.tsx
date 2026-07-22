import { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useStore, getSkinColors } from '../store';

declare global {
  interface Window { adsbygoogle: unknown[] }
}

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-PLACEHOLDER';
const ADSENSE_SLOT   = import.meta.env.VITE_ADSENSE_SLOT   || '0000000000';

interface Props { onSubscribe: () => void }

export default function AdBanner({ onSubscribe }: Props) {
  const { skin } = useStore();
  const { color } = getSkinColors(skin);

  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      (window.adsbygoogle as unknown[]).push({});
    } catch {}
  }, []);

  const isPlaceholder = ADSENSE_CLIENT === 'ca-pub-PLACEHOLDER';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      minHeight: 60,
      zIndex: 20,
      overflow: 'hidden',
    }}>
      {isPlaceholder ? (
        /* Placeholder shown before AdSense is configured */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '8px 16px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📢</div>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.5)', margin: 0 }}>Ad placeholder — configure AdSense publisher ID</p>
              <p style={{ fontSize: '0.62rem', color: 'rgba(226,232,240,0.25)', margin: '2px 0 0' }}>Set VITE_ADSENSE_CLIENT in your environment</p>
            </div>
          </div>
          <button onClick={onSubscribe} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            border: 'none', borderRadius: 20, padding: '7px 14px',
            color: '#fff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${color}40`,
          }}>
            <Sparkles size={11} /> Go Ad-Free $4.99/mo
          </button>
        </div>
      ) : (
        /* Real AdSense unit */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: 60 }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT}
            data-ad-format="horizontal"
            data-full-width-responsive="true" />
          <button onClick={onSubscribe} style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
            background: `linear-gradient(135deg, ${color}, ${color}BB)`,
            border: 'none', borderRadius: 16, padding: '6px 12px',
            color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
          }}>
            <X size={10} /> Remove ads
          </button>
        </div>
      )}
    </div>
  );
}

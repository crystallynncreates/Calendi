import { X, Sparkles, Check, Shield, Zap } from 'lucide-react';
import { useStore, getSkinColors } from '../store';

const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';

interface Props { onClose: () => void }

export default function SubscribeModal({ onClose }: Props) {
  const { setIsPremium, skin } = useStore();
  const { color, glow } = getSkinColors(skin);

  function handleSubscribe() {
    if (STRIPE_LINK) {
      window.open(STRIPE_LINK, '_blank');
    } else {
      alert('Stripe payment link not configured. Set VITE_STRIPE_PAYMENT_LINK in your environment.');
    }
  }

  function handleAlreadySubscribed() {
    setIsPremium(true);
    onClose();
  }

  const premiumFeatures = [
    'All features — calendar, widgets, planners',
    'No ads, ever',
    'All 18 animated skins',
    'Notifications on all devices',
    'Priority access to new features',
    'Support CLC Premier Studios ✨',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md anim-scale-in" style={{ background: '#0D0D1A', border: `1px solid ${color}30`, borderRadius: 28, overflow: 'hidden', boxShadow: `0 0 80px ${glow}` }}>
        {/* Header glow band */}
        <div style={{ height: 4, background: `linear-gradient(90deg, #E8B0C5, ${color}, #89CCC5, #C9A84C, #E8B0C5)`, backgroundSize: '200% 100%', animation: 'gradient-shift 4s linear infinite' }} />

        <div style={{ padding: 32 }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} style={{ color: '#C9A84C' }} />
                <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', letterSpacing: 3, textTransform: 'uppercase', color: '#C9A84C' }}>Premium</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#E2E8F0', lineHeight: 1.1, margin: 0 }}>Go Ad-Free</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.4)', margin: '6px 0 0' }}>Support CLC Premier Studios</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'rgba(226,232,240,0.5)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Price */}
          <div style={{ background: `linear-gradient(135deg, ${color}15, rgba(201,168,76,0.1))`, border: `1px solid ${color}25`, borderRadius: 20, padding: '20px 24px', marginBottom: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: '#E2E8F0', lineHeight: 1 }}>$4.99</span>
              <span style={{ fontSize: '1rem', color: 'rgba(226,232,240,0.4)' }}>/month</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(226,232,240,0.3)', margin: '8px 0 0' }}>Cancel anytime · Billed monthly</p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-2 mb-6">
            {premiumFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div style={{ width: 18, height: 18, borderRadius: 5, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} style={{ color }} />
                </div>
                <span style={{ fontSize: '0.82rem', color: 'rgba(226,232,240,0.7)' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Subscribe button */}
          <button onClick={handleSubscribe} style={{
            width: '100%', padding: '15px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, #E8B0C5, ${color}, #89CCC5)`,
            backgroundSize: '200% 100%', animation: 'gradient-shift 3s linear infinite',
            color: '#fff', fontSize: '1rem', fontWeight: 800,
            boxShadow: `0 8px 32px ${glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 12,
          }}>
            <Sparkles size={16} /> Subscribe Now — $4.99/month
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={11} style={{ color: 'rgba(226,232,240,0.3)' }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(226,232,240,0.3)', fontFamily: 'monospace' }}>Secure payment via Stripe · Cancel anytime</span>
          </div>

          {/* Already subscribed */}
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.25)', marginBottom: 8 }}>Already subscribed via Stripe?</p>
            <button onClick={handleAlreadySubscribed} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '7px 18px', color: 'rgba(226,232,240,0.45)', fontSize: '0.72rem',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <Zap size={10} /> Activate premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

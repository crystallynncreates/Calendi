import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Palette, LayoutGrid, ArrowRight, Check } from 'lucide-react';
import { useStore, LAYOUTS } from '../store';
import type { SkinId, LayoutId } from '../types';

const SKINS: { id: SkinId; label: string; color: string; glow: string }[] = [
  { id: 'violet', label: 'void',   color: '#8B5CF6', glow: 'rgba(139,92,246,0.5)' },
  { id: 'cyan',   label: 'ice',    color: '#22D3EE', glow: 'rgba(34,211,238,0.5)' },
  { id: 'pink',   label: 'blush',  color: '#EC4899', glow: 'rgba(236,72,153,0.5)' },
  { id: 'amber',  label: 'solar',  color: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },
  { id: 'auto',   label: 'auto',   color: 'conic-gradient(#8B5CF6,#22D3EE,#EC4899,#F59E0B,#8B5CF6)', glow: 'rgba(139,92,246,0.4)' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setSkin, setLayout, setOnboarded } = useStore();
  const [step, setStep] = useState(0);
  const [skin, setSkinLocal] = useState<SkinId>('auto');
  const [layout, setLayoutLocal] = useState<LayoutId>(2);

  const accent = SKINS.find(s => s.id === skin);
  const accentColor = skin === 'auto' ? '#8B5CF6' : (accent?.color ?? '#8B5CF6');
  const accentGlow = accent?.glow ?? 'rgba(139,92,246,0.4)';

  function finish() {
    setSkin(skin);
    setLayout(layout);
    setOnboarded();
    navigate('/');
  }

  const STEPS = [
    {
      icon: <Sparkles size={28} />,
      heading: <>welcome to <span style={{ color: accentColor }}>calendi</span></>,
      sub: 'your time, your way. a smart dashboard that lives on any screen.',
      content: (
        <div className="text-center mt-8">
          <div
            className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-6"
            style={{ background: `${accentColor}18`, border: `2px solid ${accentColor}40`, boxShadow: `0 0 40px ${accentGlow}` }}
          >
            <span style={{ fontSize: 48 }}>🗓️</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.45)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
            a mandatory calendar, up to 4 custom widgets, and a layout that's yours. always on. always beautiful.
          </p>
        </div>
      ),
    },
    {
      icon: <Palette size={28} />,
      heading: 'pick your vibe',
      sub: 'choose a skin or let calendi shift with the seasons',
      content: (
        <div className="grid grid-cols-5 gap-3 mt-6">
          {SKINS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSkinLocal(s.id)}
              className="flex flex-col items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div
                className="w-12 h-12 rounded-2xl"
                style={{
                  background: s.id === 'auto' ? 'conic-gradient(#8B5CF6,#22D3EE,#EC4899,#F59E0B,#8B5CF6)' : s.color,
                  boxShadow: skin === s.id ? `0 0 20px ${s.glow}` : 'none',
                  outline: skin === s.id ? `2px solid ${s.id === 'auto' ? '#8B5CF6' : s.color}` : '2px solid transparent',
                  outlineOffset: 2,
                  transition: 'all 0.2s ease',
                }}
              />
              <span className="text-xs font-mono" style={{ color: skin === s.id ? '#E2E8F0' : 'rgba(226,232,240,0.35)' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <LayoutGrid size={28} />,
      heading: 'pick your layout',
      sub: 'your calendar is always the anchor — pick how many widgets you want',
      content: (
        <div className="grid grid-cols-3 gap-2 mt-6">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayoutLocal(l.id)}
              style={{
                background: layout === l.id ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${layout === l.id ? accentColor + '60' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '0.875rem',
                padding: '0.625rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: layout === l.id ? `0 0 16px ${accentGlow}` : 'none',
              }}
            >
              <LayoutPreview id={l.id} slots={l.slots} active={layout === l.id} color={accentColor} />
              <p className="text-xs font-mono mt-1.5 text-center" style={{ color: layout === l.id ? accentColor : 'rgba(226,232,240,0.35)' }}>
                {l.name}
              </p>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = STEPS[step];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#06060F' }}
    >
      {/* Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="orb-drift" style={{ position: 'absolute', top: '-15%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}20 0%, transparent 65%)`, filter: 'blur(60px)' }} />
        <div className="orb-drift-2" style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}15 0%, transparent 65%)`, filter: 'blur(60px)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Step dots */}
        <div className="flex gap-2 justify-center mb-10">
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? accentColor : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
          ))}
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-7 anim-scale-in" key={step}>
          <div style={{ color: accentColor, marginBottom: 12 }}>
            {current.icon}
          </div>
          <h1 className="text-2xl font-bold mb-1 lowercase" style={{ color: '#E2E8F0', lineHeight: 1.2 }}>
            {current.heading}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.45)', lineHeight: 1.6 }}>
            {current.sub}
          </p>

          {current.content}
        </div>

        {/* CTA */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button className="btn-pill btn-ghost flex-1" onClick={() => setStep(step - 1)}>
              back
            </button>
          )}
          <button
            className="btn-pill flex-1"
            style={{ background: accentColor, color: '#fff', boxShadow: `0 4px 24px ${accentGlow}` }}
            onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : finish()}
          >
            {step < STEPS.length - 1 ? (
              <><span>next</span><ArrowRight size={14} /></>
            ) : (
              <><Check size={14} /><span>let's go</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LayoutPreview({ id, slots, active, color }: { id: number; slots: number; active: boolean; color: string }) {
  const cal = active ? color : 'rgba(255,255,255,0.12)';
  const widget = active ? `${color}60` : 'rgba(255,255,255,0.07)';

  const previews: Record<number, JSX.Element> = {
    1:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c"', gridTemplateColumns: '1fr', height: 44 }}><Block area="c" color={cal} /></div>,
    2:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s"', gridTemplateColumns: '2fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s" color={widget} /></div>,
    3:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s"', gridTemplateColumns: '1fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s" color={widget} /></div>,
    4:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s1" "c s2"', gridTemplateColumns: '2fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s1" color={widget} /><Block area="s2" color={widget} /></div>,
    5:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"s" "c"', gridTemplateColumns: '1fr', gridTemplateRows: '1fr 2fr', height: 44 }}><Block area="s" color={widget} /><Block area="c" color={cal} /></div>,
    6:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"s1 s2" "c c"', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 2fr', height: 44 }}><Block area="s1" color={widget} /><Block area="s2" color={widget} /><Block area="c" color={cal} /></div>,
    7:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s1" "s2 s3"', gridTemplateColumns: '1fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s1" color={widget} /><Block area="s2" color={widget} /><Block area="s3" color={widget} /></div>,
    8:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s1" "c s2" "s3 s3"', gridTemplateColumns: '2fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s1" color={widget} /><Block area="s2" color={widget} /><Block area="s3" color={widget} /></div>,
    9:  <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s"', gridTemplateColumns: '1fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s" color={widget} /></div>,
    10: <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c" "s"', gridTemplateColumns: '1fr', gridTemplateRows: '2fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s" color={widget} /></div>,
    11: <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"s1 s1 s2" "c c s3"', gridTemplateColumns: '1fr 1fr 1fr', height: 44 }}><Block area="s1" color={widget} /><Block area="s2" color={widget} /><Block area="c" color={cal} /><Block area="s3" color={widget} /></div>,
    12: <div style={{ display: 'grid', gap: 2, gridTemplateAreas: '"c s1 s2" "c s3 s4"', gridTemplateColumns: '2fr 1fr 1fr', height: 44 }}><Block area="c" color={cal} /><Block area="s1" color={widget} /><Block area="s2" color={widget} /><Block area="s3" color={widget} /><Block area="s4" color={widget} /></div>,
  };

  return previews[id] ?? <div />;
}

function Block({ area, color }: { area: string; color: string }) {
  return <div style={{ gridArea: area, background: color, borderRadius: 3, transition: 'background 0.2s' }} />;
}

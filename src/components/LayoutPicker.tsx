import { X } from 'lucide-react';
import { LAYOUTS, useStore, getSkinColors } from '../store';
import type { LayoutId } from '../types';

interface Props { onClose: () => void }

export default function LayoutPicker({ onClose }: Props) {
  const { layoutId, setLayout, skin } = useStore();
  const { color, glow } = getSkinColors(skin);

  function pick(id: LayoutId) { setLayout(id); onClose(); }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg p-5 rounded-t-3xl anim-slide-up"
        style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>pick a layout</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.35)' }}>the calendar is always your anchor</p>
          </div>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {LAYOUTS.map(l => (
            <button
              key={l.id}
              onClick={() => pick(l.id)}
              style={{
                background: layoutId === l.id ? `${color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${layoutId === l.id ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '0.875rem',
                padding: '0.625rem 0.5rem',
                cursor: 'pointer',
                boxShadow: layoutId === l.id ? `0 0 16px ${glow}` : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <LayoutThumb id={l.id} active={layoutId === l.id} color={color} />
              <p className="text-xs font-mono text-center mt-2" style={{ color: layoutId === l.id ? color : 'rgba(226,232,240,0.3)', fontSize: '0.65rem' }}>
                {l.name}
              </p>
            </button>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

function LayoutThumb({ id, active, color }: { id: number; active: boolean; color: string }) {
  const cal = active ? color : 'rgba(255,255,255,0.15)';
  const w = active ? `${color}55` : 'rgba(255,255,255,0.07)';

  const thumbs: Record<number, JSX.Element> = {
    1:  <G a='"c"' c="1fr" r="1fr"><B g="c" f={cal} /></G>,
    2:  <G a='"c s"' c="2fr 1fr" r="1fr"><B g="c" f={cal} /><B g="s" f={w} /></G>,
    3:  <G a='"c s"' c="1fr 1fr" r="1fr"><B g="c" f={cal} /><B g="s" f={w} /></G>,
    4:  <G a='"c s1" "c s2"' c="2fr 1fr" r="1fr 1fr"><B g="c" f={cal} /><B g="s1" f={w} /><B g="s2" f={w} /></G>,
    5:  <G a='"s" "c"' c="1fr" r="1fr 2fr"><B g="s" f={w} /><B g="c" f={cal} /></G>,
    6:  <G a='"s1 s2" "c c"' c="1fr 1fr" r="1fr 2fr"><B g="s1" f={w} /><B g="s2" f={w} /><B g="c" f={cal} /></G>,
    7:  <G a='"c s1" "s2 s3"' c="1fr 1fr" r="1fr 1fr"><B g="c" f={cal} /><B g="s1" f={w} /><B g="s2" f={w} /><B g="s3" f={w} /></G>,
    8:  <G a='"c s1" "c s2" "s3 s3"' c="2fr 1fr" r="1fr 1fr 1fr"><B g="c" f={cal} /><B g="s1" f={w} /><B g="s2" f={w} /><B g="s3" f={w} /></G>,
    9:  <G a='"c s"' c="1fr 1fr" r="1fr"><B g="c" f={cal} /><B g="s" f={w} /></G>,
    10: <G a='"c" "s"' c="1fr" r="2fr 1fr"><B g="c" f={cal} /><B g="s" f={w} /></G>,
    11: <G a='"s1 s1 s2" "c c s3"' c="1fr 1fr 1fr" r="1fr 1fr"><B g="s1" f={w} /><B g="s2" f={w} /><B g="c" f={cal} /><B g="s3" f={w} /></G>,
    12: <G a='"c s1 s2" "c s3 s4"' c="2fr 1fr 1fr" r="1fr 1fr"><B g="c" f={cal} /><B g="s1" f={w} /><B g="s2" f={w} /><B g="s3" f={w} /><B g="s4" f={w} /></G>,
  };
  return thumbs[id] ?? <div />;
}

function G({ a, c, r, children }: { a: string; c: string; r: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 2, gridTemplateAreas: a, gridTemplateColumns: c, gridTemplateRows: r, height: 48 }}>
      {children}
    </div>
  );
}

function B({ g, f }: { g: string; f: string }) {
  return <div style={{ gridArea: g, background: f, borderRadius: 3 }} />;
}

import { useEffect, useState, useRef } from 'react';
import { useStore, getSkinColors } from '../../store';

type ClockMode = 'digital' | 'analog' | 'military' | 'world' | 'hybrid';

const CITIES = [
  { label: 'New York',     tz: 'America/New_York' },
  { label: 'Los Angeles',  tz: 'America/Los_Angeles' },
  { label: 'Chicago',      tz: 'America/Chicago' },
  { label: 'London',       tz: 'Europe/London' },
  { label: 'Paris',        tz: 'Europe/Paris' },
  { label: 'Dubai',        tz: 'Asia/Dubai' },
  { label: 'Tokyo',        tz: 'Asia/Tokyo' },
  { label: 'Sydney',       tz: 'Australia/Sydney' },
  { label: 'São Paulo',    tz: 'America/Sao_Paulo' },
  { label: 'Mumbai',       tz: 'Asia/Kolkata' },
  { label: 'Singapore',    tz: 'Asia/Singapore' },
  { label: 'Seoul',        tz: 'Asia/Seoul' },
  { label: 'Beijing',      tz: 'Asia/Shanghai' },
  { label: 'Cairo',        tz: 'Africa/Cairo' },
  { label: 'Mexico City',  tz: 'America/Mexico_City' },
  { label: 'Denver',       tz: 'America/Denver' },
  { label: 'Toronto',      tz: 'America/Toronto' },
  { label: 'Amsterdam',    tz: 'Europe/Amsterdam' },
  { label: 'Moscow',       tz: 'Europe/Moscow' },
  { label: 'Auckland',     tz: 'Pacific/Auckland' },
];

function getTimeInTz(now: Date, tz: string) {
  return new Date(now.toLocaleString('en-US', { timeZone: tz }));
}

function formatTime(d: Date, military: boolean) {
  if (military) {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${h}${m}${s}Z`;
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

interface AnalogFaceProps { now: Date; color: string; size?: number }
function AnalogFace({ now, color, size = 100 }: AnalogFaceProps) {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourDeg = (h * 30) + (m * 0.5);
  const minDeg = m * 6;
  const secDeg = s * 6;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Face */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)" stroke={`${color}30`} strokeWidth={1.5} />
      {/* Hour marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const inner = r - 8, outer = r - 3;
        return (
          <line key={i}
            x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
            x2={cx + outer * Math.cos(a)} y2={cy + outer * Math.sin(a)}
            stroke={`${color}60`} strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round"
          />
        );
      })}
      {/* Hour hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + (r * 0.5) * Math.cos((hourDeg - 90) * (Math.PI / 180))}
        y2={cy + (r * 0.5) * Math.sin((hourDeg - 90) * (Math.PI / 180))}
        stroke={color} strokeWidth={3} strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + (r * 0.72) * Math.cos((minDeg - 90) * (Math.PI / 180))}
        y2={cy + (r * 0.72) * Math.sin((minDeg - 90) * (Math.PI / 180))}
        stroke={color} strokeWidth={2} strokeLinecap="round"
      />
      {/* Second hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + (r * 0.8) * Math.cos((secDeg - 90) * (Math.PI / 180))}
        y2={cy + (r * 0.8) * Math.sin((secDeg - 90) * (Math.PI / 180))}
        stroke="#EF4444" strokeWidth={1} strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </svg>
  );
}

const MODES: { id: ClockMode; label: string }[] = [
  { id: 'digital',  label: 'Digital'  },
  { id: 'analog',   label: 'Analog'   },
  { id: 'military', label: 'Military' },
  { id: 'hybrid',   label: 'Hybrid'   },
  { id: 'world',    label: 'World'    },
];

export default function ClockWidget() {
  const skin = useStore(s => s.skin);
  const { color } = getSkinColors(skin);
  const [now, setNow] = useState(new Date());
  const [mode, setMode] = useState<ClockMode>('digital');
  const [showSettings, setShowSettings] = useState(false);
  const [citySlots, setCitySlots] = useState<string[]>([
    'America/New_York', 'Europe/London', 'Asia/Tokyo',
  ]);
  const modeIdx = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  function cycleMode() {
    modeIdx.current = (modeIdx.current + 1) % MODES.length;
    setMode(MODES[modeIdx.current].id);
  }

  function setCity(slot: number, tz: string) {
    setCitySlots(prev => prev.map((c, i) => i === slot ? tz : c));
  }

  function removeCity(slot: number) {
    setCitySlots(prev => prev.filter((_, i) => i !== slot));
  }

  function addCity() {
    if (citySlots.length >= 3) return;
    const unused = CITIES.find(c => !citySlots.includes(c.tz));
    if (unused) setCitySlots(prev => [...prev, unused.tz]);
  }

  return (
    <div className="widget-card h-full flex flex-col select-none" style={{ position: 'relative' }}>
      {/* Mode bar */}
      <div className="shrink-0 flex gap-0.5 p-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); modeIdx.current = MODES.findIndex(x => x.id === m.id); }}
            style={{
              flex: 1, padding: '3px 2px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: mode === m.id ? `${color}22` : 'transparent',
              color: mode === m.id ? color : 'var(--w-text-faint)',
              fontSize: '0.52rem', fontWeight: 700, fontFamily: 'monospace',
              borderBottom: mode === m.id ? `1.5px solid ${color}` : '1.5px solid transparent',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
        {(mode === 'digital' || mode === 'hybrid') && (
          <div
            className="font-mono font-bold tabular-nums leading-none"
            style={{ fontSize: mode === 'hybrid' ? 'clamp(1.4rem,4vw,2rem)' : 'clamp(2rem,5vw,3.5rem)', color, letterSpacing: '-0.02em', textShadow: `0 0 30px ${color}50` }}
          >
            {hh}<span style={{ opacity: 0.7, animation: 'pulse 1s ease-in-out infinite', display: 'inline-block' }}>:</span>{mm}
            <span className="ml-1.5" style={{ fontSize: mode === 'hybrid' ? '0.9rem' : '1.1rem', color: 'var(--w-text-faint)', fontWeight: 500 }}>{ss}</span>
          </div>
        )}

        {(mode === 'analog' || mode === 'hybrid') && (
          <AnalogFace now={now} color={color} size={mode === 'hybrid' ? 80 : 120} />
        )}

        {mode === 'military' && (
          <div className="text-center">
            <div className="font-mono font-black tabular-nums" style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', color, letterSpacing: '0.08em', textShadow: `0 0 20px ${color}60` }}>
              {now.getHours().toString().padStart(2, '0')}{mm}{ss}Z
            </div>
            <div className="mt-1 text-xs font-mono" style={{ color: 'var(--w-text-dim)', letterSpacing: '0.15em' }}>
              ZULU TIME
            </div>
          </div>
        )}

        {mode === 'world' && (
          <div className="w-full flex flex-col gap-2">
            {citySlots.map((tz, i) => {
              const cityTime = getTimeInTz(now, tz);
              const cityInfo = CITIES.find(c => c.tz === tz);
              const hh2 = cityTime.getHours().toString().padStart(2, '0');
              const mm2 = cityTime.getMinutes().toString().padStart(2, '0');
              const ampm = cityTime.getHours() < 12 ? 'AM' : 'PM';
              return (
                <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <select value={tz} onChange={e => setCity(i, e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--w-text-dim)', fontSize: '0.65rem', fontFamily: 'monospace', cursor: 'pointer', outline: 'none', maxWidth: 110 }}>
                    {CITIES.map(c => <option key={c.tz} value={c.tz} style={{ background: '#0D0D1A' }}>{c.label}</option>)}
                  </select>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold tabular-nums" style={{ color, fontSize: '0.95rem' }}>{hh2}:{mm2}</span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--w-text-faint)', fontFamily: 'monospace' }}>{ampm}</span>
                    <button onClick={() => removeCity(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-faint)', padding: 1, lineHeight: 1 }}>×</button>
                  </div>
                </div>
              );
            })}
            {citySlots.length < 3 && (
              <button onClick={addCity} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: '6px', cursor: 'pointer', color: 'var(--w-text-faint)', fontSize: '0.62rem', fontFamily: 'monospace' }}>
                + add city
              </button>
            )}
          </div>
        )}

        {mode !== 'world' && (
          <div className="text-xs" style={{ color: 'var(--w-text-faint)' }}>{day}</div>
        )}
      </div>
    </div>
  );
}

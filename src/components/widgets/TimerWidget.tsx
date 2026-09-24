import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

type Tab = 'timer' | 'alarm';

type AlarmEntry = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
};

function beep(ctx: AudioContext, freq: number, dur: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(); osc.stop(ctx.currentTime + dur);
}

function alarmSound(ctx: AudioContext) {
  [880, 1046, 880, 1046, 880].forEach((f, i) => {
    setTimeout(() => beep(ctx, f, 0.3), i * 200);
  });
}

export default function TimerWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [tab, setTab] = useState<Tab>('timer');

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [input, setInput] = useState('05:00');
  const [running, setRunning] = useState(false);
  const [fired, setFired] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Alarm state
  const [alarms, setAlarms] = useState<AlarmEntry[]>([
    { id: '1', time: '07:00', label: '', enabled: false },
  ]);
  const [firedIds, setFiredIds] = useState<Set<string>>(new Set());

  function getCtx() {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    return audioCtx.current;
  }

  function parseInput(s: string) {
    const parts = s.split(':');
    if (parts.length === 2) return parseInt(parts[0] || '0') * 60 + parseInt(parts[1] || '0');
    return parseInt(s) || 0;
  }

  function startTimer() {
    const total = seconds > 0 ? seconds : parseInput(input);
    if (total <= 0) return;
    setSeconds(total); setRunning(true); setFired(false);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setRunning(false); setFired(true);
            alarmSound(getCtx());
            for (let i = 1; i <= 5; i++) setTimeout(() => alarmSound(getCtx()), i * 700);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Multi-alarm checker
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const t = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (now.getSeconds() >= 5) return;
      alarms.filter(a => a.enabled && a.time === t).forEach(a => {
        setFiredIds(prev => {
          if (prev.has(a.id)) return prev;
          for (let i = 0; i < 10; i++) setTimeout(() => alarmSound(getCtx()), i * 700);
          return new Set([...prev, a.id]);
        });
      });
    }, 1000);
    return () => clearInterval(id);
  }, [alarms]);

  function addAlarm() {
    setAlarms(prev => [...prev, { id: Date.now().toString(), time: '08:00', label: '', enabled: false }]);
  }

  function deleteAlarm(id: string) {
    setAlarms(prev => prev.filter(a => a.id !== id));
    setFiredIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  function updateAlarm(id: string, changes: Partial<AlarmEntry>) {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a));
  }

  function dismissAlarm(id: string) {
    setFiredIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    updateAlarm(id, { enabled: false });
  }

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  const total = parseInput(input);
  const pct = total > 0 ? ((total - seconds) / total) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;
  const anyFired = firedIds.size > 0;

  return (
    <div className="widget-card h-full flex flex-col p-3 select-none">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {(['timer', 'alarm'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
            style={{
              background: tab === t ? color : 'transparent',
              color: tab === t ? '#fff' : 'var(--w-text-dim)',
              boxShadow: tab === t ? `0 2px 10px ${glow}` : 'none',
            }}
          >
            {t === 'alarm' && anyFired ? '⏰' : ''}{t}
          </button>
        ))}
      </div>

      {tab === 'timer' && (
        <div className="flex flex-col items-center flex-1">
          <div className="relative my-2">
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={color} strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono font-bold text-xl" style={{ color: fired ? '#EF4444' : 'var(--w-text-main)' }}>
                {mm}:{ss}
              </span>
            </div>
          </div>

          {!running && seconds === 0 && (
            <input
              className="input-dark text-center font-mono text-lg mb-3 !py-2"
              placeholder="05:00"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          )}

          {fired && (
            <p className="text-xs font-bold mb-2 animate-pulse" style={{ color: '#EF4444' }}>⏰ time's up!</p>
          )}

          <div className="flex gap-2 mt-auto">
            {!running ? (
              <button className="btn-pill btn-primary" style={{ background: color, boxShadow: `0 4px 16px ${glow}` }} onClick={startTimer}>
                <Play size={13} fill="#fff" /> start
              </button>
            ) : (
              <button className="btn-pill btn-ghost" onClick={() => setRunning(false)}>
                <Pause size={13} /> pause
              </button>
            )}
            <button className="btn-pill btn-ghost" onClick={() => { setRunning(false); setSeconds(0); setFired(false); }}>
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}

      {tab === 'alarm' && (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {alarms.map(alarm => (
            <div key={alarm.id}>
              {firedIds.has(alarm.id) && (
                <div
                  className="w-full py-2 rounded-xl text-center text-xs font-bold mb-1"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', animation: 'alarm-pulse 0.8s ease-in-out infinite' }}
                >
                  ⏰ {alarm.label || 'ALARM'} — WAKE UP!
                  <button
                    onClick={() => dismissAlarm(alarm.id)}
                    style={{ marginLeft: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '2px 8px', color: '#EF4444', cursor: 'pointer', fontSize: '0.65rem' }}
                  >
                    dismiss
                  </button>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: alarm.enabled ? `${color}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${alarm.enabled ? color + '30' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12,
                  padding: '7px 10px',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="time"
                  value={alarm.time}
                  onChange={e => updateAlarm(alarm.id, { time: e.target.value })}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: alarm.enabled ? color : 'var(--w-text-main)',
                    letterSpacing: '-0.02em',
                    width: 90,
                    flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  value={alarm.label}
                  onChange={e => updateAlarm(alarm.id, { label: e.target.value })}
                  placeholder="label…"
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    color: 'var(--w-text-dim)',
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={() => updateAlarm(alarm.id, { enabled: !alarm.enabled })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: alarm.enabled ? color : 'var(--w-text-faint)', padding: 2, flexShrink: 0 }}
                  title={alarm.enabled ? 'Turn off' : 'Turn on'}
                >
                  {alarm.enabled ? <Bell size={13} /> : <BellOff size={13} />}
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-faint)', padding: 2, flexShrink: 0 }}
                  title="Delete alarm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addAlarm}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '7px 10px',
              borderRadius: 12,
              background: 'transparent',
              border: `1px dashed ${color}40`,
              cursor: 'pointer',
              color: color,
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              marginTop: 2,
            }}
          >
            <Plus size={12} /> add alarm
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, BellOff } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

type Tab = 'timer' | 'alarm';

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
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [alarmOn, setAlarmOn] = useState(false);
  const [alarmFired, setAlarmFired] = useState(false);

  function getCtx() {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    return audioCtx.current;
  }

  // Parse MM:SS
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

  // Alarm checker
  useEffect(() => {
    if (!alarmOn) return;
    const id = setInterval(() => {
      const now = new Date();
      const t = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
      if (t === alarmTime && now.getSeconds() < 5) {
        setAlarmFired(true);
        for (let i = 0; i < 10; i++) setTimeout(() => alarmSound(getCtx()), i * 700);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [alarmOn, alarmTime]);

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  const total = parseInput(input);
  const pct = total > 0 ? ((total - seconds) / total) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="widget-card h-full flex flex-col p-3 select-none">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {(['timer','alarm'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
            style={{
              background: tab === t ? color : 'transparent',
              color: tab === t ? '#fff' : 'rgba(226,232,240,0.4)',
              boxShadow: tab === t ? `0 2px 10px ${glow}` : 'none',
            }}
          >{t}</button>
        ))}
      </div>

      {tab === 'timer' && (
        <div className="flex flex-col items-center flex-1">
          {/* Ring */}
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
              <span className="font-mono font-bold text-xl" style={{ color: fired ? '#EF4444' : '#E2E8F0' }}>
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
        <div className="flex flex-col items-center gap-4 flex-1 pt-2">
          <input
            type="time"
            className="input-dark text-center font-mono text-3xl font-bold !py-3"
            style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', letterSpacing: '-0.02em', color }}
            value={alarmTime}
            onChange={e => setAlarmTime(e.target.value)}
          />

          {alarmFired && (
            <div className="w-full py-3 rounded-2xl text-center text-sm font-bold animate-pulse" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', animation: 'alarm-pulse 0.8s ease-in-out infinite' }}>
              ⏰ WAKE UP!
            </div>
          )}

          <button
            className="btn-pill w-full"
            style={{ background: alarmOn ? color : 'rgba(255,255,255,0.05)', color: alarmOn ? '#fff' : 'rgba(226,232,240,0.5)', boxShadow: alarmOn ? `0 4px 20px ${glow}` : 'none', border: `1px solid ${alarmOn ? color + '50' : 'rgba(255,255,255,0.1)'}` }}
            onClick={() => { setAlarmOn(!alarmOn); setAlarmFired(false); }}
          >
            {alarmOn ? <Bell size={14} /> : <BellOff size={14} />}
            {alarmOn ? 'alarm on' : 'set alarm'}
          </button>

          {alarmFired && (
            <button className="btn-pill btn-ghost w-full" onClick={() => { setAlarmFired(false); setAlarmOn(false); }}>
              dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}

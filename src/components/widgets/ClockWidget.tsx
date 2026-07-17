import { useEffect, useState } from 'react';
import { useStore, getSkinColors } from '../../store';

export default function ClockWidget() {
  const skin = useStore(s => s.skin);
  const { color } = getSkinColors(skin);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="widget-card h-full flex flex-col items-center justify-center p-4 select-none">
      <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(226,232,240,0.3)' }}>
        clock
      </div>
      <div
        className="font-mono font-bold tabular-nums leading-none"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color, letterSpacing: '-0.02em', textShadow: `0 0 40px ${color}60` }}
      >
        {hh}<span style={{ animation: 'pulse 1s ease-in-out infinite', display: 'inline-block' }}>:</span>{mm}
        <span className="ml-2 text-xl font-medium" style={{ color: 'rgba(226,232,240,0.3)' }}>{ss}</span>
      </div>
      <div className="mt-3 text-sm" style={{ color: 'rgba(226,232,240,0.4)' }}>{day}</div>
    </div>
  );
}

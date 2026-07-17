import { useState } from 'react';
import { Delete } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

const BTNS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

export default function CalculatorWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [expr, setExpr] = useState('');
  const [display, setDisplay] = useState('0');
  const [fresh, setFresh] = useState(true);

  function press(btn: string) {
    if (btn === 'C') { setExpr(''); setDisplay('0'); setFresh(true); return; }
    if (btn === '⌫') {
      const next = display.length > 1 ? display.slice(0, -1) : '0';
      setDisplay(next); setExpr(expr.slice(0, -1)); return;
    }
    if (btn === '=') {
      try {
        const raw = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
        const result = Function('"use strict"; return (' + raw + ')')();
        const str = Number.isFinite(result) ? String(parseFloat(result.toFixed(10))) : 'Error';
        setDisplay(str); setExpr(str); setFresh(true);
      } catch { setDisplay('Error'); setFresh(true); }
      return;
    }
    if (btn === '±') {
      const toggled = display.startsWith('-') ? display.slice(1) : '-' + display;
      setDisplay(toggled); setExpr(expr.slice(0, -display.length) + toggled); return;
    }
    if (btn === '%') {
      const val = parseFloat(display) / 100;
      const str = String(val);
      setDisplay(str); setExpr(expr.slice(0, -display.length) + str); return;
    }
    if (fresh && !['÷','×','−','+'].includes(btn)) {
      setDisplay(btn === '.' ? '0.' : btn); setExpr(btn); setFresh(false); return;
    }
    const next = (fresh ? '' : display === '0' && !['÷','×','−','+'].includes(btn) ? '' : display) ;
    const newDisplay = [...'÷×−+'].includes(btn) ? btn : display + btn;
    setDisplay(['÷','×','−','+'].includes(btn) ? display : newDisplay);
    setExpr(expr + btn);
    setFresh(false);
  }

  const isOp = (b: string) => ['÷', '×', '−', '+', '='].includes(b);
  const isFn = (b: string) => ['C', '±', '%'].includes(b);

  return (
    <div className="widget-card h-full flex flex-col p-3 select-none">
      <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'rgba(226,232,240,0.3)' }}>calculator</div>

      {/* Display */}
      <div
        className="rounded-xl mb-3 px-4 py-3 text-right font-mono font-bold overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="text-xs mb-0.5 h-4 truncate" style={{ color: 'rgba(226,232,240,0.25)' }}>{expr || ' '}</div>
        <div style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#E2E8F0', letterSpacing: '-0.02em' }}>{display}</div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {BTNS.flat().map((btn, i) => (
          <button
            key={i}
            onClick={() => press(btn)}
            className="rounded-xl font-mono font-semibold text-sm transition-all active:scale-95"
            style={{
              background: isOp(btn) ? color : isFn(btn) ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
              color: isOp(btn) ? '#fff' : isFn(btn) ? 'rgba(226,232,240,0.8)' : 'rgba(226,232,240,0.9)',
              border: `1px solid ${isOp(btn) ? color + '60' : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isOp(btn) ? `0 2px 12px ${glow}` : 'none',
              cursor: 'pointer',
              minHeight: 44,
              gridColumn: btn === '0' ? 'span 1' : undefined,
            }}
          >
            {btn === '⌫' ? <Delete size={14} style={{ margin: 'auto' }} /> : btn}
          </button>
        ))}
      </div>
    </div>
  );
}

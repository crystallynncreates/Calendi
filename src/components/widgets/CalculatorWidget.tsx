import { useState, useCallback } from 'react';

interface HistoryLine { expr: string; result: string }

type BtnStyle = 'num' | 'op' | 'fn' | 'top' | 'second' | 'alpha' | 'enter' | 'on' | 'nav' | 'dark';

interface Btn { label: string; style: BtnStyle; action: string }

const ROWS: Btn[][] = [
  [
    { label:'Y=',    style:'top',   action:'' },
    { label:'WIN',   style:'top',   action:'' },
    { label:'ZOOM',  style:'top',   action:'' },
    { label:'TRACE', style:'top',   action:'' },
    { label:'GRAPH', style:'top',   action:'' },
  ],
  [
    { label:'2nd',   style:'second',action:'2nd' },
    { label:'MODE',  style:'dark',  action:'' },
    { label:'DEL',   style:'dark',  action:'del' },
    { label:'↑',     style:'nav',   action:'' },
    { label:'STAT',  style:'dark',  action:'' },
  ],
  [
    { label:'ALPHA', style:'alpha', action:'' },
    { label:'X',     style:'dark',  action:'x' },
    { label:'←',     style:'nav',   action:'' },
    { label:'●',     style:'nav',   action:'enter' },
    { label:'→',     style:'nav',   action:'' },
  ],
  [
    { label:'MATH',  style:'dark',  action:'' },
    { label:'APPS',  style:'dark',  action:'' },
    { label:'↓',     style:'nav',   action:'' },
    { label:'PRGM',  style:'dark',  action:'' },
    { label:'VARS',  style:'dark',  action:'' },
  ],
  [
    { label:'CLEAR', style:'dark',  action:'clear' },
    { label:'x⁻¹',  style:'fn',    action:'^(-1)' },
    { label:'SIN',   style:'fn',    action:'sin(' },
    { label:'COS',   style:'fn',    action:'cos(' },
    { label:'TAN',   style:'fn',    action:'tan(' },
  ],
  [
    { label:'^',     style:'fn',    action:'^' },
    { label:'x²',   style:'fn',    action:'^2' },
    { label:'√',     style:'fn',    action:'sqrt(' },
    { label:'(',     style:'fn',    action:'(' },
    { label:')',     style:'fn',    action:')' },
  ],
  [
    { label:'LOG',   style:'fn',    action:'log(' },
    { label:'7',     style:'num',   action:'7' },
    { label:'8',     style:'num',   action:'8' },
    { label:'9',     style:'num',   action:'9' },
    { label:'÷',     style:'op',    action:'/' },
  ],
  [
    { label:'LN',    style:'fn',    action:'ln(' },
    { label:'4',     style:'num',   action:'4' },
    { label:'5',     style:'num',   action:'5' },
    { label:'6',     style:'num',   action:'6' },
    { label:'×',     style:'op',    action:'*' },
  ],
  [
    { label:'STO→',  style:'fn',    action:'' },
    { label:'1',     style:'num',   action:'1' },
    { label:'2',     style:'num',   action:'2' },
    { label:'3',     style:'num',   action:'3' },
    { label:'+',     style:'op',    action:'+' },
  ],
  [
    { label:'ON',    style:'on',    action:'on' },
    { label:'0',     style:'num',   action:'0' },
    { label:'.',     style:'num',   action:'.' },
    { label:'(-)',   style:'fn',    action:'-' },
    { label:'ENTER', style:'enter', action:'enter' },
  ],
];

function btnBg(s: BtnStyle, isPressed: boolean): string {
  const map: Record<BtnStyle, string> = {
    num:    isPressed ? '#c5d0e0' : '#d8e2f0',
    op:     isPressed ? '#1a36b0' : '#1e40af',
    fn:     isPressed ? '#153280' : '#1e3a8a',
    top:    isPressed ? '#233f78' : '#2a4a7a',
    second: isPressed ? '#c49200' : '#d4a900',
    alpha:  isPressed ? '#145c30' : '#166534',
    enter:  isPressed ? '#1840c8' : '#1d4ed8',
    on:     isPressed ? '#283a4c' : '#334155',
    nav:    isPressed ? '#2d3748' : '#374151',
    dark:   isPressed ? '#162236' : '#1e2d44',
  };
  return map[s];
}
function btnColor(s: BtnStyle): string {
  if (s === 'num') return '#0d1a30';
  if (s === 'second') return '#0d1a00';
  if (s === 'alpha') return '#f0fff4';
  return '#e2e8f0';
}

function evalExpr(raw: string): string {
  try {
    let e = raw
      .replace(/sin\(/g,  '(Math.sin(Math.PI/180*')
      .replace(/cos\(/g,  '(Math.cos(Math.PI/180*')
      .replace(/tan\(/g,  '(Math.tan(Math.PI/180*')
      .replace(/ln\(/g,   '(Math.log(')
      .replace(/log\(/g,  '(Math.log10(')
      .replace(/sqrt\(/g, '(Math.sqrt(')
      .replace(/\^/g,     '**')
      .replace(/π/g,      'Math.PI')
      .replace(/e(?!\d)/g,'Math.E');
    const open  = (e.match(/\(/g) || []).length;
    const close = (e.match(/\)/g) || []).length;
    e += ')'.repeat(Math.max(0, open - close));
    const fn = Function('"use strict"; return (' + e + ')') as () => unknown;
    const result = fn();
    const num = typeof result === 'number' ? result : NaN;
    if (!Number.isFinite(num)) return 'ERR:DOMAIN';
    const str = parseFloat(num.toFixed(10)).toString();
    return str.length > 13 ? num.toExponential(5) : str;
  } catch { return 'ERR:SYNTAX'; }
}

export default function CalculatorWidget() {
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [afterResult, setAfterResult] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const flash = useCallback((lbl: string) => {
    setPressedKey(lbl);
    setTimeout(() => setPressedKey(null), 110);
  }, []);

  function press(btn: Btn) {
    flash(btn.label);
    const a = btn.action;
    if (!a) return;
    if (a === 'clear') { setExpr(''); setAfterResult(false); return; }
    if (a === 'del')   { setExpr(e => e.slice(0, -1)); setAfterResult(false); return; }
    if (a === 'on')    { setExpr(''); setHistory([]); setAfterResult(false); return; }
    if (a === '2nd')   return;
    if (a === 'enter') {
      if (!expr) return;
      const result = evalExpr(expr);
      setHistory(h => [...h.slice(-4), { expr, result }]);
      setExpr(result.startsWith('ERR') ? '' : result);
      setAfterResult(true);
      return;
    }
    const isOp = ['/', '*', '+', '-', '^'].includes(a) || a.endsWith('(');
    if (afterResult && !isOp) { setExpr(a); }
    else                       { setExpr(e => e + a); }
    setAfterResult(false);
  }

  const lastLine = history[history.length - 1];

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection:'column',
      background: 'linear-gradient(160deg,#1e3a8a 0%,#111f54 100%)',
    }}>
      <p style={{ fontSize:'0.45rem', color:'rgba(255,255,255,0.3)', margin:'5px 8px 0', fontFamily:'monospace', letterSpacing:0.3 }}>🧮 calculator — TI-84 style, crunch numbers without leaving the page</p>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{
        background: 'linear-gradient(170deg,#2040a0 0%,#172d72 55%,#111f54 100%)',
        borderRadius: 12, padding: '8px 7px 10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.09)',
        width: '100%', maxWidth: 230,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {/* Brand label */}
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 1 }}>
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.48rem', fontWeight:700, letterSpacing:1 }}>TI-84 Plus CE</span>
          <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.42rem', letterSpacing: 0.5 }}>TEXAS INSTRUMENTS</span>
        </div>

        {/* Screen */}
        <div style={{
          background: '#c8d8c0',
          borderRadius: 3, border: '2px solid #8a94a6',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.45)',
          padding: '4px 7px', minHeight: 65,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          overflow: 'hidden', fontFamily: "'Courier New', monospace",
        }}>
          {history.slice(-2).map((h, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontSize:'0.5rem', color:'#4a6a4a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'55%' }}>{h.expr}</span>
              <span style={{ fontSize:'0.58rem', color:'#3a5a3a' }}>{h.result}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:1 }}>
            <span style={{ fontSize:'0.58rem', color:'#0d1f0d', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'65%' }}>
              {expr || (lastLine ? 'Ans' : '')}
            </span>
            {afterResult && lastLine && (
              <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#0d1f0d' }}>{lastLine.result}</span>
            )}
          </div>
          {!afterResult && (
            <div style={{ height:1.5, width:7, background:'#0d1f0d', marginTop:1, opacity:0.8 }} />
          )}
        </div>

        {/* Buttons */}
        {ROWS.map((row, ri) => (
          <div key={ri} style={{ display:'flex', gap:2 }}>
            {row.map((btn) => {
              const ip = pressedKey === btn.label;
              const isEnter = btn.style === 'enter';
              return (
                <button key={btn.label} onClick={() => press(btn)} style={{
                  flex: isEnter ? 1.4 : 1,
                  background: btnBg(btn.style, ip),
                  color: btnColor(btn.style),
                  border: 'none', borderRadius: 3, cursor: btn.action ? 'pointer' : 'default',
                  fontSize: ri === 0 ? '0.4rem' : btn.label.length > 4 ? '0.42rem' : '0.5rem',
                  fontWeight: 700, fontFamily: "'Courier New', monospace",
                  letterSpacing: '-0.02em', lineHeight: 1.2,
                  padding: ri === 0 ? '2px 0' : '3px 0',
                  boxShadow: ip ? 'none' : '0 2px 0 rgba(0,0,0,0.4)',
                  transform: ip ? 'translateY(1px)' : 'none',
                  transition: 'transform 0.05s, box-shadow 0.05s',
                  opacity: btn.action ? 1 : 0.65,
                  userSelect: 'none',
                }}>
                  {btn.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

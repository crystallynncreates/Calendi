import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Bold, Italic, Underline, List, AlignLeft, AlignCenter, Highlighter, Type } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

interface Note { id: string; title: string; html: string; updated: number }

const NOTES_KEY = 'calendi-notes-v2';

function load(): Note[] {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { return []; }
}
function save(notes: Note[]) { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }

type FormatCmd = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'justifyLeft' | 'justifyCenter';

const TOOLBAR: { cmd: FormatCmd; icon: React.ReactNode; title: string }[] = [
  { cmd:'bold',                icon:<Bold size={11}/>,        title:'Bold' },
  { cmd:'italic',              icon:<Italic size={11}/>,      title:'Italic' },
  { cmd:'underline',           icon:<Underline size={11}/>,   title:'Underline' },
  { cmd:'insertUnorderedList', icon:<List size={11}/>,        title:'Bullet list' },
  { cmd:'justifyLeft',         icon:<AlignLeft size={11}/>,   title:'Align left' },
  { cmd:'justifyCenter',       icon:<AlignCenter size={11}/>, title:'Align center' },
];

const FONT_SIZES = ['10px','12px','14px','16px','18px','24px','32px'];
const HIGHLIGHT_COLORS = ['#FFE066','#A8F0A8','#A8D8FF','#FFB3BA','#E8B0FF'];

export default function NotesWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [notes, setNotes] = useState<Note[]>(load);
  const [activeId, setActiveId] = useState<string | null>(() => load()[0]?.id ?? null);
  const [saved, setSaved] = useState(false);
  const [fontSize, setFontSize] = useState('14px');
  const [showHl, setShowHl] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = notes.find(n => n.id === activeId) ?? null;

  function persist(updated: Note[]) {
    setNotes(updated);
    save(updated);
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 1500);
  }

  function newNote() {
    const note: Note = { id: Date.now().toString(), title:'Untitled Note', html:'', updated:Date.now() };
    const updated = [note, ...notes];
    persist(updated);
    setActiveId(note.id);
  }

  function deleteActive() {
    if (!active) return;
    const updated = notes.filter(n => n.id !== active.id);
    persist(updated);
    setActiveId(updated[0]?.id ?? null);
  }

  function updateTitle(val: string) {
    if (!active) return;
    persist(notes.map(n => n.id === active.id ? { ...n, title:val, updated:Date.now() } : n));
  }

  const saveHtml = useCallback(() => {
    if (!active || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    persist(notes.map(n => n.id === active.id ? { ...n, html, updated:Date.now() } : n));
  }, [active, notes]);

  useEffect(() => {
    if (editorRef.current && active) {
      if (editorRef.current.innerHTML !== active.html) {
        editorRef.current.innerHTML = active.html;
      }
    }
  }, [activeId]);

  function exec(cmd: FormatCmd) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
    saveHtml();
  }

  function applyFontSize(size: string) {
    setFontSize(size);
    document.execCommand('fontSize', false, '7');
    const spans = editorRef.current?.querySelectorAll('font[size="7"]') ?? [];
    spans.forEach(s => {
      (s as HTMLElement).removeAttribute('size');
      (s as HTMLElement).style.fontSize = size;
    });
    editorRef.current?.focus();
    saveHtml();
  }

  function applyHighlight(hex: string) {
    document.execCommand('backColor', false, hex);
    setShowHl(false);
    editorRef.current?.focus();
    saveHtml();
  }

  function wordCount() {
    const text = editorRef.current?.innerText ?? active?.html.replace(/<[^>]+>/g,'') ?? '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor:`${color}25` }}>
      <p style={{ fontSize:'0.48rem', color:'var(--w-text-faint)', margin:'5px 10px 0', fontFamily:'monospace', letterSpacing:0.3, flexShrink:0 }}>📝 notes — write, bold, highlight &amp; save — your thoughts always within reach</p>
      <div className="flex flex-1 min-h-0">
      {/* Note list sidebar */}
      {notes.length > 1 && (
        <div style={{ width:100, borderRight:'1px solid rgba(255,255,255,0.06)', overflowY:'auto', flexShrink:0 }}>
          <div className="p-1.5">
            {notes.map(n => (
              <button key={n.id} onClick={() => setActiveId(n.id)}
                style={{
                  display:'block', width:'100%', textAlign:'left', padding:'5px 7px',
                  borderRadius:7, marginBottom:2, cursor:'pointer',
                  background: n.id===activeId ? `${color}15` : 'transparent',
                  border:`1px solid ${n.id===activeId ? color+'35' : 'transparent'}`,
                }}>
                <p className="text-xs font-medium truncate" style={{ color: n.id===activeId ? color : 'var(--w-text-dim)' }}>{n.title || 'Untitled'}</p>
                <p style={{ color:'var(--w-text-faint)', fontSize:'0.58rem', marginTop:1 }}>{new Date(n.updated).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0" style={{ padding:'10px 12px 8px' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color:'var(--w-text-faint)' }}>notes</span>
          <div className="flex gap-1 items-center">
            {saved && <span style={{ fontSize:'0.65rem', fontFamily:'monospace', color:`${color}80` }}>saved ✓</span>}
            <button className="btn-ghost btn-pill !px-1.5 !py-1" onClick={newNote} title="New note">
              <Plus size={11} style={{ color }} />
            </button>
            {active && (
              <button className="btn-ghost btn-pill !px-1.5 !py-1" onClick={deleteActive} style={{ color:'rgba(239,68,68,0.5)' }}>
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>

        {active ? (
          <>
            {/* Title */}
            <input
              className="bg-transparent border-none outline-none font-semibold text-sm shrink-0 mb-1.5"
              style={{ color:'var(--w-text-main)', borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:5 }}
              value={active.title}
              onChange={e => updateTitle(e.target.value)}
              placeholder="Note title"
            />

            {/* Toolbar */}
            <div style={{
              display:'flex', gap:2, alignItems:'center', padding:'3px 4px', marginBottom:6,
              background:'rgba(255,255,255,0.03)', borderRadius:8, flexShrink:0, flexWrap:'wrap',
            }}>
              {TOOLBAR.map(t => (
                <button key={t.cmd} title={t.title} onClick={() => exec(t.cmd)}
                  style={{
                    background:'none', border:'none', cursor:'pointer', borderRadius:4,
                    color:'var(--w-text-dim)', padding:'3px 4px',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  {t.icon}
                </button>
              ))}

              {/* Font size */}
              <select value={fontSize} onChange={e => applyFontSize(e.target.value)}
                style={{
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                  color:'var(--w-text-dim)', borderRadius:4, fontSize:'0.6rem',
                  padding:'1px 2px', cursor:'pointer', fontFamily:'monospace',
                }}>
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Highlight */}
              <div style={{ position:'relative' }}>
                <button title="Highlight" onClick={() => setShowHl(v=>!v)}
                  style={{ background:'none', border:'none', cursor:'pointer', borderRadius:4, color:'var(--w-text-dim)', padding:'3px 4px' }}>
                  <Highlighter size={11}/>
                </button>
                {showHl && (
                  <div style={{
                    position:'absolute', top:'100%', left:0, zIndex:50,
                    background:'#1e2d44', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8,
                    padding:6, display:'flex', gap:4, boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
                  }}>
                    {HIGHLIGHT_COLORS.map(c => (
                      <button key={c} onClick={() => applyHighlight(c)}
                        style={{ width:16, height:16, borderRadius:4, background:c, border:'none', cursor:'pointer' }} />
                    ))}
                    <button onClick={() => { document.execCommand('backColor', false, 'transparent'); setShowHl(false); editorRef.current?.focus(); }}
                      style={{ width:16, height:16, borderRadius:4, background:'transparent', border:'1px solid rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'0.6rem', color:'var(--w-text-dim)' }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Editable content area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={saveHtml}
              onBlur={saveHtml}
              style={{
                flex:1, outline:'none', overflowY:'auto',
                color:'var(--w-text-main)', fontSize:fontSize,
                lineHeight:1.6, fontFamily:'inherit',
                minHeight:0,
              }}
              data-placeholder="Start writing…"
            />

            {/* Footer */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:4, marginTop:4, flexShrink:0 }}>
              <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-faint)' }}>
                {wordCount()} words
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Type size={22} style={{ color:'var(--w-text-faint)' }} />
            <p style={{ color:'var(--w-text-faint)', fontSize:'0.75rem', textAlign:'center' }}>no notes yet</p>
            <button className="btn-pill !text-xs !py-1.5"
              style={{ background:color, color:'#fff', boxShadow:`0 4px 16px ${glow}` }}
              onClick={newNote}>
              <Plus size={11} /> new note
            </button>
          </div>
        )}
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--w-text-faint);
          pointer-events: none;
        }
      `}</style>
      </div>
    </div>
  );
}

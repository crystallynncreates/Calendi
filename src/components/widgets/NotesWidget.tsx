import { useState, useEffect, useRef } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

interface Note { id: string; title: string; body: string; updated: number }

const NOTES_KEY = 'calendi-notes';

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); }
  catch { return []; }
}
function saveNotes(notes: Note[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export default function NotesWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [activeId, setActiveId] = useState<string | null>(() => loadNotes()[0]?.id ?? null);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = notes.find(n => n.id === activeId) ?? null;

  function persist(updated: Note[]) {
    setNotes(updated);
    saveNotes(updated);
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 1500);
  }

  function newNote() {
    const note: Note = { id: Date.now().toString(), title: 'untitled note', body: '', updated: Date.now() };
    const updated = [note, ...notes];
    persist(updated);
    setActiveId(note.id);
  }

  function updateActive(field: 'title' | 'body', value: string) {
    if (!active) return;
    persist(notes.map(n => n.id === active.id ? { ...n, [field]: value, updated: Date.now() } : n));
  }

  function deleteActive() {
    if (!active) return;
    const updated = notes.filter(n => n.id !== active.id);
    persist(updated);
    setActiveId(updated[0]?.id ?? null);
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const wordCount = active?.body.trim() ? active.body.trim().split(/\s+/).length : 0;

  return (
    <div className="widget-card h-full flex" style={{ borderColor: `${color}25` }}>
      {/* Note list (sidebar for multi-note) */}
      {notes.length > 1 && (
        <div style={{ width: 110, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', flexShrink: 0 }}>
          <div className="p-2">
            {notes.map(n => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px',
                  borderRadius: 8, background: n.id === activeId ? `${color}15` : 'transparent',
                  border: `1px solid ${n.id === activeId ? color + '35' : 'transparent'}`,
                  cursor: 'pointer', marginBottom: 2,
                }}
              >
                <p className="text-xs font-medium truncate" style={{ color: n.id === activeId ? color : 'rgba(226,232,240,0.55)' }}>{n.title || 'untitled'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.25)', fontSize: '0.6rem' }}>
                  {new Date(n.updated).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 p-3">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(226,232,240,0.3)' }}>notes</span>
          <div className="flex gap-1.5 items-center">
            {saved && <span className="text-xs font-mono" style={{ color: `${color}80` }}>saved</span>}
            <button className="btn-ghost btn-pill !px-1.5 !py-1" onClick={newNote} title="New note">
              <Plus size={11} style={{ color }} />
            </button>
            {active && (
              <button className="btn-ghost btn-pill !px-1.5 !py-1" onClick={deleteActive} title="Delete note" style={{ color: 'rgba(239,68,68,0.5)' }}>
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>

        {active ? (
          <>
            <input
              className="font-semibold bg-transparent border-none outline-none mb-2 text-sm shrink-0"
              style={{ color: '#E2E8F0', borderBottom: `1px solid rgba(255,255,255,0.06)`, paddingBottom: 6 }}
              value={active.title}
              onChange={e => updateActive('title', e.target.value)}
              placeholder="note title"
            />
            <textarea
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
              style={{ color: 'rgba(226,232,240,0.75)', fontFamily: 'inherit' }}
              value={active.body}
              onChange={e => updateActive('body', e.target.value)}
              placeholder="start writing..."
            />
            <div className="shrink-0 pt-1 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-xs font-mono" style={{ color: 'rgba(226,232,240,0.2)' }}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Save size={24} style={{ color: 'rgba(226,232,240,0.15)' }} />
            <p className="text-xs text-center" style={{ color: 'rgba(226,232,240,0.25)' }}>no notes yet</p>
            <button
              className="btn-pill !text-xs !py-1.5"
              style={{ background: color, color: '#fff', boxShadow: `0 4px 16px ${glow}` }}
              onClick={newNote}
            >
              <Plus size={11} /> new note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

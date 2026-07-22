import { useState } from 'react';
import { X, Plus, Check, Trash2, CalendarPlus, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore, getSkinColors } from '../store';
import type { Planner, PlannerType, CheckItem } from '../types';

const PLANNER_META: Record<PlannerType, { label: string; emoji: string; desc: string }> = {
  'date-night':   { label: 'Date Night',    emoji: '🌹', desc: 'Plan a romantic evening' },
  'trip':         { label: 'Trip Planner',  emoji: '✈️', desc: 'Plan travel & adventures' },
  'special-event':{ label: 'Special Event', emoji: '⭐', desc: 'Birthdays, parties & more' },
};

interface Props { onClose: () => void }

export default function PlannerSheet({ onClose }: Props) {
  const { planners, addPlanner, updatePlanner, removePlanner, addEvent, skin } = useStore();
  const { color } = getSkinColors(skin);

  const [activeType, setActiveType] = useState<PlannerType>('date-night');
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', endDate: '', location: '', notes: '', budget: '' });
  const [checklistInput, setChecklistInput] = useState('');

  const typePlanners = planners.filter(p => p.type === activeType);

  function createPlanner() {
    if (!form.title.trim() || !form.date) return;
    const p: Planner = {
      id: Date.now().toString(),
      type: activeType,
      title: form.title.trim(),
      date: form.date,
      endDate: form.endDate || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      checklist: [],
      linkedToCalendar: false,
      createdAt: new Date().toISOString(),
    };
    addPlanner(p);
    setForm({ title: '', date: '', endDate: '', location: '', notes: '', budget: '' });
    setCreating(false);
    setExpandedId(p.id);
  }

  function addCheckItem(planner: Planner) {
    if (!checklistInput.trim()) return;
    const item: CheckItem = { id: Date.now().toString(), text: checklistInput.trim(), done: false };
    updatePlanner({ ...planner, checklist: [...planner.checklist, item] });
    setChecklistInput('');
  }

  function toggleCheck(planner: Planner, itemId: string) {
    updatePlanner({ ...planner, checklist: planner.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c) });
  }

  function removeCheckItem(planner: Planner, itemId: string) {
    updatePlanner({ ...planner, checklist: planner.checklist.filter(c => c.id !== itemId) });
  }

  function addToCalendar(planner: Planner) {
    const meta = PLANNER_META[planner.type];
    addEvent({
      id: `planner-${planner.id}`,
      title: planner.title,
      date: planner.date,
      color: 'pink',
      type: planner.type,
      recur: 'none',
      allDay: true,
      notes: planner.notes,
      address: planner.location,
    });
    updatePlanner({ ...planner, linkedToCalendar: true });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl anim-slide-up flex flex-col" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>planners</h2>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 mx-5 mb-3 p-0.5 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {(Object.keys(PLANNER_META) as PlannerType[]).map(t => {
            const meta = PLANNER_META[t];
            const active = activeType === t;
            return (
              <button key={t} onClick={() => { setActiveType(t); setCreating(false); }}
                className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
                style={{ background: active ? color : 'transparent', color: active ? '#fff' : 'rgba(226,232,240,0.4)', boxShadow: active ? `0 2px 8px ${color}60` : 'none' }}>
                {meta.emoji} {meta.label}
              </button>
            );
          })}
        </div>

        {/* Create button */}
        {!creating && (
          <div className="px-5 mb-3 shrink-0">
            <button onClick={() => setCreating(true)} className="w-full btn-ghost btn-pill gap-1.5 !py-2"
              style={{ color, borderColor: `${color}40`, fontSize: '0.8rem', justifyContent: 'center' }}>
              <Plus size={14} /> new {PLANNER_META[activeType].label.toLowerCase()}
            </button>
          </div>
        )}

        {/* Create form */}
        {creating && (
          <div className="mx-5 mb-3 p-4 rounded-2xl shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-mono mb-3" style={{ color }}>
              {PLANNER_META[activeType].emoji} {PLANNER_META[activeType].desc}
            </p>
            <div className="flex flex-col gap-2">
              <input className="input-dark" placeholder="title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              <div className="grid grid-cols-2 gap-2">
                <input className="input-dark" type="date" placeholder="start date *" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                {activeType === 'trip' && (
                  <input className="input-dark" type="date" placeholder="end date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                )}
              </div>
              <div className="flex gap-2 items-center">
                <MapPin size={13} style={{ color: 'rgba(226,232,240,0.3)', flexShrink: 0 }} />
                <input className="input-dark flex-1" placeholder="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="flex gap-2 items-center">
                <DollarSign size={13} style={{ color: 'rgba(226,232,240,0.3)', flexShrink: 0 }} />
                <input className="input-dark flex-1" placeholder="budget" type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
              </div>
              <textarea className="input-dark" rows={2} placeholder="notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'none' }} />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn-pill btn-ghost flex-1 !text-xs !py-1.5" onClick={() => setCreating(false)}>cancel</button>
              <button className="btn-pill flex-1 !text-xs !py-1.5" style={{ background: color, color: '#fff' }} onClick={createPlanner}>create</button>
            </div>
          </div>
        )}

        {/* Planner list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          {typePlanners.length === 0 && !creating && (
            <div className="flex flex-col items-center py-10 gap-2">
              <span style={{ fontSize: '2.5rem' }}>{PLANNER_META[activeType].emoji}</span>
              <p style={{ color: 'rgba(226,232,240,0.25)', fontSize: '0.8rem' }}>no {PLANNER_META[activeType].label.toLowerCase()}s yet</p>
            </div>
          )}

          {typePlanners.map(p => {
            const expanded = expandedId === p.id;
            const done = p.checklist.filter(c => c.done).length;
            return (
              <div key={p.id} className="mb-2 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.linkedToCalendar ? color + '30' : 'rgba(255,255,255,0.07)'}` }}>
                {/* Planner header row */}
                <button className="w-full flex items-center gap-3 p-3 text-left"
                  onClick={() => setExpandedId(expanded ? null : p.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{PLANNER_META[p.type].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#E2E8F0' }}>{p.title}</p>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(226,232,240,0.35)' }}>
                      {p.date}{p.endDate ? ` → ${p.endDate}` : ''}
                      {p.location ? ` · ${p.location}` : ''}
                      {p.checklist.length > 0 ? ` · ${done}/${p.checklist.length} done` : ''}
                    </p>
                  </div>
                  {expanded ? <ChevronUp size={14} style={{ color: 'rgba(226,232,240,0.3)', flexShrink: 0 }} />
                    : <ChevronDown size={14} style={{ color: 'rgba(226,232,240,0.3)', flexShrink: 0 }} />}
                </button>

                {expanded && (
                  <div className="px-3 pb-3 anim-slide-up">
                    {p.budget != null && (
                      <p style={{ fontSize: '0.68rem', color: 'rgba(226,232,240,0.4)', marginBottom: 8 }}>
                        <DollarSign size={10} style={{ display: 'inline', marginRight: 3 }} />
                        budget: ${p.budget.toFixed(2)}
                      </p>
                    )}
                    {p.notes && <p style={{ fontSize: '0.7rem', color: 'rgba(226,232,240,0.4)', marginBottom: 10 }}>{p.notes}</p>}

                    {/* Checklist */}
                    <p style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'rgba(226,232,240,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>checklist</p>
                    <div className="flex flex-col gap-1 mb-2">
                      {p.checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <button onClick={() => toggleCheck(p, item.id)} style={{
                            width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                            border: `1.5px solid ${item.done ? color : 'rgba(226,232,240,0.25)'}`,
                            background: item.done ? color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}>
                            {item.done && <Check size={9} style={{ color: '#fff' }} />}
                          </button>
                          <span className="flex-1" style={{ fontSize: '0.72rem', color: item.done ? 'rgba(226,232,240,0.25)' : 'rgba(226,232,240,0.65)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                          <button onClick={() => removeCheckItem(p, item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.18)', padding: 2 }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 mb-3">
                      <input className="input-dark !py-1 flex-1" style={{ fontSize: '0.7rem' }} placeholder="add item..."
                        value={checklistInput} onChange={e => setChecklistInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCheckItem(p)} />
                      <button onClick={() => addCheckItem(p)} className="btn-ghost btn-pill !px-2 !py-1" style={{ fontSize: '0.7rem' }}>+</button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!p.linkedToCalendar ? (
                        <button onClick={() => addToCalendar(p)} className="btn-pill flex-1 !text-xs !py-1.5 gap-1"
                          style={{ background: color, color: '#fff' }}>
                          <CalendarPlus size={11} /> add to calendar
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-xl"
                          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                          <Check size={11} /> on calendar
                        </div>
                      )}
                      <button onClick={() => removePlanner(p.id)} className="btn-ghost btn-pill !px-3 !py-1.5">
                        <Trash2 size={13} style={{ color: 'rgba(239,68,68,0.5)' }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Bell, BellOff, Download, ExternalLink, User, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, addMonths, subMonths,
} from 'date-fns';
import { useStore, getSkinColors } from '../store';
import { getHolidaysForDate, getHolidaysForMonth } from '../data/holidays';
import type { CalEvent, EventColor, EventType, RecurType, CheckItem } from '../types';

const COLOR_HEX: Record<EventColor, string> = {
  violet: '#8B5CF6', cyan: '#22D3EE', pink: '#EC4899', amber: '#F59E0B', emerald: '#10B981',
};

type TypeMeta = { label: string; emoji: string; color: EventColor };
const TYPE_META: Record<EventType, TypeMeta> = {
  event:           { label: 'Event',       emoji: '📅', color: 'violet' },
  reminder:        { label: 'Reminder',    emoji: '🔔', color: 'cyan' },
  holiday:         { label: 'Holiday',     emoji: '🎉', color: 'amber' },
  birthday:        { label: 'Birthday',    emoji: '🎂', color: 'pink' },
  anniversary:     { label: 'Anniversary', emoji: '💕', color: 'pink' },
  payday:          { label: 'Payday',      emoji: '💰', color: 'emerald' },
  bill:            { label: 'Bill',        emoji: '🧾', color: 'amber' },
  todo:            { label: 'To-Do',       emoji: '✅', color: 'cyan' },
  shopping:        { label: 'Shopping',    emoji: '🛍️', color: 'pink' },
  'shopping-list': { label: 'Shop List',   emoji: '📋', color: 'pink' },
  chores:          { label: 'Chores',      emoji: '🧹', color: 'emerald' },
  'self-care':     { label: 'Self-Care',   emoji: '🧘', color: 'violet' },
  gym:             { label: 'Gym',         emoji: '💪', color: 'emerald' },
  dentist:         { label: 'Dentist',     emoji: '🦷', color: 'cyan' },
  appointment:     { label: 'Appt.',       emoji: '📍', color: 'violet' },
  'date-night':    { label: 'Date Night',  emoji: '🌹', color: 'pink' },
  trip:            { label: 'Trip',        emoji: '✈️', color: 'cyan' },
  'special-event': { label: 'Special',     emoji: '⭐', color: 'amber' },
};

const QUICK_CHIPS: EventType[] = [
  'event', 'reminder', 'todo', 'birthday', 'anniversary',
  'payday', 'bill', 'shopping', 'shopping-list', 'chores',
  'self-care', 'gym', 'dentist', 'appointment', 'date-night',
  'trip', 'special-event',
];

const CHECKLIST_TYPES: EventType[] = ['todo', 'shopping', 'shopping-list', 'chores'];

interface FormState {
  title: string; type: EventType; color: EventColor;
  time: string; allDay: boolean; recur: RecurType;
  amount: string; notes: string; contactId: string; address: string;
  checklistInput: string; checklist: CheckItem[];
}

const BLANK: FormState = {
  title: '', type: 'event', color: 'violet', time: '', allDay: true,
  recur: 'none', amount: '', notes: '', contactId: '', address: '',
  checklistInput: '', checklist: [],
};

function googleCalLink(e: CalEvent) {
  const d = e.date.replace(/-/g, '');
  const start = e.time ? `${d}T${e.time.replace(':', '')}00` : d;
  const endH = e.time ? String(Number(e.time.split(':')[0]) + 1).padStart(2, '0') : null;
  const end = endH ? `${d}T${endH}${e.time!.split(':')[1]}00` : d;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${start}/${end}`;
}

function downloadICS(dayEvents: CalEvent[], label: string) {
  const esc = (s: string) => s.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Calendi//EN',
    ...dayEvents.flatMap(e => {
      const d = e.date.replace(/-/g, '');
      const dt = e.time ? `${d}T${e.time.replace(':', '')}00` : d;
      return [
        'BEGIN:VEVENT',
        `UID:${e.id}@calendi`,
        `SUMMARY:${esc(e.title)}`,
        `DTSTART:${dt}`, `DTEND:${dt}`,
        ...(e.notes ? [`DESCRIPTION:${esc(e.notes)}`] : []),
        ...(e.address ? [`LOCATION:${esc(e.address)}`] : []),
        'END:VEVENT',
      ];
    }),
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `calendi-${label}.ics`; a.click();
  URL.revokeObjectURL(url);
}

interface Props { compact?: boolean }

export default function CalendarWidget({ compact }: Props) {
  const { events, addEvent, updateEvent, removeEvent, skin, contacts, notificationsEnabled, setNotificationsEnabled } = useStore();
  const { color, glow } = getSkinColors(skin);

  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);
  const [moreFields, setMoreFields] = useState(false);

  const today = new Date();
  const panelDate = selected ?? today;
  const panelKey = format(panelDate, 'yyyy-MM-dd');
  const panelLabel = isSameDay(panelDate, today)
    ? `Today, ${format(panelDate, 'MMM d')}`
    : format(panelDate, 'EEEE, MMM d');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate));
    return eachDayOfInterval({ start, end: endOfWeek(endOfMonth(viewDate)) });
  }, [viewDate]);

  const holidayMap = useMemo(() => getHolidaysForMonth(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    events.forEach(e => map.set(e.date, [...(map.get(e.date) || []), e]));
    return map;
  }, [events]);

  const panelHolidays = getHolidaysForDate(panelDate);
  const panelEvents = eventsByDay.get(panelKey) || [];

  function pickChip(type: EventType) {
    const meta = TYPE_META[type];
    setForm(f => ({ ...f, type, color: meta.color }));
    if (!adding) setAdding(true);
  }

  function addCheckItem() {
    if (!form.checklistInput.trim()) return;
    const item: CheckItem = { id: Date.now().toString(), text: form.checklistInput.trim(), done: false };
    setForm(f => ({ ...f, checklist: [...f.checklist, item], checklistInput: '' }));
  }

  function toggleEventCheckItem(eventId: string, itemId: string) {
    const ev = events.find(e => e.id === eventId);
    if (!ev || !ev.checklist) return;
    updateEvent({ ...ev, checklist: ev.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c) });
  }

  function submitEvent() {
    if (!form.title.trim()) return;
    const e: CalEvent = {
      id: Date.now().toString(),
      title: form.title.trim(),
      date: panelKey,
      time: form.allDay ? undefined : (form.time || undefined),
      color: form.color,
      type: form.type,
      recur: form.recur,
      allDay: form.allDay,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      notes: form.notes || undefined,
      contactId: form.contactId || undefined,
      address: form.address || undefined,
      checklist: CHECKLIST_TYPES.includes(form.type) ? form.checklist : undefined,
    };
    addEvent(e);
    if (notificationsEnabled && !form.allDay && form.time && 'Notification' in window && Notification.permission === 'granted') {
      const [h, m] = form.time.split(':').map(Number);
      const eventTime = new Date(panelDate);
      eventTime.setHours(h, m, 0, 0);
      const delay = eventTime.getTime() - Date.now() - 10 * 60 * 1000;
      if (delay > 0) setTimeout(() => new Notification(`Calendi: ${e.title}`, { body: 'Coming up in 10 minutes', icon: '/icons/icon-192.png' }), delay);
    }
    setForm(BLANK);
    setAdding(false);
    setMoreFields(false);
  }

  async function requestNotifications() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotificationsEnabled(result === 'granted');
  }

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${color}30` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color, opacity: 0.65, fontSize: '0.6rem' }}>calendar</div>
          <h2 className="text-sm font-bold" style={{ color: '#E2E8F0' }}>{format(viewDate, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex gap-1 items-center">
          <button title={notificationsEnabled ? 'notifications on' : 'enable notifications'}
            onClick={notificationsEnabled ? undefined : requestNotifications}
            className="btn-ghost btn-pill !px-2 !py-1">
            {notificationsEnabled
              ? <Bell size={12} style={{ color }} />
              : <BellOff size={12} style={{ color: 'rgba(226,232,240,0.3)' }} />}
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1" onClick={() => setViewDate(subMonths(viewDate, 1))}><ChevronLeft size={13} /></button>
          <button className="btn-ghost btn-pill !px-2 !py-1" style={{ fontSize: '0.7rem' }} onClick={() => { setViewDate(new Date()); setSelected(null); }}>today</button>
          <button className="btn-ghost btn-pill !px-2 !py-1" onClick={() => setViewDate(addMonths(viewDate, 1))}><ChevronRight size={13} /></button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pb-0.5 shrink-0">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center font-mono py-0.5" style={{ color: 'rgba(226,232,240,0.25)', fontSize: '0.58rem' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-3 gap-y-0.5 shrink-0">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvts = eventsByDay.get(key) || [];
          const holidays = holidayMap.get(day.getDate()) || [];
          const inMonth = isSameMonth(day, viewDate);
          const isT = isToday(day);
          const isSel = selected ? isSameDay(day, selected) : false;
          return (
            <button key={i}
              onClick={() => { setSelected(isSel ? null : day); setAdding(false); }}
              className="relative flex flex-col items-center py-0.5 rounded-xl transition-all"
              style={{
                background: isSel ? `${color}20` : isT ? `${color}0C` : 'transparent',
                border: `1px solid ${isSel ? color + '50' : isT ? color + '20' : 'transparent'}`,
                minHeight: compact ? 26 : 30,
              }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: isT ? 700 : 500,
                color: !inMonth ? 'rgba(226,232,240,0.18)' : isT ? color : isSel ? '#E2E8F0' : 'rgba(226,232,240,0.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: '50%',
                boxShadow: isT ? `0 0 8px ${glow}` : 'none',
              }}>
                {format(day, 'd')}
              </span>
              {(dayEvts.length > 0 || (inMonth && holidays.length > 0)) && (
                <div className="flex gap-0.5 mt-0.5">
                  {inMonth && holidays.slice(0,1).map((_, hi) => <span key={hi} style={{ width: 3, height: 3, borderRadius: '50%', background: '#F59E0B' }} />)}
                  {dayEvts.slice(0, 2).map((e, di) => <span key={di} style={{ width: 3, height: 3, borderRadius: '50%', background: COLOR_HEX[e.color] }} />)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom panel — always visible */}
      <div className="flex-1 min-h-0 flex flex-col border-t mt-2" style={{ borderColor: `${color}18` }}>
        {/* Quick chips row */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
          {QUICK_CHIPS.map(type => {
            const meta = TYPE_META[type];
            const active = form.type === type && adding;
            return (
              <button key={type} onClick={() => pickChip(type)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl transition-all"
                style={{
                  background: active ? `${COLOR_HEX[meta.color]}22` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? COLOR_HEX[meta.color] + '55' : 'rgba(255,255,255,0.07)'}`,
                  color: active ? COLOR_HEX[meta.color] : 'rgba(226,232,240,0.45)',
                  fontSize: '0.62rem', fontWeight: 500,
                }}>
                <span style={{ fontSize: '0.7rem' }}>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel header */}
        <div className="flex items-center justify-between px-3 pb-1.5 shrink-0">
          <span className="font-mono" style={{ color: 'rgba(226,232,240,0.35)', fontSize: '0.65rem' }}>{panelLabel}</span>
          <div className="flex gap-1">
            {panelEvents.length > 0 && (
              <button title="Export .ics" onClick={() => downloadICS(panelEvents, panelKey)} className="btn-ghost btn-pill !px-1.5 !py-1">
                <Download size={10} style={{ color }} />
              </button>
            )}
            <button className="btn-ghost btn-pill !px-2 !py-1 gap-1"
              style={{ color, borderColor: `${color}40`, fontSize: '0.62rem' }}
              onClick={() => { setAdding(!adding); if (!adding) setMoreFields(false); }}>
              <Plus size={10} /> add
            </button>
          </div>
        </div>

        {/* Scrollable events + form */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
          {panelHolidays.map((h, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.16)' }}>
              <span style={{ fontSize: '0.7rem' }}>🎉</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(226,232,240,0.65)' }}>{h.name}</span>
            </div>
          ))}

          {panelEvents.map(e => {
            const meta = TYPE_META[e.type] ?? TYPE_META.event;
            const c = contacts.find(x => x.id === e.contactId);
            return (
              <div key={e.id} className="mb-1.5 px-2 py-2 rounded-xl"
                style={{ background: `${COLOR_HEX[e.color]}0D`, border: `1px solid ${COLOR_HEX[e.color]}22` }}>
                <div className="flex items-start gap-1.5">
                  <span style={{ fontSize: '0.75rem', marginTop: 1 }}>{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(226,232,240,0.88)', margin: 0 }} className="truncate">{e.title}</p>
                    {e.time && <p style={{ fontSize: '0.6rem', color: 'rgba(226,232,240,0.35)', margin: '2px 0 0' }}>{e.time}</p>}
                    {e.amount != null && <p style={{ fontSize: '0.6rem', color: COLOR_HEX[e.color], margin: '2px 0 0' }}>${e.amount.toFixed(2)}</p>}
                    {c && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <User size={9} style={{ color: 'rgba(226,232,240,0.28)' }} />
                        {c.phone
                          ? <a href={`tel:${c.phone}`} style={{ fontSize: '0.6rem', color }}>{c.name}</a>
                          : <span style={{ fontSize: '0.6rem', color: 'rgba(226,232,240,0.35)' }}>{c.name}</span>}
                      </div>
                    )}
                    {e.address && <p className="truncate" style={{ fontSize: '0.58rem', color: 'rgba(226,232,240,0.28)', margin: '2px 0 0' }}>📍 {e.address}</p>}
                    {e.notes && <p style={{ fontSize: '0.6rem', color: 'rgba(226,232,240,0.38)', margin: '2px 0 0' }}>{e.notes}</p>}
                    {e.checklist && e.checklist.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {e.checklist.map(item => (
                          <button key={item.id} onClick={() => toggleEventCheckItem(e.id, item.id)} className="flex items-center gap-1.5 text-left" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, border: `1px solid ${COLOR_HEX[e.color]}55`, background: item.done ? COLOR_HEX[e.color] : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.done && <Check size={6} style={{ color: '#fff' }} />}
                            </div>
                            <span style={{ fontSize: '0.58rem', color: item.done ? 'rgba(226,232,240,0.22)' : 'rgba(226,232,240,0.58)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <button onClick={() => removeEvent(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.16)', padding: 2 }}>
                      <X size={10} />
                    </button>
                    <a href={googleCalLink(e)} target="_blank" rel="noopener noreferrer" title="Add to Google Calendar">
                      <ExternalLink size={9} style={{ color: 'rgba(226,232,240,0.18)' }} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {panelEvents.length === 0 && panelHolidays.length === 0 && !adding && (
            <p className="text-center py-3" style={{ color: 'rgba(226,232,240,0.18)', fontSize: '0.7rem' }}>
              tap a chip above to add something here
            </p>
          )}

          {adding && (
            <div className="mt-2 p-3 rounded-2xl anim-slide-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                className="input-dark mb-2"
                style={{ fontSize: '0.8rem' }}
                placeholder={`${TYPE_META[form.type].emoji} ${TYPE_META[form.type].label} title`}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && !CHECKLIST_TYPES.includes(form.type) && submitEvent()}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-2 mb-2">
                <select className="input-dark" style={{ appearance: 'none', fontSize: '0.75rem' }}
                  value={form.recur} onChange={e => setForm(f => ({ ...f, recur: e.target.value as RecurType }))}>
                  <option value="none">once</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
                <label className="flex items-center gap-1.5" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.allDay} onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))} style={{ accentColor: color }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.4)' }}>all day</span>
                </label>
              </div>

              {!form.allDay && (
                <input className="input-dark mb-2" type="time" value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              )}

              {(form.type === 'bill' || form.type === 'payday') && (
                <input className="input-dark mb-2" placeholder="amount ($)" type="number"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              )}

              {CHECKLIST_TYPES.includes(form.type) && (
                <div className="mb-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {form.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-1.5 mb-1">
                      <div style={{ width: 10, height: 10, borderRadius: 3, border: `1px solid ${color}50`, flexShrink: 0 }} />
                      <span className="flex-1" style={{ fontSize: '0.68rem', color: 'rgba(226,232,240,0.6)' }}>{item.text}</span>
                      <button onClick={() => setForm(f => ({ ...f, checklist: f.checklist.filter(c => c.id !== item.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.2)', padding: 0 }}>
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1">
                    <input className="input-dark !py-1 flex-1" style={{ fontSize: '0.68rem' }} placeholder="add item..."
                      value={form.checklistInput} onChange={e => setForm(f => ({ ...f, checklistInput: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addCheckItem()} />
                    <button onClick={addCheckItem} className="btn-ghost btn-pill !px-2 !py-1" style={{ fontSize: '0.7rem' }}>+</button>
                  </div>
                </div>
              )}

              <button onClick={() => setMoreFields(!moreFields)}
                className="flex items-center gap-1 mb-2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.28)', padding: 0, fontSize: '0.65rem' }}>
                {moreFields ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                {moreFields ? 'fewer options' : 'notes, address, contact'}
              </button>

              {moreFields && (
                <div className="flex flex-col gap-2 mb-2">
                  <input className="input-dark" style={{ fontSize: '0.75rem' }} placeholder="notes..." value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  <input className="input-dark" style={{ fontSize: '0.75rem' }} placeholder="address..." value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  {contacts.length > 0 && (
                    <select className="input-dark" style={{ appearance: 'none', fontSize: '0.75rem' }}
                      value={form.contactId} onChange={e => setForm(f => ({ ...f, contactId: e.target.value }))}>
                      <option value="">no contact linked</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>)}
                    </select>
                  )}
                </div>
              )}

              <div className="flex gap-2 mb-3">
                {(Object.keys(COLOR_HEX) as EventColor[]).map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                    width: 16, height: 16, borderRadius: '50%', background: COLOR_HEX[c],
                    border: `2px solid ${form.color === c ? '#fff' : 'transparent'}`,
                    cursor: 'pointer', transition: 'transform 0.15s', transform: form.color === c ? 'scale(1.3)' : 'scale(1)',
                  }} />
                ))}
              </div>

              <div className="flex gap-2">
                <button className="btn-pill btn-ghost flex-1 !py-1.5" style={{ fontSize: '0.75rem' }}
                  onClick={() => { setAdding(false); setMoreFields(false); setForm(BLANK); }}>cancel</button>
                <button className="btn-pill flex-1 !py-1.5" style={{ background: color, color: '#fff', fontSize: '0.75rem' }}
                  onClick={submitEvent}>save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

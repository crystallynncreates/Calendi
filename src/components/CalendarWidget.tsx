import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Bell } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, addMonths, subMonths,
} from 'date-fns';
import { useStore, getSkinColors } from '../store';
import { getHolidaysForMonth } from '../data/holidays';
import type { CalEvent, EventColor, EventType, RecurType } from '../types';

const COLOR_HEX: Record<EventColor, string> = {
  violet: '#8B5CF6',
  cyan:   '#22D3EE',
  pink:   '#EC4899',
  amber:  '#F59E0B',
  emerald:'#10B981',
};

const EVENT_TYPE_COLOR: Record<EventType, EventColor> = {
  event: 'violet', bill: 'amber', birthday: 'pink',
  anniversary: 'pink', payday: 'emerald', reminder: 'cyan', holiday: 'amber',
};

interface Props { compact?: boolean }

export default function CalendarWidget({ compact }: Props) {
  const { events, addEvent, removeEvent, skin } = useStore();
  const skinColors = getSkinColors(skin);
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'event' as EventType, color: 'violet' as EventColor, time: '', allDay: true, recur: 'none' as RecurType, amount: '' });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate));
    const end = endOfWeek(endOfMonth(viewDate));
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const holidayMap = useMemo(() => getHolidaysForMonth(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    events.forEach(e => {
      const key = e.date;
      map.set(key, [...(map.get(key) || []), e]);
    });
    return map;
  }, [events]);

  const selectedKey = selected ? format(selected, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedKey ? (eventsByDay.get(selectedKey) || []) : [];
  const selectedHolidays = selected ? (holidayMap.get(selected.getDate()) || []) : [];

  function submitEvent() {
    if (!form.title.trim() || !selected) return;
    const e: CalEvent = {
      id: Date.now().toString(),
      title: form.title.trim(),
      date: format(selected, 'yyyy-MM-dd'),
      time: form.allDay ? undefined : form.time,
      color: form.color,
      type: form.type,
      recur: form.recur,
      allDay: form.allDay,
      amount: form.amount ? parseFloat(form.amount) : undefined,
    };
    addEvent(e);
    setForm({ title: '', type: 'event', color: 'violet', time: '', allDay: true, recur: 'none', amount: '' });
    setAdding(false);
  }

  const todayEvents = useMemo(() => {
    const key = format(new Date(), 'yyyy-MM-dd');
    return eventsByDay.get(key) || [];
  }, [eventsByDay]);

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor: `${skinColors.color}30` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: skinColors.color, opacity: 0.7 }}>calendar</div>
          <h2 className="text-base font-bold" style={{ color: '#E2E8F0' }}>
            {format(viewDate, compact ? 'MMM yyyy' : 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex gap-1">
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={() => setViewDate(subMonths(viewDate, 1))}>
            <ChevronLeft size={14} />
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={() => setViewDate(new Date())}>
            <span className="text-xs">today</span>
          </button>
          <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={() => setViewDate(addMonths(viewDate, 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pb-1 shrink-0">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center font-mono text-xs py-1" style={{ color: 'rgba(226,232,240,0.28)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 px-3 gap-y-0.5 shrink-0">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(key) || [];
          const holidays = holidayMap.get(day.getDate()) || [];
          const inMonth = isSameMonth(day, viewDate);
          const today = isToday(day);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const dots = [...dayEvents.slice(0, 3)];

          return (
            <button
              key={i}
              onClick={() => { setSelected(day); setAdding(false); }}
              className="relative flex flex-col items-center py-1 rounded-xl group"
              style={{
                background: isSelected ? `${skinColors.color}20` : 'transparent',
                border: `1px solid ${isSelected ? skinColors.color + '50' : 'transparent'}`,
                cursor: 'pointer',
                minHeight: compact ? 32 : 36,
              }}
            >
              <span
                className="text-xs font-semibold leading-none relative z-10"
                style={{
                  color: !inMonth ? 'rgba(226,232,240,0.2)' : today ? skinColors.color : 'rgba(226,232,240,0.75)',
                  background: today ? `${skinColors.color}18` : 'transparent',
                  borderRadius: '50%',
                  width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: today ? `0 0 10px ${skinColors.glow}` : 'none',
                  fontWeight: today ? 700 : 500,
                }}
              >
                {format(day, 'd')}
              </span>
              {(dots.length > 0 || holidays.length > 0) && (
                <div className="flex gap-0.5 mt-0.5">
                  {holidays.slice(0,1).map((_, hi) => (
                    <span key={hi} style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} />
                  ))}
                  {dots.slice(0, 2).map((e, di) => (
                    <span key={di} style={{ width: 4, height: 4, borderRadius: '50%', background: COLOR_HEX[e.color] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4">
        {selected && (
          <div className="anim-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono" style={{ color: 'rgba(226,232,240,0.4)' }}>
                {format(selected, 'EEEE, MMM d')}
              </span>
              <button
                className="btn-ghost btn-pill !px-2 !py-1 text-xs gap-1"
                style={{ color: skinColors.color, borderColor: `${skinColors.color}40` }}
                onClick={() => setAdding(!adding)}
              >
                <Plus size={11} /> add
              </button>
            </div>

            {/* Holidays */}
            {selectedHolidays.map((h, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Bell size={11} style={{ color: '#F59E0B', flexShrink: 0 }} />
                <span className="text-xs" style={{ color: 'rgba(226,232,240,0.7)' }}>{h.name}</span>
              </div>
            ))}

            {/* Events */}
            {selectedEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-2 mb-1.5 px-2 py-1.5 rounded-xl" style={{ background: `${COLOR_HEX[e.color]}0D`, border: `1px solid ${COLOR_HEX[e.color]}30` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_HEX[e.color], flexShrink: 0, marginTop: 4 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'rgba(226,232,240,0.85)' }}>{e.title}</p>
                  {e.time && <p className="text-xs mt-0.5" style={{ color: 'rgba(226,232,240,0.35)' }}>{e.time}</p>}
                  {e.amount != null && <p className="text-xs mt-0.5" style={{ color: COLOR_HEX[e.color], opacity: 0.8 }}>${e.amount.toFixed(2)}</p>}
                </div>
                <button onClick={() => removeEvent(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.2)', padding: 2 }}>
                  <X size={11} />
                </button>
              </div>
            ))}

            {selectedEvents.length === 0 && selectedHolidays.length === 0 && !adding && (
              <p className="text-xs text-center py-2" style={{ color: 'rgba(226,232,240,0.2)' }}>nothing here yet</p>
            )}

            {/* Add form */}
            {adding && (
              <div className="mt-2 p-3 rounded-2xl anim-slide-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  className="input-dark mb-2"
                  placeholder="event title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && submitEvent()}
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    className="input-dark"
                    value={form.type}
                    onChange={e => {
                      const t = e.target.value as EventType;
                      setForm(f => ({ ...f, type: t, color: EVENT_TYPE_COLOR[t] }));
                    }}
                    style={{ appearance: 'none' }}
                  >
                    <option value="event">event</option>
                    <option value="bill">bill</option>
                    <option value="birthday">birthday</option>
                    <option value="anniversary">anniversary</option>
                    <option value="payday">payday</option>
                    <option value="reminder">reminder</option>
                  </select>

                  <select
                    className="input-dark"
                    value={form.recur}
                    onChange={e => setForm(f => ({ ...f, recur: e.target.value as RecurType }))}
                    style={{ appearance: 'none' }}
                  >
                    <option value="none">once</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>
                </div>

                {form.type === 'bill' && (
                  <input
                    className="input-dark mb-2"
                    placeholder="amount ($)"
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  />
                )}

                <div className="flex items-center gap-2 mb-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allDay}
                      onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))}
                      style={{ accentColor: skinColors.color }}
                    />
                    <span className="text-xs" style={{ color: 'rgba(226,232,240,0.5)' }}>all day</span>
                  </label>
                  {!form.allDay && (
                    <input
                      className="input-dark"
                      type="time"
                      value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    />
                  )}
                </div>

                {/* Color dots */}
                <div className="flex gap-2 mb-3">
                  {(Object.keys(COLOR_HEX) as EventColor[]).map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 18, height: 18, borderRadius: '50%', background: COLOR_HEX[c],
                        border: `2px solid ${form.color === c ? '#fff' : 'transparent'}`,
                        cursor: 'pointer', transition: 'transform 0.15s ease',
                        transform: form.color === c ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="btn-pill btn-ghost flex-1 !text-xs !py-1.5" onClick={() => setAdding(false)}>cancel</button>
                  <button
                    className="btn-pill flex-1 !text-xs !py-1.5"
                    style={{ background: skinColors.color, color: '#fff' }}
                    onClick={submitEvent}
                  >
                    save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!selected && !compact && (
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'rgba(226,232,240,0.25)' }}>today</p>
            {todayEvents.length === 0 ? (
              <p className="text-xs" style={{ color: 'rgba(226,232,240,0.2)' }}>clear day — tap any date to add events</p>
            ) : todayEvents.map(e => (
              <div key={e.id} className="flex items-center gap-2 mb-1 px-2 py-1.5 rounded-xl" style={{ background: `${COLOR_HEX[e.color]}0D` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLOR_HEX[e.color], flexShrink: 0 }} />
                <span className="text-xs truncate" style={{ color: 'rgba(226,232,240,0.7)' }}>{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

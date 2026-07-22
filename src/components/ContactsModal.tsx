import { useState } from 'react';
import { X, Plus, Phone, Mail, MapPin, Edit2, Trash2, User } from 'lucide-react';
import { useStore, getSkinColors } from '../store';
import type { Contact } from '../types';

interface FormState { name: string; phone: string; email: string; address: string; notes: string }
const BLANK: FormState = { name: '', phone: '', email: '', address: '', notes: '' };

interface Props { onClose: () => void }

export default function ContactsModal({ onClose }: Props) {
  const { contacts, addContact, updateContact, removeContact, skin } = useStore();
  const { color } = getSkinColors(skin);

  const [editing, setEditing] = useState<Contact | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);

  function startAdd() { setEditing(null); setForm(BLANK); setAdding(true); }
  function startEdit(c: Contact) { setEditing(c); setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' }); setAdding(true); }

  function save() {
    if (!form.name.trim()) return;
    const contact: Contact = {
      id: editing?.id ?? Date.now().toString(),
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    editing ? updateContact(contact) : addContact(contact);
    setAdding(false);
    setEditing(null);
    setForm(BLANK);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl anim-slide-up flex flex-col" style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="font-bold text-lg" style={{ color: '#E2E8F0' }}>contacts</h2>
            <p className="text-xs font-mono" style={{ color: 'rgba(226,232,240,0.3)' }}>{contacts.length} saved · tap name to call</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost btn-pill !px-2 !py-1.5 gap-1 text-xs" style={{ color, borderColor: `${color}40` }} onClick={startAdd}>
              <Plus size={12} /> add
            </button>
            <button className="btn-ghost btn-pill !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* Add / Edit form */}
        {adding && (
          <div className="mx-5 mb-3 p-4 rounded-2xl anim-slide-up shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-mono mb-3" style={{ color }}>{editing ? 'edit contact' : 'new contact'}</p>
            <div className="flex flex-col gap-2">
              <input className="input-dark" placeholder="name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              <input className="input-dark" placeholder="phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input className="input-dark" placeholder="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="input-dark" placeholder="address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <input className="input-dark" placeholder="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn-pill btn-ghost flex-1 !text-xs !py-1.5" onClick={() => { setAdding(false); setEditing(null); setForm(BLANK); }}>cancel</button>
              <button className="btn-pill flex-1 !text-xs !py-1.5" style={{ background: color, color: '#fff' }} onClick={save}>save</button>
            </div>
          </div>
        )}

        {/* Contact list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          {contacts.length === 0 && !adding ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} style={{ color }} />
              </div>
              <p className="text-sm" style={{ color: 'rgba(226,232,240,0.3)' }}>no contacts yet</p>
              <button className="btn-pill btn-ghost !text-xs !py-1.5 !px-4" style={{ color, borderColor: `${color}40` }} onClick={startAdd}>
                <Plus size={12} /> add your first contact
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {contacts.map(c => (
                <div key={c.id} className="p-3 rounded-2xl glass-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>{c.name}</p>
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 mt-1">
                          <Phone size={11} style={{ color, flexShrink: 0 }} />
                          <span className="text-xs" style={{ color }}>{c.phone}</span>
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 mt-1">
                          <Mail size={11} style={{ color: 'rgba(226,232,240,0.4)', flexShrink: 0 }} />
                          <span className="text-xs truncate" style={{ color: 'rgba(226,232,240,0.4)' }}>{c.email}</span>
                        </a>
                      )}
                      {c.address && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={11} style={{ color: 'rgba(226,232,240,0.3)', flexShrink: 0 }} />
                          <span className="text-xs truncate" style={{ color: 'rgba(226,232,240,0.3)' }}>{c.address}</span>
                        </div>
                      )}
                      {c.notes && <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.25)' }}>{c.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button className="btn-ghost btn-pill !px-2 !py-1" onClick={() => startEdit(c)}>
                        <Edit2 size={11} style={{ color: 'rgba(226,232,240,0.4)' }} />
                      </button>
                      <button className="btn-ghost btn-pill !px-2 !py-1" onClick={() => removeContact(c.id)}>
                        <Trash2 size={11} style={{ color: 'rgba(239,68,68,0.5)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

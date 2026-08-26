import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, ShoppingCart, ExternalLink, Check } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

type FoodTab = 'starbucks' | 'dunkin' | 'ubereats' | 'shoprite';

const TABS: { id: FoodTab; label: string; emoji: string; color: string }[] = [
  { id:'starbucks', label:'Starbucks',  emoji:'☕', color:'#00704A' },
  { id:'dunkin',    label:"Dunkin'",    emoji:'🍩', color:'#FF671F' },
  { id:'ubereats',  label:'Uber Eats', emoji:'🛵', color:'#06C167' },
  { id:'shoprite',  label:'ShopRite',  emoji:'🛒', color:'#CC0000' },
];

const BRAND_URLS: Record<FoodTab, string> = {
  starbucks: 'https://www.starbucks.com/menu',
  dunkin:    'https://www.dunkindonuts.com/en/menu',
  ubereats:  'https://www.ubereats.com',
  shoprite:  'https://www.shoprite.com',
};

const BRAND_FEATURES: Record<FoodTab, string[]> = {
  starbucks: ['Mobile order via app','Rewards tracking','Seasonal menu','Customize drinks','Gift cards'],
  dunkin:    ['DD Perks rewards','Mobile ordering','Fresh bakery & donuts','Iced/hot coffee','Drive-thru quick order'],
  ubereats:  ['Delivery from 1000s of restaurants','Real-time tracking','Uber Cash rewards','Group ordering','Scheduled delivery'],
  shoprite:  ['Weekly digital coupons','Online grocery order','In-store pickup','Price Plus savings','Fresh deli & bakery'],
};

interface ListItem { id: string; name: string; qty: number; done: boolean }
const LIST_KEY = 'calendi-shoprite-list';
const SCHED_KEY = 'calendi-shoprite-schedule';

interface AutoOrder { day: string; time: string; recur: string; active: boolean }

function loadList(): ListItem[] {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || '[]'); } catch { return []; }
}
function saveList(items: ListItem[]) { localStorage.setItem(LIST_KEY, JSON.stringify(items)); }

function loadSched(): AutoOrder | null {
  try { return JSON.parse(localStorage.getItem(SCHED_KEY) || 'null'); } catch { return null; }
}
function saveSched(s: AutoOrder | null) { localStorage.setItem(SCHED_KEY, JSON.stringify(s)); }

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const RECURS = ['Once','Weekly','Bi-weekly','Monthly'];

export default function FoodOrderWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [tab, setTab] = useState<FoodTab>('starbucks');
  const [listItems, setListItems] = useState<ListItem[]>(loadList);
  const [newItem, setNewItem] = useState('');
  const [autoOrder, setAutoOrder] = useState<AutoOrder | null>(loadSched);
  const [schedSet, setSchedSet] = useState(false);

  const brand = TABS.find(t => t.id === tab)!;

  function addItem() {
    const name = newItem.trim();
    if (!name) return;
    const item: ListItem = { id: Date.now().toString(), name, qty:1, done:false };
    const updated = [...listItems, item];
    setListItems(updated);
    saveList(updated);
    setNewItem('');
  }

  function toggleItem(id: string) {
    const updated = listItems.map(i => i.id===id ? { ...i, done:!i.done } : i);
    setListItems(updated);
    saveList(updated);
  }

  function removeItem(id: string) {
    const updated = listItems.filter(i => i.id!==id);
    setListItems(updated);
    saveList(updated);
  }

  function setQty(id: string, qty: number) {
    const updated = listItems.map(i => i.id===id ? { ...i, qty:Math.max(1,qty) } : i);
    setListItems(updated);
    saveList(updated);
  }

  function saveAutoOrder(patch: Partial<AutoOrder>) {
    const updated = { ...(autoOrder || { day:'Saturday', time:'09:00', recur:'Weekly', active:true }), ...patch };
    setAutoOrder(updated);
    saveSched(updated);
    setSchedSet(true);
    setTimeout(() => setSchedSet(false), 2000);
  }

  const done = listItems.filter(i => i.done).length;

  /* ── Branded launcher panel for all tabs ── */
  function LaunchPanel() {
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:'12px 16px' }}>
        {/* Brand icon */}
        <div style={{ width:64, height:64, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', background:`${brand.color}15`, border:`2px solid ${brand.color}35`, fontSize:'2rem' }}>
          {brand.emoji}
        </div>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--w-text-main)', marginBottom:4 }}>{brand.label}</p>
          <p style={{ fontSize:'0.65rem', color:'var(--w-text-dim)', lineHeight:1.5 }}>
            Sign in and order in a new window.<br/>Use your existing account.
          </p>
        </div>
        {/* Feature list */}
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:4 }}>
          {BRAND_FEATURES[tab].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)' }}>
              <Check size={10} style={{ color:brand.color, flexShrink:0 }} />
              <span style={{ fontSize:'0.65rem', color:'var(--w-text-dim)' }}>{f}</span>
            </div>
          ))}
        </div>
        <a
          href={BRAND_URLS[tab]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', gap:6, padding:'8px 20px',
            borderRadius:20, border:'none', cursor:'pointer', textDecoration:'none',
            background:brand.color, color:'#fff',
            fontSize:'0.75rem', fontWeight:700, fontFamily:'monospace',
            boxShadow:`0 4px 16px ${brand.color}40`,
          }}>
          <ExternalLink size={12} /> Order on {brand.label}
        </a>
      </div>
    );
  }

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor:`${color}25` }}>
      <p style={{ fontSize:'0.48rem', color:'var(--w-text-faint)', margin:'6px 10px 0', fontFamily:'monospace', letterSpacing:0.3, flexShrink:0 }}>🍔 food — order from Starbucks, Dunkin, Uber Eats &amp; ShopRite, one tap away</p>
      {/* Tab bar */}
      <div style={{ display:'flex', gap:2, margin:'10px 10px 0', padding:3, borderRadius:12, background:'rgba(255,255,255,0.03)', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'5px 1px', borderRadius:9, border:'none', cursor:'pointer',
            background: tab===t.id ? t.color : 'transparent',
            color: tab===t.id ? '#fff' : 'var(--w-text-dim)',
            fontSize:'0.5rem', fontWeight:700, fontFamily:'monospace',
            display:'flex', flexDirection:'column', alignItems:'center', gap:1,
            transition:'all 0.15s',
          }}>
            <span style={{ fontSize:'0.9rem' }}>{t.emoji}</span>
            {t.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {tab !== 'shoprite' ? (
        <LaunchPanel />
      ) : (
        /* ── ShopRite: Shopping list + auto-order ── */
        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, padding:'10px 10px 8px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-faint)', textTransform:'uppercase', letterSpacing:1, display:'flex', alignItems:'center', gap:4 }}>
              <ShoppingCart size={10} /> Shopping List
            </span>
            <span style={{ fontSize:'0.6rem', color:'var(--w-text-faint)', fontFamily:'monospace' }}>
              {done}/{listItems.length} checked
            </span>
          </div>

          {/* Add item */}
          <form onSubmit={e => { e.preventDefault(); addItem(); }} style={{ display:'flex', gap:6, marginBottom:8, flexShrink:0 }}>
            <input
              className="input-dark flex-1 !py-1.5 text-xs"
              placeholder="Add grocery item…"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
            />
            <button type="submit" style={{ background:brand.color, border:'none', borderRadius:8, padding:'0 10px', cursor:'pointer', color:'#fff', flexShrink:0 }}>
              <Plus size={13} />
            </button>
          </form>

          {/* List */}
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:3, minHeight:0 }}>
            {listItems.length === 0 ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--w-text-faint)', fontSize:'0.7rem', flexDirection:'column', gap:6 }}>
                <ShoppingCart size={24} style={{ opacity:0.3 }} />
                <span>Add items above</span>
              </div>
            ) : listItems.map(item => (
              <div key={item.id} style={{
                display:'flex', alignItems:'center', gap:6, padding:'5px 8px', borderRadius:8,
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)',
                opacity: item.done ? 0.5 : 1,
              }}>
                <button onClick={() => toggleItem(item.id)}
                  style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${item.done ? brand.color : 'rgba(255,255,255,0.2)'}`, background: item.done ? brand.color : 'transparent', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {item.done && <Check size={9} style={{ color:'#fff' }} />}
                </button>
                <span style={{ flex:1, fontSize:'0.7rem', color:'var(--w-text-dim)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.name}</span>
                <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                  <button onClick={() => setQty(item.id, item.qty-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--w-text-dim)', fontSize:'0.8rem', lineHeight:1, padding:'0 2px' }}>−</button>
                  <span style={{ fontSize:'0.65rem', color:'var(--w-text-dim)', fontFamily:'monospace', minWidth:14, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={() => setQty(item.id, item.qty+1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--w-text-dim)', fontSize:'0.8rem', lineHeight:1, padding:'0 2px' }}>+</button>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.4)', padding:2 }}>
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>

          {/* Auto-order schedule */}
          <div style={{ marginTop:8, padding:'8px 10px', borderRadius:10, background:'rgba(204,0,0,0.08)', border:'1px solid rgba(204,0,0,0.2)', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-dim)', textTransform:'uppercase', letterSpacing:1, display:'flex', alignItems:'center', gap:4 }}>
                <Calendar size={9} /> Auto-Order Schedule
              </span>
              {schedSet && <span style={{ fontSize:'0.6rem', color:brand.color, fontFamily:'monospace' }}>saved ✓</span>}
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <select
                value={autoOrder?.day ?? 'Saturday'}
                onChange={e => saveAutoOrder({ day:e.target.value })}
                style={{ flex:1, minWidth:80, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--w-text-dim)', borderRadius:6, fontSize:'0.6rem', padding:'3px 4px', fontFamily:'monospace', cursor:'pointer' }}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="time"
                value={autoOrder?.time ?? '09:00'}
                onChange={e => saveAutoOrder({ time:e.target.value })}
                style={{ flex:1, minWidth:70, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--w-text-dim)', borderRadius:6, fontSize:'0.6rem', padding:'3px 4px', fontFamily:'monospace', cursor:'pointer' }}
              />
              <select
                value={autoOrder?.recur ?? 'Weekly'}
                onChange={e => saveAutoOrder({ recur:e.target.value })}
                style={{ flex:1, minWidth:70, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--w-text-dim)', borderRadius:6, fontSize:'0.6rem', padding:'3px 4px', fontFamily:'monospace', cursor:'pointer' }}>
                {RECURS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginTop:6, display:'flex', gap:6, alignItems:'center' }}>
              <a href={BRAND_URLS.shoprite} target="_blank" rel="noopener noreferrer"
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'5px 8px', background:brand.color, color:'#fff', border:'none', borderRadius:8, fontSize:'0.6rem', fontWeight:700, fontFamily:'monospace', textDecoration:'none', cursor:'pointer' }}>
                <ExternalLink size={9} /> Order at ShopRite
              </a>
            </div>
            <p style={{ fontSize:'0.55rem', color:'var(--w-text-faint)', marginTop:4, fontFamily:'monospace' }}>
              Schedule saves to calendar. Order is placed via ShopRite website.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

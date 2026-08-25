import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCcw, Music, Video, BookOpen, Volume2 } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

interface FlashCard { term: string; def: string; category: string }

/* ── Vocabulary banks ────────────────────────────────────────────────── */
const VOCAB_BANKS: Record<string, FlashCard[]> = {
  'network+': [
    { term:'OSI Model',          def:'7-layer networking model: Physical, Data Link, Network, Transport, Session, Presentation, Application', category:'Concepts' },
    { term:'TCP vs UDP',         def:'TCP = reliable, connection-oriented; UDP = fast, connectionless (used for streaming, VoIP)', category:'Protocols' },
    { term:'Subnet Mask',        def:'Divides IP address into network and host portions (e.g. 255.255.255.0 = /24)', category:'Networking' },
    { term:'VLAN',               def:'Virtual LAN – logically separates network segments without physical separation', category:'Networking' },
    { term:'DNS',                def:'Domain Name System – translates hostnames (google.com) to IP addresses', category:'Protocols' },
    { term:'DHCP',               def:'Dynamically assigns IP addresses, subnet masks, gateways to devices on a network', category:'Protocols' },
    { term:'NAT',                def:'Network Address Translation – maps private IPs to a public IP for internet access', category:'Networking' },
    { term:'Firewall',           def:'Network security device that filters incoming/outgoing traffic based on rules', category:'Security' },
    { term:'VPN',                def:'Virtual Private Network – encrypted tunnel over a public network', category:'Security' },
    { term:'802.11 Wi-Fi',       def:'IEEE standard for wireless networking (a/b/g/n/ac/ax)', category:'Wireless' },
    { term:'WPA3',               def:'Latest Wi-Fi security protocol replacing WPA2, uses SAE for stronger auth', category:'Wireless' },
    { term:'SSID',               def:'Service Set Identifier – the name broadcasted by a wireless access point', category:'Wireless' },
    { term:'RJ-45',              def:'8-pin connector used for Ethernet (Cat5e, Cat6, Cat6a cables)', category:'Hardware' },
    { term:'Switch vs Hub',      def:'Switch = intelligent (sends frames to specific port); Hub = broadcasts to all ports', category:'Hardware' },
    { term:'Router',             def:'Layer 3 device that forwards packets between networks using routing tables', category:'Hardware' },
    { term:'Load Balancer',      def:'Distributes incoming traffic across multiple servers to prevent overload', category:'Concepts' },
    { term:'Bandwidth vs Latency',def:'Bandwidth = capacity (Mbps); Latency = delay (ms) between source and destination', category:'Concepts' },
    { term:'QoS',                def:'Quality of Service – prioritizes certain traffic (e.g. VoIP over file transfers)', category:'Networking' },
    { term:'SNMP',               def:'Simple Network Management Protocol – monitors and manages network devices', category:'Protocols' },
    { term:'STP',                def:'Spanning Tree Protocol – prevents broadcast storms in switched networks', category:'Protocols' },
  ],
  'ccna': [
    { term:'OSPF',               def:'Open Shortest Path First – link-state routing protocol using Dijkstra algorithm', category:'Routing' },
    { term:'EIGRP',              def:'Enhanced IGRP – Cisco proprietary hybrid routing protocol (distance-vector + link-state)', category:'Routing' },
    { term:'BGP',                def:'Border Gateway Protocol – exterior routing protocol used between autonomous systems (internet backbone)', category:'Routing' },
    { term:'ACL',                def:'Access Control List – filters traffic based on rules applied to router interfaces', category:'Security' },
    { term:'Trunk Port',         def:'Carries multiple VLAN traffic using 802.1Q tagging', category:'Switching' },
    { term:'DTP',                def:'Dynamic Trunking Protocol – negotiates trunk links between Cisco switches', category:'Switching' },
    { term:'HSRP',               def:'Hot Standby Router Protocol – Cisco proprietary first-hop redundancy protocol', category:'HA' },
    { term:'VRRP',               def:'Virtual Router Redundancy Protocol – open standard FHRP alternative to HSRP', category:'HA' },
    { term:'EtherChannel',       def:'Bundles multiple physical links into one logical link for redundancy and bandwidth', category:'Switching' },
    { term:'Cisco IOS show ip route',def:'Displays routing table; C=connected, S=static, O=OSPF, D=EIGRP, B=BGP', category:'CLI' },
    { term:'Wildcard Mask',      def:'Inverted subnet mask used in ACLs and OSPF; 0=match, 1=ignore', category:'Networking' },
    { term:'MPLS',               def:'Multiprotocol Label Switching – routes based on labels instead of IP addresses (faster WAN)', category:'WAN' },
    { term:'PPP',                def:'Point-to-Point Protocol – WAN encapsulation with authentication (PAP/CHAP)', category:'WAN' },
    { term:'SSH vs Telnet',      def:'SSH = encrypted remote access (port 22); Telnet = unencrypted (port 23)', category:'Management' },
    { term:'TACACS+ vs RADIUS',  def:'TACACS+ = Cisco proprietary, encrypts entire packet; RADIUS = open, encrypts only password', category:'Security' },
  ],
  'nclex': [
    { term:'ABCs',               def:'Always prioritize Airway, Breathing, Circulation in emergency situations', category:'Priority' },
    { term:'Maslow Hierarchy',   def:'Physiological needs first, then Safety, Love, Esteem, Self-actualization', category:'Theory' },
    { term:'SBAR',               def:'Situation, Background, Assessment, Recommendation – communication framework', category:'Communication' },
    { term:'Normal K+ range',    def:'3.5–5.0 mEq/L; <3.5 = Hypokalemia (weak muscles); >5.0 = Hyperkalemia (cardiac arrest risk)', category:'Labs' },
    { term:'Normal Na+ range',   def:'135–145 mEq/L; <135 = Hyponatremia; >145 = Hypernatremia', category:'Labs' },
    { term:'Normal BG',          def:'Fasting 70–100 mg/dL; Post-meal <140 mg/dL; HbA1c <5.7% (normal)', category:'Labs' },
    { term:'INR Therapeutic',    def:'2.0–3.0 for most conditions; 2.5–3.5 for mechanical heart valves', category:'Labs' },
    { term:'Troponin',           def:'Most sensitive/specific marker for MI; elevated >3–6 hrs after onset', category:'Labs' },
    { term:'5 Rights of Meds',   def:'Right patient, drug, dose, route, time (+ 2 more: documentation, reason)', category:'Safety' },
    { term:'Signs of Shock',     def:'Hypotension, tachycardia, diaphoresis, altered mental status, decreased urine output', category:'Assessment' },
    { term:'Resp Acidosis',      def:'pH <7.35, PaCO2 >45 – hypoventilation; causes: COPD, opioid OD, sleep apnea', category:'ABGs' },
    { term:'Metabolic Alkalosis',def:'pH >7.45, HCO3 >26 – causes: vomiting, NG suction, diuretics, antacid overuse', category:'ABGs' },
    { term:'Opioid antidote',    def:'Naloxone (Narcan) – reverses opioid overdose; monitor for re-narcotization', category:'Pharmacology' },
    { term:'Coumadin (Warfarin)',def:'Monitor PT/INR; antidote = Vitamin K; avoid leafy greens (Vitamin K source)', category:'Pharmacology' },
    { term:'Digoxin toxicity',   def:'Signs: N/V, yellow-green halos, bradycardia; therapeutic level 0.5–2 ng/mL', category:'Pharmacology' },
    { term:'Restraint priority', def:'Always try less restrictive methods first; check q2h for skin integrity', category:'Safety' },
    { term:'Orthostatic hypo',   def:'BP drops ≥20 mmHg systolic or ≥10 diastolic when standing – fall risk', category:'Assessment' },
    { term:'Nephrotic syndrome', def:'Massive proteinuria, hypoalbuminemia, edema, hyperlipidemia', category:'Disorders' },
    { term:'Cushing triad',      def:'↑BP + bradycardia + irregular respirations = increased ICP emergency', category:'Neuro' },
    { term:'Glasgow Coma Scale', def:'Eye 1–4, Verbal 1–5, Motor 1–6; total 3–15; ≤8 = coma, intubation likely', category:'Neuro' },
  ],
  'security+': [
    { term:'CIA Triad',          def:'Confidentiality, Integrity, Availability – core principles of information security', category:'Concepts' },
    { term:'Zero Trust',         def:'Never trust, always verify – assumes breach; verifies every request regardless of location', category:'Architecture' },
    { term:'MFA',                def:'Multi-Factor Authentication – requires 2+ factors: something you know/have/are', category:'Auth' },
    { term:'PKI',                def:'Public Key Infrastructure – framework for managing digital certificates and encryption', category:'Cryptography' },
    { term:'AES',                def:'Advanced Encryption Standard – symmetric 128/192/256-bit block cipher; current gold standard', category:'Cryptography' },
    { term:'RSA',                def:'Asymmetric encryption using public/private key pair; key exchange, digital signatures', category:'Cryptography' },
    { term:'Phishing',           def:'Fraudulent email/site to steal credentials; spear phishing = targeted; whaling = executives', category:'Threats' },
    { term:'SQL Injection',      def:'Inserting malicious SQL into input fields to manipulate database queries', category:'Attacks' },
    { term:'XSS',                def:'Cross-Site Scripting – injects malicious scripts into web pages viewed by other users', category:'Attacks' },
    { term:'DDoS',               def:'Distributed Denial of Service – overwhelms target with traffic from many compromised hosts', category:'Attacks' },
    { term:'SIEM',               def:'Security Information & Event Management – aggregates logs for real-time threat detection', category:'Tools' },
    { term:'Penetration Testing',def:'Authorized simulated attack to find vulnerabilities; phases: recon, scan, exploit, report', category:'Testing' },
    { term:'Risk = Threat × Vuln',def:'Risk management equation; mitigate by reducing threat likelihood or vulnerability exposure', category:'Risk' },
    { term:'CVSS',               def:'Common Vulnerability Scoring System – 0–10 scale rating severity of vulnerabilities', category:'Risk' },
    { term:'Incident Response',  def:'Prepare, Detect, Contain, Eradicate, Recover, Lessons Learned (PICERL/NIST)', category:'Response' },
  ],
  'a+': [
    { term:'POST',               def:'Power-On Self-Test – BIOS/UEFI test that checks hardware before OS loads', category:'Hardware' },
    { term:'CPU Socket Types',   def:'Intel: LGA (pins on motherboard); AMD: AM5/AM4 (pins on CPU/PGA)', category:'Hardware' },
    { term:'RAM DDR5 vs DDR4',   def:'DDR5: faster (4800+ MT/s), higher capacity, dual 32-bit channels; DDR4: mature, cheaper', category:'Memory' },
    { term:'SATA vs NVMe',       def:'SATA: 600 MB/s max; NVMe SSD via PCIe: 3500+ MB/s – significantly faster', category:'Storage' },
    { term:'RAID 0',             def:'Striping – speed boost, NO redundancy; one drive fails = all data lost', category:'Storage' },
    { term:'RAID 1',             def:'Mirroring – exact copy on 2 drives; redundancy but 50% storage capacity', category:'Storage' },
    { term:'RAID 5',             def:'Striping + distributed parity across ≥3 drives; survives 1 drive failure', category:'Storage' },
    { term:'Motherboard Form Factors',def:'ATX (305×244mm), Micro-ATX (244×244mm), Mini-ITX (170×170mm)', category:'Hardware' },
    { term:'USB Standards',      def:'USB 2.0=480Mbps; USB 3.2 Gen1=5Gbps; Gen2=10Gbps; USB4=40Gbps', category:'Connectivity' },
    { term:'Display Ports',      def:'HDMI 2.1: 8K@60Hz; DisplayPort 2.0: 16K; USB-C: video+power+data', category:'Connectivity' },
    { term:'Windows Recovery',   def:'Safe Mode, System Restore, Startup Repair, Reset This PC, WinRE (F8/Shift+F8)', category:'OS' },
    { term:'ipconfig /all',      def:'Shows all NIC details: IP, MAC, gateway, DNS; use /flushdns to clear DNS cache', category:'CLI' },
    { term:'Laser vs Inkjet',    def:'Laser: toner, fuser, drum; Inkjet: ink cartridges, slower, less expensive per page', category:'Printers' },
    { term:'Virtualization',     def:'Type 1 hypervisor (bare-metal): Hyper-V, ESXi; Type 2 (hosted): VirtualBox, VMware WS', category:'Cloud' },
    { term:'ESD Prevention',     def:'Anti-static wrist strap grounded to chassis; work on anti-static mat', category:'Safety' },
  ],
};

function matchExam(query: string): FlashCard[] {
  const q = query.toLowerCase();
  for (const [key, cards] of Object.entries(VOCAB_BANKS)) {
    if (q.includes(key) || key.includes(q.split(/\s+/)[0])) return cards;
  }
  // Generic fallback based on common IT/medical keywords
  if (/nurs|patient|rn|lpn|hospital|cna/.test(q)) return VOCAB_BANKS['nclex'];
  if (/cybe|secu|hack|pen|cissp/.test(q)) return VOCAB_BANKS['security+'];
  if (/cisco|route|switch|wan|ccn/.test(q)) return VOCAB_BANKS['ccna'];
  if (/comp|it|tech|help desk|a\+/.test(q)) return VOCAB_BANKS['a+'];
  return VOCAB_BANKS['network+'];
}

function generateLyrics(exam: string, cards: FlashCard[]): string {
  const terms = cards.slice(0, 12).map(c => c.term);
  const categories = [...new Set(cards.map(c => c.category))].slice(0, 4);

  return `🎵 "${exam.toUpperCase()} STUDY ANTHEM" 🎵

[Verse 1]
Sit down, open up your books and let's get in the zone,
${terms[0]} and ${terms[1]}, yeah I'll make it my own,
${terms[2]} on the left, and ${terms[3]} on the right,
Study hard every day and we'll ace it tonight!

[Chorus]
Oh-oh-oh, I know my ${categories[0]},
Oh-oh-oh, I learned my ${categories[1]},
Every term, every fact, locked into my brain,
Flash cards in my hand, gonna ace this exam!

[Verse 2]
${terms[4]} is fundamental, gotta understand the flow,
${terms[5]} connects the dots everywhere that we go,
${terms[6]} and ${terms[7]}, they all play a part,
${terms[8]}? I know it all — it's already in my heart!

[Bridge]
${categories[2] || 'Concepts'} concepts, line by line,
${categories[3] || 'Skills'} and skills, gonna shine,
${terms[9] || terms[0]} — I define it every time,
${terms[10] || terms[1]} — the answer is all mine!

[Outro]
Study smart, not just hard — you've got this today,
Review your flash cards, TTS your way,
${exam.toUpperCase()} — I'm ready, I'll pass, no delay! 🎓`;
}

type Tab = 'cards' | 'song' | 'video';

export default function StudyGameWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const [query, setQuery] = useState('');
  const [exam, setExam] = useState('');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tab, setTab] = useState<Tab>('cards');
  const [speaking, setSpeaking] = useState(false);
  const [videoSearch, setVideoSearch] = useState('');

  function start() {
    const q = query.trim();
    if (!q) return;
    const matched = matchExam(q);
    setExam(q);
    setCards(matched);
    setLyrics(generateLyrics(q, matched));
    setVideoSearch(q + ' study guide exam prep');
    setCardIdx(0);
    setFlipped(false);
    setTab('cards');
  }

  function nextCard() { setCardIdx(i => (i + 1) % cards.length); setFlipped(false); }
  function prevCard() { setCardIdx(i => (i - 1 + cards.length) % cards.length); setFlipped(false); }

  function speakLyrics() {
    if (!lyrics || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(lyrics.replace(/🎵|🎓|🎶/g,''));
    utt.rate = 1.1; utt.pitch = 1.1;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const card = cards[cardIdx];
  const videoSrc = videoSearch
    ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoSearch + ' tutorial')}`
    : '';

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor:`${color}25` }}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize:'1.1rem' }}>🧠</span>
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color:'rgba(226,232,240,0.3)' }}>study game</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); start(); }} style={{ display:'flex', gap:6 }}>
          <input
            className="input-dark flex-1 !py-1.5 text-xs"
            placeholder="e.g. NCLEX, CompTIA Network+, CCNA…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-pill !px-3 !py-1.5"
            style={{ background:color, color:'#fff', boxShadow:`0 2px 10px ${glow}`, flexShrink:0 }}>
            <Search size={12} />
          </button>
        </form>
      </div>

      {cards.length > 0 ? (
        <>
          {/* Tabs */}
          {(() => {
            const tabDefs: { id: Tab; label: string; icon: React.ReactNode }[] = [
              { id:'cards', label:'Flash Cards', icon:<BookOpen size={10}/> },
              { id:'song',  label:'Song',        icon:<Music size={10}/> },
              { id:'video', label:'Video',       icon:<Video size={10}/> },
            ];
            return (
              <div style={{ display:'flex', gap:2, margin:'0 12px 8px', padding:3, borderRadius:10, background:'rgba(255,255,255,0.03)', flexShrink:0 }}>
                {tabDefs.map(({ id:t, label:lbl, icon }) => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex:1, padding:'4px 2px', borderRadius:7, border:'none', cursor:'pointer',
                    background: tab===t ? color : 'transparent',
                    color: tab===t ? '#fff' : 'rgba(226,232,240,0.4)',
                    fontSize:'0.55rem', fontWeight:700, fontFamily:'monospace',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:3,
                  }}>
                    {icon} {lbl}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Content */}
          <div className="flex-1 overflow-hidden px-3 pb-3">
            {tab === 'cards' && card && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                {/* Progress */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)' }}>
                    {exam.toUpperCase()} — {card.category}
                  </span>
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.4)' }}>
                    {cardIdx+1}/{cards.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height:2, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                  <div style={{ width:`${((cardIdx+1)/cards.length)*100}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.3s' }} />
                </div>
                {/* Card */}
                <div
                  onClick={() => setFlipped(f => !f)}
                  style={{
                    flex:1, borderRadius:14, cursor:'pointer', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center', padding:16, textAlign:'center',
                    background: flipped ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border:`1px solid ${flipped ? color+'40' : 'rgba(255,255,255,0.08)'}`,
                    transition:'all 0.2s', boxShadow: flipped ? `0 4px 20px ${glow}40` : 'none',
                  }}>
                  {!flipped ? (
                    <>
                      <span style={{ fontSize:'0.55rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)', marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>term</span>
                      <p style={{ fontSize:'1rem', fontWeight:700, color:'#E2E8F0', lineHeight:1.3 }}>{card.term}</p>
                      <p style={{ fontSize:'0.6rem', color:'rgba(226,232,240,0.25)', marginTop:10 }}>tap to reveal definition</p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize:'0.55rem', fontFamily:'monospace', color:color, marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>definition</span>
                      <p style={{ fontSize:'0.72rem', color:'rgba(226,232,240,0.85)', lineHeight:1.5 }}>{card.def}</p>
                    </>
                  )}
                </div>
                {/* Navigation */}
                <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                  <button onClick={prevCard} style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'5px 12px', cursor:'pointer', color }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => { setCardIdx(Math.floor(Math.random()*cards.length)); setFlipped(false); }}
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'5px 10px', cursor:'pointer', color:'rgba(226,232,240,0.5)', fontSize:'0.6rem', fontFamily:'monospace' }}>
                    <RotateCcw size={11} />
                  </button>
                  <button onClick={nextCard} style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'5px 12px', cursor:'pointer', color }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {tab === 'song' && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)', textTransform:'uppercase', letterSpacing:1 }}>🎵 study anthem</span>
                  <button onClick={speakLyrics}
                    style={{ background: speaking ? `${color}25` : 'rgba(255,255,255,0.04)', border:`1px solid ${speaking ? color+'40' : 'rgba(255,255,255,0.08)'}`, borderRadius:8, padding:'4px 10px', cursor:'pointer', color: speaking ? color : 'rgba(226,232,240,0.5)', display:'flex', alignItems:'center', gap:4, fontSize:'0.6rem', fontFamily:'monospace' }}>
                    <Volume2 size={10} /> {speaking ? 'stop' : 'play TTS'}
                  </button>
                </div>
                <div style={{ flex:1, overflowY:'auto', background:'rgba(255,255,255,0.02)', borderRadius:10, padding:12 }}>
                  <pre style={{ fontSize:'0.65rem', color:'rgba(226,232,240,0.7)', lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'monospace', margin:0 }}>{lyrics}</pre>
                </div>
              </div>
            )}

            {tab === 'video' && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)', textTransform:'uppercase', letterSpacing:1 }}>📹 study video</span>
                {videoSrc ? (
                  <div style={{ flex:1, borderRadius:10, overflow:'hidden', background:'#000' }}>
                    <iframe src={videoSrc} title="Study Video" allow="autoplay; fullscreen" allowFullScreen
                      style={{ width:'100%', height:'100%', border:'none' }} />
                  </div>
                ) : (
                  <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(226,232,240,0.25)', fontSize:'0.75rem' }}>
                    Search for an exam above to load videos
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 pb-4">
          <span style={{ fontSize:'2.5rem' }}>📚</span>
          <p style={{ color:'rgba(226,232,240,0.35)', fontSize:'0.75rem', textAlign:'center', lineHeight:1.6 }}>
            Type your exam or subject above.<br/>
            Flash cards, a study song, and videos will generate instantly.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
            {['Network+','NCLEX','CCNA','Security+','A+'].map(ex => (
              <button key={ex} onClick={() => { setQuery(ex); }}
                style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'4px 10px', cursor:'pointer', color, fontSize:'0.65rem', fontFamily:'monospace' }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

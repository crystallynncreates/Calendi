import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCcw, Music, Video, BookOpen, Volume2, HelpCircle } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

interface FlashCard { term: string; def: string; category: string }
interface QuizQ { term: string; options: string[]; correctIdx: number; category: string }

/* ── Vocabulary banks ── */
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
    { term:'show ip route',      def:'Displays routing table; C=connected, S=static, O=OSPF, D=EIGRP, B=BGP', category:'CLI' },
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
    { term:'USB Standards',      def:'USB 2.0=480Mbps; USB 3.2 Gen1=5Gbps; Gen2=10Gbps; USB4=40Gbps', category:'Connectivity' },
    { term:'Display Ports',      def:'HDMI 2.1: 8K@60Hz; DisplayPort 2.0: 16K; USB-C: video+power+data', category:'Connectivity' },
    { term:'Windows Recovery',   def:'Safe Mode, System Restore, Startup Repair, Reset This PC, WinRE (F8/Shift+F8)', category:'OS' },
    { term:'ipconfig /all',      def:'Shows all NIC details: IP, MAC, gateway, DNS; use /flushdns to clear DNS cache', category:'CLI' },
    { term:'Virtualization',     def:'Type 1 hypervisor (bare-metal): Hyper-V, ESXi; Type 2 (hosted): VirtualBox, VMware WS', category:'Cloud' },
    { term:'ESD Prevention',     def:'Anti-static wrist strap grounded to chassis; work on anti-static mat', category:'Safety' },
  ],
  'mcat': [
    { term:'Krebs Cycle',        def:'8-step cycle in mitochondria that oxidizes acetyl-CoA; produces NADH, FADH2, ATP, CO2', category:'Biochemistry' },
    { term:'Michaelis-Menten',   def:'Km = substrate conc. at ½ Vmax; lower Km = higher enzyme affinity for substrate', category:'Biochemistry' },
    { term:'Hardy-Weinberg',     def:'p² + 2pq + q² = 1; equilibrium requires: no selection, drift, mutation, or migration', category:'Genetics' },
    { term:'Action Potential',   def:'Depolarization via Na+ influx, repolarization via K+ efflux; threshold ≈ –55mV', category:'Physiology' },
    { term:'Eukaryote vs Prokaryote', def:'Eukaryotes: membrane-bound nucleus, 80S ribosomes; Prokaryotes: 70S, no nucleus', category:'Cell Biology' },
    { term:'Gibbs Free Energy',  def:'ΔG = ΔH – TΔS; negative ΔG = spontaneous reaction; ΔG=0 at equilibrium', category:'Thermodynamics' },
    { term:'OIL RIG',            def:'Oxidation Is Loss of electrons; Reduction Is Gain of electrons', category:'Chemistry' },
    { term:'Le Chatelier\'s Principle', def:'Equilibrium shifts to oppose stress: add product → shifts left; increase pressure → favors fewer moles gas', category:'Chemistry' },
    { term:'Mitosis vs Meiosis', def:'Mitosis: 2 identical diploid cells; Meiosis: 4 unique haploid gametes with crossing over', category:'Cell Biology' },
    { term:'Kohlberg Stages',    def:'Pre-conventional (self-interest) → Conventional (rules) → Post-conventional (universal ethics)', category:'Psychology' },
    { term:'Classical Conditioning', def:'Pavlov: neutral stimulus paired with UCS → CS elicits CR; extinction occurs without UCS', category:'Psychology' },
    { term:'Bicarbonate Buffer', def:'H2CO3 / HCO3– maintains blood pH 7.35–7.45; kidneys regulate HCO3–, lungs regulate CO2', category:'Biochemistry' },
    { term:'Bernoulli\'s Equation', def:'P + ½ρv² + ρgh = constant; faster fluid flow = lower pressure', category:'Physics' },
    { term:'Doppler Effect',     def:'Source approaching = higher observed frequency; moving away = lower frequency', category:'Physics' },
    { term:'DNA Replication',    def:'Semi-conservative; helicase unwinds, primase adds RNA primer, DNA Pol III extends 5\'→3\'', category:'Biochemistry' },
  ],
  'gre': [
    { term:'Abscond',            def:'To leave hurriedly and secretly, typically to avoid consequences of wrongdoing', category:'Vocabulary' },
    { term:'Equivocate',         def:'Use ambiguous language to conceal truth or avoid commitment; to be deliberately vague', category:'Vocabulary' },
    { term:'Laconic',            def:'Using very few words; brief and concise in speech or expression', category:'Vocabulary' },
    { term:'Perfidious',         def:'Deceitful and untrustworthy; guilty of betrayal or breach of faith', category:'Vocabulary' },
    { term:'Recondite',          def:'Not known by many people; dealing with obscure subject matter', category:'Vocabulary' },
    { term:'Sanguine',           def:'Optimistic, especially in difficult situations; blood-red in color', category:'Vocabulary' },
    { term:'Garrulous',          def:'Excessively talkative, especially on trivial matters', category:'Vocabulary' },
    { term:'Intransigent',       def:'Unwilling to change views or to compromise; stubbornly uncompromising', category:'Vocabulary' },
    { term:'Permutation vs Combination', def:'Permutation: order matters nPr = n!/(n−r)!; Combination: order doesn\'t nCr = n!/[r!(n−r)!]', category:'Quant' },
    { term:'Standard Deviation', def:'Measures data spread; 68% within 1σ, 95% within 2σ, 99.7% within 3σ of mean', category:'Quant' },
    { term:'Argument Essay',     def:'Identify logical flaws/assumptions in given argument; provide evidence of error; suggest improvements', category:'AWA' },
    { term:'Specious',           def:'Superficially plausible but actually wrong or misleading', category:'Vocabulary' },
    { term:'Propitious',         def:'Giving or indicating a good chance of success; favorable circumstances', category:'Vocabulary' },
    { term:'Tendentious',        def:'Promoting a particular point of view; biased toward a specific conclusion', category:'Vocabulary' },
    { term:'Enervate',           def:'To cause someone to feel drained of energy or vitality; to weaken', category:'Vocabulary' },
  ],
  'lsat': [
    { term:'Sufficient vs Necessary', def:'Sufficient: IF A THEN B; Necessary: B required for A; contrapositive = negate and flip both sides', category:'Logic' },
    { term:'Modus Ponens',       def:'If P then Q; P is true; therefore Q. Valid deductive argument form', category:'Logic' },
    { term:'Modus Tollens',      def:'If P then Q; Q is false; therefore P is false. Contrapositive reasoning', category:'Logic' },
    { term:'Flaw Types',         def:'Ad hominem, circular reasoning, appeal to authority, false dichotomy, hasty generalization', category:'Reasoning' },
    { term:'Strengthen vs Weaken', def:'Strengthen: add info making conclusion more likely; Weaken: undermine the evidence-to-conclusion link', category:'Reasoning' },
    { term:'Parallel Reasoning', def:'Find answer with same logical structure; match premises-to-conclusion relationship exactly', category:'Reasoning' },
    { term:'Linear Game Setup',  def:'Assign variables to ordered positions; build grid; eliminate using conditional clues', category:'Logic Games' },
    { term:'Grouping Game',      def:'Assign elements to groups; track in/out membership; test conditions systematically', category:'Logic Games' },
    { term:'Main Point Question',def:'Identify the conclusion the author is proving; signal words: so, therefore, thus, hence', category:'RC' },
    { term:'Inference Question', def:'Must be true given the passage; correct answer follows necessarily, not just plausibly', category:'RC' },
    { term:'Assumption Negation Test', def:'Negate the assumption — if it destroys the argument, it\'s a necessary assumption', category:'Reasoning' },
    { term:'Most Strongly Supported', def:'Correct answer is most provable from stimulus; not necessarily 100% certain', category:'Reasoning' },
  ],
  'aws': [
    { term:'EC2',                def:'Elastic Compute Cloud – virtual servers; types: t3 (general), c5 (compute), r5 (memory), p3 (GPU)', category:'Compute' },
    { term:'S3',                 def:'Object storage; 11 nines durability; storage classes: Standard, IA, Glacier, Intelligent-Tiering', category:'Storage' },
    { term:'VPC',                def:'Virtual Private Cloud – isolated network with subnets, route tables, IGW, NAT gateway, security groups', category:'Networking' },
    { term:'IAM',                def:'Identity & Access Management – users, groups, roles, JSON policies; principle of least privilege', category:'Security' },
    { term:'Lambda',             def:'Serverless function; pay per invocation + duration; max 15 min; triggers: S3, DynamoDB, API Gateway', category:'Serverless' },
    { term:'RDS',                def:'Managed relational DB: MySQL, PostgreSQL, Aurora, SQL Server; Multi-AZ for HA, Read Replicas for scale', category:'Database' },
    { term:'DynamoDB',           def:'Managed NoSQL (key-value); single-digit ms latency; partition key + optional sort key', category:'Database' },
    { term:'Auto Scaling',       def:'Adjusts EC2 fleet automatically; policies: target tracking (e.g. CPU%), step, scheduled', category:'Compute' },
    { term:'ELB',                def:'Elastic Load Balancer; ALB (HTTP layer 7), NLB (TCP layer 4), GLB (third-party appliances)', category:'Networking' },
    { term:'Route 53',           def:'AWS DNS; routing policies: simple, weighted, latency, geolocation, failover, multivalue', category:'Networking' },
    { term:'CloudFront',         def:'CDN – global edge network; caches S3/EC2 content; integrates with WAF and ACM (SSL)', category:'CDN' },
    { term:'Well-Architected Pillars', def:'Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability', category:'Concepts' },
    { term:'SQS vs SNS',         def:'SQS = queue (pull, decoupling); SNS = pub/sub notification (push to multiple subscribers)', category:'Messaging' },
    { term:'Shared Responsibility', def:'AWS: hardware, physical security; Customer: data, IAM, OS patching, application security', category:'Security' },
    { term:'S3 Presigned URL',   def:'Temporary URL granting time-limited access to private S3 object; no IAM credentials needed by recipient', category:'Storage' },
  ],
  'cna': [
    { term:'ADLs',               def:'Activities of Daily Living: bathing, dressing, grooming, eating, toileting, transferring, ambulating', category:'Patient Care' },
    { term:'ROM Exercises',      def:'Range of Motion – active (patient does it), passive (CNA moves), active-assistive; prevents contractures', category:'Mobility' },
    { term:'Positioning',        def:'Fowler\'s (45–60°), Semi-Fowler\'s (30–45°), Trendelenburg (head down), Sims (left lateral, enema)', category:'Patient Care' },
    { term:'Log Rolling',        def:'Turn patient as one unit (spinal precautions); use draw sheet; 2+ staff; pillow between knees', category:'Mobility' },
    { term:'Normal Vital Signs', def:'BP 120/80, HR 60–100 bpm, RR 12–20/min, Temp 98.6°F (37°C), SpO2 ≥95%', category:'Assessment' },
    { term:'Hand Hygiene',       def:'#1 infection control measure; wash 20 sec with soap+water (preferred for C.diff); use hand sanitizer otherwise', category:'Safety' },
    { term:'Isolation Types',    def:'Contact (MRSA/C.diff): gloves+gown; Droplet (flu): mask; Airborne (TB): N95 + negative pressure room', category:'Safety' },
    { term:'Pressure Injuries',  def:'Decubitus ulcers at bony prominences (coccyx, heels, elbows); reposition q2h; stages I–IV', category:'Skin Care' },
    { term:'Perineal Care',      def:'Female: front to back; uncircumcised male: retract foreskin, clean, return foreskin after care', category:'Patient Care' },
    { term:'Dysphagia Precautions', def:'HOB elevated 30–90°; thickened liquids per diet order; upright 30 min after meals; small bites', category:'Nutrition' },
    { term:'Foley Catheter Care',def:'Sterile insertion; closed drainage system; bag always below bladder; document I&O every shift', category:'Patient Care' },
    { term:'Patient Rights',     def:'Privacy, dignity, refuse treatment, informed consent, communication in preferred language, safe environment', category:'Legal' },
  ],
  'usmle': [
    { term:'Frank-Starling Law', def:'Increased preload → increased cardiac output (to a point); mechanism: sarcomere stretch optimizes actin-myosin overlap', category:'Cardiology' },
    { term:'Warfarin MOA',       def:'Inhibits Vitamin K epoxide reductase → blocks synthesis of factors II, VII, IX, X, protein C/S', category:'Pharmacology' },
    { term:'Beta-Blockers',      def:'Block β1 (↓HR, ↓contractility) and β2 (bronchospasm); indications: HTN, angina, HF, post-MI, arrhythmias', category:'Pharmacology' },
    { term:'ACE Inhibitors',     def:'Block Ang I→II conversion; ↓BP, ↓aldosterone; side effects: dry cough (bradykinin), angioedema', category:'Pharmacology' },
    { term:'MI Types',           def:'STEMI: complete occlusion (treat with PCI); NSTEMI: partial (medical management); troponin rises 3–6h post-onset', category:'Cardiology' },
    { term:'Virchow\'s Triad',   def:'DVT/PE risk: Stasis + Endothelial injury + Hypercoagulability; D-dimer screen, CT-PA confirms PE', category:'Hematology' },
    { term:'Shock Types',        def:'Cardiogenic (↑PCWP, ↓CO); Distributive/Septic (↓SVR, ↑CO early); Hypovolemic (↓PCWP, ↓CO)', category:'Critical Care' },
    { term:'DKA',                def:'Type 1 DM; ↑glucose, ↑ketones, anion gap metabolic acidosis; treat: IV fluids + insulin + K+ replacement', category:'Endocrinology' },
    { term:'Thyroid Interpretation', def:'TSH↑ + T4↓ = hypothyroidism; TSH↓ + T4↑ = hyperthyroidism; Graves = TSI antibodies + exophthalmos', category:'Endocrinology' },
    { term:'CAP Pathogens',      def:'S. pneumoniae most common; Atypical: Mycoplasma, Legionella; Hospital: Pseudomonas, MRSA, Klebsiella', category:'Pulmonology' },
    { term:'Meningitis Signs',   def:'Kernig\'s (resists knee extension supine); Brudzinski\'s (hips flex with neck flexion)', category:'Neurology' },
    { term:'Antidepressant Classes', def:'SSRIs (1st line), SNRIs, TCAs (anticholinergic SE), MAOIs (hypertensive crisis with tyramine-rich foods)', category:'Pharmacology' },
    { term:'Child-Pugh Score',   def:'Cirrhosis severity: Bilirubin, Albumin, PT, Ascites, Encephalopathy; classes A/B/C predict prognosis', category:'GI' },
    { term:'Acute Appendicitis', def:'RLQ pain, nausea/vomiting, McBurney\'s point; ↑WBC; CT scan diagnostic; tx: appendectomy', category:'Surgery' },
  ],
  'cissp': [
    { term:'8 CISSP Domains',    def:'Security & Risk, Asset Security, Security Architecture, Network Security, IAM, Assessment, Operations, SDLC', category:'Domains' },
    { term:'Risk Formula',       def:'Risk = Threat × Vulnerability × Asset Value; residual risk = risk remaining after applying controls', category:'Risk' },
    { term:'Access Control Models', def:'DAC (owner sets), MAC (labels/clearance), RBAC (job roles), ABAC (attributes), Rule-based', category:'IAM' },
    { term:'PKI Components',     def:'CA (issues certs), RA (verifies identity), CRL/OCSP (revocation), certificate (public key + identity)', category:'Cryptography' },
    { term:'Symmetric vs Asymmetric', def:'Symmetric: same key both ways (AES, 3DES) – fast; Asymmetric: key pair (RSA, ECC) – slow but secure key exchange', category:'Cryptography' },
    { term:'BCP vs DRP',         def:'BCP = Business Continuity (keep operating during disaster); DRP = IT restore after disaster; BCP is broader', category:'Resilience' },
    { term:'RTO vs RPO',         def:'RTO = max acceptable downtime; RPO = max acceptable data loss; both drive backup/recovery strategy', category:'Resilience' },
    { term:'Data Classification',def:'Government: Top Secret > Secret > Confidential > Unclassified; Commercial: Confidential > Private > Sensitive > Public', category:'Asset Security' },
    { term:'Bell-LaPadula Model',def:'Confidentiality model: No read up, no write down; used in military/government systems', category:'Architecture' },
    { term:'Biba Integrity Model',def:'Integrity: No read down, no write up; prevents low-integrity data from corrupting high-integrity data', category:'Architecture' },
    { term:'Penetration Testing Phases', def:'Reconnaissance → Scanning → Exploitation → Post-Exploitation → Reporting; types: black/gray/white box', category:'Testing' },
    { term:'SDLC Security',      def:'Security integrated at every phase: requirements → design → code → test → deploy → maintain (DevSecOps)', category:'SDLC' },
  ],
  'azure': [
    { term:'Regions & Availability Zones', def:'Regions: geographic areas; AZs: 3+ isolated datacenters within a region for high availability', category:'Infrastructure' },
    { term:'Resource Groups',    def:'Logical containers for Azure resources; manage access, billing, and lifecycle together', category:'Management' },
    { term:'Azure Active Directory', def:'Cloud identity (Entra ID); manages users, groups, SSO, MFA, Conditional Access; not the same as on-prem AD', category:'Identity' },
    { term:'Azure Blob Storage', def:'Object storage; tiers: Hot, Cool, Archive; containers hold blobs; geo-redundancy options (LRS, GRS, ZRS)', category:'Storage' },
    { term:'Azure Virtual Machines', def:'IaaS VMs; VM Scale Sets = autoscaling; Availability Sets = fault/update domain protection', category:'Compute' },
    { term:'Azure App Service',  def:'PaaS web hosting for .NET, Node, Python, Java; auto-scale, deployment slots, custom domains', category:'Compute' },
    { term:'AKS',                def:'Azure Kubernetes Service – managed Kubernetes; orchestrates containers; integrates with ACR', category:'Containers' },
    { term:'Azure SQL Database', def:'Managed SQL Server PaaS; DTU or vCore pricing; Elastic Pools for multi-database cost savings', category:'Database' },
    { term:'Azure Cosmos DB',    def:'Multi-model globally distributed NoSQL; multiple consistency levels; like DynamoDB with more flexibility', category:'Database' },
    { term:'Azure Monitor',      def:'Metrics, alerts, dashboards, Log Analytics workspace; integrates with Application Insights for APM', category:'Monitoring' },
    { term:'CapEx vs OpEx',      def:'CapEx = upfront hardware purchase; OpEx = pay-as-you-go; cloud shifts IT spending to OpEx model', category:'Concepts' },
    { term:'Shared Responsibility', def:'Microsoft: datacenter, host OS, network fabric; Customer: data, identity, endpoints, apps, configurations', category:'Security' },
  ],
  'pmp': [
    { term:'5 Process Groups',   def:'Initiating → Planning → Executing → Monitoring & Controlling → Closing (IPEMC)', category:'Framework' },
    { term:'10 Knowledge Areas', def:'Integration, Scope, Schedule, Cost, Quality, Resources, Communications, Risk, Procurement, Stakeholders', category:'Framework' },
    { term:'Triple Constraint',  def:'Scope, Time, Cost – Iron Triangle; quality at center; changes to one affect others', category:'Concepts' },
    { term:'Critical Path Method', def:'Longest path through task network = project duration; tasks on CPM have 0 float/slack', category:'Schedule' },
    { term:'Earned Value',       def:'EV = %complete × BAC; SV = EV–PV; CV = EV–AC; SPI = EV/PV; CPI = EV/AC; >1.0 is good', category:'Cost' },
    { term:'Risk Register',      def:'Documents identified risks, probability, impact, response strategies: Avoid/Transfer/Mitigate/Accept', category:'Risk' },
    { term:'Change Control Board', def:'CCB reviews and approves/rejects change requests; prevents scope creep; documents all decisions', category:'Integration' },
    { term:'WBS',                def:'Work Breakdown Structure – hierarchical decomposition of deliverables into work packages', category:'Scope' },
    { term:'Stakeholder Grid',   def:'Power/Interest grid; High Power+High Interest = manage closely; Low/Low = monitor', category:'Stakeholders' },
    { term:'RACI Matrix',        def:'Responsible (does work), Accountable (owns outcome), Consulted (gives input), Informed (kept updated)', category:'Resources' },
    { term:'Communication Channels', def:'Formula: n(n–1)/2; 10 team members = 45 channels; more people = exponentially more complexity', category:'Communications' },
    { term:'Agile vs Waterfall', def:'Waterfall = sequential fixed-scope phases; Agile = iterative adaptive sprints; Hybrid blends both', category:'Approaches' },
  ],
  'lpn': [
    { term:'LPN Scope of Practice', def:'Administer meds, IV monitoring, wound care, document vitals, collect data; cannot independently assess, plan, or diagnose', category:'Scope' },
    { term:'Normal Vitals',      def:'BP 120/80, HR 60–100, RR 12–20, Temp 97.8–99.1°F, SpO2 95–100%, Pain scale 0–10', category:'Assessment' },
    { term:'Six Rights of Medication', def:'Right patient, drug, dose, route, time, documentation; check twice before administering any medication', category:'Pharmacology' },
    { term:'Insulin Types',      def:'Rapid (Lispro/Aspart: 15min onset); Short (Regular: 30min); Intermediate (NPH: 2h); Long (Glargine: no peak)', category:'Pharmacology' },
    { term:'Heparin Antidote',   def:'Protamine sulfate reverses heparin; monitor aPTT (therapeutic 60–100 sec); HIT = immune thrombocytopenia', category:'Pharmacology' },
    { term:'Wound Care Principles', def:'Sterile technique for surgical wounds; clean for chronic; pack wounds loosely, never tightly; assess drainage', category:'Procedures' },
    { term:'NG Tube Verification', def:'Check gastric aspirate pH <5; X-ray = gold standard; auscultation alone is NOT reliable for confirmation', category:'Procedures' },
    { term:'COPD Nursing',       def:'Low-flow O2 1–3 L/min; pursed-lip breathing; tripod position; avoid high-dose O2 (may blunt hypoxic drive)', category:'Respiratory' },
    { term:'Post-Op Assessment', def:'Airway → Breathing → Circulation → LOC → Pain → Surgical site → I&O; VS q15min×4 then q1h', category:'Surgical' },
    { term:'Therapeutic Communication', def:'Open-ended questions, active listening, reflecting, clarifying; avoid false reassurance, giving advice, why questions', category:'Communication' },
    { term:'LPN Delegation',     def:'Can delegate ADLs, vitals, ambulation to CNA; CANNOT delegate assessments, patient teaching, IV push meds', category:'Management' },
    { term:'Foley Catheter',     def:'Sterile insertion; maintain closed drainage system; bag always below bladder; document I&O every shift', category:'Procedures' },
  ],
  'sight-words-1': [
    { term:'the',   def:'The most common word in English — "The cat sat on the mat."', category:'Grade 1' },
    { term:'and',   def:'Joins two things together — "Dogs and cats are pets."', category:'Grade 1' },
    { term:'a',     def:'Used before a word — "A bird flew by."', category:'Grade 1' },
    { term:'to',    def:'Shows direction or purpose — "I go to school."', category:'Grade 1' },
    { term:'said',  def:'Past tense of say — "She said hello."', category:'Grade 1' },
    { term:'in',    def:'Inside something — "The fish is in the water."', category:'Grade 1' },
    { term:'is',    def:'Describes what something is — "The sky is blue."', category:'Grade 1' },
    { term:'it',    def:'Refers to a thing — "It is raining today."', category:'Grade 1' },
    { term:'was',   def:'Past tense of is — "It was sunny yesterday."', category:'Grade 1' },
    { term:'he',    def:'Refers to a boy or man — "He ran fast."', category:'Grade 1' },
    { term:'for',   def:'Shows purpose — "This gift is for you."', category:'Grade 1' },
    { term:'on',    def:'On top of — "The book is on the table."', category:'Grade 1' },
    { term:'are',   def:'Plural of is — "They are my friends."', category:'Grade 1' },
    { term:'but',   def:'Shows a contrast — "I tried but I fell."', category:'Grade 1' },
    { term:'have',  def:'To own or possess — "I have a puppy."', category:'Grade 1' },
    { term:'you',   def:'The person being spoken to — "Can you help me?"', category:'Grade 1' },
    { term:'that',  def:'Points to something — "That house is big."', category:'Grade 1' },
    { term:'with',  def:'Together or alongside — "I walk with my friend."', category:'Grade 1' },
    { term:'she',   def:'Refers to a girl or woman — "She loves to read."', category:'Grade 1' },
    { term:'they',  def:'More than one person or thing — "They are playing."', category:'Grade 1' },
  ],
  'sight-words-2': [
    { term:'because', def:'Gives a reason — "I stayed inside because it rained."', category:'Grade 2' },
    { term:'friend',  def:'Someone you like and trust — "My best friend is kind."', category:'Grade 2' },
    { term:'every',   def:'Each one — "Every student must read."', category:'Grade 2' },
    { term:'people',  def:'More than one person — "People live in houses."', category:'Grade 2' },
    { term:'could',   def:'Was able to — "She could jump very high."', category:'Grade 2' },
    { term:'would',   def:'Was willing to — "He would help if he could."', category:'Grade 2' },
    { term:'should',  def:'Ought to — "You should drink water daily."', category:'Grade 2' },
    { term:'their',   def:'Belonging to them — "It is their turn to play."', category:'Grade 2' },
    { term:'there',   def:'In that place — "Put the box over there."', category:'Grade 2' },
    { term:'where',   def:'In what place — "Where is the library?"', category:'Grade 2' },
    { term:'which',   def:'Asks about a choice — "Which book do you want?"', category:'Grade 2' },
    { term:'once',    def:'One time — "I once saw a shooting star."', category:'Grade 2' },
    { term:'around',  def:'In a circle or near — "We ran around the track."', category:'Grade 2' },
    { term:'always',  def:'Every time, without exception — "She always brushes her teeth."', category:'Grade 2' },
    { term:'never',   def:'Not at any time — "He never forgets his lunch."', category:'Grade 2' },
  ],
  'sight-words-3': [
    { term:'beautiful', def:'Very pretty — "The sunset was beautiful."', category:'Grade 3' },
    { term:'different',  def:'Not the same — "Each snowflake is different."', category:'Grade 3' },
    { term:'important',  def:'Very meaningful — "Reading is important for learning."', category:'Grade 3' },
    { term:'together',   def:'With each other, as a team — "We can work together!"', category:'Grade 3' },
    { term:'question',   def:'Something you ask — "She raised her hand to ask a question."', category:'Grade 3' },
    { term:'favorite',   def:'Liked best — "Pizza is my favorite food."', category:'Grade 3' },
    { term:'enough',     def:'As much as needed — "Did you get enough sleep?"', category:'Grade 3' },
    { term:'especially', def:'More than usual — "I especially love music class."', category:'Grade 3' },
    { term:'thought',    def:'Past tense of think — "I thought it would rain."', category:'Grade 3' },
    { term:'government', def:'The leaders who run a country or city — "The government makes laws."', category:'Grade 3' },
    { term:'knowledge',  def:'What you know from learning — "Reading builds knowledge."', category:'Grade 3' },
    { term:'imagine',    def:'To picture something in your mind — "Imagine a flying horse!"', category:'Grade 3' },
    { term:'probably',   def:'Most likely — "It will probably snow tomorrow."', category:'Grade 3' },
    { term:'possible',   def:'Able to happen — "Anything is possible with practice."', category:'Grade 3' },
    { term:'mystery',    def:'Something unknown or unexplained — "The missing sock is a mystery."', category:'Grade 3' },
  ],
  'algebra': [
    { term:'Variable',        def:'A letter (x, y) representing an unknown number — "Solve for x in 2x + 3 = 11"', category:'Concepts' },
    { term:'Order of Operations', def:'PEMDAS: Parentheses, Exponents, Multiply/Divide (left→right), Add/Subtract (left→right)', category:'Concepts' },
    { term:'Slope',           def:'Rise over run: m = (y2−y1)/(x2−x1); steepness of a line', category:'Linear' },
    { term:'Slope-Intercept', def:'y = mx + b; m = slope, b = y-intercept where line crosses y-axis', category:'Linear' },
    { term:'Quadratic Formula', def:'x = (−b ± √(b²−4ac)) / 2a; solves ax² + bx + c = 0', category:'Quadratics' },
    { term:'Factoring',       def:'Rewrite expression as a product: x²+5x+6 = (x+2)(x+3); FOIL to check', category:'Quadratics' },
    { term:'Distributive Property', def:'a(b+c) = ab + ac; multiply outside term by each inside term', category:'Properties' },
    { term:'Systems of Equations', def:'Two equations, two unknowns; solve by substitution, elimination, or graphing', category:'Systems' },
    { term:'Inequality',      def:'< > ≤ ≥; flip sign when multiplying/dividing by a negative number', category:'Concepts' },
    { term:'Exponent Rules',  def:'xᵃ·xᵇ = xᵃ⁺ᵇ; (xᵃ)ᵇ = xᵃᵇ; x⁰ = 1; x⁻¹ = 1/x', category:'Exponents' },
    { term:'Function',        def:'Each input (x) gives exactly one output f(x); vertical line test confirms a function', category:'Functions' },
    { term:'Domain & Range',  def:'Domain = all valid x-inputs; Range = all resulting y-outputs', category:'Functions' },
    { term:'Absolute Value',  def:'|x| = distance from 0; always positive; |−5| = 5', category:'Concepts' },
    { term:'Radical / Square Root', def:'√x = number that times itself equals x; √49 = 7; rationalize by removing √ from denominator', category:'Radicals' },
  ],
  'geometry': [
    { term:'Pythagorean Theorem', def:'a² + b² = c²; c = hypotenuse (longest side of right triangle)', category:'Triangles' },
    { term:'Area of Triangle', def:'A = ½ × base × height', category:'Area' },
    { term:'Area of Circle',  def:'A = πr²; Circumference = 2πr; π ≈ 3.14159', category:'Area' },
    { term:'Supplementary Angles', def:'Two angles that add to 180°; linear pair', category:'Angles' },
    { term:'Complementary Angles', def:'Two angles that add to 90°; together form a right angle', category:'Angles' },
    { term:'Parallel Lines',  def:'Never intersect; cut by a transversal creates alternate interior (equal) and co-interior (supplementary) angles', category:'Lines' },
    { term:'Congruent vs Similar', def:'Congruent: same shape AND size (≅); Similar: same shape, proportional size (~)', category:'Polygons' },
    { term:'Quadrilateral Types', def:'Rectangle (4 right angles), Rhombus (4 equal sides), Parallelogram (opp. sides parallel), Trapezoid (1 pair parallel)', category:'Polygons' },
    { term:'Volume of Prism', def:'V = base area × height', category:'3D Shapes' },
    { term:'Volume of Sphere', def:'V = (4/3)πr³; Surface area = 4πr²', category:'3D Shapes' },
    { term:'Transformation Types', def:'Translation (slide), Rotation (turn), Reflection (flip), Dilation (resize)', category:'Transformations' },
    { term:'Coordinate Midpoint', def:'Midpoint = ((x1+x2)/2, (y1+y2)/2); Distance = √((x2−x1)²+(y2−y1)²)', category:'Coordinate' },
  ],
  'biology': [
    { term:'Cell Theory',     def:'All living things are made of cells; the cell is the basic unit of life; all cells come from existing cells', category:'Cells' },
    { term:'Mitosis',         def:'Cell division producing 2 identical diploid daughter cells; PMAT: Prophase, Metaphase, Anaphase, Telophase', category:'Cell Division' },
    { term:'Photosynthesis',  def:'6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂; occurs in chloroplasts; light and dark reactions', category:'Energy' },
    { term:'Cellular Respiration', def:'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP; glycolysis → Krebs → electron transport chain', category:'Energy' },
    { term:'DNA Structure',   def:'Double helix; A pairs with T, G pairs with C; sugar-phosphate backbone; antiparallel strands', category:'Genetics' },
    { term:'Natural Selection', def:'Individuals with traits suited to environment survive and reproduce more; drives evolution over generations', category:'Evolution' },
    { term:'Ecosystem',       def:'Biotic (living) + abiotic (non-living) components; producers → consumers → decomposers', category:'Ecology' },
    { term:'Homeostasis',     def:'Maintaining stable internal conditions (temp, pH, glucose); controlled by feedback loops', category:'Physiology' },
    { term:'Protein Synthesis', def:'Transcription (DNA→mRNA in nucleus) + Translation (mRNA→protein at ribosomes)', category:'Genetics' },
    { term:'Classification',  def:'Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species (DKPCOFGS)', category:'Taxonomy' },
    { term:'Osmosis',         def:'Water moves across semi-permeable membrane from low to high solute concentration', category:'Cells' },
    { term:'Immune System',   def:'Innate (non-specific, fast) vs Adaptive (specific, memory B/T cells); antigens trigger antibody production', category:'Physiology' },
  ],
  'chemistry': [
    { term:'Periodic Table',  def:'Elements arranged by atomic number; periods = rows (energy levels); groups = columns (same valence electrons)', category:'Fundamentals' },
    { term:'Atomic Structure', def:'Protons+neutrons in nucleus; electrons in shells; atomic number = protons; mass number = protons+neutrons', category:'Fundamentals' },
    { term:'Covalent Bond',   def:'Atoms share electrons; nonmetals + nonmetals; polar if electrons shared unequally (e.g. H₂O)', category:'Bonding' },
    { term:'Ionic Bond',      def:'Electron transfer from metal to nonmetal; opposite charges attract; forms crystalline solids (NaCl)', category:'Bonding' },
    { term:'Molarity',        def:'M = moles of solute / liters of solution; 2 mol NaCl in 1 L = 2 M solution', category:'Solutions' },
    { term:'pH Scale',        def:'0–14; pH = −log[H⁺]; <7 = acid; 7 = neutral; >7 = base; each unit = 10× concentration change', category:'Acids & Bases' },
    { term:'Balancing Equations', def:'Same number of each atom on both sides; coefficient multiplies entire formula; law of conservation of mass', category:'Reactions' },
    { term:'Ideal Gas Law',   def:'PV = nRT; P=pressure, V=volume, n=moles, R=8.314 J/(mol·K), T=Kelvin temperature', category:'Gas Laws' },
    { term:'Oxidation Numbers', def:'OIL RIG: Oxidation Is Loss; Reduction Is Gain of electrons; oxidizing agent gets reduced', category:'Redox' },
    { term:'Enthalpy',        def:'ΔH = heat change; negative ΔH = exothermic (releases heat); positive ΔH = endothermic (absorbs heat)', category:'Thermochemistry' },
    { term:'Intermolecular Forces', def:'Hydrogen bonds (strongest) > dipole-dipole > London dispersion; determine boiling point and solubility', category:'Bonding' },
    { term:'Electronegativity', def:'Fluorine highest (4.0); increases up/right on periodic table; difference >1.7 = ionic bond', category:'Bonding' },
  ],
  'physics': [
    { term:"Newton's 1st Law",  def:'An object at rest stays at rest; in motion stays in motion — unless acted upon by a net force (inertia)', category:'Motion' },
    { term:"Newton's 2nd Law",  def:'F = ma; force equals mass times acceleration; units: Newtons (kg·m/s²)', category:'Motion' },
    { term:"Newton's 3rd Law",  def:'Every action has an equal and opposite reaction; forces come in pairs', category:'Motion' },
    { term:'Kinematic Equations', def:'v=v₀+at; x=v₀t+½at²; v²=v₀²+2ax; for constant acceleration in one direction', category:'Motion' },
    { term:'Conservation of Energy', def:'Energy cannot be created or destroyed; KE + PE = constant; KE=½mv², PE=mgh', category:'Energy' },
    { term:'Momentum',           def:'p = mv; Conservation: total momentum before = after collision; impulse = FΔt = Δp', category:'Momentum' },
    { term:'Work',               def:'W = Fd·cosθ; only force component in direction of motion does work; units: Joules', category:'Energy' },
    { term:'Ohm\'s Law',         def:'V = IR; voltage = current × resistance; P = IV = I²R = V²/R', category:'Electricity' },
    { term:'Wave Properties',    def:'v = fλ; speed = frequency × wavelength; amplitude = height; transverse vs longitudinal', category:'Waves' },
    { term:'Gravity',            def:'F = Gm₁m₂/r²; g = 9.8 m/s² at Earth\'s surface; weight W = mg', category:'Forces' },
    { term:'Projectile Motion',  def:'Horizontal: constant velocity; Vertical: free fall (a=−9.8 m/s²); independent components', category:'Motion' },
    { term:'Centripetal Acceleration', def:'a = v²/r; directed toward center of circle; F = mv²/r', category:'Circular Motion' },
  ],
  'us-history': [
    { term:'Declaration of Independence', def:'1776; written by Jefferson; declares natural rights (life, liberty, pursuit of happiness) and colonial independence from Britain', category:'Founding' },
    { term:'Constitutional Convention', def:'1787 Philadelphia; drafted U.S. Constitution; Great Compromise: bicameral Congress (Senate + House)', category:'Founding' },
    { term:'Bill of Rights',     def:'First 10 Amendments (1791); freedoms of speech, religion, press, assembly; protects individual rights from government', category:'Founding' },
    { term:'Manifest Destiny',   def:'19th century belief that U.S. was destined to expand westward; led to westward expansion and Native displacement', category:'Expansion' },
    { term:'Civil War',          def:'1861–1865; North (Union) vs South (Confederacy) over slavery and states\' rights; Union victory; slavery abolished', category:'Civil War' },
    { term:'Emancipation Proclamation', def:'1863 by Lincoln; freed enslaved people in Confederate states; war aim shifted to include abolition', category:'Civil War' },
    { term:'Reconstruction',     def:'1865–1877; rebuilding South after Civil War; 13th, 14th, 15th Amendments; ended with Compromise of 1877', category:'Post-Civil War' },
    { term:'Progressive Era',    def:'1890s–1920s; reforms addressing corruption, workers\' rights, women\'s suffrage, trust-busting, food safety', category:'Reform' },
    { term:'Great Depression',   def:'1929–1939; stock market crash; 25% unemployment; FDR\'s New Deal programs created relief and reform', category:'20th Century' },
    { term:'Cold War',           def:'1947–1991; ideological conflict: U.S. (democracy/capitalism) vs USSR (communism); arms race, space race, proxy wars', category:'20th Century' },
    { term:'Civil Rights Movement', def:'1950s–1960s; MLK Jr., Rosa Parks, SNCC, NAACP; Civil Rights Act 1964, Voting Rights Act 1965', category:'Civil Rights' },
    { term:'Vietnam War',        def:'1955–1975; U.S. involvement 1965–1973; cold war proxy conflict; 58,000 U.S. deaths; massive anti-war protests', category:'20th Century' },
  ],
  'anatomy': [
    { term:'Cardiac Cycle',      def:'Systole (ventricle contracts → pumps blood) + Diastole (heart relaxes → fills with blood); normal HR 60–100 bpm', category:'Cardiovascular' },
    { term:'Respiratory System', def:'Nose/mouth → pharynx → larynx → trachea → bronchi → bronchioles → alveoli; gas exchange occurs in alveoli', category:'Respiratory' },
    { term:'Nervous System',     def:'CNS (brain + spinal cord) + PNS; somatic (voluntary) vs autonomic (involuntary: sympathetic/parasympathetic)', category:'Neurology' },
    { term:'Digestive Process',  def:'Mouth → esophagus → stomach → small intestine (absorption) → large intestine → rectum; liver/pancreas are accessory organs', category:'Digestive' },
    { term:'Skeletal System',    def:'206 bones in adults; axial (skull/spine/ribs) + appendicular (limbs/girdles); functions: support, protection, movement, blood production', category:'Skeletal' },
    { term:'Muscular Contraction', def:'Sliding filament theory: actin + myosin; needs Ca²⁺ and ATP; neuromuscular junction uses acetylcholine', category:'Muscular' },
    { term:'Endocrine System',   def:'Hormone-secreting glands: hypothalamus, pituitary (master), thyroid, adrenal, pancreas (insulin/glucagon)', category:'Endocrine' },
    { term:'Lymphatic System',   def:'Collects tissue fluid, returns to blood; lymph nodes filter pathogens; spleen = largest lymph organ', category:'Immune' },
    { term:'Urinary System',     def:'Kidneys filter blood → urine → ureters → bladder → urethra; nephron = functional unit; regulates fluid/electrolyte balance', category:'Urinary' },
    { term:'Reproductive System',def:'Male: testes produce sperm + testosterone; Female: ovaries produce eggs + estrogen/progesterone; fertilization in fallopian tube', category:'Reproductive' },
    { term:'Integumentary System',def:'Skin (epidermis + dermis + hypodermis) + hair + nails; largest organ; protection, thermoregulation, sensation, vitamin D synthesis', category:'Integumentary' },
    { term:'Blood Components',   def:'Plasma (55%): water + proteins; RBCs (O₂ transport, no nucleus); WBCs (immune); Platelets (clotting)', category:'Cardiovascular' },
  ],
  'pharmacology': [
    { term:'Drug Absorption',    def:'Entry into bloodstream; affected by route (IV=100%, oral varies), first-pass metabolism, food, pH', category:'Pharmacokinetics' },
    { term:'First-Pass Effect',  def:'Oral drugs metabolized by liver before reaching systemic circulation; reduces bioavailability (e.g. morphine, nitroglycerin)', category:'Pharmacokinetics' },
    { term:'Half-Life',          def:'Time for drug concentration to decrease by 50%; ~4–5 half-lives to reach steady state or full elimination', category:'Pharmacokinetics' },
    { term:'Agonist vs Antagonist', def:'Agonist = activates receptor (mimics natural ligand); Antagonist = blocks receptor (e.g. naloxone blocks opioids)', category:'Pharmacodynamics' },
    { term:'Beta Blockers',      def:'Block β-adrenergic receptors; ↓HR/BP/contractility; used: HTN, angina, arrhythmia, post-MI; SE: bradycardia, bronchospasm', category:'Cardiovascular' },
    { term:'ACE Inhibitors',     def:'Block angiotensin-converting enzyme; ↓BP; used: HTN, HF, CKD protection; SE: dry cough (bradykinin), angioedema', category:'Cardiovascular' },
    { term:'Statins (HMG-CoA)', def:'Block cholesterol synthesis in liver; lower LDL; used: hyperlipidemia, CV prevention; SE: myopathy, ↑liver enzymes', category:'Cardiovascular' },
    { term:'Benzodiazepines',    def:'Enhance GABA; anxiolytic, sedative, anticonvulsant; risk: dependence, respiratory depression; reversed by flumazenil', category:'CNS' },
    { term:'SSRIs',              def:'Selective Serotonin Reuptake Inhibitors; 1st-line antidepressants; SE: GI upset, sexual dysfunction, serotonin syndrome at toxic levels', category:'CNS' },
    { term:'NSAIDs',             def:'Block COX-1/COX-2; anti-inflammatory, analgesic, antipyretic; SE: GI bleeding, renal impairment, cardiovascular risk', category:'Pain' },
    { term:'Antibiotic Classes', def:'Penicillins (cell wall); Aminoglycosides (protein synthesis 30S); Fluoroquinolones (DNA gyrase); Macrolides (50S ribosome)', category:'Anti-infectives' },
    { term:'Insulin Types',      def:'Rapid (Lispro/Aspart, 15 min); Short (Regular, 30 min); Intermediate (NPH, 2h); Long (Glargine, no peak, 24h)', category:'Endocrine' },
  ],
  'discrete-math': [
    { term:'Set Theory',         def:'Sets: collection of distinct elements; A∪B (union), A∩B (intersection), A\' (complement), A⊆B (subset)', category:'Sets' },
    { term:'Propositional Logic', def:'Logical connectives: ∧ (AND), ∨ (OR), ¬ (NOT), → (implies), ↔ (biconditional); truth tables determine validity', category:'Logic' },
    { term:'Proof by Induction', def:'Base case (n=1) + Inductive step (assume n=k, prove n=k+1); proves statements for all natural numbers', category:'Proofs' },
    { term:'Graph Theory',       def:'G=(V,E); vertices + edges; degree = edges per vertex; directed (digraph) vs undirected; trees are acyclic connected graphs', category:'Graphs' },
    { term:'Big O Notation',     def:'O(1)<O(log n)<O(n)<O(n log n)<O(n²)<O(2ⁿ)<O(n!); describes algorithm time/space complexity as input grows', category:'Algorithms' },
    { term:'Modular Arithmetic', def:'a ≡ b (mod n) means n divides (a−b); "clock arithmetic"; used in cryptography, hashing', category:'Number Theory' },
    { term:'Permutations',       def:'P(n,r) = n!/(n−r)!; ordered arrangements of r items from n; order matters', category:'Combinatorics' },
    { term:'Combinations',       def:'C(n,r) = n!/[r!(n−r)!]; unordered selections; order doesn\'t matter; Pascal\'s triangle', category:'Combinatorics' },
    { term:'Euler\'s Formula',   def:'For connected planar graphs: V − E + F = 2 (V=vertices, E=edges, F=faces including outer)', category:'Graphs' },
    { term:'Binary & Hex',       def:'Binary: base 2 (0,1); Hex: base 16 (0–9, A–F); 1010₂ = A₁₆ = 10₁₀; used in computer science', category:'Number Theory' },
    { term:'DFA vs NFA',         def:'Deterministic Finite Automaton: one transition per input; NFA: multiple; both recognize same regular languages', category:'Automata' },
    { term:'Inclusion-Exclusion', def:'|A∪B| = |A|+|B|−|A∩B|; for three sets: +|A|+|B|+|C|−|A∩B|−|A∩C|−|B∩C|+|A∩B∩C|', category:'Combinatorics' },
  ],
  'midwifery': [
    { term:'Naegele\'s Rule',    def:'EDD = LMP + 9 months + 7 days; assumes 28-day cycle; adjust for cycle length variations', category:'Antepartum' },
    { term:'Stages of Labor',   def:'1st: dilation (latent 0–6cm, active 6–10cm); 2nd: pushing/birth; 3rd: placenta delivery; 4th: recovery (1–2hr)', category:'Labor' },
    { term:'Leopold\'s Maneuvers', def:'4 abdominal palpation steps to determine fetal position, presentation, and engagement', category:'Assessment' },
    { term:'Fetal Heart Rate',  def:'Normal FHR 110–160 bpm; accelerations = reassuring; late decelerations = concerning (uteroplacental insufficiency)', category:'Monitoring' },
    { term:'Bishop Score',      def:'Cervical readiness: dilation, effacement, station, consistency, position; >8 = favorable for induction', category:'Labor' },
    { term:'Postpartum Hemorrhage', def:'>500 mL blood loss (vaginal) or >1000 mL (C-section); causes: uterine atony, lacerations, retained placenta, coagulopathy', category:'Complications' },
    { term:'Preeclampsia',      def:'BP ≥140/90 after 20 weeks + proteinuria; risk: severe features (BP≥160/110, HELLP); tx: MgSO₄, delivery', category:'Complications' },
    { term:'APGAR Score',       def:'At 1 and 5 min: Activity, Pulse, Grimace, Appearance, Respiration; 0–10; ≥7 normal; <4 needs resuscitation', category:'Neonatal' },
    { term:'Shoulder Dystocia', def:'Anterior shoulder stuck behind pubic symphysis after head delivery; McRoberts maneuver first-line response', category:'Complications' },
    { term:'Breastfeeding Support', def:'Latch: deep, wide mouth, lips flanged; supply established 6–8 feeds/day; colostrum first 3–4 days then mature milk', category:'Postpartum' },
    { term:'Newborn Assessment', def:'APGAR, weight, length, head circumference, reflexes (Moro, rooting, sucking, Babinski), skin, fontanelles', category:'Neonatal' },
    { term:'GBS Screening',     def:'Group B Strep swab at 35–37 weeks; if positive → IV penicillin during labor to prevent neonatal infection', category:'Antepartum' },
  ],
  'spanish': [
    { term:'ser vs estar',      def:'ser = permanent (identity, origin, profession); estar = temporary (emotion, location, condition); both mean "to be"', category:'Verbs' },
    { term:'Preterite vs Imperfect', def:'Preterite: completed action (-é/-aste/-ó/-amos/-aron); Imperfect: ongoing past habit/description (-aba/-ía)', category:'Past Tense' },
    { term:'Subjunctive Mood',  def:'Expresses doubt, emotion, wishes, impersonal expressions (es importante que…); present: -e/-a endings for irregular stems', category:'Mood' },
    { term:'Direct Object Pronouns', def:'me, te, lo/la, nos, os, los/las; replace the direct object; placed before conjugated verb or attached to infinitive', category:'Pronouns' },
    { term:'Reflexive Verbs',   def:'Action done to oneself: me llamo (I call myself); reflexive pronouns: me, te, se, nos, os, se', category:'Pronouns' },
    { term:'Numbers 1–20',      def:'uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez, once, doce, trece, catorce, quince, dieciséis–veinte', category:'Numbers' },
    { term:'Days of the Week',  def:'lunes, martes, miércoles, jueves, viernes, sábado, domingo; lowercase in Spanish; la semana = the week', category:'Vocabulary' },
    { term:'Colors',            def:'rojo (red), azul (blue), verde (green), amarillo (yellow), negro (black), blanco (white), naranja (orange)', category:'Vocabulary' },
    { term:'Family Vocabulary', def:'madre/mamá, padre/papá, hermano/a, abuelo/a, tío/a, primo/a, esposo/a, hijo/a', category:'Vocabulary' },
    { term:'Common Irregular Verbs', def:'ir (voy/vas/va), tener (tengo/tienes), hacer (hago/haces), decir (digo/dices), poder (puedo/puedes)', category:'Verbs' },
    { term:'Por vs Para',       def:'por = cause/exchange/duration/agent; para = purpose/destination/recipient/deadline; both translate to "for"', category:'Prepositions' },
    { term:'Gustar conjugation', def:'me/te/le/nos/les + gusta (singular) / gustan (plural); subject comes after verb: Me gustan los tacos', category:'Verbs' },
  ],
  'psychology': [
    { term:'Classical Conditioning', def:'Pavlov: neutral stimulus paired with UCS → becomes CS that elicits CR; extinction without UCS; spontaneous recovery', category:'Behavioral' },
    { term:'Operant Conditioning', def:'Skinner: behavior shaped by consequences; positive reinforcement, negative reinforcement, punishment, extinction', category:'Behavioral' },
    { term:'Maslow\'s Hierarchy', def:'Physiological → Safety → Love/Belonging → Esteem → Self-actualization; lower needs must be met first', category:'Motivation' },
    { term:'Defense Mechanisms', def:'Freud: unconscious strategies to reduce anxiety; repression, denial, projection, rationalization, displacement, sublimation', category:'Psychoanalytic' },
    { term:'Piaget\'s Stages',  def:'Sensorimotor (0–2), Preoperational (2–7), Concrete Operations (7–11), Formal Operations (12+)', category:'Development' },
    { term:'Erikson\'s Stages', def:'8 psychosocial stages; each has a conflict; e.g. Trust vs Mistrust (infant); Identity vs Role Confusion (adolescent)', category:'Development' },
    { term:'Cognitive Biases',  def:'Confirmation bias (seek info that confirms), availability heuristic (recent=common), anchoring, fundamental attribution error', category:'Cognition' },
    { term:'Memory Types',      def:'Sensory (< 1 sec), Working/Short-term (7±2 items, <30 sec), Long-term (procedural, declarative, episodic, semantic)', category:'Cognition' },
    { term:'Observational Learning', def:'Bandura\'s social learning; learn by watching others (model); influenced by attention, retention, reproduction, motivation', category:'Behavioral' },
    { term:'Nature vs Nurture', def:'Genetics (nature) vs environment (nurture) debate; modern view: epigenetics shows interaction; both shape behavior', category:'Development' },
    { term:'Psychological Disorders', def:'DSM-5 categories: mood (depression, bipolar), anxiety, psychotic (schizophrenia), personality, neurodevelopmental (ADHD, autism)', category:'Abnormal' },
    { term:'Neurotransmitters', def:'Dopamine (reward/movement), Serotonin (mood/sleep), GABA (inhibitory), Glutamate (excitatory), Norepinephrine (arousal/attention)', category:'Biological' },
  ],
  'economics': [
    { term:'Supply & Demand',    def:'Price rises when demand↑ or supply↓; price falls when demand↓ or supply↑; equilibrium where curves intersect', category:'Microeconomics' },
    { term:'Elasticity',         def:'Price elasticity of demand = %ΔQd / %ΔP; >1 elastic (luxuries), <1 inelastic (necessities like insulin)', category:'Microeconomics' },
    { term:'GDP',                def:'Gross Domestic Product = C + I + G + (X−M); total value of goods/services produced in a country in a year', category:'Macroeconomics' },
    { term:'Inflation vs Deflation', def:'Inflation: ↑prices, ↓purchasing power; Deflation: ↓prices (can cause spending delays, recession); measured by CPI', category:'Macroeconomics' },
    { term:'Monetary Policy',    def:'Central bank (Federal Reserve) controls money supply + interest rates; expansionary (↓rates) or contractionary (↑rates)', category:'Policy' },
    { term:'Fiscal Policy',      def:'Government spending and tax policy; expansionary (↑spending/↓taxes) during recession; contractionary during inflation', category:'Policy' },
    { term:'Opportunity Cost',   def:'Value of the next best alternative given up; "there\'s no such thing as a free lunch" — every choice has a cost', category:'Concepts' },
    { term:'Comparative Advantage', def:'Produce what you have lower opportunity cost for; basis for international trade and specialization', category:'Trade' },
    { term:'Market Structures',  def:'Perfect competition (price-takers), Monopoly (single seller), Oligopoly (few firms), Monopolistic competition (differentiated products)', category:'Microeconomics' },
    { term:'Phillips Curve',     def:'Inverse short-run relationship between unemployment and inflation; stagflation broke this in 1970s', category:'Macroeconomics' },
    { term:'Externalities',      def:'Costs/benefits not reflected in price; negative (pollution), positive (education); corrected by taxes/subsidies (Pigouvian)', category:'Market Failure' },
    { term:'Business Cycle',     def:'Expansion → Peak → Recession (2+ quarters negative GDP growth) → Trough → Recovery; measured by GDP, employment, output', category:'Macroeconomics' },
  ],
  'sight-words-4': [
    { term:'accomplish',     def:"To successfully complete a task or achieve a goal through effort", category:'4th Grade' },
    { term:'determined',     def:"Having a strong will to achieve something despite obstacles; resolute", category:'4th Grade' },
    { term:'sufficient',     def:"Enough to meet a need or requirement; adequate for the purpose", category:'4th Grade' },
    { term:'conclude',       def:"To reach a decision or opinion after reasoning through evidence", category:'4th Grade' },
    { term:'evidence',       def:"Facts, data, or examples that support a claim or argument", category:'4th Grade' },
    { term:'summarize',      def:"To state the main points of something in a brief, clear way", category:'4th Grade' },
    { term:'consequence',    def:"A result or effect that follows from an action or event", category:'4th Grade' },
    { term:'perspective',    def:"A particular way of thinking about or viewing something", category:'4th Grade' },
    { term:'significant',    def:"Important, meaningful, or having a major effect on something", category:'4th Grade' },
    { term:'contribute',     def:"To give or add something to help a group effort or cause", category:'4th Grade' },
    { term:'establish',      def:"To set up, create, or prove something firmly and permanently", category:'4th Grade' },
    { term:'illustrate',     def:"To explain or show something using examples, pictures, or diagrams", category:'4th Grade' },
    { term:'evaluate',       def:"To judge the quality, importance, or value of something carefully", category:'4th Grade' },
    { term:'infer',          def:"To reach a conclusion based on evidence and reasoning, not stated directly", category:'4th Grade' },
    { term:'appropriate',    def:"Correct or suitable for a particular situation or purpose", category:'4th Grade' },
  ],
  'sight-words-5': [
    { term:'analyze',        def:"To study something carefully to understand its parts and how they relate", category:'5th Grade' },
    { term:'narrative',      def:"A story or account of connected events told in sequence", category:'5th Grade' },
    { term:'hypothesis',     def:"A testable prediction made before conducting an experiment", category:'5th Grade' },
    { term:'controversy',    def:"A disagreement or debate where people hold strong opposing opinions", category:'5th Grade' },
    { term:'fundamental',    def:"Forming the base or foundation; absolutely essential to something", category:'5th Grade' },
    { term:'procedure',      def:"A set of steps followed in a regular, orderly way to accomplish something", category:'5th Grade' },
    { term:'characteristic', def:"A quality or feature that makes something or someone distinct or recognizable", category:'5th Grade' },
    { term:'comparison',     def:"Examining two or more things to find similarities and differences", category:'5th Grade' },
    { term:'democracy',      def:"A system of government where citizens vote to elect leaders and make decisions", category:'5th Grade' },
    { term:'reliable',       def:"Consistently good in quality or performance; able to be trusted", category:'5th Grade' },
    { term:'elaborate',      def:"To add more detail or explanation to make something clearer or more complete", category:'5th Grade' },
    { term:'justification',  def:"Good reasons or evidence that explain why a decision or action is correct", category:'5th Grade' },
    { term:'synthesis',      def:"Combining parts or ideas from different sources to create something new", category:'5th Grade' },
    { term:'transition',     def:"A change from one state, place, or situation to another", category:'5th Grade' },
    { term:'stereotype',     def:"An oversimplified, fixed idea about a group of people that ignores individuality", category:'5th Grade' },
  ],
  'sight-words-6': [
    { term:'abolish',        def:"To formally end or eliminate a law, system, or practice", category:'6th Grade' },
    { term:'catalyst',       def:"A person or event that causes important change to happen rapidly", category:'6th Grade' },
    { term:'ambiguous',      def:"Having more than one possible meaning; open to different interpretations", category:'6th Grade' },
    { term:'circulate',      def:"To move or flow continuously in a closed system; to pass around widely", category:'6th Grade' },
    { term:'deduction',      def:"Reaching a specific conclusion from a general rule or principle", category:'6th Grade' },
    { term:'empathy',        def:"The ability to understand and share the feelings of another person", category:'6th Grade' },
    { term:'generate',       def:"To produce or create something, often energy, ideas, or revenue", category:'6th Grade' },
    { term:'jurisdiction',   def:"Official authority or legal power to make decisions in a given area", category:'6th Grade' },
    { term:'meticulous',     def:"Showing great attention to detail; very careful and precise", category:'6th Grade' },
    { term:'propaganda',     def:"Biased or misleading information used to promote a particular cause", category:'6th Grade' },
    { term:'resilient',      def:"Able to recover quickly from difficulties or challenges", category:'6th Grade' },
    { term:'sovereignty',    def:"Supreme power or authority; the right of a state to govern itself", category:'6th Grade' },
    { term:'sustainable',    def:"Able to be maintained over time without depleting resources", category:'6th Grade' },
    { term:'variation',      def:"A difference or slight change from the original or standard form", category:'6th Grade' },
    { term:'credible',       def:"Able to be believed; convincing and trustworthy as a source", category:'6th Grade' },
  ],
  'sight-words-7': [
    { term:'allegory',       def:"A story where characters and events represent hidden moral or political meaning", category:'7th Grade' },
    { term:'connotation',    def:"An idea or feeling a word suggests beyond its literal dictionary meaning", category:'7th Grade' },
    { term:'dystopia',       def:"An imagined society where conditions are extremely bad due to oppression or fear", category:'7th Grade' },
    { term:'exposition',     def:"Background information at the start of a story setting up characters and setting", category:'7th Grade' },
    { term:'foreshadowing',  def:"A clue or hint early in a story about what will happen later", category:'7th Grade' },
    { term:'irony',          def:"When the opposite of what is expected happens, or words mean the opposite of what is said", category:'7th Grade' },
    { term:'metaphor',       def:"A direct comparison between two unlike things without using like or as", category:'7th Grade' },
    { term:'protagonist',    def:"The main character in a story who drives the plot forward", category:'7th Grade' },
    { term:'antagonist',     def:"The character or force that opposes the protagonist and creates conflict", category:'7th Grade' },
    { term:'satire',         def:"Using humor, irony, or exaggeration to criticize or mock society", category:'7th Grade' },
    { term:'inference',      def:"A conclusion drawn from evidence and reasoning rather than stated directly", category:'7th Grade' },
    { term:'rhetoric',       def:"The art of persuasion through effective writing or speaking", category:'7th Grade' },
    { term:'bias',           def:"A tendency to favor one view over another unfairly; prejudice in thinking", category:'7th Grade' },
    { term:'symbolism',      def:"Using objects, people, or events to represent abstract ideas or concepts", category:'7th Grade' },
    { term:'theme',          def:"The central message or life lesson the author wants readers to understand", category:'7th Grade' },
  ],
  'sight-words-8': [
    { term:'allusion',       def:"An indirect reference to a well-known person, event, or work of literature", category:'8th Grade' },
    { term:'diction',        def:"Word choice; a writer picks specific words to create tone and meaning", category:'8th Grade' },
    { term:'juxtaposition',  def:"Placing two contrasting ideas or things side by side for effect", category:'8th Grade' },
    { term:'paradox',        def:"A statement that seems contradictory but reveals a deeper truth", category:'8th Grade' },
    { term:'syntax',         def:"The arrangement of words and phrases to create well-formed sentences", category:'8th Grade' },
    { term:'verisimilitude', def:"The appearance of being true or real; believability in fiction", category:'8th Grade' },
    { term:'motif',          def:"A recurring element in a work that has symbolic significance", category:'8th Grade' },
    { term:'polemic',        def:"A strong verbal or written attack on someone or something", category:'8th Grade' },
    { term:'subtext',        def:"The underlying meaning or message beneath what is literally said", category:'8th Grade' },
    { term:'didactic',       def:"Intended to teach a moral lesson; instructional in purpose", category:'8th Grade' },
    { term:'archetype',      def:"A universal character type or pattern found across many stories and cultures", category:'8th Grade' },
    { term:'ambivalence',    def:"Having mixed or contradictory feelings about something at the same time", category:'8th Grade' },
    { term:'fallacy',        def:"An error in reasoning that makes an argument invalid or misleading", category:'8th Grade' },
    { term:'episodic',       def:"Made up of a series of loosely connected incidents rather than a unified plot", category:'8th Grade' },
    { term:'catharsis',      def:"Emotional release experienced by an audience through watching tragedy", category:'8th Grade' },
  ],
  'addition': [
    { term:'Addend',         def:"Any number being added in an addition problem; e.g. in 3+5, both 3 and 5 are addends", category:'Vocabulary' },
    { term:'Sum',            def:"The answer to an addition problem; the total when addends are combined", category:'Vocabulary' },
    { term:'Commutative Property', def:"a + b = b + a; changing the order of addends does not change the sum", category:'Properties' },
    { term:'Associative Property', def:"(a + b) + c = a + (b + c); grouping addends differently does not change the sum", category:'Properties' },
    { term:'Identity Property',    def:"Any number + 0 = that number; zero is the additive identity", category:'Properties' },
    { term:'Regrouping (Carrying)', def:"When a column sum exceeds 9, carry the tens digit to the next column left", category:'Process' },
    { term:'Making 10',      def:"Mental math strategy: split an addend to make a group of 10 (8+5 = 8+2+3 = 13)", category:'Strategy' },
    { term:'Doubles',        def:"Adding a number to itself (6+6=12); memorizing doubles speeds mental math", category:'Strategy' },
    { term:'Column Addition', def:"Align digits by place value (ones, tens, hundreds); add each column right to left", category:'Process' },
    { term:'Estimation',     def:"Rounding addends to the nearest 10 or 100 to quickly estimate a sum", category:'Strategy' },
    { term:'Clue Words',     def:"in all, total, altogether, sum, plus, combined — signal addition in word problems", category:'Word Problems' },
    { term:'Number Line Addition', def:"Start at one addend on number line, jump forward by the second addend to find sum", category:'Visual' },
  ],
  'subtraction': [
    { term:'Minuend',        def:"The number being subtracted FROM; the starting amount (e.g. in 9-4, 9 is the minuend)", category:'Vocabulary' },
    { term:'Subtrahend',     def:"The number being subtracted; taken away from the minuend", category:'Vocabulary' },
    { term:'Difference',     def:"The answer to a subtraction problem; what remains after subtracting", category:'Vocabulary' },
    { term:'Regrouping (Borrowing)', def:"Taking 1 from the next place value column to subtract when the digit is too small", category:'Process' },
    { term:'Checking Subtraction', def:"Add the difference + subtrahend; if it equals the minuend, the answer is correct", category:'Strategy' },
    { term:'Not Commutative', def:"a - b is NOT equal to b - a; order matters in subtraction (10-3 ≠ 3-10)", category:'Properties' },
    { term:'Zero Property',  def:"Any number minus 0 = that number; any number minus itself = 0", category:'Properties' },
    { term:'Inverse of Addition', def:"Subtraction undoes addition; if 5+3=8, then 8-3=5 and 8-5=3", category:'Concepts' },
    { term:'Count Up Method', def:"Start at the subtrahend and count up to the minuend; the jumps = the difference", category:'Strategy' },
    { term:'Clue Words',     def:"less, fewer, remain, left, take away, difference, change, how many more — signal subtraction", category:'Word Problems' },
    { term:'Place Value Subtraction', def:"Subtract ones from ones, tens from tens, borrowing when needed across columns", category:'Process' },
  ],
  'multiplication': [
    { term:'Factor',         def:"Numbers being multiplied together; in 4 x 6, both 4 and 6 are factors", category:'Vocabulary' },
    { term:'Product',        def:"The answer to a multiplication problem; result of multiplying factors", category:'Vocabulary' },
    { term:'Array',          def:"A grid model of multiplication; rows x columns = product (3 rows of 4 = 12)", category:'Visual' },
    { term:'Commutative Property', def:"a x b = b x a; order of factors does not change the product (4x5=5x4)", category:'Properties' },
    { term:'Associative Property', def:"(a x b) x c = a x (b x c); grouping factors differently does not change product", category:'Properties' },
    { term:'Distributive Property', def:"a(b+c) = ab + ac; multiply a by each addend separately then add (3x12 = 3x10 + 3x2)", category:'Properties' },
    { term:'Identity Property', def:"Any number x 1 = that number; 1 is the multiplicative identity", category:'Properties' },
    { term:'Zero Property',  def:"Any number x 0 = 0; multiplying by zero always gives zero", category:'Properties' },
    { term:'Skip Counting',  def:"Counting by multiples of a number (by 3s: 3,6,9,12,...) to find products", category:'Strategy' },
    { term:'Repeated Addition', def:"Multiplication as repeated addition: 4x3 = 3+3+3+3 = 12", category:'Concepts' },
    { term:'Times Tables',   def:"Memorized multiplication facts from 1x1 through 12x12; foundation for all math", category:'Skill' },
    { term:'Clue Words',     def:"times, of, product, each, per, groups of, total (with equal groups) — signal multiplication", category:'Word Problems' },
    { term:'Partial Products', def:"Break factors into expanded form; multiply each part; add results (23x4 = 20x4 + 3x4)", category:'Strategy' },
  ],
  'long-division': [
    { term:'Dividend',       def:"The number being divided; the total amount being shared equally", category:'Vocabulary' },
    { term:'Divisor',        def:"The number you divide by; how many equal groups to make", category:'Vocabulary' },
    { term:'Quotient',       def:"The answer to a division problem; how many are in each group", category:'Vocabulary' },
    { term:'Remainder',      def:"What is left over after dividing evenly; must be less than the divisor", category:'Vocabulary' },
    { term:'DMSB Algorithm', def:"Divide, Multiply, Subtract, Bring down — the 4 repeating steps of long division", category:'Process' },
    { term:'Step 1: Divide', def:"Estimate how many times the divisor goes into the current partial dividend", category:'Process' },
    { term:'Step 2: Multiply', def:"Multiply your estimate by the divisor; write the product below", category:'Process' },
    { term:'Step 3: Subtract', def:"Subtract the product from the partial dividend; write the difference", category:'Process' },
    { term:'Step 4: Bring Down', def:"Bring the next digit of the dividend down beside the remainder; repeat DMSB", category:'Process' },
    { term:'Checking Division', def:"Quotient x Divisor + Remainder = Dividend; verifies your answer is correct", category:'Strategy' },
    { term:'Partial Quotient Method', def:"Estimate chunks of the quotient and subtract repeatedly (flexible algorithm)", category:'Strategy' },
    { term:'Estimation in Division', def:"Round divisor to nearest 10 to make trial quotient guesses easier", category:'Strategy' },
  ],
  'pa-cdl': [
    { term:'CDL Class A',    def:"Required to drive combination vehicles over 26,001 lbs with towed unit over 10,000 lbs (semi-trucks)", category:'License Classes' },
    { term:'CDL Class B',    def:"Required for heavy straight vehicles over 26,001 lbs not towing over 10,000 lbs", category:'License Classes' },
    { term:'CDL Class C',    def:"Vehicles designed to transport 16+ passengers or carry hazardous materials requiring placards", category:'License Classes' },
    { term:'Pre-trip Inspection', def:"Required safety check before each trip; covers engine, brakes, lights, tires, coupling, cargo", category:'Safety' },
    { term:'Hours of Service (HOS)', def:"Federal limits: 11-hour driving limit, 14-hour on-duty window, 10-hour off-duty rest, 60/70-hour weekly cap", category:'Regulations' },
    { term:'GVWR',           def:"Gross Vehicle Weight Rating: maximum weight a vehicle is designed to safely carry including cargo", category:'Concepts' },
    { term:'Air Brake Endorsement', def:"Required knowledge (brakes, slack adjusters, compressors, drums) if vehicle has air brakes", category:'Endorsements' },
    { term:'Hazmat Endorsement', def:"Required to haul hazardous materials; needs TSA background check and knowledge test", category:'Endorsements' },
    { term:'Tanker Endorsement', def:"Required for vehicles carrying liquid loads of 1,000+ gallons in one tank", category:'Endorsements' },
    { term:'Doubles/Triples Endorsement', def:"T endorsement: required to pull double or triple trailers", category:'Endorsements' },
    { term:'CDL Disqualification', def:"DUI in any vehicle, railroad crossing violations, excessive speeding, or HOS violations can disqualify", category:'Regulations' },
    { term:'CDL Medical Card', def:"Drivers must have current DOT physical medical certificate; valid for up to 24 months", category:'Requirements' },
    { term:'Smith System',   def:"Safe driving method: Aim High, Big Picture, Keep Eyes Moving, Leave Room, Make Sure They See You", category:'Safety' },
  ],
  'pa-class-c': [
    { term:'PA Class C License', def:"Standard vehicle license; for cars, SUVs, pickups under 26,001 lbs GVWR without hazmat or 16+ passengers", category:'License' },
    { term:'Vision Requirements', def:"20/40 or better in better eye; 20/100 or better in worse eye; PennDOT may add restrictions", category:'Requirements' },
    { term:'Speed Limits',   def:"Residential: 25 mph; School zone: 15 mph; Urban: 35 mph; Interstate: 65-70 mph unless posted", category:'Rules of Road' },
    { term:'Right of Way',   def:"Yield to vehicles already in intersection; pedestrians have right of way in crosswalks", category:'Rules of Road' },
    { term:'DUI in PA',      def:"Illegal at .08% BAC; .04% for CDL drivers; .02% for under 21; tiered penalties up to 18 months in jail", category:'Legal' },
    { term:'Move Over Law',  def:"Slow down and move to next lane for stopped emergency, roadway maintenance, or recovery vehicles", category:'Legal' },
    { term:'School Bus Law', def:"Must stop when school bus red lights flash; applies to both directions on undivided roads", category:'Legal' },
    { term:'Following Distance', def:"3-second rule in good conditions; increase to 4-6 seconds in rain, snow, or heavy traffic", category:'Safety' },
    { term:'Stopping Distance', def:"At 60 mph on dry road: approx 246 feet total (reaction + braking); wet roads need more", category:'Safety' },
    { term:'Cell Phone Law', def:"Hands-free only while driving; no interactive wireless device use (texting, calling, apps)", category:'Legal' },
    { term:'Point System',   def:"Moving violations add points; 6 points = warning letter; 11+ points = 15-day suspension", category:'Legal' },
    { term:'Headlight Rules', def:"Required sunset to sunrise and when visibility is less than 1,000 feet; use low beams in fog", category:'Rules of Road' },
    { term:'Roundabout Rules', def:"Yield to vehicles already in circle; enter when safe; proceed counter-clockwise; signal to exit", category:'Rules of Road' },
  ],
  'boating-safety': [
    { term:'Life Jackets (PFDs)', def:"One Coast Guard-approved PFD required per person; children under 12 must wear at all times while underway in PA", category:'Safety Equipment' },
    { term:'PFD Types',      def:"Type I (offshore); Type II (near shore); Type III (inland/recreational); Type IV (throwable); Type V (special use)", category:'Safety Equipment' },
    { term:'Red Buoys',      def:"Nun buoys (pointed top) mark right side of channel when returning to port; keep red on right returning", category:'Navigation' },
    { term:'Green Buoys',    def:"Can buoys (flat top) mark left side of channel when returning to port; keep green on left returning", category:'Navigation' },
    { term:'Yellow Buoys',   def:"Special purpose markers: caution, restricted area, swim area boundaries, or racing course markers", category:'Navigation' },
    { term:'Right of Way Rules', def:"Vessel being overtaken has right of way; give-way vessel yields; stand-on vessel maintains course and speed", category:'Rules of Road' },
    { term:'Crossing Situations', def:"Vessel to your starboard (right) has right of way; give way by slowing or turning starboard", category:'Rules of Road' },
    { term:'Weather Safety', def:"Check NOAA forecast before departure; seek shelter if lightning; watch for dark clouds and wind shifts", category:'Weather' },
    { term:'Storm Safety',   def:"Head to shore or marina at first sign of storm; stay low; put on PFDs; never anchor in open water in storms", category:'Weather' },
    { term:'Fish Size Limits', def:"Minimum legal size protects juvenile fish; measured tip of closed mouth to tip of compressed tail fin", category:'Regulations' },
    { term:'Clinch Knot',    def:"Thread line through eye; wrap 5x around main line; pass tag end through loop above eye; pull tight", category:'Knots' },
    { term:'Palomar Knot',   def:"Strongest common fishing knot; double 6 inches of line through eye; tie loose overhand knot; pass hook through loop; wet and pull", category:'Knots' },
    { term:'Boat Launching', def:"Check trailer lights; back trailer until hull submersed; release bow strap; start motor; pull truck and trailer forward", category:'Trailering' },
    { term:'Trailer Basics', def:"Check wheel bearings, tire pressure (cold), and safety chains; use tow mirrors; do not exceed trailer tongue weight", category:'Trailering' },
    { term:'Navigation Lights', def:"Sunset to sunrise: red port (left), green starboard (right), white stern light; powerboats add white masthead light", category:'Navigation' },
  ],
  'fishing-license': [
    { term:'PA Fishing License Required', def:"All residents 16+ and non-residents fishing in PA waters need a license; must be visibly displayed", category:'Requirements' },
    { term:'Resident Annual License', def:"For PA residents; purchase at county treasurer, license dealers, or PFBC online; valid Jan 1 - Dec 31", category:'License Types' },
    { term:'Non-Resident License', def:"Required for anyone who is not a PA resident; higher fee than resident license", category:'License Types' },
    { term:'Tourist (Short-term) License', def:"3-day or 7-day license available for visitors who do not need a full annual license", category:'License Types' },
    { term:'Senior License',def:"Reduced-fee license for residents 65 and older; Lifetime license also available", category:'License Types' },
    { term:'Creel Limit',    def:"Maximum number of fish of a given species you may legally keep per day", category:'Regulations' },
    { term:'Size Limit',     def:"Minimum legal length of a fish to keep; measured tip of mouth to tip of tail (compressed)", category:'Regulations' },
    { term:'Trout Season',   def:"PA Opening Day typically first Saturday in April for most streams; special regulations vary by water", category:'Seasons' },
    { term:'Catch and Release', def:"Returning fish to water; use wet hands, barbless hooks, and quick release to maximize survival", category:'Practices' },
    { term:'Special Regulation Waters', def:"Some streams have unique rules: fly-fishing only, delayed harvest, or catch-and-release only; check PFBC regulations", category:'Regulations' },
    { term:'Invasive Species Rule', def:"Do not transport water, plants, or baitfish between water bodies; prevents spread of invasive species", category:'Conservation' },
    { term:'Report Violations', def:"Call 1-888-GAME-COM to report fishing, hunting, or boating law violations anonymously", category:'Enforcement' },
  ],
  'uas-law': [
    { term:'FAA Part 107',   def:"Federal Aviation Administration regulation governing commercial (for-hire) small UAS operations in the US", category:'Regulations' },
    { term:'Remote Pilot Certificate', def:"Required for commercial UAS operations; pass FAA aeronautical knowledge test at an approved testing center", category:'Certification' },
    { term:'Recreational Flyer Rules', def:"Hobby flyers must follow community-based safety guidelines, register if drone over 0.55 lbs, and use TRUST", category:'Regulations' },
    { term:'Maximum Altitude', def:"400 feet AGL (above ground level) by default; may fly higher within 400 feet of a structure with authorization", category:'Operational Limits' },
    { term:'Visual Line of Sight', def:"Pilot must keep drone in unaided visual sight at all times; no FPV goggles as sole means of observation", category:'Operational Limits' },
    { term:'Airspace Authorization', def:"Required before flying in controlled airspace (Classes B, C, D, E surface); use LAANC system or DroneZone", category:'Airspace' },
    { term:'Drone Registration', def:"Required for drones 0.55-55 lbs; register at FAA DroneZone ($5/3 years); mark drone with registration number", category:'Requirements' },
    { term:'Maximum Speed',  def:"100 mph (87 knots) maximum airspeed for Part 107 operations", category:'Operational Limits' },
    { term:'Night Operations', def:"Allowed with anti-collision lighting visible 3 statute miles; no waiver needed (updated rule post-2021)", category:'Operational Limits' },
    { term:'Remote ID',      def:"Required as of Sept 2023 for most drones; broadcasts GPS location and ID like a digital license plate", category:'Regulations' },
    { term:'No-Fly Zones',   def:"National parks, military bases, Washington DC airspace, and airport areas without LAANC authorization", category:'Airspace' },
    { term:'Operations Over People', def:"Categories A (under 0.55 lbs), B, C (with parachute), D (with ATC broadcast) govern flying over people", category:'Operational Limits' },
    { term:'Waivers',        def:"FAA may waive certain Part 107 rules if pilot demonstrates safety; apply at FAA DroneZone website", category:'Regulations' },
  ],
  'advanced-math': [
    { term:'Derivative',     def:"Rate of change of a function; slope of tangent line; d/dx[x^n] = nx^(n-1) (Power Rule)", category:'Calculus' },
    { term:'Integral',       def:"Accumulation of quantities; area under a curve; antiderivative of f(x); Fundamental Theorem links to derivative", category:'Calculus' },
    { term:'Limit',          def:"Value a function approaches as x approaches a given point; foundation of calculus; lim(x→a) f(x)", category:'Calculus' },
    { term:'Chain Rule',     def:"d/dx[f(g(x))] = f'(g(x)) * g'(x); used to differentiate composite functions", category:'Calculus' },
    { term:"L'Hopital's Rule", def:"Evaluate indeterminate forms (0/0, inf/inf) by taking derivatives of numerator and denominator separately", category:'Calculus' },
    { term:'Matrix Multiplication', def:"(AB)ij = sum of products of row i of A and column j of B; dimensions must be m×n times n×p", category:'Linear Algebra' },
    { term:'Eigenvalue',     def:"Scalar λ where Av = λv for non-zero vector v; reveals stretching factors of linear transformation", category:'Linear Algebra' },
    { term:'Taylor Series',  def:"Approximates any function near point a as infinite sum: Σ[f^(n)(a)/n!](x-a)^n", category:'Series' },
    { term:'Differential Equation', def:"Equation relating a function and its derivatives; models rates of change (dy/dx = ky → y = Ce^(kt))", category:'Diff EQ' },
    { term:'Fourier Transform', def:"Decomposes a function into its frequency components; used in signal processing, physics, and engineering", category:'Analysis' },
    { term:'Stokes Theorem', def:"Surface integral of curl F = line integral of F around boundary; generalizes Fundamental Theorem to 3D", category:'Vector Calc' },
    { term:'Bayes Theorem',  def:"P(A|B) = P(B|A)*P(A)/P(B); updates probability based on new evidence; fundamental to statistics and AI", category:'Statistics' },
  ],
  'ancient-math': [
    { term:'Babylonian Math', def:"Base-60 (sexagesimal) number system c. 2000 BCE; used positional notation; gave us 60-minute hours", category:'Ancient Systems' },
    { term:'Egyptian Fractions', def:"Only unit fractions (1/n) used; Rhind Papyrus (1650 BCE) contains 84 math problems and fraction tables", category:'Ancient Systems' },
    { term:"Euclid's Elements", def:"Foundational geometry text c. 300 BCE; 13 books; proved from 5 postulates including the parallel postulate", category:'Greek Math' },
    { term:'Pythagorean Theorem', def:"a² + b² = c²; known by Babylonians 1000 years before Pythagoras; cornerstone of geometry", category:'Greek Math' },
    { term:'Archimedes',     def:"Estimated pi between 3.1408 and 3.1429; developed method of exhaustion, precursor to integration", category:'Greek Math' },
    { term:'Fibonacci Sequence', def:"0,1,1,2,3,5,8,13,21,...; introduced Hindu-Arabic numerals to Europe; appears throughout nature", category:'Medieval Math' },
    { term:'Zero as a Number', def:"Concept developed in India by Brahmagupta (628 CE); transformed mathematics from placeholder to number", category:'Hindu Math' },
    { term:'Golden Ratio',   def:"φ ≈ 1.618; ratio where (a+b)/a = a/b; appears in Greek art, architecture, Fibonacci, and nature", category:'Greek Math' },
    { term:'Mayan Number System', def:"Base-20 (vigesimal) system; included zero; used for astronomy and calendar; dots and bars notation", category:'Ancient Systems' },
    { term:'Thales of Miletus', def:"First to use abstract geometry without measurement; predicted solar eclipse; father of Greek mathematics", category:'Greek Math' },
    { term:'Al-Khwarizmi',   def:"Islamic mathematician (c. 820 CE); wrote Algebra (al-kitab al-mukhtasar); word algorithm from his name", category:'Islamic Math' },
    { term:'Eratosthenes',   def:"Calculated Earth circumference (c. 240 BCE) to within 2% accuracy; invented Sieve of Eratosthenes for primes", category:'Greek Math' },
  ],
  'bible-intro': [
    { term:'Old Testament',  def:"39 books (Protestant); covers creation, fall, covenant, law, prophets, and wisdom literature; written before Christ", category:'Scripture' },
    { term:'New Testament',  def:"27 books; covers life of Jesus (Gospels), early church (Acts), epistles (letters), and Revelation", category:'Scripture' },
    { term:'Pentateuch/Torah', def:"First 5 books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy; the Law of Moses; foundational to Judaism and Christianity", category:'OT Books' },
    { term:'Gospels',        def:"Matthew, Mark, Luke, John; four accounts of Jesus life, ministry, death, resurrection, and teaching", category:'NT Books' },
    { term:'Epistles',       def:"NT letters to churches and individuals; Paul wrote Romans, Corinthians, Galatians, Ephesians, Philippians, Colossians, and more", category:'NT Books' },
    { term:'Covenant',       def:"Agreement between God and people; Abrahamic, Mosaic, Davidic, and New Covenant through Christ", category:'Theology' },
    { term:'Psalms',         def:"150 poems and songs of worship, lament, praise, and wisdom; attributed largely to King David", category:'OT Books' },
    { term:'Prophecy',       def:"Isaiah, Jeremiah, Ezekiel, Daniel and 12 Minor Prophets; messages from God through chosen speakers", category:'OT Books' },
    { term:'Canon',          def:"Recognized set of inspired Scripture; Protestant = 66 books; Catholic = 73; Eastern Orthodox = more", category:'Scripture' },
    { term:'Hermeneutics',   def:"Study of principles for interpreting Scripture accurately; considers context, genre, language, and history", category:'Methods' },
    { term:'Inerrancy',      def:"Belief that the Bible in its original manuscripts is without error in all it affirms", category:'Doctrine' },
    { term:'Inspiration',    def:"The Holy Spirit guided human authors to write exactly what God intended (2 Tim 3:16)", category:'Doctrine' },
    { term:'Exegesis',       def:"Drawing meaning OUT of the text through careful study; opposite of eisegesis (reading into it)", category:'Methods' },
  ],
  'world-religions': [
    { term:'Christianity',   def:"Belief in Jesus Christ as Lord and Savior; Holy Trinity; Bible as Scripture; salvation by grace through faith", category:'Major Religions' },
    { term:'Islam',          def:"Submission to Allah; 5 Pillars (Shahada, Salat, Zakat, Sawm, Hajj); Quran as holy text; founded through Muhammad", category:'Major Religions' },
    { term:'Judaism',        def:"Covenant people of God; Torah as law; awaiting Messiah; Talmud interprets Scripture; monotheistic", category:'Major Religions' },
    { term:'Hinduism',       def:"Oldest major religion; Brahman as ultimate reality; karma, dharma, moksha; Vedas and Upanishads as scripture", category:'Major Religions' },
    { term:'Buddhism',       def:"Founded by Siddhartha Gautama; 4 Noble Truths; Eightfold Path; goal is Nirvana (freedom from suffering)", category:'Major Religions' },
    { term:'Sikhism',        def:"Founded by Guru Nanak (1469 CE); monotheistic; Guru Granth Sahib is scripture; service and equality emphasized", category:'Major Religions' },
    { term:'Taoism',         def:"Founded by Laozi; Tao = The Way; wu wei (non-action); harmony with nature; Tao Te Ching as text", category:'Major Religions' },
    { term:'Confucianism',   def:"Based on Confucius teachings; emphasizes filial piety, relationships, ethics, and social harmony", category:'Major Religions' },
    { term:'Animism',        def:"Belief that natural objects, places, and creatures possess spiritual essence; found in many indigenous religions", category:'Worldviews' },
    { term:'Secular Humanism', def:"Non-religious worldview centered on human reason, ethics, and fulfillment without reference to God", category:'Worldviews' },
    { term:'5 Pillars of Islam', def:"Shahada (declaration), Salat (prayer 5x daily), Zakat (charity), Sawm (Ramadan fasting), Hajj (pilgrimage)", category:'Islam' },
    { term:'Sacred Texts',   def:"Bible (Christianity), Quran (Islam), Torah/Talmud (Judaism), Vedas (Hinduism), Tripitaka (Buddhism)", category:'Comparison' },
  ],
  'philosophy': [
    { term:'Epistemology',   def:"Branch of philosophy studying knowledge: what can we know, how do we know it, and what is justified belief", category:'Branches' },
    { term:'Metaphysics/Ontology', def:"Study of being and existence: what is real, what exists, and the nature of reality", category:'Branches' },
    { term:'Ethics',         def:"Branch studying morality: right and wrong actions, good character, and how one ought to live", category:'Branches' },
    { term:'Logic',          def:"Study of valid reasoning; distinguishes valid from invalid arguments; formal and informal logic", category:'Branches' },
    { term:'Socratic Method', def:"Asking probing questions to expose contradictions and lead toward truth through dialogue", category:'Methods' },
    { term:"Plato's Forms",  def:"True reality consists of perfect abstract forms; the physical world is imperfect shadow copies", category:'Ancient' },
    { term:"Aristotle's Logic", def:"Syllogism: All men are mortal; Socrates is a man; therefore Socrates is mortal — valid deductive argument", category:'Ancient' },
    { term:"Descartes",      def:"Cogito ergo sum — I think therefore I am; used methodological doubt to find certain knowledge", category:'Modern' },
    { term:"Kant's Categorical Imperative", def:"Act only according to a maxim you could will to become a universal law for everyone", category:'Modern' },
    { term:'Utilitarianism', def:"Greatest good for greatest number; judge actions by outcomes (Bentham, Mill)", category:'Modern' },
    { term:'Existentialism', def:"Humans must create their own meaning; freedom and responsibility are central (Sartre, Kierkegaard, Camus)", category:'Contemporary' },
    { term:'Empiricism',     def:"Knowledge comes primarily from sensory experience; Locke, Hume, Berkeley (vs. Rationalism)", category:'Epistemology' },
    { term:'Rationalism',    def:"Knowledge derived from reason and innate ideas, not just experience; Descartes, Spinoza, Leibniz", category:'Epistemology' },
  ],
  'public-speaking': [
    { term:'Ethos',          def:"Credibility and trustworthiness of the speaker; the audience must believe in your character and expertise", category:'Aristotle' },
    { term:'Pathos',         def:"Emotional appeal; connecting with the feelings and values of the audience to motivate response", category:'Aristotle' },
    { term:'Logos',          def:"Logical appeal; using evidence, data, examples, and reasoning to persuade rationally", category:'Aristotle' },
    { term:'Thesis Statement', def:"One clear, focused sentence stating the main point or argument of your speech", category:'Structure' },
    { term:'Hook',           def:"Attention-grabbing opening device: shocking statistic, story, rhetorical question, or bold claim", category:'Structure' },
    { term:'Vocal Variety',  def:"Using changes in pitch, pace (rate), volume, and tone to keep audience engaged and emphasize key points", category:'Delivery' },
    { term:'Eye Contact',    def:"Looking at individual audience members to build connection, show confidence, and gauge understanding", category:'Delivery' },
    { term:'Transitions',    def:"Words and phrases that connect ideas and guide the audience (furthermore, however, in contrast, finally)", category:'Structure' },
    { term:'Active Listening', def:"Fully concentrating on the speaker, processing the message, and responding thoughtfully and respectfully", category:'Listening' },
    { term:'Q&A Management', def:"Anticipate questions; answer concisely and honestly; say you will follow up if you do not know", category:'Delivery' },
    { term:'Impromptu Speaking', def:"Speaking with little or no preparation; use PREP (Point, Reason, Example, Point) to organize quickly", category:'Types' },
    { term:'Monroe Motivated Sequence', def:"Attention, Need, Satisfaction, Visualization, Action — persuasive speech structure that drives audiences to act", category:'Structure' },
  ],
  'history': [
    { term:'Primary Source',  def:"First-hand account or original document from the time period: diaries, speeches, photos, artifacts", category:'Methods' },
    { term:'Secondary Source', def:"Analysis or interpretation of primary sources written after the event by historians or scholars", category:'Methods' },
    { term:'Causation',       def:"The relationship between events where one event influences or brings about another", category:'Methods' },
    { term:'Continuity and Change', def:"How societies maintain traditions while also transforming over time; core historical thinking concept", category:'Methods' },
    { term:'French Revolution', def:"1789-1799; overthrew French monarchy; ideals of Liberty, Equality, Fraternity; led to Napoleon Bonaparte", category:'Modern History' },
    { term:'Industrial Revolution', def:"18th-19th century shift from agrarian to factory economy; steam power, urbanization, wage labor", category:'Modern History' },
    { term:'World War I',     def:"1914-1918; sparked by assassination of Archduke Franz Ferdinand; trench warfare; Treaty of Versailles (1919)", category:'20th Century' },
    { term:'World War II',    def:"1939-1945; began with Hitler invading Poland; Holocaust; atomic bombs on Japan; UN founded after war", category:'20th Century' },
    { term:'Cold War',        def:"1947-1991; ideological conflict between US (democracy) and USSR (communism); arms race; proxy wars", category:'20th Century' },
    { term:'Civil Rights Movement', def:"1950s-1960s US movement to end racial segregation and discrimination; led by Dr. Martin Luther King Jr.", category:'American History' },
    { term:'Colonialism',     def:"European nations claiming and exploiting overseas territories from 15th-20th centuries; shaped modern borders", category:'World History' },
    { term:'The Renaissance', def:"14th-17th century European cultural rebirth of art, science, and humanism; began in Italy", category:'World History' },
  ],
  'writing-research': [
    { term:'Thesis Statement', def:"A clear, arguable claim that your paper will support with evidence; the core of your argument", category:'Writing' },
    { term:'Topic Sentence',  def:"First sentence of a paragraph; introduces the main idea and connects to the thesis", category:'Writing' },
    { term:'MLA Format',      def:"Modern Language Association; used in humanities; in-text citation: (Author Page); Works Cited list", category:'Citation' },
    { term:'APA Format',      def:"American Psychological Association; used in social sciences; in-text: (Author, year, p. #); References list", category:'Citation' },
    { term:'Chicago Style',   def:"Used in history and some sciences; footnotes or endnotes; bibliography list at end", category:'Citation' },
    { term:'Primary Research', def:"Collecting original data through surveys, interviews, experiments, or direct observations", category:'Research Types' },
    { term:'Secondary Research', def:"Using existing sources such as peer-reviewed articles, books, and databases like JSTOR or EBSCOhost", category:'Research Types' },
    { term:'Annotated Bibliography', def:"List of sources each followed by a brief summary and evaluation of its relevance and credibility", category:'Research Skills' },
    { term:'Peer Review',     def:"Experts evaluate research before publication for quality, accuracy, and original contribution", category:'Research Skills' },
    { term:'Plagiarism',      def:"Using someone else words or ideas without proper attribution; a serious academic integrity violation", category:'Ethics' },
    { term:'Revision',        def:"Rereading and improving a draft for clarity, organization, argument strength, and effectiveness", category:'Writing Process' },
    { term:'CRAAP Test',      def:"Currency, Relevance, Authority, Accuracy, Purpose — framework for evaluating source credibility", category:'Research Skills' },
  ],
  'christian-ethics': [
    { term:'Natural Law',     def:"Moral principles discoverable through reason embedded in creation; basis for universal human rights (Aquinas)", category:'Foundations' },
    { term:'Divine Command Theory', def:"An action is morally right because God commands it; morality is grounded in the will of God", category:'Foundations' },
    { term:'Imago Dei',       def:"Humans made in the image of God (Genesis 1:27); source of inherent dignity, worth, and equality for all people", category:'Anthropology' },
    { term:'Agape',           def:"Unconditional, selfless love modeled by God; the highest form of love in Christian ethics (Greek word)", category:'Love' },
    { term:'The Great Commandment', def:"Love God with all heart, soul, mind, and strength; love your neighbor as yourself (Mark 12:30-31)", category:'Scripture' },
    { term:'Golden Rule',     def:"Treat others as you wish to be treated (Matthew 7:12); reciprocity principle found in all major religions", category:'Scripture' },
    { term:'Just War Theory', def:"Augustine and Aquinas criteria: just cause, right intention, proportionality, last resort, declared by authority", category:'Social Ethics' },
    { term:'Social Justice',  def:"Care for the poor, oppressed, and marginalized rooted in biblical prophets (Micah 6:8) and NT teachings", category:'Social Ethics' },
    { term:'Virtue Ethics',   def:"Character-based ethics developing virtues: faith, hope, love (theological); justice, courage, temperance, prudence (cardinal)", category:'Ethical Theory' },
    { term:'Sanctity of Life', def:"All human life is sacred from conception to natural death; basis for Christian ethics on abortion and euthanasia", category:'Applied Ethics' },
    { term:'Stewardship',     def:"Responsible management of creation, resources, and gifts entrusted by God; environmental and economic ethics", category:'Applied Ethics' },
    { term:'Reconciliation',  def:"Restoring broken relationships; central to Christian ethics through forgiveness modeled on God forgiving humanity", category:'Community' },
  ],
  'philosophy-religion': [
    { term:'Ontological Argument', def:"God is the greatest conceivable being; existing in reality is greater than existing only in mind; therefore God exists (Anselm)", category:'Arguments for God' },
    { term:'Cosmological Argument', def:"Everything that exists has a cause; the universe exists; therefore there must be an uncaused First Cause (God)", category:'Arguments for God' },
    { term:'Teleological Argument', def:"The universe shows complex design (fine-tuning); design implies a designer; therefore God exists (Paley, Craig)", category:'Arguments for God' },
    { term:'Problem of Evil',  def:"If God is all-good and all-powerful, why does evil and suffering exist? — the greatest challenge to theism", category:'Challenges' },
    { term:'Theodicy',         def:"Defense of God goodness despite evil; free will theodicy, soul-making theodicy (Hick), and greater good arguments", category:'Challenges' },
    { term:'Faith and Reason', def:"Can religious belief be rationally justified? Reformed epistemology (Plantinga) argues yes — basic beliefs need no proof", category:'Epistemology' },
    { term:'Religious Experience', def:"Mystical encounters claimed as evidence of God; William James catalogued varieties: conversion, mysticism, prayer", category:'Evidence' },
    { term:'Revelation',       def:"God self-disclosure through Scripture and Jesus (special revelation); nature and conscience (general revelation)", category:'Doctrine' },
    { term:'Religious Pluralism', def:"All major religions lead to the same ultimate reality; held by John Hick; challenged by exclusivists", category:'World Religions' },
    { term:'Exclusivism',      def:"Only one religion is fully true; Christian view: salvation through Christ alone (John 14:6)", category:'World Religions' },
    { term:'Inclusivism',      def:"Jesus is the only savior but may save those outside the church through non-explicit faith; middle position", category:'World Religions' },
    { term:'Agnosticism',      def:"Position that the existence of God is unknown or unknowable; neither affirms nor denies theism", category:'Worldviews' },
  ],
  'moral-theology': [
    { term:'Sin',              def:"Falling short of God moral standard; original sin (inherited), mortal sin (grave), venial sin (minor) — Catholic distinctions", category:'Core Concepts' },
    { term:'Repentance/Metanoia', def:"A complete turning from sin toward God; Greek metanoia means change of mind and direction of life", category:'Core Concepts' },
    { term:'Sanctification',   def:"Ongoing process of becoming more holy after salvation; transformation into the image of Christ", category:'Core Concepts' },
    { term:'Conscience',       def:"Inner moral faculty that judges right from wrong; must be informed by Scripture, tradition, and reason", category:'Moral Faculty' },
    { term:'Casuistry',        def:"Method of resolving difficult moral cases by applying ethical principles to specific situations", category:'Methods' },
    { term:'Principle of Double Effect', def:"An action with both good and bad effects may be permissible if: good intent, good act, good outweighs bad (Aquinas)", category:'Methods' },
    { term:'Moral Absolutes',  def:"Some actions are intrinsically evil regardless of intent or circumstances (e.g. torture, genocide)", category:'Norms' },
    { term:'Proportionalism',  def:"Moral rightness depends on proportionate reason balancing values; disputed and rejected in Veritatis Splendor", category:'Norms' },
    { term:'Catholic Social Teaching', def:"Body of teaching on human dignity, common good, solidarity, subsidiarity, and preferential option for the poor", category:'Social Ethics' },
    { term:'Eschatological Ethics', def:"Living now in light of the coming Kingdom of God; justice, hope, and community shaped by final destiny", category:'Foundations' },
    { term:'Atonement',        def:"How Christ reconciles humanity to God; theories: substitution, moral influence, Christus Victor, ransom", category:'Foundations' },
    { term:'Grace',            def:"Unmerited favor and power from God; prevenient (drawing), justifying (saving), and sanctifying (transforming) grace", category:'Core Concepts' },
  ],
  'ministry-chaplaincy': [
    { term:'Field Education',  def:"Supervised ministry placement in a church, hospital, or community setting during seminary education", category:'Formation' },
    { term:'Chaplaincy',       def:"Ministry in institutional settings — military, hospital, prison, campus — serving people of all faith backgrounds", category:'Contexts' },
    { term:'CPE (Clinical Pastoral Education)', def:"Training program for chaplains using verbatim reports, group process, and individual supervision in clinical setting", category:'Training' },
    { term:'Supervised Ministry', def:"Structured learning with mentoring from an experienced ministry leader; reflection and accountability included", category:'Formation' },
    { term:'Internship (Ministry)', def:"Extended ministry placement for students to apply classroom learning in real-world church or ministry contexts", category:'Formation' },
    { term:'Verbatim Report',  def:"Written account of a pastoral encounter for supervision; records exact dialogue, feelings, and theological reflection", category:'CPE' },
    { term:'Spiritual Care',   def:"Attending to spiritual and existential needs regardless of religious background; non-sectarian chaplaincy term", category:'Practice' },
    { term:'Multi-faith Ministry', def:"Providing care to people of different religions without imposing one tradition; respect and presence-centered", category:'Practice' },
    { term:'Unit of CPE',      def:"One quarter of full-time CPE: 400 total hours, 100 supervisory hours minimum; offered at ACPE-accredited centers", category:'CPE' },
    { term:'Theology of Ministry', def:"Theological foundation for understanding one call, role, and purpose in serving others on behalf of God", category:'Foundations' },
    { term:'Boundary Setting', def:"Maintaining appropriate limits in pastoral relationships to protect both care receiver and minister from harm", category:'Ethics' },
    { term:'Self-care in Ministry', def:"Intentional practices — rest, supervision, community — to sustain a minister over long-term without burnout", category:'Practice' },
  ],
  'missions': [
    { term:'Missio Dei',       def:"The mission of God; God is the primary missionary who sends the church into the world to participate in his work", category:'Theology' },
    { term:'Great Commission', def:"Matthew 28:18-20; Jesus commands disciples to go, make disciples of all nations, baptize, and teach", category:'Scripture' },
    { term:'Contextualization', def:"Adapting the gospel message to the cultural context without compromising its truth or core content", category:'Methods' },
    { term:'Unreached People Groups', def:"Ethnic groups with less than 2% evangelical Christian; no indigenous church able to reach them without outside help", category:'Strategy' },
    { term:'Cultural Competency', def:"Ability to interact respectfully and effectively with people of different cultural backgrounds and worldviews", category:'Skills' },
    { term:'Syncretism',       def:"Blending Christianity with incompatible religious beliefs; distorts the gospel and creates false religion", category:'Dangers' },
    { term:'Short-term Missions', def:"Brief trips of 1-2 weeks; most effective when supporting long-term missionaries and meeting defined needs", category:'Types' },
    { term:'Long-term Missions', def:"Career missionaries who learn language, culture, and plant reproducible indigenous churches over many years", category:'Types' },
    { term:'Bi-vocational Missions', def:"Supporting oneself through a secular job (tentmaking) while doing missionary work in restricted-access countries", category:'Strategy' },
    { term:'Holistic Mission',  def:"Meeting physical, social, and spiritual needs together — word and deed ministry (integral mission)", category:'Theology' },
    { term:'Church Planting',  def:"Establishing new local churches among unreached or underserved communities; core strategy of missions", category:'Strategy' },
    { term:'Orality',          def:"Most of the world learns through oral rather than written methods; oral storytelling strategies for unreached groups", category:'Methods' },
  ],
  'counseling-ministry': [
    { term:'Active Listening',  def:"Fully attending to a client; reflecting feelings; not interrupting; validating experience without judgment", category:'Skills' },
    { term:'CBT (Cognitive Behavioral Therapy)', def:"Links thoughts, feelings, and behaviors; challenges cognitive distortions to change emotional responses", category:'Approaches' },
    { term:'Crisis Intervention', def:"Immediate stabilization of someone in acute distress; assess safety, create plan, mobilize support, commit to follow-up", category:'Crisis' },
    { term:'Suicide Risk Assessment', def:"Evaluate ideation, plan, means, intent, and protective factors; use tools like Columbia Protocol or SAD PERSONS", category:'Crisis' },
    { term:'Mandated Reporter',  def:"Professionals required by law to report suspected child abuse or neglect regardless of confidentiality", category:'Legal/Ethics' },
    { term:'Confidentiality',    def:"Keeping client information private; exceptions: imminent harm to self or others, child abuse, court order", category:'Legal/Ethics' },
    { term:'Marriage and Family Therapy', def:"Systems approach that focuses on relationship patterns and dynamics rather than just individual pathology", category:'Approaches' },
    { term:'Boundaries in Counseling', def:"Clear professional limits protecting clients from exploitation or harm; no dual relationships", category:'Ethics' },
    { term:'Transference',       def:"Client unconsciously projects feelings about past relationships onto the counselor; must be managed carefully", category:'Concepts' },
    { term:'Countertransference', def:"Counselor emotional reactions to client based on own unresolved issues; requires self-awareness and supervision", category:'Concepts' },
    { term:'Empathic Presence',  def:"Being fully present with another in their pain without trying to fix; ministry of compassion (Romans 12:15)", category:'Ministry' },
    { term:'Referral',           def:"Directing a client to a more specialized professional when needs exceed your scope of training or competency", category:'Practice' },
  ],
  'homiletics': [
    { term:'Homiletics',       def:"The art and science of preaching; includes biblical exegesis, sermon structure, delivery, and pastoral application", category:'Foundations' },
    { term:'Exegesis',         def:"Drawing meaning OUT of a text through careful study of original language, context, literary genre, and history", category:'Bible Study' },
    { term:'Eisegesis',        def:"Reading personal ideas INTO a text rather than drawing meaning out; opposite of good biblical interpretation", category:'Bible Study' },
    { term:'Expository Preaching', def:"Preaching systematically through a biblical text; the text itself drives the sermon structure and main points", category:'Sermon Types' },
    { term:'Topical Preaching', def:"Sermon organized around a theme with multiple Scripture passages supporting the central idea", category:'Sermon Types' },
    { term:'Narrative Preaching', def:"Sermon structured as a story using plot, tension, and resolution; engages imagination and emotion", category:'Sermon Types' },
    { term:'Liturgy',          def:"The order of corporate worship; structured communal elements: creeds, prayers, Scripture, Eucharist, benediction", category:'Worship' },
    { term:'Lectionary',       def:"A scheduled cycle of Scripture readings followed across the church year in liturgical traditions", category:'Worship' },
    { term:'Call and Response', def:"Interactive worship element where leader speaks and congregation responds; rooted in African worship tradition", category:'Worship' },
    { term:'Worship Leading',  def:"Guiding a congregation through music, prayer, and Scripture to encounter God and respond in faith", category:'Worship' },
    { term:'Illustration',     def:"Stories, examples, or analogies that make abstract biblical truth concrete and memorable for listeners", category:'Sermon Craft' },
    { term:'Application',      def:"Showing how biblical truth applies to everyday life; the bridge from ancient text to modern listener", category:'Sermon Craft' },
  ],
  'pastoral-ministry': [
    { term:'Pastoral Care',    def:"Spiritual guidance, prayer, and support for individuals and families within a congregation through life challenges", category:'Care' },
    { term:'Servant Leadership', def:"Leading by serving others first; modeled by Jesus who washed his disciples feet (John 13:1-17)", category:'Leadership' },
    { term:'Discipleship',     def:"The ongoing process of becoming a follower of Jesus; growing in faith, obedience, and Christlike character", category:'Formation' },
    { term:'Evangelism',       def:"Sharing the good news (gospel) of Jesus Christ with others to invite them into relationship with God", category:'Outreach' },
    { term:'Church Administration', def:"Managing staff, budget, facilities, programs, and volunteers to support the church mission effectively", category:'Administration' },
    { term:'Congregational Care', def:"Intentionally visiting, calling, and supporting church members through illness, grief, and life transitions", category:'Care' },
    { term:'Vision Casting',   def:"Communicating a compelling picture of the future to inspire, align, and mobilize a congregation toward mission", category:'Leadership' },
    { term:'Conflict Resolution', def:"Biblical process (Matthew 18) for addressing disputes within the church; grace, truth, and reconciliation", category:'Leadership' },
    { term:'Spiritual Formation', def:"Intentional practices shaping a person into Christlikeness: prayer, Scripture, fasting, community, service", category:'Formation' },
    { term:'Preaching Cycle',  def:"Planning, studying, writing, practicing, delivering, and evaluating sermons consistently week after week", category:'Preaching' },
    { term:'Board/Elder Relations', def:"Pastor works with governing board on vision, budget, and accountability; shared authority and trust essential", category:'Administration' },
    { term:'Bivocational Ministry', def:"Pastor who also works a secular job; common in smaller churches; requires strong time management and boundaries", category:'Contexts' },
  ],
  'isc2-cc': [
    { term:'CIA Triad',         def:"Confidentiality (limit access), Integrity (prevent unauthorized changes), Availability (ensure reliable access) — foundation of security", category:'Core Concepts' },
    { term:'Authentication',    def:"Verifying WHO you are (username/password, biometrics, MFA); authorization is what you can do after authentication", category:'Access Control' },
    { term:'Least Privilege',   def:"Grant users only the minimum permissions needed to perform their job function; reduces attack surface", category:'Principles' },
    { term:'Defense in Depth',  def:"Layered security approach; multiple controls so if one fails others compensate (firewall + IDS + endpoint + training)", category:'Principles' },
    { term:'Incident Response Phases', def:"Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned (PICERL); structured breach response", category:'IR' },
    { term:'DAC / MAC / RBAC',  def:"Discretionary (owner controls), Mandatory (labels/clearances), Role-Based (job role grants access) — access control models", category:'Access Control' },
    { term:'Social Engineering', def:"Manipulating people into revealing information or taking action; phishing, pretexting, baiting, tailgating", category:'Threats' },
    { term:'Malware Types',     def:"Virus (attaches to files), Worm (self-replicating), Trojan (disguised), Ransomware (encrypts for ransom), Spyware (monitors)", category:'Threats' },
    { term:'Symmetric Encryption', def:"Same key encrypts and decrypts (AES, 3DES); fast but key distribution is a challenge", category:'Cryptography' },
    { term:'Asymmetric Encryption', def:"Public key encrypts, private key decrypts (RSA, ECC); solves key distribution; used in HTTPS, email signing", category:'Cryptography' },
    { term:'Risk = Threat x Vulnerability x Impact', def:"Risk is the likelihood and impact of a threat exploiting a vulnerability; accept, mitigate, transfer, or avoid", category:'Risk Management' },
    { term:'Physical Security',  def:"Locks, guards, cameras, fences, badges, and mantraps protect physical assets from unauthorized access", category:'Controls' },
    { term:'Business Continuity', def:"Plans to maintain operations during a disruption; BCP covers all functions; DR plan focuses on IT recovery", category:'Resilience' },
  ],
  'greek-mythology': [
    { term:'Zeus',              def:"King of the Olympian gods; ruler of sky, thunder, and lightning; lived on Mount Olympus; married Hera", category:'Olympians' },
    { term:'Hera',              def:"Queen of the gods; goddess of marriage, women, and family; wife of Zeus; known for jealousy of Zeus affairs", category:'Olympians' },
    { term:'Athena',            def:"Goddess of wisdom, strategy, and crafts; born fully armored from Zeus head; patron deity of Athens", category:'Olympians' },
    { term:'Apollo',            def:"God of the sun, music, poetry, and prophecy; twin of Artemis; associated with the Oracle at Delphi", category:'Olympians' },
    { term:'Artemis',           def:"Goddess of the hunt, moon, and wilderness; twin of Apollo; protector of young women and childbirth", category:'Olympians' },
    { term:'Poseidon',          def:"God of the sea, earthquakes, and horses; brother of Zeus and Hades; wielded a golden trident", category:'Olympians' },
    { term:'Hades',             def:"God of the underworld; brother of Zeus; ruled the realm of the dead; married Persephone; wore a helm of invisibility", category:'Major Gods' },
    { term:'Aphrodite',         def:"Goddess of love and beauty; born from sea foam; married Hephaestus; mother of Eros (Cupid)", category:'Olympians' },
    { term:'Hermes',            def:"Messenger of the gods; god of commerce, travelers, and thieves; wore winged sandals and carried the caduceus", category:'Olympians' },
    { term:'Ares',              def:"God of war and violence; son of Zeus and Hera; lover of Aphrodite; represents chaotic, brutal aspect of war", category:'Olympians' },
    { term:'The Odyssey',       def:"Homer epic poem about Odysseus ten-year journey home after the Trojan War; encounters Cyclops, Sirens, Circe, Scylla", category:'Epic Poems' },
    { term:'Trojan War',        def:"Ten-year Greek siege of Troy; sparked by Paris abducting Helen; ended with the Trojan Horse; Iliad by Homer", category:'Myths' },
    { term:'Prometheus',        def:"Titan who stole fire from the gods and gave it to humanity; punished by Zeus with eternal torment (eagle ate his liver)", category:'Titans' },
    { term:'Hercules (Heracles)', def:"Greatest Greek hero; son of Zeus and mortal woman; performed the 12 Labors as penance; became a god after death", category:'Heroes' },
    { term:'Persephone',        def:"Daughter of Demeter; abducted by Hades; queen of the underworld; her return each spring symbolizes seasons", category:'Myths' },
  ],
  'egyptology': [
    { term:'Pharaoh',           def:"King of Egypt, considered a living god; both political and religious ruler; wore double crown of Upper and Lower Egypt", category:'Government' },
    { term:'Hieroglyphics',     def:"Egyptian writing system using pictorial symbols; over 700 characters; written on papyrus, walls, and monuments", category:'Writing' },
    { term:'Rosetta Stone',     def:"Discovered 1799; trilingual decree (hieroglyphics, Demotic, Greek); enabled decipherment of hieroglyphics by Champollion", category:'Discovery' },
    { term:'Great Pyramid of Giza', def:"Built for Pharaoh Khufu c. 2560 BCE; 481 feet tall; one of the Seven Wonders of the Ancient World; built by workers not slaves", category:'Monuments' },
    { term:'Ra (Amun-Ra)',      def:"Sun god; chief creator deity; merged with Amun as Amun-Ra; symbolized by solar disk; traveled the sky in a solar barque", category:'Deities' },
    { term:'Osiris',            def:"God of afterlife, death, and resurrection; killed and dismembered by Set; resurrected by Isis; husband of Isis; father of Horus", category:'Deities' },
    { term:'Isis',              def:"Goddess of magic, healing, and motherhood; wife of Osiris; mother of Horus; one of the most widely worshipped Egyptian deities", category:'Deities' },
    { term:'Anubis',            def:"Jackal-headed god of embalming and the dead; guided souls to the afterlife; presided over mummification rituals", category:'Deities' },
    { term:'Mummification',     def:"Preservation of bodies for the afterlife; removed organs into canopic jars, dried with natron salt, wrapped in linen over 70 days", category:'Practices' },
    { term:'Tutankhamun',       def:"Boy pharaoh who died around age 18-19; tomb discovered intact in 1922 by Howard Carter; revealed treasures of Egyptian royalty", category:'Pharaohs' },
    { term:'Old / Middle / New Kingdoms', def:"Three major eras of Egyptian civilization; pyramid building age, reunification, and imperial expansion; separated by intermediate periods", category:'History' },
    { term:'Book of the Dead',  def:"Collection of magic spells to help the deceased navigate the afterlife; heart weighed against feather of Ma at on a scale", category:'Religion' },
    { term:'Ma at',             def:"Concept of cosmic order, truth, and justice; feather of Ma at weighed against soul; pharaoh responsible for maintaining Ma at", category:'Philosophy' },
    { term:'Cleopatra VII',     def:"Last active pharaoh of Egypt; spoke 9 languages; allied with Julius Caesar and Mark Antony; Egypt fell to Rome after her death", category:'Pharaohs' },
  ],
  'pan-african-studies': [
    { term:'Pan-Africanism',    def:"Political and cultural movement advocating unity of all African peoples worldwide; originated in late 19th century Diaspora", category:'Overview' },
    { term:'Marcus Garvey',     def:"Jamaican political leader; founded UNIA (Universal Negro Improvement Association); Back to Africa movement; Black self-determination", category:'Leaders' },
    { term:'W.E.B. Du Bois',    def:"First Black Harvard PhD; co-founded NAACP; organized five Pan-African Congresses (1919-1927); wrote The Souls of Black Folk", category:'Leaders' },
    { term:'Kwame Nkrumah',     def:"First leader of independent Ghana (1957); champion of Pan-Africanism; advocated African socialism and continental unity", category:'Leaders' },
    { term:'African Union (AU)', def:"Continental union of 55 African nations established 2002; successor to OAU; promotes unity, peace, and development across Africa", category:'Organizations' },
    { term:'Decolonization',    def:"Post-WWII process of African nations gaining independence from European colonial powers; most achieved independence by 1975", category:'History' },
    { term:'African Diaspora',  def:"People of African descent living outside Africa, particularly in the Americas as a result of the transatlantic slave trade", category:'Concepts' },
    { term:'Great Zimbabwe',    def:"Pre-colonial African kingdom (11th-15th century CE); sophisticated stone-walled city; evidence of advanced African civilization", category:'History' },
    { term:'Cheikh Anta Diop',  def:"Senegalese scholar who argued ancient Egypt was a Black African civilization; challenged Eurocentric views of African history", category:'Scholars' },
    { term:'Afrocentrism',      def:"Intellectual and cultural movement placing African history and values at the center of analysis; response to Eurocentrism", category:'Concepts' },
    { term:'Négritude Movement', def:"Literary and intellectual movement founded by Senghor, Césaire, and Damas in 1930s; affirmed African cultural identity and dignity", category:'Movements' },
    { term:'Ubuntu Philosophy', def:"Southern African concept meaning I am because we are; emphasizes communal interdependence, compassion, and shared humanity", category:'Philosophy' },
  ],
  'african-american-studies': [
    { term:'Transatlantic Slave Trade', def:"Forced migration of 12+ million Africans to the Americas (1500s-1800s); Middle Passage crossing had 10-20% mortality rate", category:'History' },
    { term:'Reconstruction (1865-1877)', def:"Post-Civil War period; 13th (abolished slavery), 14th (citizenship), 15th (voting rights) Amendments; Freedmen Bureau established", category:'History' },
    { term:'Jim Crow Laws',     def:"State and local laws enforcing racial segregation in the American South from 1877-1965; separate but equal doctrine", category:'History' },
    { term:'Harlem Renaissance', def:"1920s cultural explosion in New York; Langston Hughes, Zora Neale Hurston, Louis Armstrong, Duke Ellington; Black arts flourished", category:'Culture' },
    { term:'Civil Rights Movement', def:"1950s-60s mass movement ending legal segregation; Rosa Parks, MLK, March on Washington (1963), Civil Rights Act (1964)", category:'History' },
    { term:'NAACP',             def:"National Association for the Advancement of Colored People; co-founded by Du Bois in 1909; oldest US civil rights organization", category:'Organizations' },
    { term:'Black Power Movement', def:"1960s-70s political and cultural self-determination movement; Stokely Carmichael coined the phrase; Black Panther Party formed 1966", category:'History' },
    { term:'Intersectionality', def:"Framework coined by Kimberlé Crenshaw; analyzes overlapping systems of oppression based on race, gender, class, and other identities", category:'Theory' },
    { term:'HBCUs',             def:"Historically Black Colleges and Universities; founded to serve Black students; Howard, Morehouse, Spelman, Hampton among the most notable", category:'Education' },
    { term:'Great Migration',   def:"Two waves (1910-1940, 1940-1970); over 6 million Black Americans moved from the South to Northern and Western cities", category:'History' },
    { term:'Redlining',         def:"Discriminatory practice of denying mortgages and services to Black neighborhoods; created lasting wealth gaps and segregated cities", category:'Economics' },
    { term:'Black Lives Matter', def:"Movement founded 2013 after Trayvon Martin killing; addresses systemic racism, police brutality, and racial inequality in the US", category:'Contemporary' },
  ],
  'ot-survey': [
    { term:'Pentateuch (Torah)', def:"Genesis, Exodus, Leviticus, Numbers, Deuteronomy; Law of Moses; covers creation, fall, flood, covenant with Abraham, the Exodus", category:'Law' },
    { term:'Historical Books',  def:"Joshua through Esther; conquest of Canaan, period of Judges, united and divided kingdoms, Babylonian exile and Persian return", category:'History' },
    { term:'Wisdom Literature', def:"Job (suffering), Psalms (worship), Proverbs (practical wisdom), Ecclesiastes (meaning), Song of Songs (love)", category:'Poetry' },
    { term:'Major Prophets',    def:"Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel; lengthy prophetic books addressing Israel, Judah, and surrounding nations", category:'Prophecy' },
    { term:'Minor Prophets (Book of the Twelve)', def:"Hosea through Malachi; 12 shorter prophetic books covering justice, judgment, restoration, and the Day of the Lord", category:'Prophecy' },
    { term:'The Covenant Structure', def:"God enters binding agreements: Adamic, Noahic, Abrahamic, Mosaic, Davidic — each progressive, culminating in New Covenant", category:'Theology' },
    { term:'Babylonian Exile',  def:"Judah conquered by Babylon (605-586 BCE); Jerusalem and temple destroyed; Jews exiled; Daniel and Ezekiel minister during this period", category:'History' },
    { term:'The Exodus',        def:"God delivers Israel from Egyptian slavery through Moses; crossing of the Red Sea; 40 years in wilderness; receiving the Law at Sinai", category:'History' },
    { term:'Messianic Prophecies', def:"Isaiah 53 (suffering servant), Micah 5:2 (Bethlehem), Psalm 22 (crucifixion details), Zechariah 9:9 (triumphal entry)", category:'Prophecy' },
    { term:'The Psalter',       def:"150 psalms organized in 5 books; genres include lament, praise, royal, wisdom, and imprecatory psalms; largely attributed to David", category:'Poetry' },
    { term:'Creation and Fall', def:"Genesis 1-3: God creates world very good; Adam and Eve sin; curse, exile from Eden; beginning of redemptive narrative", category:'Genesis' },
    { term:'Types and Shadows', def:"OT persons, events, institutions that foreshadow NT fulfillment: Passover-Crucifixion, Temple-Jesus body, Manna-Eucharist", category:'Theology' },
  ],
  'nt-survey': [
    { term:'Synoptic Gospels',  def:"Matthew, Mark, Luke; share common material and structure; Mark likely earliest (50s CE); Q source theory explains shared content", category:'Gospels' },
    { term:'Gospel of John',    def:"Unique theological Gospel; 7 I AM statements; Logos theology (John 1:1); signs point to Jesus divinity; written 85-95 CE", category:'Gospels' },
    { term:'Acts of the Apostles', def:"Luke sequel; Pentecost and early church; Peter and Paul ministries; spread of gospel from Jerusalem to Rome; ends with Paul in Rome", category:'History' },
    { term:'Pauline Epistles',  def:"Romans, 1-2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1-2 Thessalonians, Philemon; written 49-62 CE", category:'Epistles' },
    { term:'Pastoral Epistles', def:"1-2 Timothy and Titus; instructions for church leadership, guarding sound doctrine, and organizing local congregations", category:'Epistles' },
    { term:'General Epistles',  def:"Hebrews, James, 1-2 Peter, 1-3 John, Jude; addressed to broad audiences; diverse theology, Jewish and Gentile contexts", category:'Epistles' },
    { term:'Revelation',        def:"Apocalyptic letter to seven churches; John vision on Patmos; judgment, cosmic warfare, new heaven and earth; written c. 95 CE", category:'Apocalyptic' },
    { term:'Justification by Faith', def:"Pauline teaching: sinners declared righteous before God through faith in Christ alone, not law-keeping (Romans 3-5; Galatians 2-3)", category:'Theology' },
    { term:'Kingdom of God',    def:"Central theme in Synoptics; Jesus announces God reign is breaking into history; parables describe it; inaugurated but not yet complete", category:'Theology' },
    { term:'Canon Formation',   def:"NT books circulated, collected, debated; Athanasius listed 27 NT books in 367 CE; councils confirmed what churches already accepted", category:'Canon' },
    { term:'Christology',       def:"NT presents Jesus as fully God and fully human; Council of Nicaea (325) affirmed divinity; Chalcedon (451) affirmed two natures", category:'Theology' },
    { term:'Resurrection',      def:"Bodily resurrection of Jesus is the cornerstone of NT faith (1 Cor 15); witnessed by 500+; proved by empty tomb; gave birth to church", category:'Core Doctrine' },
  ],
  'hermeneutics': [
    { term:'Grammatical-Historical Method', def:"Interpret text according to original grammar (word meanings, syntax) and historical context of the author and audience", category:'Methods' },
    { term:'Authorial Intent',  def:"Primary meaning of a text is what the human author intended for the original audience; guards against reading foreign meanings in", category:'Principles' },
    { term:'Literary Genre',    def:"Genre shapes interpretation; poetry, law, prophecy, epistle, and apocalyptic each follow different rules and should be read differently", category:'Principles' },
    { term:'Context Principle', def:"Interpret verses in context of paragraph, chapter, book, testament, and whole Bible; never pull verses out of their context", category:'Principles' },
    { term:'Intertextuality',   def:"OT quotes and allusions in NT; later biblical authors interpret earlier texts; Scripture interpreting Scripture is reliable", category:'Principles' },
    { term:'Typology',          def:"OT persons, events, and institutions foreshadow NT fulfillment; Christ is the antitype who fulfills OT types and shadows", category:'Methods' },
    { term:'Allegory vs. Literal', def:"Some passages are clearly figurative (Ps 18:2 rock); others literal; literary genre, context, and author intent guide which to choose", category:'Principles' },
    { term:'Horizon Fusion',    def:"Gadamer concept: bridging the gap between the ancient text world and the modern reader world to make application meaningful", category:'Philosophy' },
    { term:'Sensus Plenior',    def:"Fuller sense: God may have intended a deeper meaning in a text beyond what the human author fully understood at the time", category:'Concepts' },
    { term:'Preunderstanding',  def:"The assumptions and prior knowledge a reader brings that inevitably shapes interpretation; must be identified and evaluated critically", category:'Concepts' },
    { term:'Exegesis vs. Eisegesis', def:"Exegesis = drawing meaning OUT of the text; Eisegesis = reading personal ideas INTO the text; exegesis is the proper method", category:'Methods' },
    { term:'Application',       def:"Bridging from ancient meaning to modern life; what does this text demand of me today given my context?", category:'Practice' },
  ],
  'biblical-languages': [
    { term:'Hebrew Alphabet',   def:"22 consonants; written right to left; no original vowels; Masoretes added vowel points (niqqud) in 7th-10th century CE", category:'Hebrew' },
    { term:'Biblical Hebrew Verbs', def:"Verbs express ASPECT not tense: perfect (complete action), imperfect (ongoing/future); qal, niphal, hiphil, piel stems", category:'Hebrew' },
    { term:'Koine Greek',       def:"Common Greek dialect of the NT era (300 BCE-300 CE); simpler than classical; lingua franca of the Mediterranean world", category:'Greek' },
    { term:'Greek Alphabet',    def:"24 letters; alpha to omega; key: alpha (a), beta (b), delta (d), theta (th), lambda (l), sigma (s), omega (long o)", category:'Greek' },
    { term:'Greek Noun Cases',  def:"Nominative (subject), Genitive (possession), Dative (indirect object), Accusative (direct object); no capitalization needed", category:'Greek' },
    { term:'Greek Verb Parsing', def:"Identify: tense (present/aorist/perfect), voice (active/middle/passive), mood (indicative/subjunctive), person, number", category:'Greek' },
    { term:'Aramaic',           def:"Semitic language related to Hebrew; sections of Daniel and Ezra; Jesus likely spoke Aramaic as his primary everyday language", category:'Other Languages' },
    { term:'Septuagint (LXX)', def:"Greek translation of OT (3rd-1st century BCE); widely used in early church; NT writers often quote from it rather than Hebrew", category:'Texts' },
    { term:'Textual Criticism', def:"Comparing manuscripts to identify the most accurate reading of the original text; 5800+ Greek NT manuscripts exist", category:'Methods' },
    { term:'Lexicon',           def:"Dictionary of biblical Greek or Hebrew with definitions, morphology, and usage data (e.g. BDAG for Greek, BDB for Hebrew)", category:'Tools' },
    { term:'Interlinear Bible', def:"Shows original language word-by-word with English translation beneath each word; accessible to students without fluency", category:'Tools' },
    { term:'Concordance',       def:"Index of every word in the Bible with its references; Strongs Concordance assigns numbers to every Hebrew and Greek word", category:'Tools' },
  ],
  'systematic-theology': [
    { term:'Theology Proper',   def:"Study of the nature and attributes of God; communicable (love, wisdom) vs incommunicable (omnipotence, omniscience, eternality)", category:'God' },
    { term:'Trinitarian Theology', def:"One God in three co-equal, co-eternal persons: Father, Son, Holy Spirit; not three gods (tritheism) nor one mode (modalism)", category:'God' },
    { term:'Christology',       def:"Study of Jesus Christ; hypostatic union: fully God and fully human in one person; two natures, one person affirmed at Chalcedon 451", category:'Christ' },
    { term:'Pneumatology',      def:"Study of the Holy Spirit; convicts of sin, regenerates, indwells, seals, gifts, and sanctifies believers; third person of the Trinity", category:'Holy Spirit' },
    { term:'Anthropology',      def:"Study of human nature; created in imago Dei; fallen through Adam sin; mortal body; soul and spirit; in need of redemption", category:'Humanity' },
    { term:'Hamartiology',      def:"Study of sin; original sin (inherited guilt), total depravity (corruption in all areas), personal sin; sin separates from God", category:'Sin' },
    { term:'Soteriology',       def:"Study of salvation; golden chain: election, calling, regeneration, faith, justification, adoption, sanctification, glorification", category:'Salvation' },
    { term:'Ecclesiology',      def:"Study of the church; universal (all believers) and local expressions; ordinances (baptism, Lord supper); church government models", category:'Church' },
    { term:'Eschatology',       def:"Study of last things; second coming of Christ, bodily resurrection, final judgment, heaven (new creation), and hell (eternal separation)", category:'End Times' },
    { term:'Bibliology',        def:"Study of Scripture; verbal plenary inspiration, inerrancy in original manuscripts, sufficiency, clarity, canonicity, and authority", category:'Scripture' },
    { term:'Election and Predestination', def:"God foreknows and chooses those who will be saved; Calvinist (unconditional) vs Arminian (foreknown faith) perspectives", category:'Salvation' },
    { term:'Atonement Theories', def:"Penal Substitution (Christ bore our punishment), Moral Influence, Christus Victor, Ransom, Governmental — explain how cross saves", category:'Salvation' },
  ],
  'apologetics': [
    { term:'Apologetics',       def:"Rational defense of the Christian faith; from Greek apologia (to give a defense); 1 Peter 3:15 commands readiness to answer", category:'Overview' },
    { term:'Classical Apologetics', def:"Argues for theism first (cosmological, ontological), then for Christian theism (resurrection evidence); two-step method", category:'Approaches' },
    { term:'Evidential Apologetics', def:"Presents direct historical evidence for Christianity; reliability of Scripture; resurrection facts; fulfilled prophecy (Habermas)", category:'Approaches' },
    { term:'Presuppositional Apologetics', def:"All reasoning presupposes God; argues from Scripture as foundation; exposes inconsistency of non-Christian worldviews (Van Til)", category:'Approaches' },
    { term:'Cosmological Argument', def:"Everything that exists has a cause; the universe began to exist; therefore an uncaused First Cause (God) must exist (Kalam)", category:'Arguments' },
    { term:'Teleological Argument', def:"Universe shows fine-tuned complexity; design implies a designer; probability of life-permitting constants by chance is essentially zero", category:'Arguments' },
    { term:'Moral Argument',    def:"Objective morality exists; objective morality requires a transcendent moral lawgiver; therefore God exists (Lewis, Craig)", category:'Arguments' },
    { term:'Resurrection Evidence', def:"Empty tomb, post-resurrection appearances to 500+, disciples died for this belief, Paul conversion, James conversion — minimal facts", category:'Historical' },
    { term:'Reliability of NT', def:"5800+ Greek manuscripts, 25000+ total; written within decades of events; archaeologically confirmed; earlier than critics claim", category:'Historical' },
    { term:'Problem of Evil Response', def:"Free will theodicy, soul-making (Hick), greater good argument, eschatological resolution — God permits evil for greater purposes", category:'Objections' },
    { term:'Cumulative Case',   def:"Combined weight of philosophical, historical, scientific, and experiential evidence all pointing toward Christianity being true", category:'Methods' },
    { term:'Presuppositions',   def:"Every worldview begins with unprovable starting assumptions; Christianity presupposes God and Scripture as more coherent than alternatives", category:'Methods' },
  ],
  'church-history': [
    { term:'Apostolic Age (30-100 CE)', def:"First generation Christians; spread from Jerusalem; Paul missionary journeys; all NT books written; persecution under Nero and Domitian", category:'Early Church' },
    { term:'Early Heresies',    def:"Gnosticism (secret knowledge), Marcionism (rejected OT), Arianism (Christ not fully God); each prompted councils to define orthodoxy", category:'Early Church' },
    { term:'Council of Nicaea (325 CE)', def:"Affirmed full divinity of Christ against Arianism; produced Nicene Creed; called by Emperor Constantine; bishops from across empire", category:'Councils' },
    { term:'Edict of Milan (313 CE)', def:"Constantine legalized Christianity in Roman Empire; Christianity moved from persecuted minority to imperial favor within a generation", category:'Roman Period' },
    { term:'Augustine of Hippo (354-430)', def:"Defining theologian of Western Christianity; wrote Confessions and City of God; theology of grace, original sin, and just war", category:'Early Fathers' },
    { term:'The Great Schism (1054)', def:"Split between Eastern Orthodox and Roman Catholic churches; filioque controversy (Spirit proceeds from Father and Son) and papal authority", category:'Medieval' },
    { term:'Medieval Church',   def:"Pope at height of political power; Crusades (1095-1291); scholasticism (Aquinas); universities founded; cathedral building era", category:'Medieval' },
    { term:'Martin Luther (1517)', def:"Posted 95 Theses against indulgences; sparked Protestant Reformation; sola scriptura, sola fide, sola gratia; translated Bible into German", category:'Reformation' },
    { term:'Protestant Reformation', def:"Luther, Calvin (Geneva), Zwingli (Zurich); rejection of papal authority; Bible in vernacular languages; priesthood of all believers", category:'Reformation' },
    { term:'John Calvin',       def:"French reformer; systematic theology in Institutes of the Christian Religion; doctrine of election; Geneva as model reformed city", category:'Reformation' },
    { term:'Wesley and Methodism', def:"John Wesley and Charles Wesley; 18th century revival movement; field preaching, class meetings, social reform; founded Methodism", category:'Modern' },
    { term:'Global Christianity', def:"20th-21st century: center of Christianity shifted to Global South (Africa, Asia, Latin America); charismatic and Pentecostal growth", category:'Contemporary' },
  ],
};

const CHIPS = [
  'Network+','NCLEX','CCNA','Security+','A+','MCAT','GRE','LSAT','AWS','CISSP','Azure','PMP','LPN','CNA','USMLE',
  '1st Grade Words','2nd Grade Words','3rd Grade Words','4th Grade Words','5th Grade Words','6th Grade Words','7th Grade Words','8th Grade Words',
  'Addition','Subtraction','Multiplication','Long Division',
  'Algebra','Geometry','Advanced Math','Ancient Math',
  'Biology','Chemistry','Physics',
  'U.S. History','History','Anatomy','Pharmacology','Discrete Math','Midwifery','Spanish','Psychology','Economics',
  'PA CDL','PA Class C Driving','Boating Safety','Fishing License','UAS Law',
  'Bible Intro','World Religions','Philosophy','Public Speaking','Writing & Research',
  'Christian Ethics','Philosophy of Religion','Moral Theology',
  'Ministry & Chaplaincy','Missions','Counseling & Crisis','Homiletics & Worship','Pastoral Ministry',
  'ISC2 CC','Greek Mythology','Egyptology','Pan-African Studies','African American Studies',
  'OT Survey','NT Survey','Hermeneutics','Biblical Languages',
  'Systematic Theology','Apologetics','Church History',
];

function matchExam(query: string): FlashCard[] {
  const q = query.toLowerCase().trim();
  for (const [key, cards] of Object.entries(VOCAB_BANKS)) {
    if (q.includes(key) || key.includes(q.split(/\s+/)[0])) return cards;
  }
  /* Grade-level sight words */
  if (/1st.*(grade|word|sight)|kindergarten|kinder|grade 1/.test(q)) return VOCAB_BANKS['sight-words-1'];
  if (/2nd.*(grade|word|sight)|grade 2/.test(q)) return VOCAB_BANKS['sight-words-2'];
  if (/3rd.*(grade|word|sight)|grade 3\b/.test(q)) return VOCAB_BANKS['sight-words-3'];
  if (/4th.*(grade|word|vocab)|grade 4\b/.test(q)) return VOCAB_BANKS['sight-words-4'];
  if (/5th.*(grade|word|vocab)|grade 5\b/.test(q)) return VOCAB_BANKS['sight-words-5'];
  if (/6th.*(grade|word|vocab)|grade 6\b/.test(q)) return VOCAB_BANKS['sight-words-6'];
  if (/7th.*(grade|word|vocab)|grade 7\b/.test(q)) return VOCAB_BANKS['sight-words-7'];
  if (/8th.*(grade|word|vocab)|grade 8\b/.test(q)) return VOCAB_BANKS['sight-words-8'];
  if (/sight.word|dolch|fry.word/.test(q)) return VOCAB_BANKS['sight-words-1'];
  /* Elementary math operations */
  if (/addition|adding|addend|\bsum\b/.test(q)) return VOCAB_BANKS['addition'];
  if (/subtract|minuend|subtrahend|differ/.test(q)) return VOCAB_BANKS['subtraction'];
  if (/multipli|times table|product|\bfactor\b/.test(q)) return VOCAB_BANKS['multiplication'];
  if (/long.divis|divis|dividend|divisor|quotient/.test(q)) return VOCAB_BANKS['long-division'];
  /* K-12 math */
  if (/alg(ebra)?|linear equat|quadratic|polynomial|variable|slope/.test(q)) return VOCAB_BANKS['algebra'];
  if (/geo(metry)?|triangle|pythagor|angle|polygon|circle area/.test(q)) return VOCAB_BANKS['geometry'];
  /* K-12 sciences */
  if (/bio(logy)?|cell|evolut|ecosystem|photosyn|mitosis/.test(q)) return VOCAB_BANKS['biology'];
  if (/chem(istry)?|periodic|element|atom|molecule|bond/.test(q)) return VOCAB_BANKS['chemistry'];
  if (/physics|force|newton|motion|energy|wave|momentum/.test(q)) return VOCAB_BANKS['physics'];
  /* Social studies */
  if (/us.hist|american.hist|civil.war|revolution|constitution/.test(q)) return VOCAB_BANKS['us-history'];
  /* Advanced/ancient math */
  if (/advanced.math|calculus|derivative|integral|eigenvalue|fourier|diff.eq|linear.alg/.test(q)) return VOCAB_BANKS['advanced-math'];
  if (/ancient.math|babylonian|egyptian.math|greek.math|archimedes|euclid|fibonacci/.test(q)) return VOCAB_BANKS['ancient-math'];
  /* PA driving and outdoor */
  if (/pa.cdl|commercial.driv|cdl.driv|class.a.*driv|class.b.*driv/.test(q)) return VOCAB_BANKS['pa-cdl'];
  if (/pa.class.c|class.c.*driv|drivers.test|driving.test|dmv|penndo/.test(q)) return VOCAB_BANKS['pa-class-c'];
  if (/boating.safety|boat.safety|navigation.buoy|life.jacket|pwc|jet.ski|clinch.knot|palomar/.test(q)) return VOCAB_BANKS['boating-safety'];
  if (/fishing.licen|pa.fishing|fish.licen|creel.limit|fish.size/.test(q)) return VOCAB_BANKS['fishing-license'];
  if (/uas.law|drone.law|part.107|faa.drone|remote.pilot|unmanned/.test(q)) return VOCAB_BANKS['uas-law'];
  /* Humanities */
  if (/bible.intro|intro.*bible|bible.overv|old.testament|new.testament|gospel|epistl|canon/.test(q)) return VOCAB_BANKS['bible-intro'];
  if (/world.relig|comparative.relig|hinduism|buddhism|islam.overv|taoism|sikhism/.test(q)) return VOCAB_BANKS['world-religions'];
  if (/philos|epistemolog|ontolog|plato|aristotle|socrat|kant|descartes|utilit|existential/.test(q)) return VOCAB_BANKS['philosophy'];
  if (/public.speak|speech|oratory|rhetoric|present|imprompt|persuasive.speak/.test(q)) return VOCAB_BANKS['public-speaking'];
  if (/\bhist(ory)?\b|world.hist|chronolog|french.rev|industrial.rev|cold.war|world.war/.test(q)) return VOCAB_BANKS['history'];
  if (/writing.research|research.method|mla.format|apa.format|chicago.style|annotated.bib|thesis.statement|plagiarism/.test(q)) return VOCAB_BANKS['writing-research'];
  /* Theology */
  if (/christian.ethic|imago.dei|natural.law|divine.command|agape|just.war|virtue.ethic/.test(q)) return VOCAB_BANKS['christian-ethics'];
  if (/philos.relig|philosophy.of.relig|theodicy|problem.of.evil|ontological.arg|cosmological|teleological/.test(q)) return VOCAB_BANKS['philosophy-religion'];
  if (/moral.theol|casuistry|double.effect|sanctification|moral.absol|sin.and/.test(q)) return VOCAB_BANKS['moral-theology'];
  if (/ministy.chap|chaplain|field.educ|supervised.ministr|cpe|internship.*ministr/.test(q)) return VOCAB_BANKS['ministry-chaplaincy'];
  if (/mission|missiol|cross.cultural|great.commission|unreached|misio.dei|contextuali/.test(q)) return VOCAB_BANKS['missions'];
  if (/counsel|crisis.interven|marriage.famil|suicide.risk|cbt|transference|mandated.report/.test(q)) return VOCAB_BANKS['counseling-ministry'];
  if (/homiletic|preaching|sermon|worship.lead|liturgy|lectionary|expository/.test(q)) return VOCAB_BANKS['homiletics'];
  if (/pastoral.ministr|servant.lead|discipleship|evangelism|church.admin|congregat|vision.cast/.test(q)) return VOCAB_BANKS['pastoral-ministry'];
  /* College / trades */
  if (/anatomy|body|organ|muscl|skeletal|cardiovasc/.test(q)) return VOCAB_BANKS['anatomy'];
  if (/pharm(acology)?|drug|medication|agonist|half.life|dosage/.test(q)) return VOCAB_BANKS['pharmacology'];
  if (/discrete.math|set.theory|graph.theory|logic.gate|combinat|modular/.test(q)) return VOCAB_BANKS['discrete-math'];
  if (/midwif|obstetric|labor|birth|postpartum|antepartum|apgar/.test(q)) return VOCAB_BANKS['midwifery'];
  if (/spanish|español|espanol|sp vocab|sp verb/.test(q)) return VOCAB_BANKS['spanish'];
  if (/psych(ology)?|freud|piaget|erikson|skinner|pavlov|behavior/.test(q)) return VOCAB_BANKS['psychology'];
  if (/econ(omics)?|supply|demand|gdp|inflation|fiscal|monetary/.test(q)) return VOCAB_BANKS['economics'];
  /* Existing exams */
  if (/lpn|practical nurse|lvn/.test(q)) return VOCAB_BANKS['lpn'];
  if (/cna|nursing assistant|aide/.test(q)) return VOCAB_BANKS['cna'];
  if (/usmle|step 1|step1|medical board/.test(q)) return VOCAB_BANKS['usmle'];
  if (/mcat|med school|medical college/.test(q)) return VOCAB_BANKS['mcat'];
  if (/gre|grad school|graduate record/.test(q)) return VOCAB_BANKS['gre'];
  if (/lsat|law school/.test(q)) return VOCAB_BANKS['lsat'];
  if (/aws|amazon web|ec2|s3\b/.test(q)) return VOCAB_BANKS['aws'];
  if (/azure|microsoft cloud|az-/.test(q)) return VOCAB_BANKS['azure'];
  if (/cissp|certified info sys security prof/.test(q)) return VOCAB_BANKS['cissp'];
  if (/isc2.cc|cc.cert|certified in cyber|isc2 cc/.test(q)) return VOCAB_BANKS['isc2-cc'];
  if (/greek.myth|olympian|zeus|athena|hercules|odyssey|troy|titan/.test(q)) return VOCAB_BANKS['greek-mythology'];
  if (/egypt(ology)?|pharaoh|hieroglyph|mummif|pyramid|sphinx|rosetta/.test(q)) return VOCAB_BANKS['egyptology'];
  if (/pan.african|garvey|nkrumah|ubuntu|negritude|afrocentric|decoloniz/.test(q)) return VOCAB_BANKS['pan-african-studies'];
  if (/african.american|black.hist|harlem.renais|jim.crow|naacp|civil.right|great.migrat|redlin|hbcu/.test(q)) return VOCAB_BANKS['african-american-studies'];
  if (/ot.survey|old.test(ament)?|pentateuch|torah|deuteronomy|leviticus|psalms|prophets/.test(q)) return VOCAB_BANKS['ot-survey'];
  if (/nt.survey|new.test(ament)?|gospel|acts.of|pauline|epistle|revelation.*john|synoptic/.test(q)) return VOCAB_BANKS['nt-survey'];
  if (/hermeneut|biblical.interp|exegesis|eisegesis|authorial.intent|intertextuality/.test(q)) return VOCAB_BANKS['hermeneutics'];
  if (/biblical.lang|hebrew.alphabet|koine.greek|greek.verb|lexicon|concordance|septuagint/.test(q)) return VOCAB_BANKS['biblical-languages'];
  if (/systematic.theol|theology.proper|christology|pneumatology|soteriology|ecclesiology|eschatology|hamartiology/.test(q)) return VOCAB_BANKS['systematic-theology'];
  if (/apologetic|cosmological.arg|teleological|moral.arg|resurrection.evid|presupposit|classical.apol|evidential/.test(q)) return VOCAB_BANKS['apologetics'];
  if (/church.hist|early.church|reformation.hist|nicaea|constantine|augustine|great.schism|luther.reform|calvin|methodism/.test(q)) return VOCAB_BANKS['church-history'];
  if (/pmp|project manag|pmbok/.test(q)) return VOCAB_BANKS['pmp'];
  if (/nurs|patient|rn\b|hospital/.test(q)) return VOCAB_BANKS['nclex'];
  if (/cybe|secu|hack|pen test/.test(q)) return VOCAB_BANKS['security+'];
  if (/cisco|route|switch|wan|ccn/.test(q)) return VOCAB_BANKS['ccna'];
  if (/comp|it\b|tech|help desk/.test(q)) return VOCAB_BANKS['a+'];
  return VOCAB_BANKS['network+'];
}

function generateLyrics(exam: string, cards: FlashCard[]): string {
  const first = (c: FlashCard) => c.def.split(';')[0].split('–')[0].split(':')[0].trim().slice(0, 60);
  const cats = [...new Set(cards.map(c => c.category))].slice(0, 4);
  const c = (n: number) => cards[n % cards.length];
  return `🎵 "${exam.toUpperCase()} STUDY ANTHEM" 🎵

[Verse 1]
Open up your brain, let's lock this in today,
${c(0).term} — ${first(c(0))},
${c(1).term} — remember it this way,
${first(c(1))}, hey!

[Pre-Chorus]
${c(2).term}, ${c(3).term},
Write them down, say them loud, feel them in your soul,
Every definition building up your ${cats[0]} goals!

[Chorus]
Oh-oh, I know my ${cats[0]}, I know my ${cats[1] || cats[0]},
Every term, every fact, locked into my brain,
${c(4).term} — ${first(c(4))},
Flash cards in my hand, gonna ace this exam!

[Verse 2]
${c(5).term} — that's ${first(c(5))},
${c(6).term} — you know what that means,
${c(7).term}: ${first(c(7))},
Study hard, it's not as tough as it seems!

[Bridge]
${cats[2] || 'Key concepts'}, line by line,
${c(8).term} — ${first(c(8))},
${c(9).term} — now you're doing fine,
${cats[3] || 'Keep going'} — every answer's mine!

[Verse 3]
${c(10).term}? ${first(c(10))},
${c(11).term}? ${first(c(11))},
Two more to go, I've got them memorized,
${exam.toUpperCase()}, I came here authorized!

[Outro]
Study smart, not just hard — you've got this today,
${exam.toUpperCase()} — I'm ready, I'll pass, no delay! 🎓

💡 Key Definitions:
${cards.slice(0,6).map(cd => `• ${cd.term}: ${cd.def.slice(0,80)}${cd.def.length>80?'…':''}`).join('\n')}`;
}

function buildQuiz(cards: FlashCard[]): QuizQ[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(10, cards.length)).map(card => {
    const wrong = cards.filter(x => x !== card).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [card.def, ...wrong.map(w => w.def)].sort(() => Math.random() - 0.5);
    return { term: card.term, options: opts, correctIdx: opts.indexOf(card.def), category: card.category };
  });
}

type Tab = 'cards' | 'quiz' | 'song' | 'video';

export default function StudyGameWidget() {
  const skin = useStore(s => s.skin);
  const setActiveApp = useStore(s => s.setActiveApp);
  const { color, glow } = getSkinColors(skin);
  const [query, setQuery] = useState('');
  const [exam, setExam] = useState('');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tab, setTab] = useState<Tab>('cards');
  const [speaking, setSpeaking] = useState(false);

  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [videoState, setVideoState] = useState<'idle'|'playing'|'paused'>('idle');
  const [videoSlide, setVideoSlide] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef<{ interval: ReturnType<typeof setInterval>|null; elapsed: number; total: number; lastSlide: number }>({ interval:null, elapsed:0, total:0, lastSlide:-1 });
  const [lyricLine, setLyricLine] = useState(0);
  const lyricRef = useRef<ReturnType<typeof setInterval>|null>(null);

  function stopVideo() {
    if (videoRef.current.interval) { clearInterval(videoRef.current.interval); videoRef.current.interval = null; }
    window.speechSynthesis?.cancel();
    setVideoState('idle');
    setVideoSlide(0);
    setVideoProgress(0);
  }

  function loadExam(q: string) {
    stopVideo();
    if (lyricRef.current) { clearInterval(lyricRef.current); lyricRef.current = null; }
    const matched = matchExam(q);
    setExam(q);
    setCards(matched);
    setLyrics(generateLyrics(q, matched));

    setCardIdx(0);
    setFlipped(false);
    setTab('cards');
    setSpeaking(false);
    setLyricLine(0);
  }

  function start() {
    const q = query.trim();
    if (!q) return;
    loadExam(q);
  }

  function nextCard() { setCardIdx(i => (i + 1) % cards.length); setFlipped(false); }
  function prevCard() { setCardIdx(i => (i - 1 + cards.length) % cards.length); setFlipped(false); }

  function speakLyrics() {
    window.speechSynthesis?.cancel();
    if (lyricRef.current) { clearInterval(lyricRef.current); lyricRef.current = null; }
    if (speaking) { setSpeaking(false); setLyricLine(0); return; }
    if (!lyrics || !('speechSynthesis' in window)) return;
    const lines = lyrics.split('\n');
    setLyricLine(0);
    const utt = new SpeechSynthesisUtterance(lyrics.replace(/🎵|🎓|🎶/g, ''));
    utt.rate = 1.1; utt.pitch = 1.05;
    utt.onend = () => { setSpeaking(false); setLyricLine(0); if (lyricRef.current) { clearInterval(lyricRef.current); lyricRef.current = null; } };
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
    let idx = 0;
    lyricRef.current = setInterval(() => {
      idx = (idx + 1) % lines.length;
      setLyricLine(idx);
    }, 850);
  }

  function answerQuiz(optIdx: number) {
    if (quizSelected !== null) return;
    setQuizSelected(optIdx);
    if (optIdx === quiz[quizIdx].correctIdx) {
      setQuizScore(s => s + 1);
      setQuizStreak(s => s + 1);
    } else {
      setQuizStreak(0);
    }
  }

  function nextQuizQ() { setQuizIdx(i => i + 1); setQuizSelected(null); }

  function resetQuiz() {
    setQuiz(buildQuiz(cards));
    setQuizIdx(0);
    setQuizSelected(null);
    setQuizScore(0);
    setQuizStreak(0);
  }

  function speakVideoSlide(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.92; utt.pitch = 1.0;
    window.speechSynthesis.speak(utt);
  }

  function runVideoInterval(n: number, cardDur: number) {
    const r = videoRef.current;
    const iv = setInterval(() => {
      r.elapsed += 0.1;
      const pct = Math.min(1, r.elapsed / r.total);
      setVideoProgress(pct);
      const introTime = 5;
      const outroStart = introTime + n * cardDur;
      if (r.elapsed < introTime) {
        if (r.lastSlide !== 0) { r.lastSlide = 0; setVideoSlide(0); }
      } else if (r.elapsed >= outroStart) {
        if (r.lastSlide !== n + 1) {
          r.lastSlide = n + 1;
          setVideoSlide(n + 1);
          speakVideoSlide("Study complete! You covered " + n + " terms for " + exam + ". Keep reviewing and you will ace it!");
        }
      } else {
        const afterIntro = r.elapsed - introTime;
        const slideIdx = Math.min(n - 1, Math.floor(afterIntro / cardDur));
        if (slideIdx + 1 !== r.lastSlide) {
          r.lastSlide = slideIdx + 1;
          setVideoSlide(slideIdx + 1);
          const c = cards[slideIdx];
          speakVideoSlide(c.term + ". " + c.def.replace(/;/g, '.'));
        }
      }
      if (r.elapsed >= r.total) {
        clearInterval(iv);
        r.interval = null;
        setVideoState('idle');
      }
    }, 100);
    r.interval = iv;
  }

  function startVideo() {
    if (!cards.length) return;
    const n = cards.length;
    const cardDur = Math.max(7, Math.min(15, 170 / n));
    const total = 5 + n * cardDur + 5;
    videoRef.current = { interval: null, elapsed: 0, total, lastSlide: -1 };
    setVideoState('playing');
    setVideoSlide(0);
    setVideoProgress(0);
    speakVideoSlide("Welcome to your " + exam + " study overview. We will cover " + n + " key concepts.");
    runVideoInterval(n, cardDur);
  }

  function toggleVideoPause() {
    if (videoState === 'playing') {
      if (videoRef.current.interval) { clearInterval(videoRef.current.interval); videoRef.current.interval = null; }
      window.speechSynthesis?.pause();
      setVideoState('paused');
    } else if (videoState === 'paused') {
      window.speechSynthesis?.resume();
      const n = cards.length;
      const cardDur = Math.max(7, Math.min(15, 170 / n));
      runVideoInterval(n, cardDur);
      setVideoState('playing');
    }
  }

  useEffect(() => {
    if (cards.length > 0) {
      setQuiz(buildQuiz(cards));
      setQuizIdx(0);
      setQuizSelected(null);
      setQuizScore(0);
      setQuizStreak(0);
    }
  }, [cards]);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    if (videoRef.current.interval) clearInterval(videoRef.current.interval);
    if (lyricRef.current) clearInterval(lyricRef.current);
  }, []);

  const card = cards[cardIdx];
  const quizDone = quiz.length > 0 && quizIdx >= quiz.length;
  const quizQ = quiz[quizIdx] as QuizQ | undefined;
  const pct = quizDone ? Math.round((quizScore / quiz.length) * 100) : 0;
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';

  const tabDefs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id:'cards', label:'Cards', icon:<BookOpen size={10}/> },
    { id:'quiz',  label:'Quiz',  icon:<HelpCircle size={10}/> },
    { id:'song',  label:'Song',  icon:<Music size={10}/> },
    { id:'video', label:'Video', icon:<Video size={10}/> },
  ];

  return (
    <div className="widget-card h-full flex flex-col" style={{ borderColor:`${color}25` }}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize:'1.1rem' }}>🧠</span>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color:'var(--w-text-dim)' }}>study game</span>
            <p style={{ fontSize:'0.5rem', color:'var(--w-text-faint)', margin:'1px 0 0', letterSpacing:0.3 }}>Type any subject — get flash cards, quiz, a study song &amp; video instantly</p>
          </div>
        </div>
        <form onSubmit={e => { e.preventDefault(); start(); }} style={{ display:'flex', gap:6 }}>
          <input
            className="input-dark flex-1 !py-1.5 text-xs"
            placeholder="NCLEX, 1st grade words, Algebra, Pharmacology…"
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
          {/* Tab bar */}
          <div style={{ display:'flex', gap:2, margin:'0 12px 8px', padding:3, borderRadius:10, background:'rgba(255,255,255,0.03)', flexShrink:0 }}>
            {tabDefs.map(({ id:t, label:lbl, icon }) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'4px 2px', borderRadius:7, border:'none', cursor:'pointer',
                background: tab===t ? color : 'transparent',
                color: tab===t ? '#fff' : 'var(--w-text-dim)',
                fontSize:'0.55rem', fontWeight:700, fontFamily:'monospace',
                display:'flex', alignItems:'center', justifyContent:'center', gap:3,
                transition:'background 0.15s',
              }}>
                {icon} {lbl}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden px-3 pb-3">

            {/* ── FLASH CARDS ── */}
            {tab === 'cards' && card && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-faint)' }}>
                    {exam.toUpperCase()} — {card.category}
                  </span>
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-dim)' }}>
                    {cardIdx+1}/{cards.length}
                  </span>
                </div>
                <div style={{ height:2, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                  <div style={{ width:`${((cardIdx+1)/cards.length)*100}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.3s' }} />
                </div>
                {/* 3D Flip Card */}
                <div style={{ flex:1, perspective:'1000px', minHeight:0 }}>
                  <div
                    onClick={() => setFlipped(f => !f)}
                    style={{
                      position:'relative', width:'100%', height:'100%',
                      transformStyle:'preserve-3d',
                      transition:'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                      transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      cursor:'pointer',
                    }}
                  >
                    {/* Front */}
                    <div style={{
                      position:'absolute', width:'100%', height:'100%',
                      backfaceVisibility:'hidden',
                      borderRadius:14, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', padding:16, textAlign:'center',
                      background:'rgba(255,255,255,0.04)',
                      border:'1px solid rgba(255,255,255,0.08)',
                    }}>
                      <span style={{ fontSize:'0.55rem', fontFamily:'monospace', color:'var(--w-text-faint)', marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>term</span>
                      <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--w-text-main)', lineHeight:1.3, margin:0 }}>{card.term}</p>
                      <p style={{ fontSize:'0.6rem', color:'var(--w-text-faint)', marginTop:12, margin:'12px 0 0' }}>tap to flip</p>
                    </div>
                    {/* Back */}
                    <div style={{
                      position:'absolute', width:'100%', height:'100%',
                      backfaceVisibility:'hidden',
                      transform:'rotateY(180deg)',
                      borderRadius:14, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', padding:16, textAlign:'center',
                      background:`${color}18`,
                      border:`1px solid ${color}40`,
                      boxShadow:`0 4px 20px ${glow}40`,
                    }}>
                      <span style={{ fontSize:'0.55rem', fontFamily:'monospace', color, marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>definition</span>
                      <p style={{ fontSize:'0.72rem', color:'var(--w-text-main)', lineHeight:1.5, margin:0 }}>{card.def}</p>
                    </div>
                  </div>
                </div>
                {/* Navigation */}
                <div style={{ display:'flex', gap:8, justifyContent:'center', flexShrink:0 }}>
                  <button onClick={prevCard} style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'5px 12px', cursor:'pointer', color }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => { setCardIdx(Math.floor(Math.random()*cards.length)); setFlipped(false); }}
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'5px 10px', cursor:'pointer', color:'var(--w-text-dim)' }}>
                    <RotateCcw size={11} />
                  </button>
                  <button onClick={nextCard} style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'5px 12px', cursor:'pointer', color }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── QUIZ ── */}
            {tab === 'quiz' && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                {quizDone ? (
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14 }}>
                    <span style={{ fontSize:'2.8rem' }}>{grade === 'A' ? '🏆' : grade === 'B' ? '⭐' : grade === 'C' ? '👍' : '📚'}</span>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ fontSize:'2.2rem', fontWeight:800, color, fontFamily:'monospace', lineHeight:1, margin:0 }}>{quizScore}/{quiz.length}</p>
                      <p style={{ fontSize:'0.65rem', color:'var(--w-text-dim)', marginTop:6, margin:'6px 0 0' }}>{pct}% correct — Grade <strong style={{ color }}>{grade}</strong></p>
                    </div>
                    <button onClick={resetQuiz}
                      style={{ background:color, color:'#fff', border:'none', borderRadius:10, padding:'8px 22px', cursor:'pointer', fontSize:'0.7rem', fontWeight:700, fontFamily:'monospace', boxShadow:`0 2px 12px ${glow}` }}>
                      Play Again
                    </button>
                  </div>
                ) : quizQ ? (
                  <>
                    {/* Quiz header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-faint)' }}>
                        Q {quizIdx+1}/{quiz.length} · {quizQ.category}
                      </span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'#86efac' }}>✓ {quizScore}</span>
                        {quizStreak > 1 && (
                          <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'#fb923c' }}>🔥 {quizStreak}</span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height:2, background:'rgba(255,255,255,0.08)', borderRadius:2, flexShrink:0 }}>
                      <div style={{ width:`${(quizIdx/quiz.length)*100}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.3s' }} />
                    </div>
                    {/* Question */}
                    <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${color}25`, borderRadius:12, padding:'12px 14px', textAlign:'center', flexShrink:0 }}>
                      <p style={{ fontSize:'0.52rem', fontFamily:'monospace', color:'var(--w-text-faint)', textTransform:'uppercase', letterSpacing:1, margin:'0 0 6px' }}>what is</p>
                      <p style={{ fontSize:'0.88rem', fontWeight:700, color:'var(--w-text-main)', lineHeight:1.3, margin:0 }}>{quizQ.term}</p>
                    </div>
                    {/* Options */}
                    <div style={{ display:'flex', flexDirection:'column', gap:5, flex:1 }}>
                      {quizQ.options.map((opt, i) => {
                        const isCorrect = i === quizQ.correctIdx;
                        const isSelected = quizSelected === i;
                        const answered = quizSelected !== null;
                        let bg = 'rgba(255,255,255,0.03)';
                        let borderC = 'rgba(255,255,255,0.08)';
                        let textColor = 'var(--w-text-dim)';
                        if (answered && isCorrect) { bg = 'rgba(34,197,94,0.15)'; borderC = 'rgba(34,197,94,0.5)'; textColor = '#86efac'; }
                        else if (answered && isSelected) { bg = 'rgba(239,68,68,0.15)'; borderC = 'rgba(239,68,68,0.5)'; textColor = '#fca5a5'; }
                        return (
                          <button key={i} onClick={() => answerQuiz(i)} disabled={answered}
                            style={{
                              flex:1, display:'flex', alignItems:'center', gap:8,
                              background:bg, border:`1px solid ${borderC}`,
                              borderRadius:10, padding:'7px 10px',
                              cursor: answered ? 'default' : 'pointer',
                              textAlign:'left', transition:'background 0.2s, border-color 0.2s',
                            }}>
                            <span style={{ fontSize:'0.6rem', fontFamily:'monospace', fontWeight:800, color: answered && isCorrect ? '#86efac' : answered && isSelected ? '#fca5a5' : color, minWidth:14, flexShrink:0 }}>
                              {String.fromCharCode(65+i)}
                            </span>
                            <span style={{ fontSize:'0.62rem', lineHeight:1.4, color:textColor }}>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Next button */}
                    {quizSelected !== null && (
                      <button onClick={nextQuizQ}
                        style={{ background:color, color:'#fff', border:'none', borderRadius:10, padding:'7px', cursor:'pointer', fontSize:'0.65rem', fontWeight:700, fontFamily:'monospace', boxShadow:`0 2px 8px ${glow}`, flexShrink:0 }}>
                        {quizIdx + 1 >= quiz.length ? 'See Results →' : 'Next Question →'}
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* ── SONG (animated music video) ── */}
            {tab === 'song' && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:0, position:'relative', overflow:'hidden' }}>
                {/* Animated background glow */}
                <div style={{
                  position:'absolute', inset:0, borderRadius:10, zIndex:0, pointerEvents:'none',
                  background: speaking ? `radial-gradient(ellipse at 50% 70%, ${color}28 0%, transparent 75%)` : 'transparent',
                  animation: speaking ? 'song-pulse 2.2s ease-in-out infinite' : 'none',
                  transition:'background 0.5s',
                }} />
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, zIndex:1, paddingBottom:8 }}>
                  <span style={{ fontSize:'0.58rem', fontFamily:'monospace', letterSpacing:1, textTransform:'uppercase', color: speaking ? color : 'var(--w-text-faint)' }}>
                    {speaking ? '🎵 now playing' : '🎵 study anthem'}
                  </span>
                  <button onClick={speakLyrics} style={{
                    background: speaking ? `${color}25` : 'rgba(255,255,255,0.04)',
                    border:`1px solid ${speaking ? color+'50' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius:8, padding:'4px 10px', cursor:'pointer',
                    color: speaking ? color : 'var(--w-text-dim)',
                    display:'flex', alignItems:'center', gap:4,
                    fontSize:'0.6rem', fontFamily:'monospace', fontWeight:700,
                  }}>
                    <Volume2 size={10} /> {speaking ? '■ Stop' : '▶ Play'}
                  </button>
                </div>
                {/* Lyric scroll */}
                <div style={{ flex:1, overflowY:'auto', zIndex:1, padding:'2px 0' }}>
                  {lyrics.split('\n').map((line, i) => {
                    const isActive = speaking && lyricLine === i;
                    const isHeader = line.startsWith('[') || line.startsWith('🎵');
                    return (
                      <p key={i} style={{
                        margin:'1px 0', padding:'2px 6px', borderRadius:5,
                        fontSize: isActive ? '0.74rem' : '0.62rem',
                        fontWeight: isActive ? 800 : isHeader ? 600 : 400,
                        color: isActive ? 'var(--w-text-main)' : isHeader ? color : 'var(--w-text-dim)',
                        background: isActive ? `${color}22` : 'transparent',
                        fontFamily:'monospace', lineHeight:1.65,
                        transition:'font-size 0.2s, background 0.2s, color 0.2s',
                        textAlign: isHeader ? 'center' : 'left',
                        textShadow: isActive ? `0 0 12px ${glow}` : 'none',
                      }}>{line || ' '}</p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── VIDEO (AI animated study presentation) ── */}
            {tab === 'video' && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:8 }}>
                {videoState === 'idle' && videoSlide === 0 ? (
                  /* Start screen */
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
                    <span style={{ fontSize:'2.5rem' }}>🎬</span>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--w-text-main)', margin:'0 0 4px', fontFamily:'monospace' }}>{exam.toUpperCase()}</p>
                      <p style={{ fontSize:'0.6rem', color:'var(--w-text-dim)', margin:0 }}>AI-narrated study overview · {cards.length} key concepts</p>
                    </div>
                    <button onClick={startVideo} style={{
                      background:color, color:'#fff', border:'none', borderRadius:12,
                      padding:'10px 28px', cursor:'pointer', fontSize:'0.72rem',
                      fontWeight:800, fontFamily:'monospace', letterSpacing:1,
                      boxShadow:`0 4px 18px ${glow}`,
                      display:'flex', alignItems:'center', gap:8,
                    }}>
                      <Video size={14} /> Start Presentation
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Progress bar */}
                    <div style={{ height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, flexShrink:0 }}>
                      <div style={{ width:`${videoProgress*100}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.1s linear' }} />
                    </div>
                    {/* Slide area */}
                    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:0, overflow:'hidden' }}>
                      {(() => {
                        const n = cards.length;
                        if (videoSlide === 0) {
                          return (
                            <div key="intro" className="anim-fade-slide-in" style={{ textAlign:'center', padding:'0 12px' }}>
                              <span style={{ fontSize:'2rem' }}>📚</span>
                              <p style={{ fontSize:'1rem', fontWeight:800, color:'var(--w-text-main)', fontFamily:'monospace', margin:'10px 0 4px' }}>{exam.toUpperCase()}</p>
                              <p style={{ fontSize:'0.62rem', color:'var(--w-text-dim)', margin:'0 0 12px' }}>Comprehensive Study Overview</p>
                              <div style={{ padding:'5px 14px', background:`${color}18`, border:`1px solid ${color}35`, borderRadius:20, display:'inline-block' }}>
                                <span style={{ fontSize:'0.58rem', color, fontFamily:'monospace' }}>▶ Narrated · {n} key concepts</span>
                              </div>
                            </div>
                          );
                        } else if (videoSlide > n) {
                          return (
                            <div key="outro" className="anim-fade-slide-in" style={{ textAlign:'center', padding:'0 12px' }}>
                              <span style={{ fontSize:'2.5rem' }}>🎓</span>
                              <p style={{ fontSize:'1rem', fontWeight:800, color, fontFamily:'monospace', margin:'10px 0 4px' }}>Study Complete!</p>
                              <p style={{ fontSize:'0.65rem', color:'var(--w-text-dim)', margin:'0 0 12px' }}>You covered {n} key terms for {exam}</p>
                              <p style={{ fontSize:'0.58rem', color:'var(--w-text-faint)', margin:0 }}>Switch to Cards or Quiz to reinforce your knowledge.</p>
                              <button onClick={() => { setVideoSlide(0); setVideoProgress(0); }} style={{
                                marginTop:14, background:`${color}18`, border:`1px solid ${color}35`, borderRadius:10,
                                padding:'6px 18px', cursor:'pointer', color, fontSize:'0.6rem', fontFamily:'monospace', fontWeight:700,
                              }}>Watch Again</button>
                            </div>
                          );
                        } else {
                          const slideCard = cards[videoSlide - 1];
                          return (
                            <div key={videoSlide} className="anim-fade-slide-in" style={{ width:'100%', padding:'0 6px', display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
                              <span style={{
                                fontSize:'0.5rem', fontFamily:'monospace', letterSpacing:2, textTransform:'uppercase',
                                padding:'3px 12px', background:`${color}18`, border:`1px solid ${color}35`, borderRadius:20, color,
                              }}>{slideCard.category}</span>
                              <p style={{ fontSize:'0.95rem', fontWeight:800, color:'var(--w-text-main)', fontFamily:'monospace', textAlign:'center', lineHeight:1.3, margin:0 }}>{slideCard.term}</p>
                              <p style={{ fontSize:'0.65rem', color:'var(--w-text-dim)', textAlign:'center', lineHeight:1.65, margin:0 }}>{slideCard.def}</p>
                              <span style={{ fontSize:'0.5rem', color:'var(--w-text-faint)', fontFamily:'monospace', marginTop:4 }}>{videoSlide} / {n}</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    {/* Dot navigation */}
                    <div style={{ display:'flex', gap:4, justifyContent:'center', flexWrap:'wrap', flexShrink:0 }}>
                      {Array.from({ length: Math.min(cards.length + 2, 14) }, (_, i) => (
                        <div key={i} style={{
                          width:5, height:5, borderRadius:'50%',
                          background: videoSlide === i ? color : 'rgba(255,255,255,0.15)',
                          transition:'background 0.25s',
                        }} />
                      ))}
                    </div>
                    {/* Playback controls */}
                    {videoState !== 'idle' && (
                      <div style={{ display:'flex', gap:8, justifyContent:'center', flexShrink:0 }}>
                        <button onClick={toggleVideoPause} style={{
                          background:`${color}20`, border:`1px solid ${color}45`, borderRadius:10,
                          padding:'6px 20px', cursor:'pointer', color, fontSize:'0.62rem', fontFamily:'monospace', fontWeight:800,
                        }}>
                          {videoState === 'playing' ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button onClick={stopVideo} style={{
                          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10,
                          padding:'6px 14px', cursor:'pointer', color:'var(--w-text-dim)', fontSize:'0.62rem', fontFamily:'monospace',
                        }}>
                          ■ Stop
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 pb-4">
          <span style={{ fontSize:'2.5rem' }}>📚</span>
          <p style={{ color:'var(--w-text-dim)', fontSize:'0.75rem', textAlign:'center', lineHeight:1.6 }}>
            Type your exam or subject above.<br/>
            Flash cards, quiz, a study song, and video will generate instantly.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
            {CHIPS.map(ex => (
              <button key={ex} onClick={() => { setQuery(ex); loadExam(ex); }}
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

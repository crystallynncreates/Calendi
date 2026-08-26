import React, { useState, useEffect } from 'react';
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
};

const CHIPS = ['Network+','NCLEX','CCNA','Security+','A+','MCAT','GRE','LSAT','AWS','CISSP','Azure','PMP','LPN','CNA','USMLE',
  '1st Grade Words','2nd Grade Words','3rd Grade Words','Algebra','Geometry','Biology','Chemistry','Physics',
  'U.S. History','Anatomy','Pharmacology','Discrete Math','Midwifery','Spanish','Psychology','Economics'];

function matchExam(query: string): FlashCard[] {
  const q = query.toLowerCase().trim();
  for (const [key, cards] of Object.entries(VOCAB_BANKS)) {
    if (q.includes(key) || key.includes(q.split(/\s+/)[0])) return cards;
  }
  /* Grade-level sight words */
  if (/1st.*(grade|word|sight)|kindergarten|kinder|grade 1/.test(q)) return VOCAB_BANKS['sight-words-1'];
  if (/2nd.*(grade|word|sight)|grade 2/.test(q)) return VOCAB_BANKS['sight-words-2'];
  if (/3rd.*(grade|word|sight)|4th|5th|grade [345]/.test(q)) return VOCAB_BANKS['sight-words-3'];
  if (/sight.word|dolch|fry.word/.test(q)) return VOCAB_BANKS['sight-words-1'];
  /* K-12 math */
  if (/alg(ebra)?|linear equat|quadratic|polynomial|variable|slope/.test(q)) return VOCAB_BANKS['algebra'];
  if (/geo(metry)?|triangle|pythagor|angle|polygon|circle area/.test(q)) return VOCAB_BANKS['geometry'];
  /* K-12 sciences */
  if (/bio(logy)?|cell|evolut|ecosystem|photosyn|mitosis/.test(q)) return VOCAB_BANKS['biology'];
  if (/chem(istry)?|periodic|element|atom|molecule|bond/.test(q)) return VOCAB_BANKS['chemistry'];
  if (/physics|force|newton|motion|energy|wave|momentum/.test(q)) return VOCAB_BANKS['physics'];
  /* Social studies */
  if (/us.hist|american.hist|civil.war|revolution|constitution/.test(q)) return VOCAB_BANKS['us-history'];
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
  if (/cissp|isc2|certified info sys/.test(q)) return VOCAB_BANKS['cissp'];
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
  const [videoSearch, setVideoSearch] = useState('');
  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);

  function loadExam(q: string) {
    const matched = matchExam(q);
    setExam(q);
    setCards(matched);
    setLyrics(generateLyrics(q, matched));
    setVideoSearch(q + ' study guide exam prep');
    setCardIdx(0);
    setFlipped(false);
    setTab('cards');
  }

  function start() {
    const q = query.trim();
    if (!q) return;
    loadExam(q);
  }

  function nextCard() { setCardIdx(i => (i + 1) % cards.length); setFlipped(false); }
  function prevCard() { setCardIdx(i => (i - 1 + cards.length) % cards.length); setFlipped(false); }

  function speakLyrics() {
    if (!lyrics || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(lyrics.replace(/🎵|🎓|🎶/g, ''));
    utt.rate = 1.1; utt.pitch = 1.1;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
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

  useEffect(() => {
    if (cards.length > 0) {
      setQuiz(buildQuiz(cards));
      setQuizIdx(0);
      setQuizSelected(null);
      setQuizScore(0);
      setQuizStreak(0);
    }
  }, [cards]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

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
                color: tab===t ? '#fff' : 'rgba(226,232,240,0.4)',
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
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)' }}>
                    {exam.toUpperCase()} — {card.category}
                  </span>
                  <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.4)' }}>
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
                      <span style={{ fontSize:'0.55rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)', marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>term</span>
                      <p style={{ fontSize:'1rem', fontWeight:700, color:'#E2E8F0', lineHeight:1.3, margin:0 }}>{card.term}</p>
                      <p style={{ fontSize:'0.6rem', color:'rgba(226,232,240,0.25)', marginTop:12, margin:'12px 0 0' }}>tap to flip</p>
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
                      <p style={{ fontSize:'0.72rem', color:'rgba(226,232,240,0.85)', lineHeight:1.5, margin:0 }}>{card.def}</p>
                    </div>
                  </div>
                </div>
                {/* Navigation */}
                <div style={{ display:'flex', gap:8, justifyContent:'center', flexShrink:0 }}>
                  <button onClick={prevCard} style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:8, padding:'5px 12px', cursor:'pointer', color }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => { setCardIdx(Math.floor(Math.random()*cards.length)); setFlipped(false); }}
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'5px 10px', cursor:'pointer', color:'rgba(226,232,240,0.5)' }}>
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
                      <p style={{ fontSize:'0.65rem', color:'rgba(226,232,240,0.5)', marginTop:6, margin:'6px 0 0' }}>{pct}% correct — Grade <strong style={{ color }}>{grade}</strong></p>
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
                      <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)' }}>
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
                      <p style={{ fontSize:'0.52rem', fontFamily:'monospace', color:'rgba(226,232,240,0.3)', textTransform:'uppercase', letterSpacing:1, margin:'0 0 6px' }}>what is</p>
                      <p style={{ fontSize:'0.88rem', fontWeight:700, color:'#E2E8F0', lineHeight:1.3, margin:0 }}>{quizQ.term}</p>
                    </div>
                    {/* Options */}
                    <div style={{ display:'flex', flexDirection:'column', gap:5, flex:1 }}>
                      {quizQ.options.map((opt, i) => {
                        const isCorrect = i === quizQ.correctIdx;
                        const isSelected = quizSelected === i;
                        const answered = quizSelected !== null;
                        let bg = 'rgba(255,255,255,0.03)';
                        let borderC = 'rgba(255,255,255,0.08)';
                        let textColor = 'rgba(226,232,240,0.75)';
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

            {/* ── SONG ── */}
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

            {/* ── VIDEO ── */}
            {tab === 'video' && (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:10 }}>
                <span style={{ fontSize:'0.6rem', fontFamily:'monospace', color:'var(--w-text-faint)', textTransform:'uppercase', letterSpacing:1 }}>📹 study video</span>
                {videoSearch ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[
                      { label:`${exam} study guide`, icon:'📖' },
                      { label:`${exam} explained for beginners`, icon:'🎓' },
                      { label:`${exam} practice questions`, icon:'✏️' },
                      { label:`${exam} cheat sheet review`, icon:'📋' },
                    ].map(({ label, icon }) => (
                      <button key={label} onClick={() => setActiveApp({
                        id: 'youtube', name: 'YouTube', emoji: 'Y', color: '#FF0000',
                        bgColor: 'rgba(255,0,0,0.1)', borderColor: 'rgba(255,0,0,0.3)',
                        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(label)}`,
                        canEmbed: false,
                      })} style={{
                        display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                        borderRadius:12, border:`1px solid ${color}25`, background:`${color}10`,
                        cursor:'pointer', textAlign:'left', width:'100%',
                      }}>
                        <span style={{ fontSize:'1.2rem' }}>{icon}</span>
                        <div>
                          <p style={{ fontSize:'0.62rem', fontWeight:700, color:'var(--w-text-main)', margin:'0 0 2px', fontFamily:'monospace' }}>{label}</p>
                          <p style={{ fontSize:'0.5rem', color:'var(--w-text-faint)', margin:0 }}>Opens in YouTube →</p>
                        </div>
                      </button>
                    ))}
                    <button onClick={() => setActiveApp({
                      id:'youtube', name:'YouTube', emoji:'Y', color:'#FF0000',
                      bgColor:'rgba(255,0,0,0.1)', borderColor:'rgba(255,0,0,0.3)',
                      url:`https://www.youtube.com/results?search_query=${encodeURIComponent(exam + ' study song vocabulary')}`,
                      canEmbed:false,
                    })} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                      borderRadius:12, border:`1px solid ${color}40`, background:`${color}20`,
                      cursor:'pointer', textAlign:'left', width:'100%',
                    }}>
                      <span style={{ fontSize:'1.2rem' }}>🎵</span>
                      <div>
                        <p style={{ fontSize:'0.62rem', fontWeight:700, color, margin:'0 0 2px', fontFamily:'monospace' }}>{exam} study song &amp; vocabulary</p>
                        <p style={{ fontSize:'0.5rem', color:'var(--w-text-faint)', margin:0 }}>Opens in YouTube →</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--w-text-faint)', fontSize:'0.75rem' }}>
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

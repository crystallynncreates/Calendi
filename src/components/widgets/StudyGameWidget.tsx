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
};

const CHIPS = ['Network+','NCLEX','CCNA','Security+','A+','MCAT','GRE','LSAT','AWS','CISSP','Azure','PMP','LPN','CNA','USMLE'];

function matchExam(query: string): FlashCard[] {
  const q = query.toLowerCase().trim();
  for (const [key, cards] of Object.entries(VOCAB_BANKS)) {
    if (q.includes(key) || key.includes(q.split(/\s+/)[0])) return cards;
  }
  if (/lpn|practical nurse|lvn/.test(q)) return VOCAB_BANKS['lpn'];
  if (/cna|nursing assistant|aide/.test(q)) return VOCAB_BANKS['cna'];
  if (/usmle|step 1|step1|medical board|usmle/.test(q)) return VOCAB_BANKS['usmle'];
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
  const terms = cards.slice(0, 12).map(c => c.term);
  const cats = [...new Set(cards.map(c => c.category))].slice(0, 4);
  return `🎵 "${exam.toUpperCase()} STUDY ANTHEM" 🎵

[Verse 1]
Sit down, open up your books and let's get in the zone,
${terms[0]} and ${terms[1]}, yeah I'll make it my own,
${terms[2]} on the left, and ${terms[3]} on the right,
Study hard every day and we'll ace it tonight!

[Chorus]
Oh-oh-oh, I know my ${cats[0]},
Oh-oh-oh, I learned my ${cats[1] || cats[0]},
Every term, every fact, locked into my brain,
Flash cards in my hand, gonna ace this exam!

[Verse 2]
${terms[4]} is fundamental, gotta understand the flow,
${terms[5]} connects the dots everywhere that we go,
${terms[6]} and ${terms[7]}, they all play a part,
${terms[8]}? I know it all — it's already in my heart!

[Bridge]
${cats[2] || 'Concepts'} concepts, line by line,
${cats[3] || 'Skills'} and skills, gonna shine,
${terms[9] || terms[0]} — I define it every time,
${terms[10] || terms[1]} — the answer is all mine!

[Outro]
Study smart, not just hard — you've got this today,
${exam.toUpperCase()} — I'm ready, I'll pass, no delay! 🎓`;
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
  const videoSrc = videoSearch
    ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoSearch + ' tutorial')}`
    : '';
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
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize:'1.1rem' }}>🧠</span>
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color:'rgba(226,232,240,0.3)' }}>study game</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); start(); }} style={{ display:'flex', gap:6 }}>
          <input
            className="input-dark flex-1 !py-1.5 text-xs"
            placeholder="NCLEX, AWS, MCAT, LSAT, PMP…"
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

import { useId } from 'react';

type P = { size?: number };
function W({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      {children}
    </svg>
  );
}

// ── Netflix ──────────────────────────────────────────────────────────────────
export function NetflixLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="8" fill="#141414"/>
      {/* Left vertical bar */}
      <rect x="7" y="6" width="10" height="36" fill="#E50914"/>
      {/* Right vertical bar */}
      <rect x="31" y="6" width="10" height="36" fill="#E50914"/>
      {/* Diagonal stripe: top of left bar → bottom of right bar, width 10 */}
      <polygon points="17,6 27,6 31,42 21,42" fill="#E50914"/>
    </W>
  );
}

// ── YouTube ──────────────────────────────────────────────────────────────────
export function YouTubeLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect x="3" y="10" width="42" height="28" rx="9" fill="#FF0000"/>
      <polygon points="18,16 18,32 34,24" fill="white"/>
    </W>
  );
}

// ── Disney+ ──────────────────────────────────────────────────────────────────
export function DisneyPlusLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="#040E36"/>
      {/* D outer shape */}
      <path d="M6 12 L6 36 L14 36 Q27 36 27 24 Q27 12 14 12 Z" fill="white"/>
      {/* D inner cutout */}
      <path d="M10.5 16 L10.5 32 L13.5 32 Q22.5 32 22.5 24 Q22.5 16 13.5 16 Z" fill="#040E36"/>
      {/* Plus — horizontal */}
      <rect x="30" y="22" width="11" height="3.5" rx="1.75" fill="#5BC8F0"/>
      {/* Plus — vertical */}
      <rect x="34.25" y="17" width="3.5" height="13" rx="1.75" fill="#5BC8F0"/>
    </W>
  );
}

// ── Amazon Prime Video ────────────────────────────────────────────────────────
export function PrimeLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="#00A8E0"/>
      <polygon points="14,14 14,34 36,24" fill="white"/>
      {/* Orange "smile" underline — Prime's signature */}
      <path d="M13 38 Q24 44 35 38" stroke="#FF9900" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </W>
  );
}

// ── Facebook ─────────────────────────────────────────────────────────────────
export function FacebookLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="#1877F2"/>
      {/* f letterform */}
      <path d="M27 10 L24 10 C20.1 10 17 13.1 17 17 L17 21 L13 21 L13 27 L17 27 L17 40 L23 40 L23 27 L27.5 27 L28.5 21 L23 21 L23 17 C23 16.4 23.4 16 24 16 L27 16 Z" fill="white"/>
    </W>
  );
}

// ── Instagram ─────────────────────────────────────────────────────────────────
export function InstagramLogo({ size = 32 }: P) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gid = `ig${uid}`;
  return (
    <W size={size}>
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#FED373"/>
          <stop offset="25%"  stopColor="#F15245"/>
          <stop offset="60%"  stopColor="#D92E7F"/>
          <stop offset="100%" stopColor="#515BD4"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gid})`}/>
      {/* Camera body */}
      <rect x="10" y="13" width="28" height="22" rx="6" stroke="white" strokeWidth="2.5"/>
      {/* Camera lens */}
      <circle cx="24" cy="24" r="6.5" stroke="white" strokeWidth="2.5"/>
      {/* Flash dot */}
      <circle cx="35.5" cy="14.5" r="2.5" fill="white"/>
    </W>
  );
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
export function WhatsAppLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="12" fill="#25D366"/>
      {/* Speech bubble teardrop */}
      <path d="M24 9 C15.7 9 9 15.7 9 24 C9 26.9 9.8 29.6 11.2 32 L9 39 L16.2 36.9 C18.4 38.2 21 39 24 39 C32.3 39 39 32.3 39 24 C39 15.7 32.3 9 24 9 Z" fill="white"/>
      {/* Phone handset — earpiece, handle, mouthpiece */}
      <circle cx="20.5" cy="20.5" r="3.5" fill="#25D366"/>
      <circle cx="28"   cy="29"   r="3.5" fill="#25D366"/>
      <path d="M20.5 20.5 Q18 26.5 28 29" stroke="#25D366" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
    </W>
  );
}

// ── Google ────────────────────────────────────────────────────────────────────
// Colored arc segments form the G shape; all arcs are CCW (sweep=0), short (<180°).
// Center (24,24), radius 13. Gap at ~±30° from 3-o'clock (right).
// Upper gap: (35.3, 17.5) ≈ 2 o'clock | Lower gap: (35.3, 30.5) ≈ 4 o'clock
// Arc order CCW: 2→12(blue) 12→9(red) 9→6(yellow) 6→4(green)
export function GoogleLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="white" stroke="#E8EAED" strokeWidth="1"/>
      {/* Blue  : 2 o'clock → 12 o'clock */}
      <path d="M35.3 17.5 A13 13 0 0 0 24 11"    stroke="#4285F4" strokeWidth="7" strokeLinecap="butt" fill="none"/>
      {/* Red   : 12 o'clock → 9 o'clock */}
      <path d="M24 11    A13 13 0 0 0 11 24"    stroke="#EA4335" strokeWidth="7" strokeLinecap="butt" fill="none"/>
      {/* Yellow: 9 o'clock → 6 o'clock */}
      <path d="M11 24    A13 13 0 0 0 24 37"    stroke="#FBBC04" strokeWidth="7" strokeLinecap="butt" fill="none"/>
      {/* Green : 6 o'clock → 4 o'clock */}
      <path d="M24 37    A13 13 0 0 0 35.3 30.5" stroke="#34A853" strokeWidth="7" strokeLinecap="butt" fill="none"/>
      {/* Blue L-shape: vertical right-edge of gap + horizontal crossbar */}
      <path d="M35.3 17.5 L35.3 24 L26 24" stroke="#4285F4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </W>
  );
}

// ── Google Maps ───────────────────────────────────────────────────────────────
export function GoogleMapsLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="white" stroke="#E8EAED" strokeWidth="1"/>
      {/* Teardrop pin body */}
      <path d="M24 8 C18.5 8 14 12.5 14 18 C14 27 24 40 24 40 C24 40 34 27 34 18 C34 12.5 29.5 8 24 8 Z" fill="#EA4335"/>
      {/* White inner dot */}
      <circle cx="24" cy="18" r="5.5" fill="white"/>
      {/* Subtle drop shadow */}
      <ellipse cx="24" cy="40" rx="5" ry="2" fill="rgba(0,0,0,0.1)"/>
    </W>
  );
}

// ── Zoom ──────────────────────────────────────────────────────────────────────
export function ZoomLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="#2D8CFF"/>
      {/* Camera body */}
      <rect x="7" y="15" width="22" height="18" rx="5" fill="white"/>
      {/* Camera viewfinder chevron */}
      <polygon points="29,18 41,12 41,36 29,30" fill="white"/>
    </W>
  );
}

// ── Google Meet ───────────────────────────────────────────────────────────────
export function GoogleMeetLogo({ size = 32 }: P) {
  return (
    <W size={size}>
      <rect width="48" height="48" rx="10" fill="white" stroke="#E8EAED" strokeWidth="1"/>
      {/* Main camera body — teal/green */}
      <rect x="7" y="15" width="22" height="18" rx="5" fill="#00897B"/>
      {/* Upper chevron — lighter teal */}
      <polygon points="29,18 41,12 41,28 29,28" fill="#00BFA5"/>
      {/* Lower chevron — green */}
      <polygon points="29,28 41,28 41,36 29,30" fill="#4CAF50"/>
      {/* Meet red badge (accent dot) */}
      <circle cx="40" cy="37" r="5" fill="#EA4335"/>
    </W>
  );
}

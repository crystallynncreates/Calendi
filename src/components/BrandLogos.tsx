type P = { size?: number };

function BrandImg({ src, alt, size }: { src: string; alt: string; size: number }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }}
    />
  );
}

export function NetflixLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/netflix.svg" alt="Netflix" size={size} />;
}

export function YouTubeLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/youtube.svg" alt="YouTube" size={size} />;
}

export function DisneyPlusLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/disneyplus.svg" alt="Disney+" size={size} />;
}

export function PrimeLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/prime.svg" alt="Prime Video" size={size} />;
}

export function FacebookLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/facebook.svg" alt="Facebook" size={size} />;
}

export function InstagramLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/instagram.svg" alt="Instagram" size={size} />;
}

export function WhatsAppLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/whatsapp.svg" alt="WhatsApp" size={size} />;
}

export function GoogleLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/google.svg" alt="Google" size={size} />;
}

export function GoogleMapsLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/maps.svg" alt="Google Maps" size={size} />;
}

export function ZoomLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/zoom.svg" alt="Zoom" size={size} />;
}

export function GoogleMeetLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/meet.svg" alt="Google Meet" size={size} />;
}

export function ChromeLogo({ size = 32 }: P) {
  return <BrandImg src="/logos/chrome.svg" alt="Google Chrome" size={size} />;
}

/* ── Inline SVG logos for services without /public/logos files ── */

export function TikTokLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#010101"/>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.05-7.91a8.12 8.12 0 004.77 1.52V5.46a4.85 4.85 0 01-1-.77z" fill="white"/>
    </svg>
  );
}

export function XLogo({ size = 26 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#000"/>
      <path d="M18.244 4.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 4.25H8.08l4.262 5.632L18.244 4.25zm-1.161 17.52h1.833L7.084 6.126H5.117z" fill="white"/>
    </svg>
  );
}

export function HuluLogo({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 32" fill="none">
      <rect width="64" height="32" rx="4" fill="#1CE783"/>
      <text x="8" y="23" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="bold" fill="#000">hulu</text>
    </svg>
  );
}

export function PeacockLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#F5A623"/>
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial">🦚</text>
    </svg>
  );
}

export function GmailLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" stroke="#ddd" strokeWidth="0.5"/>
      <path d="M2 7l10 7 10-7" stroke="none" fill="none"/>
      <path d="M2 7l10 6.5L22 7" fill="none" stroke="#EA4335" strokeWidth="1.5"/>
      <path d="M2 7v10h4V11l6 4 6-4v6h4V7" fill="#EA4335"/>
      <path d="M6 11v6H2V7l4 4z" fill="#C5221F"/>
      <path d="M18 11v6h4V7l-4 4z" fill="#C5221F"/>
      <path d="M2 7l4 4 6-4-6-2.5L2 7z" fill="#FBBC04"/>
      <path d="M22 7l-4 4-6-4 6-2.5L22 7z" fill="#34A853"/>
      <rect x="2" y="5" width="20" height="14" rx="2" fill="none"/>
    </svg>
  );
}

export function OutlookLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#0078D4"/>
      <rect x="3" y="6" width="11" height="12" rx="2" fill="#fff" opacity="0.9"/>
      <text x="8.5" y="14.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0078D4" fontFamily="Arial">O</text>
      <rect x="14" y="9" width="7" height="6" rx="1" fill="#fff" opacity="0.6"/>
    </svg>
  );
}

export function TeamsLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#6264A7"/>
      <circle cx="15" cy="8" r="3" fill="#fff" opacity="0.9"/>
      <rect x="10" y="13" width="9" height="6" rx="2" fill="#fff" opacity="0.9"/>
      <circle cx="8" cy="10" r="2.5" fill="#BDBDE8"/>
      <rect x="3" y="14" width="7" height="5" rx="2" fill="#BDBDE8"/>
    </svg>
  );
}

export function CanvasLMSLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#E66000"/>
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial">C</text>
      <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </svg>
  );
}

export function StarbucksLogo({ size = 30 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="15" fill="#00704A"/>
      <circle cx="15" cy="15" r="10" fill="none" stroke="white" strokeWidth="0.8"/>
      <text x="15" y="19" textAnchor="middle" fontSize="11" fill="white" fontFamily="Arial" fontWeight="bold">☕</text>
    </svg>
  );
}

export function DunkinLogo({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 28" fill="none">
      <text x="2" y="20" fontFamily="Arial Black,sans-serif" fontSize="16" fontWeight="900" fill="#FF671F">Dunkin'</text>
    </svg>
  );
}

export function UberEatsLogo({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 32" fill="none">
      <text x="2" y="14" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#142328">Uber</text>
      <text x="2" y="28" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="700" fill="#06C167">Eats</text>
    </svg>
  );
}

export function ShopRiteLogo({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 24" fill="none">
      <text x="0" y="17" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="900" fill="#CC0000">ShopRite</text>
    </svg>
  );
}

export function PlayhopLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#FF5C5C"/>
      <polygon points="9,7 19,12 9,17" fill="white"/>
    </svg>
  );
}

export function MessagesLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="12" fill="#4CAF50"/>
      <rect x="4" y="7" width="16" height="11" rx="3" fill="white" opacity="0.9"/>
      <path d="M8 18l2-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function KrunkerLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#1a1a2e"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke="#F59E0B" strokeWidth="2"/>
      <line x1="12" y1="3" x2="12" y2="7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="7" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      <line x1="17" y1="12" x2="21" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function ChessLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#2d2d2d"/>
      <text x="12" y="18" textAnchor="middle" fontSize="16" fill="white" fontFamily="serif">♞</text>
    </svg>
  );
}

export function BackgammonLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#8B5CF6"/>
      <text x="12" y="17" textAnchor="middle" fontSize="14" fill="white">🎲</text>
    </svg>
  );
}

export function Game2048Logo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#FF7043"/>
      <text x="12" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial">2048</text>
    </svg>
  );
}

export function JigsawLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#7C3AED"/>
      <text x="12" y="17" textAnchor="middle" fontSize="13" fill="white">🧩</text>
    </svg>
  );
}

export function WordleLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#6AAA64"/>
      <rect x="4" y="8" width="5" height="5" rx="1" fill="white"/>
      <rect x="10" y="8" width="5" height="5" rx="1" fill="#C9B458"/>
      <rect x="16" y="8" width="5" height="5" rx="1" fill="#787C7E"/>
      <rect x="4" y="14" width="5" height="5" rx="1" fill="#787C7E"/>
      <rect x="10" y="14" width="5" height="5" rx="1" fill="#6AAA64"/>
    </svg>
  );
}

export function SpellingBeeLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#F5C518"/>
      <text x="12" y="17" textAnchor="middle" fontSize="13" fill="black">🐝</text>
    </svg>
  );
}

export function SolitaireLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#E91E63"/>
      <text x="12" y="17" textAnchor="middle" fontSize="14" fill="white">🃏</text>
    </svg>
  );
}

export function SudokuLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#7B68EE"/>
      <text x="12" y="17" textAnchor="middle" fontSize="14" fill="white">🔢</text>
    </svg>
  );
}

export function JstrisLogo({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#00BCD4"/>
      <rect x="5" y="10" width="4" height="4" rx="1" fill="white"/>
      <rect x="10" y="10" width="4" height="4" rx="1" fill="white"/>
      <rect x="10" y="15" width="4" height="4" rx="1" fill="white" opacity="0.7"/>
      <rect x="15" y="10" width="4" height="4" rx="1" fill="white" opacity="0.5"/>
    </svg>
  );
}

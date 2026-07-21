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

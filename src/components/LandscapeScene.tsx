interface Props { scene: string }

export default function LandscapeScene({ scene }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {scene === 'aurora'         && <AuroraScene />}
      {scene === 'sunset'         && <SunsetScene />}
      {scene === 'night-sky'      && <NightSkyScene />}
      {scene === 'deep-ocean'     && <DeepOceanScene />}
      {scene === 'galaxy'         && <GalaxyScene />}
      {scene === 'forest'         && <ForestScene />}
      {scene === 'desert'         && <DesertScene />}
      {scene === 'mountain'       && <MountainScene />}
      {scene === 'cherry-blossom' && <CherryBlossomScene />}
      {scene === 'winter-snow'    && <WinterSnowScene />}
      {scene === 'tropical-beach' && <TropicalBeachScene />}
      {scene === 'rainy-night'    && <RainyNightScene />}
      {scene === 'fireflies'      && <FirefliesScene />}
    </div>
  );
}

function AuroraScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #020b14 0%, #041a2e 50%, #061a18 100%)' }}>
      {/* Stars */}
      {Array.from({ length: 60 }, (_, i) => (
        <div key={i} className="star" style={{
          position: 'absolute',
          left: `${(i * 37 + 13) % 100}%`,
          top: `${(i * 23 + 7) % 55}%`,
          width: i % 5 === 0 ? 2 : 1,
          height: i % 5 === 0 ? 2 : 1,
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.4 + (i % 4) * 0.15,
          animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 3}s infinite`,
        }} />
      ))}
      {/* Aurora bands */}
      <div className="aurora-band" style={{ position: 'absolute', top: '15%', left: '-10%', width: '120%', height: '25%', background: 'linear-gradient(90deg, transparent, rgba(0,255,128,0.12), rgba(0,220,180,0.18), rgba(0,255,128,0.12), transparent)', filter: 'blur(20px)', animation: 'aurora-shift 8s ease-in-out infinite' }} />
      <div className="aurora-band" style={{ position: 'absolute', top: '22%', left: '-10%', width: '120%', height: '18%', background: 'linear-gradient(90deg, transparent, rgba(120,0,255,0.08), rgba(180,0,255,0.14), rgba(120,0,255,0.08), transparent)', filter: 'blur(25px)', animation: 'aurora-shift 12s ease-in-out 2s infinite reverse' }} />
      <div className="aurora-band" style={{ position: 'absolute', top: '30%', left: '-10%', width: '120%', height: '12%', background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.07), rgba(0,240,200,0.12), rgba(0,200,255,0.07), transparent)', filter: 'blur(30px)', animation: 'aurora-shift 10s ease-in-out 4s infinite' }} />
      {/* Ground glow */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, rgba(0,40,20,0.6) 0%, transparent 100%)' }} />
    </div>
  );
}

function SunsetScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0d0028 0%, #3d0a5e 20%, #8b1a4a 40%, #c9442e 60%, #e8752e 75%, #f0a040 85%, #f5c060 100%)' }}>
      {/* Sun glow */}
      <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,150,50,0.5) 40%, transparent 70%)', filter: 'blur(8px)', animation: 'pulse-slow 4s ease-in-out infinite' }} />
      {/* Horizon shimmer */}
      <div style={{ position: 'absolute', bottom: '15%', left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255,200,80,0.6), rgba(255,220,100,0.8), rgba(255,200,80,0.6), transparent)', filter: 'blur(2px)', animation: 'shimmer 3s ease-in-out infinite' }} />
      {/* Mountain silhouettes */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '22%' }}>
        <path d="M0,200 L0,140 L80,80 L160,130 L260,60 L360,110 L480,50 L580,100 L680,40 L780,90 L900,30 L1000,85 L1120,45 L1220,95 L1340,55 L1440,100 L1440,200 Z" fill="rgba(10,5,20,0.9)" />
        <path d="M0,200 L0,160 L100,120 L200,150 L320,110 L440,140 L560,100 L660,135 L780,105 L880,130 L1000,95 L1120,125 L1240,105 L1360,130 L1440,115 L1440,200 Z" fill="rgba(6,2,15,0.95)" />
      </svg>
    </div>
  );
}

function NightSkyScene() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    x: (i * 73 + 11) % 100,
    y: (i * 41 + 7) % 85,
    size: i % 8 === 0 ? 2.5 : i % 4 === 0 ? 1.5 : 1,
    delay: (i * 0.17) % 4,
    dur: 2 + (i % 4),
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #01020a 0%, #02050f 40%, #030a18 70%, #040d20 100%)' }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: '50%', background: '#fff', opacity: 0.3, animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
      ))}
      {/* Moon */}
      <div style={{ position: 'absolute', top: '12%', right: '20%', width: 48, height: 48, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff 0%, #f0e8d0 40%, #d4c890 100%)', boxShadow: '0 0 30px rgba(240,232,200,0.4), 0 0 60px rgba(240,232,200,0.15)' }} />
      {/* Shooting star */}
      <div style={{ position: 'absolute', top: '20%', left: '60%', width: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', transform: 'rotate(-30deg)', animation: 'shooting-star 5s ease-in-out 3s infinite' }} />
      {/* Milky way band */}
      <div style={{ position: 'absolute', top: 0, left: '30%', width: '40%', height: '100%', background: 'linear-gradient(15deg, transparent, rgba(180,160,255,0.04), rgba(200,180,255,0.06), rgba(180,160,255,0.04), transparent)', filter: 'blur(20px)', transform: 'rotate(15deg)' }} />
    </div>
  );
}

function DeepOceanScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #000d1a 0%, #001828 30%, #002040 60%, #003060 100%)' }}>
      {/* Caustic light rays */}
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ position: 'absolute', top: 0, left: `${15 + i * 18}%`, width: `${4 + (i % 3) * 3}%`, height: '60%', background: `linear-gradient(180deg, rgba(0,180,255,${0.04 + i * 0.01}) 0%, transparent 100%)`, filter: 'blur(8px)', transform: `rotate(${-3 + i * 1.5}deg)`, transformOrigin: 'top center', animation: `caustic ${3 + i * 0.7}s ease-in-out ${i * 0.5}s infinite alternate` }} />
      ))}
      {/* Bubbles */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', bottom: `${(i * 17) % 30}%`, left: `${(i * 23 + 5) % 95}%`, width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, borderRadius: '50%', border: '1px solid rgba(100,200,255,0.25)', animation: `bubble-rise ${4 + (i % 4)}s ease-in ${(i * 0.4) % 4}s infinite` }} />
      ))}
      {/* Deep glow */}
      <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: '40%', height: '30%', background: 'radial-gradient(ellipse, rgba(0,150,255,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />
    </div>
  );
}

function GalaxyScene() {
  const stars = Array.from({ length: 150 }, (_, i) => ({
    x: (i * 67 + 13) % 100, y: (i * 43 + 9) % 100,
    size: i % 10 === 0 ? 3 : i % 5 === 0 ? 2 : 1,
    opacity: 0.2 + (i % 5) * 0.15,
    delay: (i * 0.13) % 5,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #050010 0%, #0a0020 30%, #080015 60%, #030010 100%)' }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: '50%', background: '#fff', opacity: s.opacity, animation: i % 4 === 0 ? `twinkle 3s ease-in-out ${s.delay}s infinite` : undefined }} />
      ))}
      {/* Nebula clouds */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '60%', height: '40%', background: 'radial-gradient(ellipse, rgba(180,0,255,0.08) 0%, rgba(100,0,200,0.05) 40%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '40%', width: '50%', height: '35%', background: 'radial-gradient(ellipse, rgba(0,100,255,0.07) 0%, rgba(100,0,255,0.05) 50%, transparent 70%)', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', top: '30%', left: '10%', width: '35%', height: '30%', background: 'radial-gradient(ellipse, rgba(255,50,150,0.05) 0%, transparent 70%)', filter: 'blur(35px)' }} />
      {/* Milky way spiral */}
      <div style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 30deg at 45% 50%, transparent 0deg, rgba(140,100,255,0.04) 30deg, transparent 90deg, rgba(80,60,200,0.03) 180deg, transparent 270deg)', filter: 'blur(20px)', animation: 'orb-drift 40s linear infinite' }} />
    </div>
  );
}

function ForestScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #050e08 0%, #081808 30%, #0a2010 60%, #0c2812 100%)' }}>
      {/* Light rays */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ position: 'absolute', top: 0, left: `${20 + i * 22}%`, width: `${3 + i * 2}%`, height: '65%', background: 'linear-gradient(180deg, rgba(180,220,100,0.06) 0%, transparent 100%)', filter: 'blur(12px)', transform: `rotate(${-5 + i * 3}deg)`, transformOrigin: 'top center', animation: `light-ray ${5 + i}s ease-in-out ${i * 1.2}s infinite alternate` }} />
      ))}
      {/* Canopy glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(180deg, rgba(60,120,40,0.15) 0%, transparent 100%)', filter: 'blur(20px)' }} />
      {/* Mist */}
      <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: '25%', background: 'linear-gradient(to top, rgba(200,220,200,0.07) 0%, transparent 100%)', filter: 'blur(15px)', animation: 'aurora-shift 12s ease-in-out infinite' }} />
      {/* Tree silhouettes */}
      <svg viewBox="0 0 1440 250" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '30%' }}>
        <path d="M0,250 L0,80 L30,40 L60,70 L80,20 L100,50 L130,10 L160,45 L190,5 L220,40 L250,0 L280,35 L310,5 L340,38 L370,2 L400,40 L440,0 L480,38 L520,5 L560,35 L600,0 L640,40 L680,8 L720,42 L760,5 L800,38 L840,2 L880,40 L920,5 L960,38 L1000,0 L1040,35 L1080,5 L1120,40 L1160,8 L1200,42 L1240,5 L1280,40 L1320,10 L1360,45 L1400,15 L1440,50 L1440,250 Z" fill="rgba(5,12,5,0.97)" />
      </svg>
    </div>
  );
}

function DesertScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0806 0%, #1a1208 15%, #3d2810 30%, #8b5820 50%, #c07830 65%, #d49040 75%, #e8b058 85%, #f0c870 100%)' }}>
      {/* Heat shimmer */}
      <div style={{ position: 'absolute', bottom: '30%', left: 0, right: 0, height: '8%', background: 'linear-gradient(90deg, transparent, rgba(255,200,100,0.08), transparent)', filter: 'blur(4px)', animation: 'shimmer 2.5s ease-in-out infinite' }} />
      {/* Sun */}
      <div style={{ position: 'absolute', top: '10%', right: '25%', width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,200,0.95) 0%, rgba(255,220,100,0.7) 40%, transparent 70%)', boxShadow: '0 0 40px rgba(255,200,50,0.5)' }} />
      {/* Dune silhouettes */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '35%' }}>
        <path d="M0,200 C100,120 200,180 400,130 C600,80 700,160 900,120 C1100,80 1200,150 1440,110 L1440,200 Z" fill="rgba(100,55,10,0.9)" />
        <path d="M0,200 C150,150 300,190 500,155 C700,120 850,175 1100,145 C1250,125 1350,165 1440,150 L1440,200 Z" fill="rgba(60,30,5,0.95)" />
      </svg>
    </div>
  );
}

function MountainScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #060810 0%, #0a0f1e 20%, #0e1628 40%, #121e35 60%, #162540 80%, #1a2c4a 100%)' }}>
      {/* Stars */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 67 + 11) % 100}%`, top: `${(i * 41 + 5) % 40}%`, width: 1, height: 1, borderRadius: '50%', background: '#fff', opacity: 0.3 + (i % 3) * 0.2, animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 3}s infinite` }} />
      ))}
      {/* Moon glow */}
      <div style={{ position: 'absolute', top: '8%', left: '15%', width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,230,255,0.9) 0%, rgba(180,200,255,0.5) 50%, transparent 75%)', boxShadow: '0 0 30px rgba(200,220,255,0.3)' }} />
      {/* Mist layers */}
      <div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '15%', background: 'linear-gradient(90deg, transparent, rgba(150,170,220,0.06), rgba(180,200,240,0.08), rgba(150,170,220,0.06), transparent)', filter: 'blur(25px)', animation: 'aurora-shift 15s ease-in-out infinite' }} />
      {/* Mountain silhouettes */}
      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '60%' }}>
        <path d="M0,300 L0,200 L120,80 L240,160 L360,60 L480,150 L600,40 L720,130 L840,50 L960,140 L1080,55 L1200,145 L1320,65 L1440,120 L1440,300 Z" fill="rgba(20,28,45,0.9)" />
        <path d="M0,300 L0,230 L100,160 L220,210 L360,150 L500,200 L640,140 L780,195 L900,155 L1040,200 L1160,160 L1300,205 L1440,170 L1440,300 Z" fill="rgba(12,18,30,0.95)" />
        <path d="M0,300 L0,260 L180,220 L360,250 L540,215 L720,245 L900,210 L1080,240 L1260,215 L1440,235 L1440,300 Z" fill="rgba(8,12,20,0.98)" />
      </svg>
    </div>
  );
}

function CherryBlossomScene() {
  const petals = Array.from({ length: 40 }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    delay: (i * 0.4) % 8,
    dur: 4 + (i % 4) * 1.5,
    size: 6 + (i % 4) * 3,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1a0a2e 0%, #3d1a4a 25%, #7a3060 50%, #c05080 70%, #f09090 85%, #f8c0b0 100%)' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 200, height: 120, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,200,200,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      {petals.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: '-20px', left: `${p.left}%`,
          width: p.size, height: p.size * 0.7,
          borderRadius: '50% 0 50% 0',
          background: `rgba(${240 + (i % 3) * 5}, ${160 + (i % 5) * 10}, ${175 + (i % 4) * 8}, 0.75)`,
          animation: `petal-fall ${p.dur}s ease-in ${p.delay}s infinite`,
          transform: `rotate(${-30 + (i % 5) * 15}deg)`,
        }} />
      ))}
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '28%' }}>
        <path d="M0,220 L0,150 Q80,80 160,140 Q200,160 240,100 Q290,30 340,100 Q380,150 420,80 Q470,10 540,90 Q600,150 660,80 Q720,20 780,90 Q840,150 900,80 Q960,10 1020,90 Q1080,150 1140,80 Q1200,20 1260,90 Q1330,160 1440,100 L1440,220 Z" fill="rgba(20,8,30,0.95)" />
      </svg>
    </div>
  );
}

function WinterSnowScene() {
  const flakes = Array.from({ length: 55 }, (_, i) => ({
    left: (i * 43 + 7) % 100,
    delay: (i * 0.25) % 7,
    dur: 5 + (i % 5) * 1.2,
    size: 2 + (i % 4),
    opacity: 0.4 + (i % 3) * 0.2,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #050818 0%, #0a1030 30%, #101840 60%, #182050 80%, #202860 100%)' }}>
      <div style={{ position: 'absolute', top: '10%', left: '60%', width: 55, height: 55, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,240,255,0.95) 0%, rgba(200,220,255,0.6) 50%, transparent 75%)', boxShadow: '0 0 40px rgba(200,220,255,0.4)' }} />
      {flakes.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', top: '-10px', left: `${f.left}%`,
          width: f.size, height: f.size, borderRadius: '50%',
          background: 'white', opacity: f.opacity,
          animation: `snow-fall ${f.dur}s linear ${f.delay}s infinite`,
        }} />
      ))}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(to top, rgba(180,210,255,0.12) 0%, transparent 100%)', filter: 'blur(10px)' }} />
    </div>
  );
}

function TropicalBeachScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a1828 0%, #0d2040 20%, #103060 40%, #1848a0 60%, #2870c8 75%, #3898e0 85%, #50c0f0 100%)' }}>
      <div style={{ position: 'absolute', top: '12%', left: '65%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,250,200,0.98) 0%, rgba(255,220,80,0.7) 50%, transparent 75%)', boxShadow: '0 0 60px rgba(255,220,80,0.5), 0 0 120px rgba(255,200,50,0.2)' }} />
      <div style={{ position: 'absolute', bottom: '38%', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,240,180,0.3), rgba(255,255,200,0.5), rgba(255,240,180,0.3), transparent)', animation: 'shimmer 4s ease-in-out infinite' }} />
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, width: '100%', height: '15%', animation: 'aurora-shift 6s ease-in-out infinite' }}>
        <path d="M0,80 C180,40 360,120 540,60 C720,0 900,100 1080,50 C1260,0 1380,80 1440,60 L1440,160 L0,160 Z" fill="rgba(32,120,200,0.5)" />
      </svg>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '22%', left: 0, right: 0, width: '100%', height: '12%', animation: 'aurora-shift 8s ease-in-out 1s infinite reverse' }}>
        <path d="M0,60 C200,20 400,80 600,40 C800,0 1000,70 1200,35 C1350,10 1420,55 1440,45 L1440,120 L0,120 Z" fill="rgba(40,140,220,0.45)" />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '25%', background: 'linear-gradient(to top, #c8a060 0%, #d4b070 40%, rgba(180,145,80,0.6) 70%, transparent 100%)' }} />
    </div>
  );
}

function RainyNightScene() {
  const drops = Array.from({ length: 50 }, (_, i) => ({
    left: (i * 53 + 7) % 100,
    delay: (i * 0.18) % 2,
    dur: 0.5 + (i % 4) * 0.15,
    height: 10 + (i % 5) * 5,
    opacity: 0.15 + (i % 4) * 0.08,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #020408 0%, #050a10 30%, #080f18 60%, #0a1220 100%)' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{ position: 'absolute', bottom: `${20 + (i % 2) * 8}%`, left: `${5 + i * 20}%`, width: `${8 + (i % 3) * 6}%`, height: '20%', background: `radial-gradient(ellipse, rgba(${i % 2 === 0 ? '255,180,60' : '100,160,255'},0.08) 0%, transparent 70%)`, filter: 'blur(20px)' }} />
      ))}
      {drops.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', top: '-20px', left: `${d.left}%`,
          width: 1, height: d.height,
          background: `rgba(160,200,240,${d.opacity})`,
          animation: `rain-fall ${d.dur}s linear ${d.delay}s infinite`,
          transform: 'rotate(15deg)',
        }} />
      ))}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(to top, rgba(30,50,80,0.6) 0%, transparent 100%)' }} />
      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '55%' }}>
        <path d="M0,300 L0,160 L60,160 L60,100 L100,100 L100,80 L120,80 L120,100 L160,100 L160,160 L200,160 L200,120 L240,120 L240,90 L260,90 L260,120 L300,120 L300,160 L360,160 L360,130 L400,130 L400,70 L430,70 L430,130 L470,130 L470,160 L530,160 L530,110 L570,110 L570,160 L630,160 L630,90 L660,90 L660,60 L690,60 L690,90 L730,90 L730,160 L790,160 L790,120 L820,120 L820,80 L850,80 L850,120 L890,120 L890,160 L950,160 L950,80 L980,80 L980,50 L1010,50 L1010,80 L1050,80 L1050,160 L1110,160 L1110,110 L1150,110 L1150,160 L1210,160 L1210,90 L1250,90 L1250,160 L1310,160 L1310,120 L1350,120 L1350,70 L1380,70 L1380,120 L1440,120 L1440,300 Z" fill="rgba(8,12,18,0.97)" />
      </svg>
    </div>
  );
}

function FirefliesScene() {
  const flies = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 67 + 13) % 90,
    y: (i * 43 + 11) % 70,
    delay: (i * 0.5) % 6,
    dur: 2 + (i % 4),
    size: 3 + (i % 3) * 2,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #010805 0%, #020d08 30%, #041510 60%, #061a12 100%)' }}>
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 71 + 9) % 100}%`, top: `${(i * 37 + 5) % 45}%`, width: 1, height: 1, borderRadius: '50%', background: '#fff', opacity: 0.25 + (i % 4) * 0.12, animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 3}s infinite` }} />
      ))}
      {flies.map((f, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${f.x}%`, top: `${f.y + 20}%`,
          width: f.size, height: f.size,
          borderRadius: '50%',
          background: 'rgba(200,255,100,0.9)',
          boxShadow: `0 0 ${f.size * 3}px rgba(180,255,80,0.7), 0 0 ${f.size * 6}px rgba(160,240,60,0.3)`,
          animation: `firefly-glow ${f.dur}s ease-in-out ${f.delay}s infinite`,
        }} />
      ))}
      <svg viewBox="0 0 1440 250" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '35%' }}>
        <path d="M0,250 L0,60 L40,100 L60,40 L80,80 L100,20 L120,60 L150,5 L180,50 L210,0 L240,45 L270,10 L300,55 L340,5 L380,50 L420,0 L460,45 L500,10 L540,55 L580,5 L620,48 L660,8 L700,52 L740,5 L780,48 L820,10 L860,55 L900,5 L940,48 L980,8 L1020,52 L1060,5 L1100,48 L1140,10 L1180,55 L1220,8 L1260,50 L1300,12 L1340,55 L1380,15 L1440,50 L1440,250 Z" fill="rgba(4,14,6,0.97)" />
      </svg>
    </div>
  );
}

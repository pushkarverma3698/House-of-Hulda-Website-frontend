'use client';

/**
 * House of Hulda — Unified Mountain Scene
 * ════════════════════════════════════════
 * 
 * All layers share the same viewBox (0 0 1440 900) and are designed
 * to stack together into ONE cohesive Himalayan valley landscape.
 * 
 * Visual composition (bottom-anchored):
 * 
 *    ┌──────────── sky ────────────────┐
 *    │                                 │
 *    │     ▲ snowy peaks ▲    ▲       │  ← Layer 1: lightest, tallest
 *    │   ▲▲██████████████▲▲▲██▲      │
 *    │  ▲██████████████████████▲▲     │  ← Layer 2: mid-green ridges
 *    │ ████████████████████████████   │
 *    │ ╭──────╮ rolling hills ╭────╮  │  ← Layer 3: dark foothills
 *    │🌲│cabin│🌲🌲          🌲🌲🌲│  │  ← Layer 4: cabin + trees
 *    │🌲🌲🌲🌲🌲              🌲🌲🌲│  │
 *    └─────────────────────────────────┘
 * 
 * Each layer fills from its ridgeline DOWN to the bottom,
 * so layers overlap and no sky peeks through between them.
 */

// ═══════════════════════════════════════════════════════════
// LAYER 1: Distant Snow-Capped Peaks
// Lightest color, tallest peaks, fills entire bottom
// ═══════════════════════════════════════════════════════════
export const DistantPeaks = () => (
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYEnd slice" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <linearGradient id="dp-grad" x1="0" y1="0.3" x2="0" y2="1">
        <stop offset="0%" stopColor="#8a9baa" stopOpacity="0.7" />
        <stop offset="40%" stopColor="#5a7080" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#2a3e3a" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    {/* Main peak cluster — forms the horizon */}
    <path d="
      M0,900
      L0,600
      Q80,580 160,520
      L280,380
      L340,430
      L420,320
      L480,400
      L580,250
      L650,350
      L720,200
      L790,310
      L860,240
      L930,360
      L1020,280
      L1100,380
      L1180,300
      L1260,420
      L1340,350
      L1440,450
      L1440,900
      Z" fill="url(#dp-grad)" />
    {/* Snow highlights on the tallest peaks */}
    <path d="M720,200 L690,270 L750,270 Z" fill="#c8d4e0" opacity="0.5" />
    <path d="M580,250 L560,300 L600,310 Z" fill="#c8d4e0" opacity="0.4" />
    <path d="M860,240 L840,295 L880,300 Z" fill="#c8d4e0" opacity="0.4" />
    <path d="M420,320 L405,365 L440,370 Z" fill="#b8c8d8" opacity="0.3" />
    <path d="M1020,280 L1000,335 L1040,330 Z" fill="#b8c8d8" opacity="0.3" />
  </svg>
);


// ═══════════════════════════════════════════════════════════
// LAYER 2: Mid-Range Forest Ridges
// Darker green, lower ridgeline, covers lower half
// ═══════════════════════════════════════════════════════════
export const MidMountains = () => (
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYEnd slice" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <linearGradient id="mm-grad" x1="0" y1="0.4" x2="0" y2="1">
        <stop offset="0%" stopColor="#2a4a35" />
        <stop offset="100%" stopColor="#1a3025" />
      </linearGradient>
    </defs>
    {/* Smooth rolling ridge — sits in front of distant peaks */}
    <path d="
      M0,900
      L0,560
      Q120,500 250,520
      Q400,480 520,510
      Q650,460 780,490
      Q900,450 1000,480
      Q1120,440 1220,470
      Q1340,430 1440,460
      L1440,900
      Z" fill="url(#mm-grad)" />
    {/* Distant tree texture on ridge — tiny triangles */}
    <g opacity="0.2" fill="#152818">
      {[100,160,230,310,380,460,540,620,700,780,840,920,1000,1060,1140,1220,1300,1380].map((x, i) => {
        const baseY = 520 - Math.sin(x * 0.004) * 60;
        return <path key={i} d={`M${x},${baseY} l-5,14 l10,0 Z`} />;
      })}
    </g>
  </svg>
);


// ═══════════════════════════════════════════════════════════
// LAYER 3: Rolling Foothills (where the cabin sits)
// Darkest mountain layer, gentle undulating curves
// ═══════════════════════════════════════════════════════════
export const RollingHills = () => (
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYEnd slice" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <linearGradient id="rh-grad" x1="0" y1="0.6" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a2e1a" />
        <stop offset="100%" stopColor="#0f1a0f" />
      </linearGradient>
    </defs>
    {/* Gentle rolling hills forming the valley floor */}
    <path d="
      M0,900
      L0,680
      Q150,640 300,660
      Q500,630 680,650
      Q800,640 900,650
      Q1050,630 1200,660
      Q1340,640 1440,670
      L1440,900
      Z" fill="url(#rh-grad)" />
    {/* Slightly higher back-hill for depth */}
    <path d="
      M0,900
      L0,640
      Q200,610 400,630
      Q600,600 800,625
      Q1000,600 1200,630
      Q1350,610 1440,635
      L1440,900
      Z" fill="#162616" opacity="0.5" />
  </svg>
);


// ═══════════════════════════════════════════════════════════
// LAYER 4: The Kath Kuni Cabin (Detailed, Warm)
// Positioned on the valley floor, center of composition
// ═══════════════════════════════════════════════════════════
export const KathKuniCabin = () => (
  <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: 'auto', display: 'block' }}>
    <defs>
      <radialGradient id="wglow" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor="#ffd78a" />
        <stop offset="50%" stopColor="#e8a840" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#c47a20" stopOpacity="0" />
      </radialGradient>
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feComposite in="SourceGraphic" in2="b" operator="over" />
      </filter>
    </defs>

    {/* ── Grassy mound the cabin sits on ── */}
    <ellipse cx="200" cy="290" rx="180" ry="35" fill="#1e3518" opacity="0.7" />

    {/* ── Stone foundation ── */}
    <rect x="120" y="230" width="160" height="45" rx="2" fill="#3a4240" />
    <line x1="120" y1="248" x2="280" y2="248" stroke="#4a5250" strokeWidth="1" opacity="0.4" />
    <line x1="120" y1="262" x2="280" y2="262" stroke="#4a5250" strokeWidth="1" opacity="0.4" />

    {/* ── Wooden first floor (Kath Kuni) ── */}
    <rect x="125" y="185" width="150" height="48" fill="#5a3a1e" />
    {[195, 205, 215, 225].map((y, i) => (
      <line key={`w${i}`} x1="125" y1={y} x2="275" y2={y} stroke="#3a220e" strokeWidth="1" opacity="0.35" />
    ))}

    {/* ── Interlocking stone band ── */}
    <rect x="123" y="180" width="154" height="7" fill="#4a5547" opacity="0.7" />

    {/* ── Overhanging balcony (Penda) ── */}
    <rect x="110" y="155" width="180" height="26" fill="#4a2d15" />
    <rect x="110" y="155" width="180" height="5" fill="#3a1f0d" />
    {Array.from({length: 14}, (_, i) => 118 + i * 12).map((x, i) => (
      <line key={`r${i}`} x1={x} y1="160" x2={x} y2="181" stroke="#3a1f0d" strokeWidth="1.2" opacity="0.5" />
    ))}

    {/* ── Upper floor ── */}
    <path d="M130,110 L270,110 L275,155 L125,155 Z" fill="#6b4226" />
    {[120, 130, 140, 148].map((y, i) => (
      <line key={`u${i}`} x1="130" y1={y} x2="270" y2={y} stroke="#4a2d15" strokeWidth="0.8" opacity="0.3" />
    ))}

    {/* ── Slate roof ── */}
    <path d="M100,155 L200,60 L300,155 Z" fill="#2a3530" />
    <path d="M108,150 L200,67 L292,150" stroke="#3a4540" strokeWidth="0.6" fill="none" opacity="0.3" />
    <line x1="200" y1="60" x2="200" y2="80" stroke="#3a4540" strokeWidth="1.5" opacity="0.4" />

    {/* ── Chimney ── */}
    <rect x="248" y="72" width="16" height="40" fill="#4a5547" />
    <rect x="245" y="68" width="22" height="6" fill="#3a4240" />

    {/* ── Smoke (animated) ── */}
    <path d="M255,68 Q248,50 260,35 Q252,18 262,0" stroke="#D4DCD4" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.15">
      <animate attributeName="d" values="M255,68 Q248,50 260,35 Q252,18 262,0;M255,68 Q262,50 250,35 Q262,18 252,0;M255,68 Q248,50 260,35 Q252,18 262,0" dur="7s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.1;0.25;0.1" dur="5s" repeatCount="indefinite" />
    </path>

    {/* ── Glowing windows ── */}
    <g filter="url(#glow)">
      <rect x="145" y="200" width="16" height="22" fill="url(#wglow)" opacity="0.7" />
      <rect x="240" y="200" width="16" height="22" fill="url(#wglow)" opacity="0.6" />
      <rect x="170" y="120" width="18" height="22" fill="url(#wglow)" opacity="0.85" />
      <rect x="215" y="120" width="18" height="22" fill="url(#wglow)" opacity="0.75" />
    </g>
    {/* Window frames */}
    <rect x="145" y="200" width="16" height="22" fill="none" stroke="#3a1f0d" strokeWidth="1.2" />
    <rect x="240" y="200" width="16" height="22" fill="none" stroke="#3a1f0d" strokeWidth="1.2" />
    <rect x="170" y="120" width="18" height="22" fill="none" stroke="#3a1f0d" strokeWidth="1.2" />
    <line x1="179" y1="120" x2="179" y2="142" stroke="#3a1f0d" strokeWidth="0.8" />
    <line x1="170" y1="131" x2="188" y2="131" stroke="#3a1f0d" strokeWidth="0.8" />
    <rect x="215" y="120" width="18" height="22" fill="none" stroke="#3a1f0d" strokeWidth="1.2" />
    <line x1="224" y1="120" x2="224" y2="142" stroke="#3a1f0d" strokeWidth="0.8" />
    <line x1="215" y1="131" x2="233" y2="131" stroke="#3a1f0d" strokeWidth="0.8" />

    {/* ── Door ── */}
    <rect x="188" y="210" width="24" height="24" rx="1" fill="#1a0e05" />
  </svg>
);


// ═══════════════════════════════════════════════════════════
// LAYER 5: Foreground Deodar Pine Forest
// Darkest silhouettes, frames left and right edges
// Uses the full 1440x900 viewBox, trees at the bottom edges
// ═══════════════════════════════════════════════════════════

const DeodarPine = ({ x, y, s = 1, color = "#080e08" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x="-4" y="30" width="8" height="140" fill="#0a0e08" />
    {/* Layered drooping branch tiers */}
    <path d="M0,50 C-30,70 -65,110 -90,135 C-55,115 -25,115 0,115 C25,115 55,115 90,135 C65,110 30,70 0,50 Z" fill={color} />
    <path d="M0,20 C-25,40 -55,75 -75,95 C-45,80 -18,80 0,80 C18,80 45,80 75,95 C55,75 25,40 0,20 Z" fill={color} opacity="0.95" />
    <path d="M0,-10 C-20,10 -45,40 -60,60 C-35,48 -12,48 0,48 C12,48 35,48 60,60 C45,40 20,10 0,-10 Z" fill={color} />
    <path d="M0,-40 C-15,-18 -32,8 -45,25 C-22,16 -8,16 0,16 C8,16 22,16 45,25 C32,8 15,-18 0,-40 Z" fill={color} opacity="0.95" />
    <path d="M0,-70 C-10,-50 -22,-25 -32,-10 C-15,-16 0,-16 0,-16 C0,-16 15,-16 32,-10 C22,-25 10,-50 0,-70 Z" fill={color} />
    {/* Drooping leader tip */}
    <path d="M0,-105 C-4,-85 -12,-65 -18,-50 C-6,-58 0,-58 0,-58 C0,-58 6,-58 18,-50 C12,-65 4,-85 0,-105 Z" fill={color} />
  </g>
);

export const ForegroundForest = () => (
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYEnd slice" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', display: 'block' }}>
    {/* ── LEFT CLUSTER — Dense, dark, overlapping ── */}
    <DeodarPine x={180} y={520} s={1.2} color="#0f1c0f" />
    <DeodarPine x={80}  y={480} s={1.6} color="#0a140a" />
    <DeodarPine x={-30} y={420} s={2.2} color="#060c06" />
    <DeodarPine x={120} y={440} s={1.8} color="#080e08" />
    <DeodarPine x={-80} y={460} s={2.6} color="#040804" />
    <DeodarPine x={250} y={540} s={1.0} color="#142414" />

    {/* ── RIGHT CLUSTER — Mirror composition ── */}
    <DeodarPine x={1260} y={530} s={1.1} color="#0f1c0f" />
    <DeodarPine x={1350} y={470} s={1.7} color="#0a140a" />
    <DeodarPine x={1480} y={410} s={2.4} color="#060c06" />
    <DeodarPine x={1300} y={450} s={1.9} color="#080e08" />
    <DeodarPine x={1520} y={440} s={2.8} color="#040804" />
    <DeodarPine x={1180} y={550} s={0.9} color="#142414" />
  </svg>
);


// ═══════════════════════════════════════════════════════════
// INFOGRAPHIC OVERLAY — Subtle editorial data markers
// ═══════════════════════════════════════════════════════════
export const InfographicOverlay = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {/* Elevation marker */}
    <div style={{
      position: 'absolute', top: '35%', left: 0, width: '100%',
      borderTop: '1px dashed rgba(255,255,255,0.08)', paddingLeft: '4vw'
    }}>
      <span style={{
        fontSize: '8px', color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase', letterSpacing: '3px', marginTop: '5px',
        display: 'inline-block', fontFamily: 'var(--font-ui, monospace)', fontWeight: 300
      }}>
        2,047m · Above Sea Level
      </span>
    </div>
    {/* Coordinates */}
    <div style={{
      position: 'absolute', bottom: '12%', right: '4vw', textAlign: 'right'
    }}>
      <span style={{
        fontSize: '8px', color: 'rgba(255,255,255,0.15)',
        fontFamily: 'var(--font-ui, monospace)', letterSpacing: '1.5px',
        fontWeight: 300, lineHeight: '1.8'
      }}>
        32.1150° N · 77.1700° E<br />
        Naggar · Kullu Valley
      </span>
    </div>
  </div>
);


// ── Legacy named exports for backwards compatibility ──
export const VectorMountainPeaks = DistantPeaks;
export const VectorKathKuniCabin = KathKuniCabin;
export const VectorDeodarForest = ForegroundForest;
export const InfographicLayer = InfographicOverlay;

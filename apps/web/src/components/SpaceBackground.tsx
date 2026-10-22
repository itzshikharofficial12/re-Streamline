import React from 'react';

// Deterministic star coordinates to avoid SSR hydration mismatches
const STATIC_STARS = [
  { x: 4.5, y: 12.0, size: 1.2, opacity: 0.5 },
  { x: 8.2, y: 34.5, size: 1.5, opacity: 0.65 },
  { x: 14.8, y: 18.2, size: 1.0, opacity: 0.35 },
  { x: 19.3, y: 48.0, size: 1.2, opacity: 0.55 },
  { x: 23.4, y: 71.0, size: 1.8, opacity: 0.75 },
  { x: 27.1, y: 22.4, size: 1.0, opacity: 0.4 },
  { x: 31.8, y: 38.6, size: 1.3, opacity: 0.5 },
  { x: 37.0, y: 14.5, size: 1.0, opacity: 0.3 },
  { x: 41.2, y: 82.0, size: 1.4, opacity: 0.6 },
  { x: 46.5, y: 28.5, size: 1.2, opacity: 0.45 },
  { x: 52.0, y: 9.0, size: 1.5, opacity: 0.6 },
  { x: 58.4, y: 42.0, size: 1.1, opacity: 0.4 },
  { x: 63.2, y: 19.5, size: 1.3, opacity: 0.55 },
  { x: 67.8, y: 64.0, size: 1.0, opacity: 0.35 },
  { x: 72.1, y: 28.0, size: 1.6, opacity: 0.7 },
  { x: 76.5, y: 45.0, size: 1.2, opacity: 0.45 },
  { x: 82.0, y: 16.0, size: 1.4, opacity: 0.5 },
  { x: 85.5, y: 39.5, size: 1.0, opacity: 0.4 },
  { x: 92.4, y: 22.0, size: 1.5, opacity: 0.65 },
  { x: 96.0, y: 52.0, size: 1.2, opacity: 0.5 },
  { x: 94.8, y: 84.0, size: 1.0, opacity: 0.3 },
  { x: 6.0, y: 66.0, size: 1.1, opacity: 0.4 },
  { x: 12.0, y: 88.0, size: 1.3, opacity: 0.5 },
  { x: 89.0, y: 11.0, size: 1.2, opacity: 0.45 },
  { x: 61.0, y: 76.0, size: 1.0, opacity: 0.3 }
];

export function SpaceBackground() {
  return (
    <div className="space-background" aria-hidden="true">
      {/* Deep space radial ambient shading */}
      <div className="space-radial-glow" />

      {/* Static starfield */}
      <div className="starfield">
        {STATIC_STARS.map((star, idx) => (
          <span
            key={idx}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity
            }}
          />
        ))}

        {/* Feature Star 1 (Left diffraction cross) */}
        <div className="cross-star cross-star-left">
          <div className="cross-core" />
          <div className="cross-flare-h" />
          <div className="cross-flare-v" />
        </div>

        {/* Feature Star 2 (Right diffraction cross) */}
        <div className="cross-star cross-star-right">
          <div className="cross-core" />
          <div className="cross-flare-h" />
          <div className="cross-flare-v" />
        </div>
      </div>

      {/* Planetary Horizon at bottom */}
      <div className="horizon-wrapper">
        <div className="horizon-glow" />
        <img src="/horizon.png" alt="" className="horizon-image" loading="eager" decoding="async" />
      </div>
    </div>
  );
}

export default SpaceBackground;

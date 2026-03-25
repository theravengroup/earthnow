"use client";

// Suppress known non-critical console warnings immediately on module load
// This runs before any components render, catching early warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: unknown[]) => {
    const msg = args.map(a => typeof a === 'string' ? a : String(a)).join(' ');
    // Suppress Framer Motion "transparent" animation warning
    // This occurs when animating to CSS keyword "transparent" instead of rgba(0,0,0,0)
    // It's cosmetic - the animation still works, just with a slight pop instead of smooth transition
    if (
      (msg.includes('transparent') && msg.includes('animatable')) ||
      msg.includes('not an animatable value') ||
      msg.includes('THREE.Clock') ||
      msg.includes('Clock')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args: unknown[]) => {
    const msg = args.map(a => typeof a === 'string' ? a : String(a)).join(' ');
    if (
      (msg.includes('transparent') && msg.includes('animatable')) ||
      msg.includes('not an animatable value')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Empty component - the suppression happens at module load time above
export function WarningSuppressor() {
  return null;
}

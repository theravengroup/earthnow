"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Something went wrong.</p>
      <button onClick={reset} style={{ background: '#14b8a6', color: 'white', border: 'none', borderRadius: 999, padding: '8px 20px', cursor: 'pointer', fontSize: 14 }}>Try again</button>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Page not found.</p>
      <Link href="/" style={{ background: '#14b8a6', color: 'white', borderRadius: 999, padding: '8px 20px', fontSize: 14, textDecoration: 'none' }}>
        Back to EarthNow
      </Link>
    </div>
  );
}

import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0e17 0%, #0d1220 100%)',
          borderRadius: '32px',
        }}
      >
        {/* Outer glow */}
        <div
          style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 70%)',
          }}
        />
        {/* Glowing globe */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #1e3a5f 0%, #0f2744 50%, #0a1628 100%)',
            boxShadow: '0 0 30px 8px rgba(20, 184, 166, 0.35), 0 0 50px 15px rgba(14, 165, 233, 0.15), inset 0 0 15px rgba(255,255,255,0.05)',
            position: 'relative',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

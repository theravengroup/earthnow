import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0e17',
          borderRadius: '4px',
        }}
      >
        {/* Glowing globe */}
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #1e3a5f 0%, #0f2744 50%, #0a1628 100%)',
            boxShadow: '0 0 8px 2px rgba(20, 184, 166, 0.4), 0 0 12px 4px rgba(14, 165, 233, 0.2), inset 0 0 4px rgba(255,255,255,0.05)',
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

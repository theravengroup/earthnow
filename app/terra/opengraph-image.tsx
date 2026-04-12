import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Terra — Real-Time Planetary Display | EarthNow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0a0e17 0%, #0d1a2d 50%, #0a0e17 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Teal accent dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#14b8a6",
            boxShadow: "0 0 20px rgba(20,184,166,0.6)",
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          EarthNow
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          TERRA
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Real-time planetary data on any display.
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
          }}
        >
          {["CO\u2082", "Population", "Energy", "Water", "Forest"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "1px solid rgba(20,184,166,0.3)",
                fontSize: 14,
                color: "#14b8a6",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          earthnow.app/terra
        </div>
      </div>
    ),
    { ...size }
  );
}

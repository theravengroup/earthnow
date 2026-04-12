import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Today on Earth — EarthNow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

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
            marginBottom: 16,
          }}
        >
          Today on Earth
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 24,
          }}
        >
          {dateStr}
        </div>
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 16,
          }}
        >
          {[
            { label: "BIRTHS", value: "~385K", color: "#22c55e" },
            { label: "CO\u2082", value: "~115M t", color: "#f97316" },
            { label: "ENERGY", value: "~450M MWh", color: "#06b6d4" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          earthnow.app
        </div>
      </div>
    ),
    { ...size }
  );
}

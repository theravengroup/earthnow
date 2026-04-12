import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Timeline — Earth's Story in Data | EarthNow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const milestones = [
    { year: "13.8B BCE", label: "Big Bang" },
    { year: "4.5B BCE", label: "Earth Forms" },
    { year: "3.5B BCE", label: "First Life" },
    { year: "200K BCE", label: "Homo Sapiens" },
    { year: "Today", label: "8.1B Humans" },
  ];

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
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 48,
          }}
        >
          Earth&apos;s Story in Data
        </div>
        {/* Timeline dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {milestones.map((m, i) => (
            <div
              key={m.year}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: i === milestones.length - 1 ? 16 : 10,
                    height: i === milestones.length - 1 ? 16 : 10,
                    borderRadius: "50%",
                    background: i === milestones.length - 1 ? "#14b8a6" : "rgba(255,255,255,0.4)",
                    boxShadow:
                      i === milestones.length - 1
                        ? "0 0 16px rgba(20,184,166,0.6)"
                        : "none",
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 10,
                    letterSpacing: "0.05em",
                  }}
                >
                  {m.year}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: i === milestones.length - 1 ? "#14b8a6" : "rgba(255,255,255,0.6)",
                    marginTop: 2,
                  }}
                >
                  {m.label}
                </div>
              </div>
              {i < milestones.length - 1 && (
                <div
                  style={{
                    width: 120,
                    height: 1,
                    background: "rgba(255,255,255,0.15)",
                    marginLeft: 12,
                    marginRight: 12,
                    marginBottom: 36,
                  }}
                />
              )}
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
          earthnow.app/timeline
        </div>
      </div>
    ),
    { ...size }
  );
}

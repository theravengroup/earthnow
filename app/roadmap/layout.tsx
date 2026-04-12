import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap — EarthNow",
  description:
    "What we're building next at EarthNow. Explore upcoming features, data expansions, and platform improvements for real-time planetary visualization.",
  openGraph: {
    title: "Roadmap — EarthNow",
    description:
      "What we're building next at EarthNow. Explore upcoming features and platform improvements.",
    url: "https://earthnow.app/roadmap",
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

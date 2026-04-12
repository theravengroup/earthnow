import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terra — Real-Time Planetary Display | EarthNow",
  description:
    "A stunning real-time planetary dashboard for lobbies and shared spaces. Live data on CO2, population, energy, and dozens of vital signs on any display.",
  openGraph: {
    title: "Terra — Real-Time Planetary Display",
    description:
      "A stunning real-time planetary dashboard for lobbies and shared spaces.",
    url: "https://earthnow.app/terra",
  },
};

export default function TerraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

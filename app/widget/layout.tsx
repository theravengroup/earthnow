import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed Live Earth Data — EarthNow",
  description: "Put a living piece of the planet on your website. Embed live counters showing real-time data on population, CO₂ emissions, energy, and more.",
  openGraph: {
    title: "Embed Live Earth Data — EarthNow",
    description: "Put a living piece of the planet on your website. Perfect for classrooms, blogs, newsrooms, and dashboards.",
    type: "website",
  },
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

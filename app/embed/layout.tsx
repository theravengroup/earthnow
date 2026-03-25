import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EarthNow Widget",
  description: "Embeddable live counter widget showing real-time planetary data.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

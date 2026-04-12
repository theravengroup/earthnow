import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline — Earth's Story in Data | EarthNow",
  description:
    "Explore key moments in Earth's history through real-time data. From the Big Bang to today, see how the planet has changed across billions of years.",
  openGraph: {
    title: "Timeline — Earth's Story in Data",
    description:
      "Explore key moments in Earth's history through real-time data.",
    url: "https://earthnow.app/timeline",
  },
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

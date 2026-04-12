import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You — EarthNow",
  description:
    "Thank you for supporting EarthNow. Your contribution helps keep the platform independent and expand real-time planetary data visualization.",
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

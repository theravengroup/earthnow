import type { Metadata } from "next";
import { UniversalNavbar } from "@/components/universal-navbar";

export const metadata: Metadata = {
  title: "Thank You — Terra by EarthNow",
  description: "Thank you for your Terra order. Please provide your shipping details.",
};

export default function TerraThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout includes the navbar for navigation but omits footer/floating button
  return (
    <>
      <UniversalNavbar />
      {children}
    </>
  );
}

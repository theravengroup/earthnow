"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, GraduationCap, Newspaper, LayoutDashboard } from "lucide-react";
import { UniversalNavbar } from "@/components/universal-navbar";
import { DonateSection } from "@/components/donate-section";
import { toast } from "sonner";

// Available stats with their display info
const AVAILABLE_STATS = [
  { key: "population", label: "World Population", color: "#22c55e" },
  { key: "births", label: "Births Today", color: "#22c55e" },
  { key: "deaths", label: "Deaths Today", color: "#ef4444" },
  { key: "co2", label: "CO₂ Today", color: "#f97316" },
  { key: "trees", label: "Forest Lost", color: "#ef4444" },
  { key: "energy", label: "Energy Generated", color: "#06b6d4" },
  { key: "water", label: "Water Used", color: "#3b82f6" },
  { key: "waste", label: "Food Wasted", color: "#f97316" },
  { key: "searches", label: "Google Searches", color: "#14b8a6" },
  { key: "military", label: "Military Spending", color: "#ef4444" },
  { key: "education", label: "Education Spending", color: "#22c55e" },
  { key: "photos", label: "Photos Taken", color: "#a855f7" },
];

export default function WidgetPage() {
  // Configuration state
  const [selectedStats, setSelectedStats] = useState<string[]>(["population", "co2", "births"]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [showBranding, setShowBranding] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Generate embed URL
  const embedUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("stats", selectedStats.join(","));
    params.set("theme", theme);
    params.set("layout", layout);
    if (!showBranding) params.set("brand", "false");
    return `https://earthnow.app/embed?${params.toString()}`;
  }, [selectedStats, theme, layout, showBranding]);
  
  // Calculate dimensions
  const dimensions = useMemo(() => {
    const statCount = selectedStats.length;
    if (layout === "horizontal") {
      // ~200px per stat + padding
      const width = Math.max(200, statCount * 180 + 48);
      const height = showBranding ? 100 : 80;
      return { width, height };
    } else {
      // Vertical layout
      const width = 220;
      const height = statCount * 60 + (showBranding ? 44 : 32);
      return { width, height };
    }
  }, [selectedStats.length, layout, showBranding]);
  
  // Generate embed code
  const embedCode = useMemo(() => {
    return `<iframe src="${embedUrl}" 
  width="${dimensions.width}" height="${dimensions.height}" 
  frameborder="0" 
  style="border: none; border-radius: 8px;"
  title="EarthNow Live Counter">
</iframe>`;
  }, [embedUrl, dimensions]);
  
  // Handle stat toggle
  const toggleStat = (key: string) => {
    if (selectedStats.includes(key)) {
      if (selectedStats.length > 1) {
        setSelectedStats(selectedStats.filter(s => s !== key));
      }
    } else {
      if (selectedStats.length >= 4) {
        toast.error("Maximum 4 stats per widget");
        return;
      }
      setSelectedStats([...selectedStats, key]);
    }
  };
  
  // Copy handlers
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText("https://earthnow.app");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Create preview URL for iframe
  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("stats", selectedStats.join(","));
    params.set("theme", theme);
    params.set("layout", layout);
    if (!showBranding) params.set("brand", "false");
    return `/embed?${params.toString()}`;
  }, [selectedStats, theme, layout, showBranding]);

  return (
    <>
      <UniversalNavbar />
      
      <div className="noise-overlay min-h-screen bg-[#0a0e17]" style={{ paddingTop: "64px" }}>
        {/* Hero Section */}
        <section className="px-6 pb-12 pt-20 text-center md:px-12 md:pt-28">
          <motion.h1
            className="font-serif text-white"
            style={{ fontSize: "clamp(28px, 3vw, 48px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Embed Live Earth Data
          </motion.h1>
          <motion.p
            className="mt-3 font-serif italic"
            style={{ fontSize: "clamp(14px, 1.3vw, 20px)", color: "rgba(255,255,255,0.6)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Put a living piece of the planet on your website.
          </motion.p>
          <motion.p
            className="mt-2 font-sans"
            style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.35)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Perfect for classrooms, blogs, newsrooms, and dashboards.
          </motion.p>
        </section>

        {/* Configurator Section */}
        <section className="px-6 pb-16 md:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left Column - Controls */}
              <div className="space-y-6">
                {/* Choose Your Stats */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <h3 className="mb-4 font-sans text-[16px] font-medium text-white">
                    Choose Your Stats <span className="text-[12px] text-[#64748b]">(1-4)</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_STATS.map((stat) => {
                      const isSelected = selectedStats.includes(stat.key);
                      return (
                        <button
                          key={stat.key}
                          onClick={() => toggleStat(stat.key)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-150"
                          style={{
                            background: isSelected ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.03)",
                            border: isSelected ? "1px solid rgba(45,212,191,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            color: isSelected ? "white" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: stat.color }}
                          />
                          <span className="truncate text-[12px]">{stat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Toggle */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <h3 className="mb-4 font-sans text-[16px] font-medium text-white">Theme</h3>
                  <div className="flex gap-2">
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className="rounded-full px-5 py-2 text-[14px] font-medium capitalize transition-all duration-150"
                        style={{
                          background: theme === t ? "#14b8a6" : "transparent",
                          border: theme === t ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)",
                          color: theme === t ? "white" : "#94a3b8",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Toggle */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <h3 className="mb-4 font-sans text-[16px] font-medium text-white">Layout</h3>
                  <div className="flex gap-2">
                    {(["horizontal", "vertical"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLayout(l)}
                        className="rounded-full px-5 py-2 text-[14px] font-medium capitalize transition-all duration-150"
                        style={{
                          background: layout === l ? "#14b8a6" : "transparent",
                          border: layout === l ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)",
                          color: layout === l ? "white" : "#94a3b8",
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Branding Toggle */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <h3 className="mb-4 font-sans text-[16px] font-medium text-white">Show EarthNow Branding</h3>
                  <div className="flex gap-2">
                    {(["On", "Off"] as const).map((opt) => {
                      const isOn = opt === "On";
                      const isSelected = showBranding === isOn;
                      return (
                        <button
                          key={opt}
                          onClick={() => setShowBranding(isOn)}
                          className="rounded-full px-5 py-2 text-[14px] font-medium transition-all duration-150"
                          style={{
                            background: isSelected ? "#14b8a6" : "transparent",
                            border: isSelected ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)",
                            color: isSelected ? "white" : "#94a3b8",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {!showBranding && (
                    <p className="mt-3 text-[11px] italic" style={{ color: "rgba(255,255,255,0.3)" }}>
                      We&apos;d appreciate it if you kept the branding, but it&apos;s your call.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Live Preview */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-6"
                style={{
                  background: theme === "dark" ? "#1a1a2e" : "#f3f4f6",
                  border: "1px solid rgba(255,255,255,0.06)",
                  minHeight: "400px",
                }}
              >
                {/* Fake browser chrome */}
                <div 
                  className="mb-4 flex w-full max-w-md items-center gap-2 rounded-lg px-4 py-2"
                  style={{ 
                    background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                  </div>
                  <div 
                    className="ml-3 flex-1 rounded px-3 py-1 text-center text-[11px]"
                    style={{ 
                      background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                    }}
                  >
                    yourwebsite.com
                  </div>
                </div>

                {/* Preview iframe */}
                <div 
                  className="flex items-center justify-center rounded-lg p-8"
                  style={{ 
                    background: theme === "dark" ? "#0a0e17" : "#ffffff",
                    minWidth: "100%",
                  }}
                >
                  <iframe
                    key={previewUrl}
                    src={previewUrl}
                    width={Math.min(dimensions.width, 500)}
                    height={dimensions.height}
                    style={{ border: "none", borderRadius: "8px" }}
                    title="Widget Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Embed Code Section */}
        <section className="px-6 pb-16 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <h3 className="mb-4 font-sans text-[16px] font-medium text-white">Embed Code</h3>
              
              {/* Code block */}
              <div className="relative">
                <pre
                  className="overflow-x-auto rounded-lg p-4 font-mono text-[13px]"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    color: "#94a3b8",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {embedCode}
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute right-3 top-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(45,212,191,0.4)",
                    color: "#14b8a6",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Direct link alternative */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Or just link to:
                </span>
                <code className="rounded px-2 py-1 font-mono text-[13px]" style={{ background: "rgba(255,255,255,0.05)", color: "#14b8a6" }}>
                  https://earthnow.app
                </code>
                <button
                  onClick={handleCopyLink}
                  className="rounded-full p-1.5 transition-all duration-150"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5" style={{ color: "#14b8a6" }} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" style={{ color: "#64748b" }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="px-6 pb-16 md:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <GraduationCap className="h-8 w-8" />,
                  title: "Classrooms",
                  desc: "Show students the planet in real time. A live reminder that the numbers are always moving.",
                },
                {
                  icon: <Newspaper className="h-8 w-8" />,
                  title: "Newsrooms & Blogs",
                  desc: "Add context to any story about climate, population, or global trends.",
                },
                {
                  icon: <LayoutDashboard className="h-8 w-8" />,
                  title: "Dashboards",
                  desc: "Bring planetary awareness into your team's daily view.",
                },
              ].map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  className="rounded-2xl p-6 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "rgba(20,184,166,0.1)", color: "#14b8a6" }}
                  >
                    {useCase.icon}
                  </div>
                  <h4 className="mb-2 font-sans text-[16px] font-semibold text-white">
                    {useCase.title}
                  </h4>
                  <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {useCase.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-16 text-center md:px-12">
          <p 
            className="mb-6 font-serif italic"
            style={{ fontSize: "clamp(16px, 1.5vw, 24px)", color: "rgba(255,255,255,0.6)" }}
          >
            Every embed is a window into the planet.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full px-8 py-3 text-[15px] font-medium text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
            }}
          >
            Explore EarthNow
          </Link>
        </section>

        {/* Donate Section */}
        <DonateSection 
          title="Support EarthNow"
          description="EarthNow is an independent project visualizing the real-time state of our planet. If you find it meaningful, consider supporting its development."
        />
      </div>
    </>
  );
}

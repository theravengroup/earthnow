"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, GraduationCap, Newspaper, LayoutDashboard } from "lucide-react";
import { UniversalNavbar } from "@/components/universal-navbar";
import { DonateSection } from "@/components/donate-section";
import { toast } from "sonner";
import { SITE_URL } from "@/lib/constants";

// Available stats with their display info
const AVAILABLE_STATS = [
  // Core planetary
  { key: "population", label: "World Population", color: "#22c55e" },
  { key: "births", label: "Births Today", color: "#22c55e" },
  { key: "deaths", label: "Deaths Today", color: "#ef4444" },
  { key: "co2", label: "CO₂ Emitted", color: "#f97316" },
  { key: "trees", label: "Forest Lost", color: "#ef4444" },
  { key: "energy", label: "Energy Generated", color: "#06b6d4" },
  { key: "water", label: "Water Used", color: "#3b82f6" },
  { key: "waste", label: "Food Wasted", color: "#f97316" },
  // Technology & economy
  { key: "searches", label: "Google Searches", color: "#14b8a6" },
  { key: "photos", label: "Photos Taken", color: "#a855f7" },
  { key: "emails", label: "Emails Sent", color: "#8b5cf6" },
  { key: "internet", label: "Internet Data (PB)", color: "#06b6d4" },
  { key: "creditcards", label: "Credit Card Transactions", color: "#eab308" },
  { key: "aitokens", label: "AI Tokens Processed", color: "#8b5cf6" },
  // Environment
  { key: "treesplanted", label: "Trees Planted", color: "#22c55e" },
  { key: "renewable", label: "Renewable Energy (MWh)", color: "#14b8a6" },
  { key: "plastic", label: "Plastic Entering Oceans", color: "#ef4444" },
  { key: "icelost", label: "Ice Lost (tonnes)", color: "#3b82f6" },
  { key: "soillost", label: "Soil Lost (tonnes)", color: "#a3744e" },
  // Society
  { key: "military", label: "Military Spending", color: "#ef4444" },
  { key: "education", label: "Education Spending", color: "#22c55e" },
  { key: "flights", label: "Flights in the Air", color: "#94a3b8" },
  { key: "vaccines", label: "Vaccines Administered", color: "#22c55e" },
  { key: "hunger", label: "Hunger Deaths", color: "#ef4444" },
];

export default function WidgetPage() {
  // Configuration state
  const [selectedStats, setSelectedStats] = useState<string[]>(["population", "co2"]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
  const showBranding = true; // Branding is always shown
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const maxStats = 8;

  // Generate embed code (web component)
  const embedCode = useMemo(() => {
    const statsStr = selectedStats.join(",");
    return `<script src="${SITE_URL}/widget.js"><\/script>\n<earth-now stats="${statsStr}" theme="${theme}" layout="${layout}"></earth-now>`;
  }, [selectedStats, theme, layout]);

  // Handle stat toggle
  const toggleStat = (key: string) => {
    if (selectedStats.includes(key)) {
      if (selectedStats.length > 1) {
        setSelectedStats(selectedStats.filter(s => s !== key));
      }
    } else {
      if (selectedStats.length >= maxStats) {
        toast.error("Maximum 8 stats per widget");
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
    await navigator.clipboard.writeText(SITE_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Load the web component script for live preview
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!document.querySelector('script[src="/widget.js"]')) {
      const script = document.createElement('script');
      script.src = '/widget.js';
      document.head.appendChild(script);
    }
  }, []);

  // Update the preview element when config changes
  useEffect(() => {
    if (!previewRef.current) return;
    const el = previewRef.current.querySelector('earth-now') || document.createElement('earth-now');
    el.setAttribute('stats', selectedStats.join(','));
    el.setAttribute('theme', theme);
    el.setAttribute('layout', layout);
    if (!el.parentElement) previewRef.current.appendChild(el);
  }, [selectedStats, theme, layout]);

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
                  <h3 className="mb-1 font-sans text-[16px] font-medium text-white">
                    Choose Your Stats
                  </h3>
                  <p className="mb-4 text-[12px] text-[#768a9e]">
                    Pick up to 8 stats. They display in pairs of two.
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
                <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
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

                  {/* Live web component preview */}
                  <div
                    ref={previewRef}
                    className="flex items-center justify-center p-8"
                    style={{
                      background: theme === "dark" ? "#0a0e17" : "#ffffff",
                    }}
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
                    <Copy className="h-3.5 w-3.5" style={{ color: "#768a9e" }} />
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

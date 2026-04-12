"use client";

// EarthNow Roadmap Page - Cinematic Progress Report
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { UniversalNavbar } from "@/components/universal-navbar";
import { DonateSection } from "@/components/donate-section";

// Pre-computed star positions (completely deterministic to avoid hydration mismatch)
const STARS: Array<{ x: number; y: number; size: number; dur: number; del: number }> = [
  { x: 12, y: 8, size: 1, dur: 3.2, del: 0.5 }, { x: 87, y: 15, size: 2, dur: 4.1, del: 1.2 },
  { x: 34, y: 23, size: 1, dur: 2.8, del: 2.1 }, { x: 56, y: 5, size: 1, dur: 3.5, del: 0.3 },
  { x: 78, y: 42, size: 2, dur: 4.5, del: 1.8 }, { x: 23, y: 67, size: 1, dur: 3.1, del: 2.5 },
  { x: 91, y: 33, size: 1, dur: 2.9, del: 0.8 }, { x: 45, y: 89, size: 2, dur: 4.2, del: 1.5 },
  { x: 67, y: 56, size: 1, dur: 3.7, del: 2.2 }, { x: 8, y: 45, size: 1, dur: 3.3, del: 0.9 },
  { x: 52, y: 12, size: 2, dur: 4.0, del: 1.1 }, { x: 29, y: 78, size: 1, dur: 2.7, del: 2.8 },
  { x: 83, y: 61, size: 1, dur: 3.6, del: 0.4 }, { x: 16, y: 34, size: 2, dur: 4.3, del: 1.9 },
  { x: 71, y: 87, size: 1, dur: 3.0, del: 2.4 }, { x: 38, y: 51, size: 1, dur: 3.4, del: 0.7 },
  { x: 94, y: 19, size: 2, dur: 4.4, del: 1.3 }, { x: 5, y: 72, size: 1, dur: 2.6, del: 2.9 },
  { x: 61, y: 38, size: 1, dur: 3.8, del: 0.6 }, { x: 42, y: 95, size: 2, dur: 4.1, del: 1.7 },
  { x: 19, y: 16, size: 1, dur: 3.2, del: 2.3 }, { x: 76, y: 74, size: 1, dur: 2.8, del: 0.2 },
  { x: 33, y: 29, size: 2, dur: 4.5, del: 1.4 }, { x: 88, y: 48, size: 1, dur: 3.5, del: 2.6 },
  { x: 14, y: 83, size: 1, dur: 3.1, del: 0.8 }, { x: 59, y: 21, size: 2, dur: 4.0, del: 1.6 },
  { x: 47, y: 63, size: 1, dur: 2.9, del: 2.0 }, { x: 82, y: 7, size: 1, dur: 3.7, del: 0.5 },
  { x: 26, y: 91, size: 2, dur: 4.2, del: 1.2 }, { x: 68, y: 36, size: 1, dur: 3.3, del: 2.7 },
  { x: 3, y: 58, size: 1, dur: 2.7, del: 0.3 }, { x: 54, y: 79, size: 2, dur: 4.3, del: 1.8 },
  { x: 39, y: 11, size: 1, dur: 3.0, del: 2.2 }, { x: 96, y: 67, size: 1, dur: 3.6, del: 0.9 },
  { x: 21, y: 44, size: 2, dur: 4.4, del: 1.5 }, { x: 73, y: 25, size: 1, dur: 2.6, del: 2.4 },
  { x: 11, y: 52, size: 1, dur: 3.4, del: 0.7 }, { x: 64, y: 93, size: 2, dur: 4.1, del: 1.1 },
  { x: 48, y: 31, size: 1, dur: 3.8, del: 2.8 }, { x: 85, y: 69, size: 1, dur: 2.8, del: 0.4 },
  { x: 31, y: 85, size: 2, dur: 4.5, del: 1.9 }, { x: 57, y: 17, size: 1, dur: 3.2, del: 2.5 },
  { x: 79, y: 54, size: 1, dur: 3.5, del: 0.6 }, { x: 7, y: 39, size: 2, dur: 4.0, del: 1.3 },
  { x: 43, y: 76, size: 1, dur: 2.9, del: 2.1 }, { x: 92, y: 13, size: 1, dur: 3.1, del: 0.2 },
  { x: 18, y: 61, size: 2, dur: 4.2, del: 1.7 }, { x: 66, y: 47, size: 1, dur: 3.7, del: 2.9 },
  { x: 35, y: 3, size: 1, dur: 2.7, del: 0.8 }, { x: 89, y: 82, size: 2, dur: 4.3, del: 1.4 },
];

// Live features data
const liveFeatures = [
  { title: "75+ Live Counters", desc: "Real-time data across population, climate, money, technology, and civilization." },
  { title: "Cinematic Intro", desc: "A different opening every visit. 40 unique stats, letter-by-letter animation." },
  { title: "5 System Deep-Dives", desc: "People, Energy, Planet, Food, Technology — each with tabbed storytelling." },
  { title: "Lifetime Impact Calculator", desc: "Enter your birth year. See what the planet spent — including poop produced." },
  { title: "60 Civilization Signals", desc: "A living bento grid of humanity's vital signs, shuffling with animated transitions." },
  { title: "Contrast Moments", desc: "Juxtapositions that make you stop scrolling. Randomized every visit." },
  { title: "Daily Planet Briefing", desc: "earthnow.app/today — a living snapshot of the planet, updated every second." },
  { title: "Historical Time Machine", desc: "Scrub from 10,000 BCE to today. Watch civilization accelerate." },
  { title: "Shareable Moment Cards", desc: "Generate a cinematic snapshot of your visit. Copy, download, or share." },
  { title: "Historical Timeline", desc: "295 milestones across 12,000 years. Filterable. Shareable. Map-linked." },
  { title: "Dynamic OG Images", desc: "Every page generates its own social preview card. Beautiful when shared." },
  { title: "Styled Stripe Checkout", desc: "Dark-themed, on-site payments. One-time or monthly. Independent and ad-free." },
  { title: "Mobile-First Design", desc: "Optimized for phones, tablets, and desktops. Responsive grids, touch-friendly." },
];

// Building now data
const buildingNow = [
  { title: "Embeddable Live Widget", desc: "A beautiful live counter that anyone can put on their website. Teachers, bloggers, newsrooms." },
  { title: "NASA Live Data Integration", desc: "Real satellite feeds. Real atmospheric readings. Real ocean temperatures." },
  { title: "Particle Effect Visualizations", desc: "Data-driven particle systems that make the numbers feel alive. Births, emissions, energy — rendered as flowing particles." },
];

// On the horizon data
const onTheHorizon = [
  { title: "AI-Powered Insights", desc: "Daily AI-generated planet summaries. Ask questions about the data. Trend analysis in plain language." },
  { title: "Terra TV Apps", desc: "AppleTV and Android TV apps. Turn any screen into a living planet dashboard." },
  { title: "Guided Scroll Mode", desc: "Auto-scroll the homepage at documentary pace. Ambient music. Cinematic." },
  { title: "Region-Specific Views", desc: "Zoom into countries. Compare local data to global trends." },
  { title: "Educational Modules", desc: "Structured learning paths for classrooms and curious minds." },
  { title: "Scenario Simulators", desc: "What if we cut emissions by 50%? Model different futures." },
  { title: "Personalized Dashboards", desc: "Save your preferences. Track the metrics that matter to you." },
  { title: "Ambient Display Mode", desc: "A 16:9 display product for lobbies, schools, and hospitals." },
  { title: "Classroom & Nonprofit Tools", desc: "Resources designed for educators and mission-driven organizations." },
];

// Pulsing amber dot component
function PulsingDot() {
  return (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <motion.div
        className="absolute h-3 w-3 rounded-full"
        style={{ background: "#f59e0b" }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="h-2 w-2 rounded-full"
        style={{ background: "#f59e0b" }}
      />
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <>
      {/* Navbar OUTSIDE overflow-hidden container for proper fixed positioning */}
      <UniversalNavbar />
      
      <div className="noise-overlay relative min-h-screen overflow-hidden bg-[#0a0e17]" style={{ paddingTop: '64px' }}>
        {/* Star field background - decorative only, no interaction */}
        <div className="star-field pointer-events-none" style={{ zIndex: 0 }}>
          {STARS.map((star, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDuration: `${star.dur}s`,
                animationDelay: `${star.del}s`,
              }}
            />
          ))}
        </div>

        {/* Section 1 — Hero */}
        <section 
          className="relative flex flex-col items-center justify-center px-6 text-center"
          style={{ minHeight: "40vh", paddingTop: "12vh" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 
              className="font-serif font-semibold text-white"
              style={{ fontSize: "clamp(32px, 3.5vw, 56px)" }}
            >
              The Roadmap
            </h1>
            <p 
              className="mx-auto mt-4 max-w-2xl font-serif italic"
              style={{ 
                fontSize: "clamp(14px, 1.3vw, 20px)", 
                color: "rgba(255,255,255,0.6)" 
              }}
            >
              EarthNow is being built in public. Here&apos;s where we are and where we&apos;re going.
            </p>
          </motion.div>
        </section>

        {/* Section 2 — What's Live Right Now */}
        <Suspense fallback={<div className="min-h-[400px] bg-[#0a0e17]" />}>
          <section className="relative px-6 py-16 md:px-12">
            <div className="mx-auto max-w-5xl">
              <motion.div 
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-3 font-serif text-[28px] font-semibold text-white md:text-[32px]">
                  What&apos;s Live Right Now
                </h2>
                <p className="font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Every feature below is live on EarthNow today.
                </p>
              </motion.div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {liveFeatures.map((item, index) => (
                  <motion.div
                    key={index}
                    className="rounded-xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Check 
                      className="mb-3 h-5 w-5" 
                      style={{ color: "#2dd4bf", opacity: 0.8 }} 
                    />
                    <h3 className="mb-2 font-sans text-[16px] font-semibold text-white">
                      {item.title}
                    </h3>
                    <p 
                      className="font-sans text-[13px]" 
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </Suspense>

        {/* Section 3 — Building Now */}
        <Suspense fallback={<div className="min-h-[200px] bg-[#0a0e17]" />}>
          <section className="relative px-6 py-16 md:px-12">
            <div className="mx-auto max-w-5xl">
              <motion.div 
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-3 font-serif text-[28px] font-semibold text-white md:text-[32px]">
                  Building Now
                </h2>
                <p className="font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  In active development.
                </p>
              </motion.div>

              <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-3">
                {buildingNow.map((item, index) => (
                  <motion.div
                    key={index}
                    className="rounded-xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="mb-3">
                      <PulsingDot />
                    </div>
                    <h3 className="mb-2 font-sans text-[16px] font-semibold text-white">
                      {item.title}
                    </h3>
                    <p 
                      className="font-sans text-[13px]" 
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </Suspense>

        {/* Section 4 — On the Horizon */}
        <Suspense fallback={<div className="min-h-[300px] bg-[#0a0e17]" />}>
          <section className="relative px-6 py-16 md:px-12">
            <div className="mx-auto max-w-3xl">
              <motion.div 
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-3 font-serif text-[28px] font-semibold text-white md:text-[32px]">
                  On the Horizon
                </h2>
                <p className="font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  What EarthNow becomes with sustained support.
                </p>
              </motion.div>

              <div className="flex flex-col gap-4">
                {onTheHorizon.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 py-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <Circle 
                      className="mt-1 h-4 w-4 shrink-0" 
                      style={{ color: "rgba(255,255,255,0.2)" }}
                      strokeWidth={1.5}
                    />
                    <div>
                      <h3 className="font-sans text-[16px] font-semibold text-white">
                        {item.title}
                      </h3>
                      <p 
                        className="mt-1 font-sans text-[13px]" 
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </Suspense>

        {/* Section 5 — Why Support Matters */}
        <Suspense fallback={<div className="min-h-[200px] bg-[#0a0e17]" />}>
          <section className="relative px-6 py-16 md:px-12 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <motion.p
                className="font-serif italic"
                style={{ 
                  fontSize: "clamp(18px, 1.6vw, 26px)", 
                  color: "rgba(255,255,255,0.8)" 
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                EarthNow is built by one person. No team. No VC. No ads. No data sales.
              </motion.p>

              <motion.div 
                className="mt-10 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Every dollar goes directly into data, development, and infrastructure.
                </p>
                <p className="font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Supporters unlock the next layer of the platform.
                </p>
                <p className="font-sans text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  This is how independent tools for planetary awareness get built.
                </p>
              </motion.div>
            </div>
          </section>
        </Suspense>

        {/* Section 6 — Donation Section (unchanged) */}
        <Suspense fallback={<div className="min-h-[300px] bg-[#0a0e17]" />}>
          <DonateSection />
        </Suspense>
      </div>
    </>
  );
}

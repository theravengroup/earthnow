"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UniversalNavbar } from "@/components/universal-navbar";
import { terraLinks } from "@/lib/payment-links";

// Gradient Divider Component
function GradientDivider() {
  return (
    <div
      className="m-0 w-full"
      style={{
        height: "1px",
        background: "linear-gradient(to right, transparent 0%, rgba(20,184,166,0.3) 30%, rgba(20,184,166,0.3) 70%, transparent 100%)",
      }}
    />
  );
}

// Live Data Ticker Component
function LiveDataTicker() {
  const tickerContent = [
    "CO₂ TODAY · 60.94M TONNES",
    "·",
    "BIRTHS TODAY · 165.4K",
    "·",
    "FOREST LOST · 34.8K ACRES",
    "·",
    "OCEAN TEMP · 16.7°C",
    "·",
    "GLOBAL POPULATION · 8.1B",
    "·",
    "ENERGY TODAY · 687.78M MWH",
    "·",
    "PLASTIC TODAY · 478.8K TONNES",
    "·",
    "HUNGER DEATHS · 10.9K",
    "·",
  ];

  // Duplicate for seamless loop
  const duplicatedContent = [...tickerContent, ...tickerContent, ...tickerContent, ...tickerContent];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "44px",
        background: "rgba(20,184,166,0.08)",
        borderTop: "1px solid rgba(20,184,166,0.2)",
        borderBottom: "1px solid rgba(20,184,166,0.2)",
      }}
    >
      <div
        className="absolute flex h-full items-center whitespace-nowrap"
        style={{
          animation: "ticker-scroll 120s linear infinite",
        }}
      >
        {duplicatedContent.map((item, index) => (
          <span
            key={index}
            className="px-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[#14b8a6]"
          >
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

// Animated Counter Hook
function useAnimatedCounter(
  targetValue: number,
  duration: number = 1200,
  delay: number = 0,
  isInView: boolean
) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now() + delay;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);
      // easeOut curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * targetValue);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, targetValue, duration, delay]);

  return displayValue;
}

// Animated Price Component
function AnimatedPrice({ 
  value, 
  suffix, 
  delay, 
  isInView,
  formatWithComma = false 
}: { 
  value: number; 
  suffix: string; 
  delay: number;
  isInView: boolean;
  formatWithComma?: boolean;
}) {
  const animatedValue = useAnimatedCounter(value, 1200, delay, isInView);
  
  const formattedValue = formatWithComma 
    ? animatedValue.toLocaleString() 
    : animatedValue.toString();
  
  return (
    <span className="font-mono text-[15px] text-white">
      ${formattedValue}<span className="hidden md:inline"> {suffix}</span>
    </span>
  );
}

// Google TV Streamer Device Visual
function DeviceVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {/* Floating Device Container */}
      <div
        className="relative"
        style={{
          animation: "device-float 4s ease-in-out infinite alternate",
        }}
      >
        {/* Device Body */}
        <div
          className="relative flex items-center justify-between px-3"
          style={{
            width: "180px",
            height: "28px",
            background: "#1a1f2e",
            border: "1px solid rgba(20,184,166,0.4)",
            borderRadius: "8px",
          }}
        >
          {/* Pulsing LED */}
          <div
            className="rounded-full"
            style={{
              width: "8px",
              height: "8px",
              background: "#14b8a6",
              animation: "led-pulse 2s ease-in-out infinite",
              boxShadow: "0 0 8px rgba(20,184,166,0.6)",
            }}
          />
          
          {/* HDMI Plug */}
          <div
            style={{
              width: "12px",
              height: "8px",
              background: "#0f1318",
              borderRadius: "2px",
            }}
          />
        </div>
        
        {/* Cable */}
        <div
          className="mx-auto"
          style={{
            width: "2px",
            height: "20px",
            background: "linear-gradient(to bottom, rgba(20,184,166,0.2) 0%, transparent 100%)",
          }}
        />
      </div>
      
      {/* Device Label */}
      <p
        className="mt-4 text-center font-mono uppercase"
        style={{
          fontSize: "10px",
          color: "#64748b",
          letterSpacing: "0.1em",
        }}
      >
        Google TV Streamer
      </p>
      
      <style jsx>{`
        @keyframes device-float {
          0% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(6px);
          }
        }
        @keyframes led-pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default function TerraPage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const isPricingInView = useInView(pricingRef, { once: true, margin: "-100px" });

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0e17]">
      <UniversalNavbar forceSolidBackground />

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-[70vh] w-full overflow-hidden">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/terra-kQ81hbjOLPSEyiy18XQpdiSWqcFeNv.webp')",
            backgroundPosition: "60% center",
            transform: `translateY(${scrollY * 0.5}px)`,
            willChange: "transform",
          }}
        />
        {/* Dark overlay gradient from bottom */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,14,23,0.15) 0%, rgba(10,14,23,0.35) 35%, rgba(10,14,23,0.55) 60%, rgba(10,14,23,0.75) 100%)",
          }}
        />
        
        {/* Hero Content */}
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(10, 14, 23, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            marginBottom: '16px',
          }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-mono text-[18px] uppercase tracking-[0.4em] text-[#14b8a6]"
            >
              TERRA
            </motion.p>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-4 font-serif text-[72px] text-white leading-tight"
            style={{ textShadow: '0 1px 20px rgba(0,0,0,0.8), 0 2px 40px rgba(0,0,0,0.6)' }}
          >
            Earth. Alive. Now.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 max-w-[600px] font-sans text-[20px] text-[#94a3b8]"
            style={{ textShadow: '0 1px 20px rgba(0,0,0,0.8), 0 2px 40px rgba(0,0,0,0.6)' }}
          >
            A planetary display for organizations that give a damn about the world they operate in.
          </motion.p>
        </div>
      </section>

      {/* Live Data Ticker */}
      <LiveDataTicker />

      {/* Gradient Divider: Hero to Problem */}
      <GradientDivider />

      {/* Problem Section */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif text-[48px] text-white"
          >
            Your lobby says a lot about you.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-8 max-w-[680px] font-sans text-[18px] leading-relaxed text-[#94a3b8]"
          >
            Right now, it&apos;s probably showing weather. Maybe some company news. A meeting room schedule nobody reads. It&apos;s not bad. It&apos;s just forgettable. And forgettable is a problem when your clients, your recruits, and your employees walk through that door every single day forming an impression of who you are and what you stand for.
          </motion.p>
        </div>
      </section>

      {/* Gradient Divider: Problem to Solution */}
      <GradientDivider />

      {/* Solution Section */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif text-[48px] text-white"
          >
            What if your lobby said something true?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-8 max-w-[680px] font-sans text-[18px] leading-relaxed text-[#94a3b8]"
          >
            Terra is a stunning real-time planetary dashboard — beautifully designed, endlessly compelling, and unlike anything else on a lobby screen anywhere. It shows what&apos;s actually happening on Earth right now. Ocean temperatures. CO₂ levels. Species loss. Population. Energy consumption. Deforestation. Dozens of vital signs, cycling continuously, rendered in cinematic detail on any display. No clutter. No maintenance. No content team required. Just Earth. Alive. Now.
          </motion.p>
        </div>
      </section>

      {/* Gradient Divider: Solution to Benefits */}
      <GradientDivider />

      {/* Benefits Section */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Benefit Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0], delay: 0 }}
              whileHover={{
                y: -6,
                scale: 1.01,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(20,184,166,0.15)",
                borderColor: "rgba(20,184,166,0.5)",
              }}
              className="rounded-2xl p-8 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(20,184,166,0.3)",
                boxShadow: "0 0 20px rgba(20,184,166,0.1)",
              }}
            >
              <h3 className="font-serif text-[24px] text-white">
                It starts conversations.
              </h3>
              <p className="mt-4 font-sans text-[16px] leading-relaxed text-[#94a3b8]">
                Visitors stop. They look. They ask questions. That moment — that pause — is worth more than any welcome message you&apos;ve ever displayed.
              </p>
            </motion.div>

            {/* Benefit Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0], delay: 0.12 }}
              whileHover={{
                y: -6,
                scale: 1.01,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(20,184,166,0.15)",
                borderColor: "rgba(20,184,166,0.5)",
              }}
              className="rounded-2xl p-8 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(20,184,166,0.3)",
                boxShadow: "0 0 20px rgba(20,184,166,0.1)",
              }}
            >
              <h3 className="font-serif text-[24px] text-white">
                It shows what you stand for.
              </h3>
              <p className="mt-4 font-sans text-[16px] leading-relaxed text-[#94a3b8]">
                Any company can publish a sustainability report. Very few make planetary awareness part of their daily environment. Terra is visible proof that your organization sees the bigger picture.
              </p>
            </motion.div>

            {/* Benefit Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0], delay: 0.24 }}
              whileHover={{
                y: -6,
                scale: 1.01,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(20,184,166,0.15)",
                borderColor: "rgba(20,184,166,0.5)",
              }}
              className="rounded-2xl p-8 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(20,184,166,0.3)",
                boxShadow: "0 0 20px rgba(20,184,166,0.1)",
              }}
            >
              <h3 className="font-serif text-[24px] text-white">
                It never goes stale.
              </h3>
              <p className="mt-4 font-sans text-[16px] leading-relaxed text-[#94a3b8]">
                The data updates continuously. Every person who walks past sees something different, something current, something real. Terra earns attention because it deserves it.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gradient Divider: Benefits to What's in the Box */}
      <GradientDivider />

      {/* What's in the Box Section */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Text Content - Left */}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="font-serif text-[48px] text-white"
              >
                What&apos;s in the box
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                className="mt-8 max-w-[680px] font-sans text-[18px] leading-relaxed text-[#94a3b8]"
              >
                Every Terra subscription includes a pre-configured Google TV Streamer. Plug it into any HDMI display, connect to WiFi, and Terra launches automatically. No IT department. No technical setup. No configuration required. It just works.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                className="mt-6 font-sans text-[14px] text-[#64748b]"
              >
                Device included with every subscription. Minimum 90-day commitment. Cancel anytime after that.
              </motion.p>
            </div>
            
            {/* Device Visual - Right */}
            <div className="flex justify-center md:justify-end">
              <DeviceVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Divider: What's in the Box to IT Requirements */}
      <GradientDivider />

      {/* IT Requirements Section */}
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[900px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center"
          >
            <p
              className="font-mono uppercase text-[#14b8a6]"
              style={{ fontSize: "11px", letterSpacing: "0.2em" }}
            >
              FOR IT DEPARTMENTS
            </p>
            <h2 className="mt-4 font-serif text-[48px] text-white">
              Works With What You Already Have
            </h2>
            <p
              className="mx-auto mt-4 max-w-[600px] font-sans text-[#94a3b8]"
              style={{ fontSize: "18px" }}
            >
              Terra is designed to run on standard corporate infrastructure. No special hardware. No IT project.
            </p>
          </motion.div>

          {/* Requirements Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mx-auto mt-12 max-w-[700px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(20,184,166,0.2)",
              borderRadius: "16px",
              padding: "8px 0",
            }}
          >
            {[
              { label: "Display", value: "Any HDMI-compatible TV or monitor" },
              { label: "Resolution", value: "1080p minimum — 4K recommended" },
              { label: "Internet", value: "10 Mbps WiFi or faster" },
              { label: "Network", value: "Standard HTTPS outbound only" },
              { label: "Power", value: "Standard outlet near display" },
              { label: "Operation", value: "Display on during business hours" },
            ].map((row, index, arr) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between transition-colors duration-200 hover:bg-[rgba(20,184,166,0.04)]"
                style={{
                  padding: "16px 24px",
                  borderBottom: index < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <span
                  className="font-sans uppercase text-[#64748b]"
                  style={{ fontSize: "12px", letterSpacing: "0.08em" }}
                >
                  {row.label}
                </span>
                <span className="font-sans text-[15px] text-white">
                  {row.value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Note below card */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="mt-6 text-center font-sans italic text-[#64748b]"
            style={{ fontSize: "15px" }}
          >
            No VPN required. No firewall exceptions. No IT headaches. If Netflix works in your building, Terra works in your building.
          </motion.p>
        </div>
      </section>

      {/* Gradient Divider: IT Requirements to Pricing */}
      <GradientDivider />

      {/* Pricing Section */}
      <section className="px-6 py-24 md:px-12">
        <div ref={pricingRef} className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-12 text-center font-serif text-[48px] text-white"
          >
            Pricing
          </motion.h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Monthly Card - slides in from left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex h-full flex-col rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="flex flex-col justify-end"
                style={{ minHeight: "100px", paddingBottom: "24px" }}
              >
                <p className="font-mono text-[14px] uppercase tracking-wider text-[#14b8a6]">
                  Monthly
                </p>
                <p className="mt-2 font-sans text-[14px] text-[#94a3b8]">
                  Cancel after 90 days
                </p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">1–5 screens</span>
                  <AnimatedPrice value={179} suffix="/ screen / month" delay={0} isInView={isPricingInView} />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">6–10 screens</span>
                  <AnimatedPrice value={149} suffix="/ screen / month" delay={80} isInView={isPricingInView} />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">11–25 screens</span>
                  <AnimatedPrice value={129} suffix="/ screen / month" delay={160} isInView={isPricingInView} />
                </div>
                <div className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">26–100 screens</span>
                  <AnimatedPrice value={99} suffix="/ screen / month" delay={240} isInView={isPricingInView} />
                </div>
              </div>
              
              <a
                href={terraLinks.poster}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full rounded-full bg-[#14b8a6] py-4 text-center font-sans text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488]"
              >
                Order Monthly →
              </a>
            </motion.div>

            {/* Annual Card - slides in from right */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex h-full flex-col rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(20,184,166,0.6)",
                boxShadow: "0 0 30px rgba(20,184,166,0.15)",
              }}
            >
              <div
                className="flex flex-col justify-end"
                style={{ minHeight: "100px", paddingBottom: "24px" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#14b8a6]">
                  BEST VALUE
                </p>
                <p className="mt-1 font-mono text-[14px] uppercase tracking-wider text-[#14b8a6]">
                  Annual
                </p>
                <p className="mt-2 font-sans text-[14px] text-[#94a3b8]">
                  Save 17% — billed yearly per screen
                </p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">1–5 screens</span>
                  <AnimatedPrice value={1788} suffix="/ screen / year" delay={0} isInView={isPricingInView} formatWithComma />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">6–10 screens</span>
                  <AnimatedPrice value={1488} suffix="/ screen / year" delay={80} isInView={isPricingInView} formatWithComma />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">11–25 screens</span>
                  <AnimatedPrice value={1308} suffix="/ screen / year" delay={160} isInView={isPricingInView} formatWithComma />
                </div>
                <div className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">26–100 screens</span>
                  <AnimatedPrice value={1008} suffix="/ screen / year" delay={240} isInView={isPricingInView} formatWithComma />
                </div>
              </div>
              
              <a
                href={terraLinks.print}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full rounded-full bg-[#14b8a6] py-4 text-center font-sans text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488]"
              >
                Order Annual →
              </a>
            </motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-10 text-center font-sans text-[14px] text-[#64748b]"
          >
            100+ screens?{" "}
            <a 
              href="mailto:terra@earthnow.app" 
              className="text-[#14b8a6] underline underline-offset-2 transition-colors hover:text-[#5eead4]"
            >
              Contact us for enterprise pricing.
            </a>
          </motion.p>
        </div>
      </section>

      {/* Gradient Divider: Pricing to Promise */}
      <GradientDivider />

      {/* Promise Section */}
      <section className="relative overflow-hidden px-6 py-24 md:px-12">
        {/* Ambient Orb */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.04) 40%, transparent 70%)",
            zIndex: 0,
          }}
          animate={{
            scale: [0.95, 1.05],
            opacity: [0.6, 1],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        <div className="relative z-[1] mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif text-[36px] text-white"
          >
            Our promise
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-6 font-sans text-[18px] text-[#94a3b8]"
          >
            If Terra doesn&apos;t stop people in their tracks within 90 days, we&apos;ll help you return it. No runaround.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
            className="mt-8 font-sans text-[14px] text-[#64748b]"
          >
            Terra is a product of EarthNow —{" "}
            <Link 
              href="/" 
              className="text-[#14b8a6] underline underline-offset-2 transition-colors hover:text-[#5eead4]"
            >
              earthnow.app
            </Link>
          </motion.p>
        </div>
      </section>

      {/* Bottom spacing before footer */}
      <div className="h-24" />
    </main>
  );
}

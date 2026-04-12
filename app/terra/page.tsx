"use client";

import dynamic from "next/dynamic";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UniversalNavbar } from "@/components/universal-navbar";
import { useDonationCheckout } from "@/hooks/use-donation-checkout";

const StripePaymentForm = dynamic(
  () => import("@/components/stripe-payment-form").then((m) => ({ default: m.StripePaymentForm })),
  { ssr: false }
);
import { X, Tv, Smartphone, Box, Wifi, Check } from "lucide-react";

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
    "CO\u2082 TODAY \u00b7 60.94M TONNES",
    "\u00b7",
    "BIRTHS TODAY \u00b7 165.4K",
    "\u00b7",
    "FOREST LOST \u00b7 34.8K ACRES",
    "\u00b7",
    "OCEAN TEMP \u00b7 16.7\u00b0C",
    "\u00b7",
    "GLOBAL POPULATION \u00b7 8.1B",
    "\u00b7",
    "ENERGY TODAY \u00b7 687.78M MWH",
    "\u00b7",
    "PLASTIC TODAY \u00b7 478.8K TONNES",
    "\u00b7",
    "HUNGER DEATHS \u00b7 10.9K",
    "\u00b7",
  ];

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
      <div
        className="relative"
        style={{
          animation: "device-float 4s ease-in-out infinite alternate",
        }}
      >
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
          <div
            style={{
              width: "12px",
              height: "8px",
              background: "#0f1318",
              borderRadius: "2px",
            }}
          />
        </div>
        <div
          className="mx-auto"
          style={{
            width: "2px",
            height: "20px",
            background: "linear-gradient(to bottom, rgba(20,184,166,0.2) 0%, transparent 100%)",
          }}
        />
      </div>

      <p
        className="mt-4 text-center font-mono uppercase"
        style={{
          fontSize: "10px",
          color: "#768a9e",
          letterSpacing: "0.1em",
        }}
      >
        Google TV Streamer
      </p>

    </motion.div>
  );
}

// Waitlist form component for app notifications
function AppWaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    // Send to contact API with waitlist type
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Terra App Waitlist",
          email,
          message: "Interested in Terra app for Apple TV / Android TV",
        }),
      });
    } catch {
      // Still show success — we don't want to block the UX
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-[14px] text-[#14b8a6]"
      >
        <Check className="h-4 w-4" />
        <span>We&apos;ll notify you when the apps launch.</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-full px-4 py-2.5 text-[14px] text-white placeholder-[#768a9e] outline-none transition-all focus:ring-1 focus:ring-[#14b8a6]"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      <button
        type="submit"
        disabled={submitting}
        className="shrink-0 rounded-full px-5 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488] disabled:opacity-50"
        style={{
          background: "rgba(20,184,166,0.2)",
          border: "1px solid rgba(20,184,166,0.4)",
        }}
      >
        {submitting ? "..." : "Notify Me"}
      </button>
    </form>
  );
}

export default function TerraPage() {
  const [scrollY, setScrollY] = useState(0);
  const [terraCheckout, setTerraCheckout] = useState<{ plan: "monthly" | "annual"; quantity: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const isPricingInView = useInView(pricingRef, { once: true, margin: "-100px" });

  const {
    view: terraView,
    clientSecret: terraClientSecret,
    loading: terraLoading,
    checkoutAmount: terraCheckoutAmount,
    checkoutFrequency: terraCheckoutFrequency,
    startTerraCheckout,
    handleComplete: terraHandleComplete,
    reset: terraReset,
  } = useDonationCheckout();

  const handleTerraOrder = (plan: "monthly" | "annual") => {
    setTerraCheckout({ plan, quantity: 1 });
    startTerraCheckout({ plan, quantity: 1 });
  };

  const handleTerraClose = () => {
    setTerraCheckout(null);
    terraReset();
  };

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
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/terra-kQ81hbjOLPSEyiy18XQpdiSWqcFeNv.webp')",
            backgroundPosition: "60% center",
            transform: `translateY(${scrollY * 0.5}px)`,
            willChange: "transform",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,14,23,0.15) 0%, rgba(10,14,23,0.35) 35%, rgba(10,14,23,0.55) 60%, rgba(10,14,23,0.75) 100%)",
          }}
        />

        <div className="relative flex h-full flex-col items-center justify-center px-6 pt-16 text-center sm:pt-0">
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
            className="mt-4 font-serif text-[72px] leading-tight text-white"
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

      <LiveDataTicker />
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
            Terra is a stunning real-time planetary dashboard — beautifully designed, endlessly compelling, and unlike anything else on a lobby screen anywhere. It shows what&apos;s actually happening on Earth right now. Ocean temperatures. CO&#8322; levels. Species loss. Population. Energy consumption. Deforestation. Dozens of vital signs, cycling continuously, rendered in cinematic detail on any display. No clutter. No maintenance. No content team required. Just Earth. Alive. Now.
          </motion.p>
        </div>
      </section>

      <GradientDivider />

      {/* Benefits Section */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -200px 0px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -200px 0px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -200px 0px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
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

      <GradientDivider />

      {/* Two Ways to Run Terra */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <p
              className="font-mono uppercase text-[#14b8a6]"
              style={{ fontSize: "11px", letterSpacing: "0.2em" }}
            >
              TWO WAYS TO RUN TERRA
            </p>
            <h2 className="mt-4 font-serif text-[48px] text-white">
              Choose how you deploy
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] font-sans text-[18px] text-[#94a3b8]">
              Whether you want a turnkey hardware solution or prefer to use your own devices, Terra fits your setup.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Option 1: Hardware Device — Available Now */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(20,184,166,0.5)",
                boxShadow: "0 0 30px rgba(20,184,166,0.12)",
              }}
            >
              {/* Badge */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(20,184,166,0.15)" }}
                >
                  <Box className="h-5 w-5 text-[#14b8a6]" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#14b8a6]">
                    Available Now
                  </p>
                  <h3 className="font-serif text-[24px] text-white">
                    Terra Hardware
                  </h3>
                </div>
              </div>

              <p className="font-sans text-[16px] leading-relaxed text-[#94a3b8]">
                We ship you a pre-configured Google TV Streamer. Plug it into any HDMI display, connect to WiFi, and Terra launches automatically. No IT department. No technical setup. No configuration required. It just works.
              </p>

              {/* What's included */}
              <div className="mt-6 space-y-3">
                {[
                  "Pre-configured Google TV Streamer",
                  "Plug-and-play setup in under 2 minutes",
                  "Automatic updates and new features",
                  "Device included with subscription",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#14b8a6]" />
                    <span className="font-sans text-[14px] text-[#cbd5e1]">{item}</span>
                  </div>
                ))}
              </div>

              {/* Device visual */}
              <div className="mt-8 flex justify-center">
                <DeviceVisual />
              </div>

              <div className="mt-auto pt-8">
                <p className="mb-3 text-center font-sans text-[14px] text-[#768a9e]">
                  Starting at $179/screen/month. Scroll down for full pricing.
                </p>
                <a
                  href="#pricing"
                  className="block w-full rounded-full bg-[#14b8a6] py-3.5 text-center font-sans text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488]"
                  style={{ boxShadow: "0 0 20px rgba(20,184,166,0.25)" }}
                >
                  See Pricing
                </a>
              </div>
            </motion.div>

            {/* Option 2: TV Apps — Coming Soon */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Badge */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(148,163,184,0.12)" }}
                >
                  <Tv className="h-5 w-5 text-[#94a3b8]" />
                </div>
                <div>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.15em]"
                    style={{ color: "#f59e0b" }}
                  >
                    Coming Soon
                  </p>
                  <h3 className="font-serif text-[24px] text-white">
                    Terra Apps
                  </h3>
                </div>
              </div>

              <p className="font-sans text-[16px] leading-relaxed text-[#94a3b8]">
                Bring your own device. We&apos;re building native Terra apps for Apple TV and Android TV so you can run Terra on hardware you already own — no additional device needed.
              </p>

              {/* Platform details */}
              <div className="mt-6 space-y-3">
                {[
                  { icon: Smartphone, label: "Apple TV app" },
                  { icon: Tv, label: "Android TV app" },
                  { icon: Wifi, label: "Same real-time data, same cinematic experience" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#768a9e]" />
                    <span className="font-sans text-[14px] text-[#cbd5e1]">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Visual placeholder for apps */}
              <div className="mt-8 flex flex-1 items-center justify-center">
                <motion.div
                  className="flex items-center gap-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {/* Apple TV icon */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#94a3b8">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#768a9e]">
                      Apple TV
                    </span>
                  </div>

                  {/* Android TV icon */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#94a3b8">
                        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V7H6v11zM3.5 7C2.67 7 2 7.67 2 8.5v7c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-7C5 7.67 4.33 7 3.5 7zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#768a9e]">
                      Android TV
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Notify me */}
              <div className="mt-auto pt-8">
                <p className="mb-3 font-sans text-[14px] text-[#768a9e]">
                  Get notified when the apps are available:
                </p>
                <AppWaitlistForm />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
              Terra is designed to run on standard corporate infrastructure. No special hardware beyond the included streamer. No IT project.
            </p>
          </motion.div>

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
              { label: "Resolution", value: "1080p minimum \u2014 4K recommended" },
              { label: "Internet", value: "10 Mbps WiFi or faster" },
              { label: "Network", value: "Standard HTTPS outbound only" },
              { label: "Power", value: "Standard outlet near display" },
              { label: "Operation", value: "Display on during business hours" },
            ].map((row, index, arr) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 transition-colors duration-200 hover:bg-[rgba(20,184,166,0.04)] md:flex-row md:items-center md:justify-between"
                style={{
                  padding: "16px 24px",
                  borderBottom: index < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <span
                  className="font-sans uppercase text-[#768a9e]"
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

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="mt-6 text-center font-sans italic text-[#94a3b8]"
            style={{ fontSize: "16px" }}
          >
            No VPN required. No firewall exceptions. No IT headaches. If Netflix works in your building, Terra works in your building.
          </motion.p>
        </div>
      </section>

      <GradientDivider />

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-24 px-6 py-24 md:px-12">
        <div ref={pricingRef} className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-4 text-center"
          >
            <p
              className="font-mono uppercase text-[#14b8a6]"
              style={{ fontSize: "11px", letterSpacing: "0.2em" }}
            >
              TERRA HARDWARE
            </p>
            <h2 className="mt-4 font-serif text-[48px] text-white">
              Pricing
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] font-sans text-[16px] text-[#768a9e]">
              Device included with every subscription. Minimum 90-day commitment. Cancel anytime after that.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Monthly Card */}
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
                  <span className="font-sans text-[15px] text-[#94a3b8]">1\u20135 screens</span>
                  <AnimatedPrice value={179} suffix="/ screen / month" delay={0} isInView={isPricingInView} />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">6\u201310 screens</span>
                  <AnimatedPrice value={149} suffix="/ screen / month" delay={80} isInView={isPricingInView} />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">11\u201325 screens</span>
                  <AnimatedPrice value={129} suffix="/ screen / month" delay={160} isInView={isPricingInView} />
                </div>
                <div className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">26\u2013100 screens</span>
                  <AnimatedPrice value={99} suffix="/ screen / month" delay={240} isInView={isPricingInView} />
                </div>
              </div>

              <button
                onClick={() => handleTerraOrder("monthly")}
                disabled={terraLoading}
                className="mt-8 block w-full rounded-full bg-[#14b8a6] py-4 text-center font-sans text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488] disabled:opacity-50"
              >
                {terraLoading && terraCheckout?.plan === "monthly" ? "Setting up..." : "Order Monthly \u2192"}
              </button>
            </motion.div>

            {/* Annual Card */}
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
                  <span className="font-sans text-[15px] text-[#94a3b8]">1\u20135 screens</span>
                  <AnimatedPrice value={1788} suffix="/ screen / year" delay={0} isInView={isPricingInView} formatWithComma />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">6\u201310 screens</span>
                  <AnimatedPrice value={1488} suffix="/ screen / year" delay={80} isInView={isPricingInView} formatWithComma />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">11\u201325 screens</span>
                  <AnimatedPrice value={1308} suffix="/ screen / year" delay={160} isInView={isPricingInView} formatWithComma />
                </div>
                <div className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-sans text-[15px] text-[#94a3b8]">26\u2013100 screens</span>
                  <AnimatedPrice value={1008} suffix="/ screen / year" delay={240} isInView={isPricingInView} formatWithComma />
                </div>
              </div>

              <button
                onClick={() => handleTerraOrder("annual")}
                disabled={terraLoading}
                className="mt-8 block w-full rounded-full bg-[#14b8a6] py-4 text-center font-sans text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#0d9488] disabled:opacity-50"
              >
                {terraLoading && terraCheckout?.plan === "annual" ? "Setting up..." : "Order Annual \u2192"}
              </button>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-10 text-center font-sans text-[14px] text-[#768a9e]"
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

      <GradientDivider />

      {/* Promise Section */}
      <section className="relative overflow-hidden px-6 py-24 md:px-12">
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
            className="mt-8 font-sans text-[14px] text-[#768a9e]"
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

      <div className="h-24" />

      {/* Terra Checkout Modal */}
      <AnimatePresence>
        {terraCheckout && terraView === "checkout" && terraClientSecret && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{
                background: "rgba(10,14,23,0.85)",
                backdropFilter: "blur(8px)",
              }}
              onClick={handleTerraClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed left-1/2 top-1/2 z-[101] w-[95%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Terra checkout"
              style={{
                background: "linear-gradient(180deg, rgba(20,25,35,0.98) 0%, rgba(10,14,23,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px rgba(20,184,166,0.1)",
              }}
            >
              <button
                onClick={handleTerraClose}
                aria-label="Close checkout"
                className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <X className="h-5 w-5 text-[#94a3b8]" />
              </button>
              <div style={{ padding: "52px 20px 24px 20px" }}>
                <StripePaymentForm
                  clientSecret={terraClientSecret}
                  amount={terraCheckoutAmount}
                  frequency={terraCheckoutFrequency}
                  onComplete={() => {
                    handleTerraClose();
                    window.location.href = "/terra/thank-you";
                  }}
                  onBack={handleTerraClose}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

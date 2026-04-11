"use client";

import React, { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UniversalNavbar } from "@/components/universal-navbar";

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
];

// Session verification component (needs Suspense boundary for useSearchParams)
function PaymentVerifier() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    if (!paymentIntent) return;
    fetch(`/api/checkout/status?payment_intent=${paymentIntent}`)
      .then((res) => res.json())
      .catch(() => {
        // Silent fail — page still shows thank you
      });
  }, [paymentIntent]);

  return null;
}

export default function ThankYouPage() {
  return (
    <>
      {/* Verify payment in background */}
      <Suspense fallback={null}>
        <PaymentVerifier />
      </Suspense>

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

      {/* Main Content - Centered Thank You Section */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          className="flex max-w-2xl flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Overline Label */}
          <motion.span
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.3em]"
            style={{ color: '#14b8a6' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Support Received
          </motion.span>

          {/* Headline */}
          <motion.h1
            className="mb-8 font-serif text-[36px] font-semibold leading-tight text-white md:text-[48px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Thank you for supporting EarthNow.
          </motion.h1>

          {/* Body Copy */}
          <motion.p
            className="mb-12 max-w-xl text-[16px] leading-relaxed text-[#94a3b8] md:text-[18px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your support helps keep EarthNow independent, expand the platform, 
            deepen the data, and build the next layers of planetary storytelling.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Primary Button */}
            <Link
              href="/"
              className="rounded-full px-8 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                boxShadow: '0 4px 20px rgba(20,184,166,0.3)',
              }}
            >
              Return to EarthNow
            </Link>

            {/* Secondary Button */}
            <Link
              href="/roadmap"
              className="rounded-full px-8 py-3 text-[15px] font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              View the Roadmap
            </Link>
          </motion.div>

          {/* Subtle decorative element */}
          <motion.div
            className="mt-16 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div 
              className="h-[1px] w-8"
              style={{ background: 'linear-gradient(to right, transparent, rgba(20,184,166,0.3))' }}
            />
            <div 
              className="h-[6px] w-[6px] rounded-full"
              style={{ 
                background: '#14b8a6',
                boxShadow: '0 0 8px rgba(20,184,166,0.5)',
              }}
            />
            <div 
              className="h-[1px] w-8"
              style={{ background: 'linear-gradient(to left, transparent, rgba(20,184,166,0.3))' }}
            />
          </motion.div>
        </motion.div>
      </main>
      </div>
    </>
  );
}

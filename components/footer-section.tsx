"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { InteractiveLink } from "./interactive-link";
import { DonateModal } from "./donate-modal";

// Modal content data
const DATA_MODALS = {
  sources: {
    title: "Sources & Methodology",
    content: (
      <>
        <p className="mb-4 text-[14px] leading-relaxed text-[#cbd5e1]">
          EarthNow aggregates publicly available datasets from trusted global institutions, 
          research organizations, and real-time monitoring systems.
        </p>
        <p className="mb-3 text-[13px] font-medium text-white">Primary sources include:</p>
        <ul className="mb-4 space-y-2 text-[14px] text-[#94a3b8]">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            United Nations (UN)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            World Bank
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            NASA & NOAA
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            Global Carbon Project
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            FAO and other environmental datasets
          </li>
        </ul>
        <p className="text-[14px] leading-relaxed text-[#94a3b8]">
          Where real-time data is not available, we use modeled estimates based on the most 
          recent validated data and continuously update projections as new information becomes available.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-[#94a3b8]">
          Our goal is to balance clarity, accuracy, and immediacy—making complex planetary data 
          understandable without oversimplifying it.
        </p>
        <p className="mt-5 text-[12px] tracking-wide text-[#475569]">
          Last updated: March 2026
        </p>
      </>
    ),
  },
  calculate: {
    title: "How We Calculate",
    content: (
      <>
        <p className="mb-4 text-[14px] leading-relaxed text-[#cbd5e1]">
          EarthNow translates large-scale global data into real-time, human-readable metrics.
        </p>
        <p className="mb-3 text-[13px] font-medium text-white">This is done by:</p>
        <ul className="mb-4 space-y-2 text-[14px] text-[#94a3b8]">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            Converting annual or monthly datasets into per-second rates
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            Applying interpolation models to simulate real-time change
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14b8a6]" />
            Continuously updating values based on elapsed time
          </li>
        </ul>
        <div 
          className="mb-4 rounded-lg p-4"
          style={{
            background: 'rgba(20,184,166,0.08)',
            border: '1px solid rgba(20,184,166,0.2)',
          }}
        >
          <p className="mb-1 text-[12px] font-medium uppercase tracking-wider text-[#14b8a6]">
            Example
          </p>
          <p className="text-[13px] leading-relaxed text-[#94a3b8]">
            If annual CO₂ emissions are known, we divide that total into a per-second rate 
            and increment it continuously to reflect real-time accumulation.
          </p>
        </div>
        <p className="text-[14px] leading-relaxed text-[#94a3b8]">
          All calculations are designed to prioritize directional accuracy and intuitive 
          understanding over exact real-time measurement, which is often not possible at a global scale.
        </p>
        <p className="mt-5 text-[12px] tracking-wide text-[#475569]">
          Last updated: March 2026
        </p>
      </>
    ),
  },
  accuracy: {
    title: "Accuracy & Limitations",
    content: (
      <>
        <p className="mb-4 text-[14px] leading-relaxed text-[#cbd5e1]">
          EarthNow is designed to provide a real-time sense of planetary change, not precise measurement.
        </p>
        <p className="mb-3 text-[13px] font-medium text-white">Important considerations:</p>
        <ul className="mb-4 space-y-2 text-[14px] text-[#94a3b8]">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
            Many global systems do not report data in real time
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
            Some values are modeled using the best available data
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
            Short-term fluctuations are smoothed for clarity
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
            Regional variations are not always visible in global aggregates
          </li>
        </ul>
        <p className="mb-2 text-[13px] font-medium text-white">This means:</p>
        <p className="mb-4 text-[14px] leading-relaxed text-[#94a3b8]">
          The platform reflects the scale and direction of change, rather than exact 
          second-by-second measurements.
        </p>
        <p className="text-[14px] leading-relaxed text-[#94a3b8]">
          We continuously refine our models as better data becomes available.
        </p>
        <p className="mt-5 text-[12px] tracking-wide text-[#475569]">
          Last updated: March 2026
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <>
        <p className="mb-4 text-[12px] tracking-wide text-[#475569]">
          Last updated: March 2026
        </p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          EarthNow is operated by The Raven Group LLC. We take your privacy seriously. This policy explains what data we collect and how we use it.
        </p>
        <p className="mb-2 font-bold text-white">What we collect</p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          EarthNow does not require an account, login, or any personal information to use the site. If you make a donation through Stripe, Stripe collects your payment information directly — we never see or store your full card number. If you use the Contact form, we collect your name and email address solely to respond to your message.
        </p>
        <p className="mb-2 font-bold text-white">Analytics</p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          We use basic, privacy-respecting analytics to understand how visitors use EarthNow — such as which sections are viewed most and how long people spend on the site. We do not track individual users, build advertising profiles, or sell any data to third parties.
        </p>
        <p className="mb-2 font-bold text-white">Cookies</p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          EarthNow uses minimal cookies required for site functionality. We do not use advertising cookies, tracking pixels, or third-party marketing tools.
        </p>
        <p className="mb-2 font-bold text-white">Third-party services</p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          Payments are processed by Stripe, which has its own privacy policy. Our site is hosted on Vercel. No other third-party services have access to your data.
        </p>
        <p className="mb-2 font-bold text-white">Your data rights</p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          If you've submitted information through our Contact form and want it deleted, email us and we'll remove it promptly. Since we don't collect personal data from general site visitors, there is nothing to delete for most users.
        </p>
        <p className="mb-2 font-bold text-white">Changes to this policy</p>
        <p className="mb-4 text-[15px] leading-relaxed text-[#c9c9c9]">
          If we make changes to this policy, we'll update the date at the top of this page. We'll never introduce advertising or sell user data — that's a core commitment of the EarthNow project.
        </p>
        <p className="mb-2 font-bold text-white">Contact</p>
        <p className="text-[15px] leading-relaxed text-[#c9c9c9]">
          Questions about this policy? Use the Contact link in the footer to reach us.
        </p>
      </>
    ),
  },
};

// Floating Label Input Component
function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full rounded-lg border px-4 pb-3 pt-6 text-[14px] text-white transition-all duration-200 focus:outline-none"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: isFocused ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.1)",
          boxShadow: isFocused ? "0 0 12px rgba(20,184,166,0.15), inset 0 0 0 1px rgba(20,184,166,0.1)" : "none",
        }}
      />
      <label
        className="pointer-events-none absolute left-4 transition-all duration-200"
        style={{
          top: isActive ? "8px" : "50%",
          transform: isActive ? "translateY(0)" : "translateY(-50%)",
          fontSize: isActive ? "10px" : "14px",
          color: isFocused ? "#14b8a6" : "#768a9e",
          fontWeight: isActive ? 500 : 400,
          letterSpacing: isActive ? "0.05em" : "0",
          textTransform: isActive ? "uppercase" : "none",
        }}
      >
        {label}
      </label>
    </div>
  );
}

// Floating Label Textarea Component
function FloatingTextarea({
  label,
  value,
  onChange,
  required = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  return (
    <div className="relative">
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full resize-none rounded-lg border px-4 pb-3 pt-7 text-[14px] text-white transition-all duration-200 focus:outline-none"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: isFocused ? "rgba(20,184,166,0.5)" : "rgba(255,255,255,0.1)",
          boxShadow: isFocused ? "0 0 12px rgba(20,184,166,0.15), inset 0 0 0 1px rgba(20,184,166,0.1)" : "none",
        }}
      />
      <label
        className="pointer-events-none absolute left-4 transition-all duration-200"
        style={{
          top: isActive ? "10px" : "20px",
          fontSize: isActive ? "10px" : "14px",
          color: isFocused ? "#14b8a6" : "#768a9e",
          fontWeight: isActive ? 500 : 400,
          letterSpacing: isActive ? "0.05em" : "0",
          textTransform: isActive ? "uppercase" : "none",
        }}
      >
        {label}
      </label>
    </div>
  );
}

// Generic Modal Component
function FooterModal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: "rgba(10,14,23,0.95)",
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              background: "linear-gradient(180deg, #0d1220 0%, #0a0e17 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(20,184,166,0.08)",
              overflow: "visible",
            }}
          >
            {/* Close button - positioned inside modal, top-left */}
            <button
              onClick={onClose}
              className="absolute z-20 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              style={{
                top: "16px",
                left: "16px",
                width: "44px",
                height: "44px",
                minWidth: "44px",
                minHeight: "44px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-[#94a3b8]" />
            </button>

            {/* Content - extra top padding to avoid close button collision */}
            <div
              className="max-h-[70vh] overflow-y-auto"
              style={{
                padding: "52px 20px 24px 20px",
              }}
            >
              <h2 className="mb-6 font-serif text-[22px] font-semibold text-white md:text-[24px]" style={{ paddingTop: "8px" }}>
                {title}
              </h2>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Intent options for contact form
const INTENT_OPTIONS = [
  { value: "", label: "Select a topic" },
  { value: "general", label: "General Question" },
  { value: "partnership", label: "Partnership / Collaboration" },
  { value: "press", label: "Press / Media" },
  { value: "data", label: "Data / Research" },
  { value: "other", label: "Other" },
];

// Lead scoring helper - calculates intent level from behavioral signals
function calculateIntentLevel(
  timeSpentMs: number,
  messageLength: number,
  editCount: number,
  intent: string
): "Low" | "Medium" | "High" {
  let score = 0;
  
  // Time scoring (0-2 points)
  const timeSpentSec = timeSpentMs / 1000;
  if (timeSpentSec >= 60) score += 2;
  else if (timeSpentSec >= 10) score += 1;
  
  // Message length scoring (0-2 points)
  if (messageLength >= 400) score += 2;
  else if (messageLength >= 100) score += 1;
  
  // Edit count bonus (0-1 point) - indicates thoughtful revision
  if (editCount >= 5) score += 1;
  
  // Partnership intent boost (+1 point)
  if (intent === "partnership") score += 1;
  
  // Calculate level
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

// Contact Modal with Form - Premium Design
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", intent: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  
  // Invisible behavioral tracking (no UI impact)
  const modalOpenTimeRef = useRef<number>(0);
  const editCountRef = useRef<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Start tracking when modal opens
      modalOpenTimeRef.current = Date.now();
      editCountRef.current = 0;
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", message: "", intent: "" });
        // Reset tracking
        modalOpenTimeRef.current = 0;
        editCountRef.current = 0;
      }, 300);
    }
  }, [isOpen]);
  
  // Track form changes (invisible)
  const handleFormChange = useCallback((field: string, value: string) => {
    editCountRef.current += 1;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "", intent: "" });
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: "rgba(10,14,23,0.95)",
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Contact EarthNow"
            style={{
              background: "linear-gradient(180deg, #0d1220 0%, #0a0e17 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(20,184,166,0.08)",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
            }}
          >
            {/* Close button - sticky so it stays visible when scrolling */}
            <div className="sticky top-0 z-20" style={{ height: 0 }}>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  width: "44px",
                  height: "44px",
                  minWidth: "44px",
                  minHeight: "44px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                }}
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-[#94a3b8]" />
              </button>
            </div>

            {/* Content - extra top padding to avoid close button collision */}
            <div style={{ padding: "52px 20px 24px 20px" }}>
              {/* Header */}
              <div className="mb-6 text-center" style={{ paddingTop: "8px" }}>
                <h2 className="font-serif text-[22px] font-semibold text-white">
                  Contact EarthNow
                </h2>
                <p className="mt-2 text-[13px] text-[#768a9e]">
                  Questions, ideas, or collaboration opportunities.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="py-10 text-center"
                >
                  {/* Subtle checkmark with glow */}
                  <div 
                    className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ 
                      background: 'rgba(20,184,166,0.1)',
                      boxShadow: '0 0 24px rgba(20,184,166,0.2), 0 0 8px rgba(20,184,166,0.15)',
                    }}
                  >
                    <svg className="h-7 w-7 text-[#14b8a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Human confirmation message */}
                  <p className="text-[16px] font-medium text-[#14b8a6]">
                    Message sent. We&apos;ll be in touch soon.
                  </p>
                  <p className="mt-2 text-[13px] text-[#768a9e]">
                    Our team typically responds within 24–48 hours.
                  </p>
                  
                  <button
                    onClick={onClose}
                    className="mt-6 text-[13px] text-[#94a3b8] transition-colors hover:text-white"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Divider line above form */}
                  <div 
                    className="mb-6 h-px w-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput
                      label="Name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(value) => handleFormChange("name", value)}
                    />
                    <FloatingInput
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(value) => handleFormChange("email", value)}
                    />
                    
                    {/* Intent Selector */}
                    <div className="relative">
                      <label 
                        className="pointer-events-none absolute left-4 text-[10px] font-medium uppercase tracking-[0.05em]"
                        style={{
                          top: "8px",
                          color: formData.intent ? "#14b8a6" : "#768a9e",
                        }}
                      >
                        What is this about?
                      </label>
                      <select
                        value={formData.intent}
                        onChange={(e) => handleFormChange("intent", e.target.value)}
                        className="w-full appearance-none rounded-lg border px-4 pb-3 pt-6 text-[14px] transition-all duration-200 focus:outline-none"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderColor: formData.intent ? "rgba(20,184,166,0.3)" : "rgba(255,255,255,0.1)",
                          color: formData.intent ? "#ffffff" : "#768a9e",
                        }}
                      >
                        {INTENT_OPTIONS.map((option) => (
                          <option 
                            key={option.value} 
                            value={option.value}
                            style={{ background: "#0d1220", color: option.value ? "#ffffff" : "#768a9e" }}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {/* Dropdown arrow */}
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <svg 
                          className="h-4 w-4 text-[#768a9e]" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Dynamic Helper Text for Partnership */}
                    <AnimatePresence>
                      {formData.intent === "partnership" && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="-mt-2 mb-[-4px] text-[12px] italic text-[#768a9e]"
                        >
                          Tell us what you&apos;re building or proposing.
                        </motion.p>
                      )}
                    </AnimatePresence>
                    
                    <FloatingTextarea
                      label="Message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(value) => handleFormChange("message", value)}
                    />
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full px-6 py-3.5 text-[14px] font-semibold text-white transition-all duration-150"
                      style={{
                        background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                        border: "1px solid rgba(20,184,166,0.4)",
                        boxShadow: "0 0 20px rgba(20,184,166,0.2)",
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 0 30px rgba(20,184,166,0.35)",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </motion.button>
                    
                    {/* Error message */}
                    {submitError && (
                      <p className="mt-3 text-center text-[13px] text-red-400">
                        Something went wrong. Please try again.
                      </p>
                    )}
                    
                    {/* Confidence microcopy */}
                    <div className="mt-4 space-y-1.5 text-center">
                      <p className="text-[12px] text-[#768a9e]">Goes directly to our team</p>
                      <p className="text-[12px] text-[#768a9e]">Response within 24–48 hours</p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// About Modal Component
function AboutModal({ 
  isOpen, 
  onClose, 
  onOpenDonate 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onOpenDonate: () => void;
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleSupportClick = () => {
    onClose();
    // Small delay to allow close animation before opening donate modal
    setTimeout(() => {
      onOpenDonate();
    }, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: "rgba(10,14,23,0.95)",
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-32px)] max-w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="About EarthNow"
            style={{
              background: "linear-gradient(180deg, #0d1220 0%, #0a0e17 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(20,184,166,0.08)",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Close button - positioned inside modal, top-left */}
            <button
              onClick={onClose}
              className="absolute z-20 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              style={{
                top: "16px",
                left: "16px",
                width: "44px",
                height: "44px",
                minWidth: "44px",
                minHeight: "44px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-[#94a3b8]" />
            </button>

            {/* Content - extra top padding to avoid close button collision */}
            <div 
              className="max-h-[70vh] overflow-y-auto"
              style={{
                padding: "52px 20px 24px 20px",
              }}
            >
              <h2 className="mb-6 font-serif text-[22px] font-semibold text-white md:text-[24px]" style={{ paddingTop: "8px" }}>
                About EarthNow
              </h2>

              <div className="space-y-4 text-[14px] leading-relaxed text-[#cbd5e1]">
                <p>
                  EarthNow started with a simple question: what's actually happening on the planet right now?
                </p>
                <p>
                  Not last year's report. Not a quarterly summary. Right now — this second.
                </p>
                <p>
                  The data exists. Global organizations track births, deaths, emissions, energy use, food production, and technology adoption in extraordinary detail. But that data is buried in PDFs, spreadsheets, and academic papers that most people will never open.
                </p>
                <p>
                  EarthNow pulls that data out of the dark and puts it in motion. Every number on this site represents something real happening somewhere on Earth — a life beginning, a forest shrinking, a search being made, a meal being wasted.
                </p>
                <p>
                  We believe that seeing the planet in real time changes how you think about it. Static numbers inform. Live numbers move people.
                </p>
                <p>
                  EarthNow is an independent project built by The Raven Group LLC. No ads. No corporate sponsors. No agenda. Just data, presented honestly and cinematically.
                </p>
                <p>
                  If you'd like to support this work, every contribution helps us move from algorithmic estimates to live data feeds, expand our visualizations, and keep EarthNow free for everyone.
                </p>
              </div>

              {/* Support Button */}
              <button
                onClick={handleSupportClick}
                className="mt-8 w-full rounded-full py-3 text-[15px] font-medium text-white transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                  border: "1px solid rgba(20,184,166,0.4)",
                  boxShadow: "0 4px 20px rgba(20,184,166,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 28px rgba(20,184,166,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(20,184,166,0.25)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Support EarthNow
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function FooterSection() {
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  // Don't render footer on embed route or terra thank-you page
  if (pathname === "/embed" || pathname === "/terra/thank-you") {
  return null;
  }

  return (
    <>
      <motion.footer 
        className="px-8 py-12"
        style={{
          background: '#070b11',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1 - Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="font-serif text-[18px] font-bold text-white">
              EarthNow
            </span>
            <p className="mt-2 text-[13px] text-[#768a9e]">
              Real-time data on our living planet.
            </p>
            <p className="mt-4 text-[11px] text-[#4a5568]">
              © 2026 The Raven Group LLC. All rights reserved.
            </p>
          </motion.div>

          {/* Column 2 - Our Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              Our Data
            </span>
            <div className="mt-3 flex flex-col items-start gap-2">
              <InteractiveLink onClick={() => setActiveModal("sources")} className="text-[13px]">
                Sources & Methodology
              </InteractiveLink>
              <InteractiveLink onClick={() => setActiveModal("calculate")} className="text-[13px]">
                How We Calculate
              </InteractiveLink>
              <InteractiveLink onClick={() => setActiveModal("accuracy")} className="text-[13px]">
                Accuracy & Limitations
              </InteractiveLink>
            </div>
          </motion.div>

          {/* Column 3 - Project */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              Project
            </span>
            <div className="mt-3 flex flex-col items-start gap-2">
              <Link
                href="/terra"
                className="text-[13px] text-[#768a9e] transition-colors duration-200 hover:text-white"
              >
                Terra
              </Link>
              <Link
                href="/today"
                className="text-[13px] text-[#768a9e] transition-colors duration-200 hover:text-white"
              >
                Timeline
              </Link>
              <Link
                href="/widget"
                className="text-[13px] text-[#768a9e] transition-colors duration-200 hover:text-white"
              >
                Widget
              </Link>
              <Link
                href="/roadmap"
                className="text-[13px] text-[#768a9e] transition-colors duration-200 hover:text-white"
              >
                Roadmap
              </Link>
            </div>
          </motion.div>

          {/* Column 4 - Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              Company
            </span>
            <div className="mt-3 flex flex-col items-start gap-2">
              <InteractiveLink onClick={() => setActiveModal("about")} className="text-[13px]">
                About
              </InteractiveLink>
              <InteractiveLink onClick={() => setActiveModal("contact")} className="text-[13px]">
                Contact
              </InteractiveLink>
              <InteractiveLink onClick={() => setActiveModal("privacy")} className="text-[13px]">
                Privacy Policy
              </InteractiveLink>
            </div>
          </motion.div>
        </div>
      </motion.footer>

      {/* Data Modals */}
      <FooterModal
        isOpen={activeModal === "sources"}
        onClose={() => setActiveModal(null)}
        title={DATA_MODALS.sources.title}
      >
        {DATA_MODALS.sources.content}
      </FooterModal>

      <FooterModal
        isOpen={activeModal === "calculate"}
        onClose={() => setActiveModal(null)}
        title={DATA_MODALS.calculate.title}
      >
        {DATA_MODALS.calculate.content}
      </FooterModal>

      <FooterModal
        isOpen={activeModal === "accuracy"}
        onClose={() => setActiveModal(null)}
        title={DATA_MODALS.accuracy.title}
      >
        {DATA_MODALS.accuracy.content}
      </FooterModal>

      <FooterModal
        isOpen={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
        title={DATA_MODALS.privacy.title}
      >
        {DATA_MODALS.privacy.content}
      </FooterModal>

      {/* Contact Modal */}
      <ContactModal
        isOpen={activeModal === "contact"}
        onClose={() => setActiveModal(null)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={activeModal === "about"}
        onClose={() => setActiveModal(null)}
        onOpenDonate={() => setDonateModalOpen(true)}
      />

      {/* Donate Modal */}
      <DonateModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
      />
    </>
  );
}

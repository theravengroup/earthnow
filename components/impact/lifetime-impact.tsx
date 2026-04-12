"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Share2, Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/format";
import { useDonationCheckout } from "@/hooks/use-donation-checkout";
import { SITE_URL } from "@/lib/constants";

const StripePaymentForm = dynamic(
  () => import("@/components/stripe-payment-form").then((m) => ({ default: m.StripePaymentForm })),
  { ssr: false }
);
import {
  drawRoundRect,
  formatLargeNumber,
  formatTime,
  formatTimeWithUnit,
  PER_SECOND_RATES,
  type ShareMomentState,
} from "@/lib/canvas/generate-share-card";

// Animated Count-Up Component
export function AnimatedNumber({
  value,
  duration = 2000,
  color,
  abbreviated = false,
}: {
  value: number;
  duration?: number;
  color: string;
  abbreviated?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatted = abbreviated
    ? formatNumber(displayValue)
    : Math.floor(displayValue).toLocaleString();

  return (
    <span
      className="font-mono text-[28px] font-semibold tabular-nums md:text-[32px]"
      style={{
        color,
        textShadow: `0 0 12px ${color}4d`,
      }}
    >
      {value === 0 ? "—" : formatted}
    </span>
  );
}

// Impact Card Component
export function ImpactCard({
  value,
  label,
  color,
  abbreviated = false,
  comparison,
}: {
  value: number;
  label: string;
  color: string;
  abbreviated?: boolean;
  comparison?: string;
}) {
  const accentTint = `linear-gradient(135deg, ${color}14 0%, transparent 60%)`;

  return (
    <div
      className="overflow-hidden rounded-2xl p-6"
      style={{
        background: `${accentTint}, linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)`,
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      <AnimatedNumber value={value} color={color} abbreviated={abbreviated} />
      <div className="mt-2 text-[12px] font-medium uppercase tracking-wider text-[#94a3b8]">
        {label}
      </div>
      {comparison && value > 0 && (
        <div className="mt-2 text-[12px] leading-relaxed text-[#94a3b8]">
          {comparison}
        </div>
      )}
    </div>
  );
}

// Support Section Component
export function SupportSection() {
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(25);
  const [customAmount, setCustomAmount] = useState<string>("");

  const {
    view,
    clientSecret,
    loading,
    checkoutAmount,
    checkoutFrequency,
    startCheckout,
    handleComplete,
    reset,
  } = useDonationCheckout();

  const amounts = [1, 5, 10, 25, 50, 100];

  const handleDonate = () => {
    const amount =
      selectedAmount === "custom" ? parseInt(customAmount) || 0 : selectedAmount;
    if (amount <= 0) return;
    startCheckout({ frequency: donationType, amount });
  };

  if (view === "checkout" && clientSecret) {
    return (
      <div
        className="rounded-2xl p-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <StripePaymentForm
          clientSecret={clientSecret}
          amount={checkoutAmount}
          frequency={checkoutFrequency}
          onComplete={handleComplete}
          onBack={reset}
        />
      </div>
    );
  }

  if (view === "success") {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(20,184,166,0.15)' }}>
          <Check className="h-7 w-7 text-[#14b8a6]" />
        </div>
        <h3 className="mb-2 font-serif text-[22px] font-semibold text-white">
          Thank you!
        </h3>
        <p className="mb-5 text-[14px] text-[#94a3b8]">
          Your support keeps EarthNow free and ad-free.
        </p>
        <button
          onClick={reset}
          className="rounded-full px-5 py-2 text-[13px] font-medium text-[#94a3b8] transition-all hover:text-white"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Make another donation
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h3 className="mb-6 text-center font-serif text-[20px] font-medium text-white md:text-[24px]">
        Support EarthNow
      </h3>

      {/* Donation Type Toggle */}
      <div className="mb-6 flex justify-center gap-2" role="radiogroup" aria-label="Donation frequency">
        <button
          role="radio"
          aria-checked={donationType === "one-time"}
          onClick={() => setDonationType("one-time")}
          className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
            donationType === "one-time"
              ? "bg-[#14b8a6] text-white"
              : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
          }`}
        >
          One-time
        </button>
        <button
          role="radio"
          aria-checked={donationType === "monthly"}
          onClick={() => setDonationType("monthly")}
          className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
            donationType === "monthly"
              ? "bg-[#14b8a6] text-white"
              : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Amount Selection */}
      <div className="mb-6 grid grid-cols-3 gap-2 md:grid-cols-6">
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`rounded-xl py-3 text-[14px] font-medium transition-all ${
              selectedAmount === amount
                ? "bg-[#14b8a6] text-white"
                : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            $
          </span>
          <input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount("custom");
            }}
            onFocus={() => setSelectedAmount("custom")}
            className="w-full rounded-xl bg-white/5 py-3 pl-8 pr-4 text-[14px] text-white placeholder:text-[#768a9e] focus:outline-none focus:ring-1 focus:ring-[#14b8a6]"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
      </div>

      {/* Donate Button */}
      <button
        onClick={handleDonate}
        disabled={loading || (selectedAmount === "custom" && (!customAmount || parseInt(customAmount) < 1))}
        className="w-full rounded-full bg-[#14b8a6] py-4 text-[15px] font-medium text-white transition-all hover:bg-[#0d9488] disabled:opacity-50"
        style={{
          boxShadow: "0 0 30px rgba(20, 184, 166, 0.3)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Setting up payment...
          </span>
        ) : (
          <>
            Donate{" "}
            {selectedAmount === "custom"
              ? customAmount
                ? `$${customAmount}`
                : ""
              : `$${selectedAmount}`}
            {donationType === "monthly" ? "/month" : ""}
          </>
        )}
      </button>

      <p className="mt-4 text-center text-[12px] text-[#768a9e]">
        100% goes toward keeping EarthNow free and ad-free
      </p>
    </div>
  );
}

// Live time counter for ShareMoment preview card
export const LiveTimeCounter = ({ startTime }: { startTime: number }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return secs.toString();
  };

  const unit =
    elapsed < 60
      ? elapsed === 1
        ? "second"
        : "seconds"
      : elapsed < 120
      ? "minute"
      : "minutes";

  return (
    <div style={{ textAlign: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 44,
          fontWeight: 700,
          color: "#2dd4bf",
          textShadow: "0 0 30px currentColor, 0 0 60px currentColor",
          display: "block",
        }}
      >
        {formatTimeDisplay(elapsed)}
      </span>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          display: "block",
          marginTop: 4,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {unit}
      </span>
    </div>
  );
};

// Live stat counter for ShareMoment preview card
export const LiveStat = ({
  startTime,
  rate,
  label,
  color,
  isSmall = false,
}: {
  startTime: number;
  rate: number;
  label: string;
  color: string;
  isSmall?: boolean;
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setValue(elapsed * rate);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, rate]);

  const formatValue = (num: number) => {
    if (num < 1 && num > 0) return num.toFixed(2);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toLocaleString();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: isSmall ? 16 : 20,
          fontWeight: 600,
          color: color,
          textShadow: "0 0 20px currentColor",
          display: "block",
        }}
      >
        {formatValue(value)}
      </span>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: isSmall ? 9 : 11,
          color: "rgba(255,255,255,0.5)",
          display: "block",
          marginTop: 2,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// Share Moment Section Component
export const ShareMomentSection = () => {
  const [state, setState] = useState<ShareMomentState>("idle");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [isShareAction, setIsShareAction] = useState(false);
  const [globeBase64, setGlobeBase64] = useState<string | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(Date.now());
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Detect Web Share API with file support on mount
  useEffect(() => {
    const checkShareSupport = async () => {
      if (
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator
      ) {
        try {
          // Create a tiny test blob to check file sharing support
          const testBlob = new Blob(["test"], { type: "image/png" });
          const testFile = new File([testBlob], "test.png", { type: "image/png" });
          const supported = navigator.canShare({ files: [testFile] });
          setCanShareFiles(supported);
        } catch {
          setCanShareFiles(false);
        }
      } else {
        setCanShareFiles(false);
      }
    };
    checkShareSupport();
  }, []);

  // Pre-load and convert globe image to base64 on mount to avoid CORS issues with html2canvas
  useEffect(() => {
    const loadGlobeImage = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load"));
          img.src =
            "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1080&q=80";
        });

        // Convert to base64 using canvas
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          const base64 = tempCanvas.toDataURL("image/jpeg", 0.85);
          setGlobeBase64(base64);
        }
      } catch {
        // Silently fail - we'll use the CSS gradient fallback
        setGlobeBase64(null);
      }
    };

    loadGlobeImage();
  }, []);

  // Close share menu on outside click
  useEffect(() => {
    if (!shareMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target as Node)
      ) {
        setShareMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [shareMenuOpen]);

  // Generate cinematic share card on canvas (1080x1080 Instagram square)
  const generateCard = async (): Promise<{
    blob: Blob | null;
    dataUrl: string | null;
  }> => {
    const canvas = canvasRef.current;
    if (!canvas) return { blob: null, dataUrl: null };

    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: null, dataUrl: null };

    // Session data
    const currentTimeOnPage = Math.max(
      1,
      Math.floor((Date.now() - startTimeRef.current) / 1000)
    );
    const timeDisplay = formatTimeWithUnit(currentTimeOnPage);

    const metrics = {
      births: Math.floor(currentTimeOnPage * PER_SECOND_RATES.births),
      deaths: Math.floor(currentTimeOnPage * PER_SECOND_RATES.deaths),
      co2: Math.floor(currentTimeOnPage * PER_SECOND_RATES.co2),
      treesLost:
        Math.floor(currentTimeOnPage * PER_SECOND_RATES.treesLost * 100) / 100,
      energyUsed: Math.floor(currentTimeOnPage * PER_SECOND_RATES.energyUsed),
      waterUsed: Math.floor(currentTimeOnPage * PER_SECOND_RATES.waterUsed),
      googleSearches: Math.floor(
        currentTimeOnPage * PER_SECOND_RATES.googleSearches
      ),
      mealsWasted: Math.floor(currentTimeOnPage * PER_SECOND_RATES.mealsWasted),
      photosTaken: Math.floor(currentTimeOnPage * PER_SECOND_RATES.photosTaken),
    };

    // Instagram-optimized square dimensions
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const accentColor = "#2dd4bf";

    // LAYER 1: Draw Earth background
    let imageDrawn = false;

    if (globeBase64) {
      const earthImg = new Image();
      await new Promise<void>((resolve) => {
        earthImg.onload = () => {
          const imgRatio = earthImg.naturalWidth / earthImg.naturalHeight;
          const canvasRatio = width / height;
          let drawWidth, drawHeight, drawX, drawY;

          if (imgRatio > canvasRatio) {
            drawHeight = height;
            drawWidth = height * imgRatio;
            drawX = (width - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = width;
            drawHeight = width / imgRatio;
            drawX = 0;
            drawY = (height - drawHeight) / 2;
          }

          ctx.drawImage(earthImg, drawX, drawY, drawWidth, drawHeight);
          imageDrawn = true;
          resolve();
        };
        earthImg.onerror = () => resolve();
        earthImg.src = globeBase64;
      });
    }

    // Fallback: CSS-like radial gradient
    if (!imageDrawn) {
      const bgGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        0,
        width * 0.5,
        height * 0.4,
        width * 0.7
      );
      bgGradient.addColorStop(0, "#1a3a5c");
      bgGradient.addColorStop(0.4, "#0d1f33");
      bgGradient.addColorStop(0.7, "#0a0e17");
      bgGradient.addColorStop(1, "#0a0e17");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
    }

    // LAYER 2: Dark gradient overlay
    const darkOverlay = ctx.createLinearGradient(0, 0, 0, height);
    darkOverlay.addColorStop(0, "rgba(10,14,23,0.6)");
    darkOverlay.addColorStop(0.5, "rgba(10,14,23,0.85)");
    darkOverlay.addColorStop(1, "rgba(10,14,23,0.95)");
    ctx.fillStyle = darkOverlay;
    ctx.fillRect(0, 0, width, height);

    // LAYER 3: Stars overlay
    for (let i = 0; i < 60; i++) {
      const seed = i * 7919;
      const x = (seed * 13) % width;
      const y = (seed * 17) % height;
      const size = 1 + ((seed * 23) % 2);
      const opacity = 0.15 + ((seed * 29) % 30) / 100;

      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    // HEADER
    let currentY = 60;
    ctx.font = "600 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("EARTHNOW", width / 2, currentY);

    currentY += 24;
    ctx.font = "400 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("THE PLANET IN REAL TIME", width / 2, currentY);

    // QUOTE
    currentY = 145;
    ctx.font = 'italic 26px Georgia, "Times New Roman", serif';
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.fillText('"While I watched, Earth kept moving."', width / 2, currentY);

    // HERO TIME
    const heroTimeY = 260;

    // Glow effect
    ctx.save();
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 60;
    ctx.globalAlpha = 0.5;
    ctx.font = '700 72px ui-monospace, "SF Mono", Monaco, monospace';
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.fillText(timeDisplay.value, width / 2, heroTimeY);
    ctx.restore();

    // Main hero time text
    ctx.font = '700 72px ui-monospace, "SF Mono", Monaco, monospace';
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.fillText(timeDisplay.value, width / 2, heroTimeY);

    // Time unit
    ctx.font = "500 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText(timeDisplay.unit.toUpperCase(), width / 2, heroTimeY + 32);

    // STATS PANEL
    const panelY = 330;
    const panelHeight = 320;
    const panelWidth = width - 80;
    const panelX = 40;
    const panelRadius = 16;

    drawRoundRect(ctx, panelX, panelY, panelWidth, panelHeight, panelRadius);
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 9 STATS IN 3x3 GRID
    const stats = [
      { value: formatLargeNumber(metrics.births), label: "BIRTHS", color: "#22c55e" },
      { value: formatLargeNumber(metrics.deaths), label: "DEATHS", color: "#ef4444" },
      { value: formatLargeNumber(metrics.co2), label: "CO₂ (KG)", color: "#eab308" },
      {
        value:
          metrics.treesLost < 1
            ? metrics.treesLost.toFixed(2)
            : formatLargeNumber(Math.floor(metrics.treesLost)),
        label: "TREES LOST (HA)",
        color: "#ef4444",
      },
      { value: formatLargeNumber(metrics.energyUsed), label: "ENERGY (MWH)", color: "#eab308" },
      { value: formatLargeNumber(metrics.waterUsed), label: "WATER (L)", color: "#06b6d4" },
      { value: formatLargeNumber(metrics.googleSearches), label: "SEARCHES", color: "#3b82f6" },
      { value: formatLargeNumber(metrics.mealsWasted), label: "MEALS WASTED", color: "#f43f5e" },
      { value: formatLargeNumber(metrics.photosTaken), label: "PHOTOS", color: "#14b8a6" },
    ];

    const gridCols = 3;
    const gridRows = 3;
    const cellWidth = (panelWidth - 64) / gridCols;
    const cellHeight = (panelHeight - 48) / gridRows;
    const gridStartX = panelX + 32;
    const gridStartY = panelY + 24;

    stats.forEach((stat, i) => {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = gridStartX + (col + 0.5) * cellWidth;
      const y = gridStartY + (row + 0.5) * cellHeight;

      // Stat number with glow
      ctx.save();
      ctx.shadowColor = stat.color;
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.3;
      ctx.font = '700 36px ui-monospace, "SF Mono", Monaco, monospace';
      ctx.fillStyle = stat.color;
      ctx.textAlign = "center";
      ctx.fillText(stat.value, x, y);
      ctx.restore();

      ctx.font = '700 36px ui-monospace, "SF Mono", Monaco, monospace';
      ctx.fillStyle = stat.color;
      ctx.textAlign = "center";
      ctx.fillText(stat.value, x, y);

      // Label
      ctx.font = "400 11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(stat.label, x, y + 24);
    });

    // TAGLINE
    const taglineY = panelY + panelHeight + 40;
    ctx.font = 'italic 15px Georgia, "Times New Roman", serif';
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "center";
    ctx.fillText("Every second counts.", width / 2, taglineY);

    // FOOTER
    const footerY = height - 50;
    ctx.font = "400 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("earthnow.app", width / 2, footerY);

    await new Promise(requestAnimationFrame);

    const dataUrl = canvas.toDataURL("image/png");

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob, dataUrl: dataUrl && dataUrl.length > 100 ? dataUrl : null });
      }, "image/png");
    });
  };

  // Get session summary for email/share text
  const getSessionSummary = () => {
    const seconds = Math.max(
      1,
      Math.floor((Date.now() - startTimeRef.current) / 1000)
    );
    const births = Math.floor(seconds * 4.4);
    const co2 = Math.floor(seconds * 1337);
    return `In ${formatTime(seconds)} on EarthNow, ${births.toLocaleString()} lives began and ${co2.toLocaleString()} tonnes of CO₂ were released.`;
  };

  // Handle generate button click
  const handleGenerate = async () => {
    setErrorMessage(null);
    setState("generating");

    try {
      const { blob, dataUrl } = await generateCard();

      if (blob && dataUrl) {
        setImageBlob(blob);
        setImageDataUrl(dataUrl);
        setState("success");
      } else {
        setErrorMessage("Failed to generate image. Please try again.");
        setState("error");
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
      setState("error");
    }
  };

  // Share this moment
  const handleShare = async () => {
    setIsShareAction(true);
    try {
      let shareBlob = imageBlob;
      if (!shareBlob) {
        const { blob } = await generateCard();
        if (!blob) {
          toast.error("Image generation failed", {
            description: "Try Download instead",
            duration: 3000,
          });
          setIsShareAction(false);
          return;
        }
        shareBlob = blob;
        setImageBlob(blob);
      }

      const summary = getSessionSummary();

      if (navigator.share) {
        try {
          const file = new File([shareBlob], "earthnow-moment.png", {
            type: "image/png",
          });
          const canShare = navigator.canShare?.({ files: [file] });

          if (canShare) {
            await navigator.share({
              title: "My Moment on Earth",
              text: summary,
              url: SITE_URL,
              files: [file],
            });
          } else {
            await navigator.share({
              title: "My Moment on Earth",
              text: summary,
              url: SITE_URL,
            });
          }
          setShareMenuOpen(false);
          return;
        } catch (shareErr) {
          if ((shareErr as Error).name === "AbortError") {
            setIsShareAction(false);
            return;
          }
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(shareBlob);
      const link = document.createElement("a");
      link.download = `earthnow-moment-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded", {
        description: "Share not supported - image saved instead",
        duration: 2500,
      });
      setShareMenuOpen(false);
    } catch {
      toast.error("Image generation failed", {
        description: "Try Download instead",
        duration: 3000,
      });
    } finally {
      setIsShareAction(false);
    }
  };

  // Download image
  const handleDownload = async () => {
    setIsShareAction(true);
    try {
      let blob = imageBlob;
      if (!blob) {
        const result = await generateCard();
        blob = result.blob;
        if (blob) setImageBlob(blob);
      }
      if (!blob) {
        toast.error("Image generation failed", {
          description: "Please try again",
          duration: 3000,
        });
        setIsShareAction(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `earthnow-moment-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Image downloaded", {
        description: "Share card saved to your device",
        duration: 2000,
      });
      setShareMenuOpen(false);
    } catch {
      toast.error("Download failed", {
        description: "Could not generate image",
        duration: 3000,
      });
    } finally {
      setIsShareAction(false);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async () => {
    setIsShareAction(true);
    try {
      let blob = imageBlob;
      if (!blob) {
        const result = await generateCard();
        blob = result.blob;
        if (blob) setImageBlob(blob);
      }
      if (!blob) {
        toast.error("Image generation failed", {
          description: "Try Download instead",
          duration: 3000,
        });
        setIsShareAction(false);
        return;
      }

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          toast.success("Image copied", {
            description: "Share card copied to clipboard",
            duration: 2000,
          });
          setShareMenuOpen(false);
        } catch {
          toast.error("Copy not supported", {
            description: "Copy not supported in this browser",
            duration: 2500,
          });
        }
      } else {
        toast.error("Copy not supported", {
          description: "Copy not supported in this browser",
          duration: 2500,
        });
      }
    } catch {
      toast.error("Image generation failed", {
        description: "Try Download instead",
        duration: 3000,
      });
    } finally {
      setIsShareAction(false);
    }
  };

  // Handle regenerate
  const handleRegenerate = async () => {
    await handleGenerate();
  };

  return (
    <motion.section
      className="relative overflow-hidden bg-[#0a0e17] px-6 py-20 md:px-12 md:py-28"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[800px] text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-serif text-[24px] font-medium text-white md:text-[32px]">
            Share Your Moment on Earth
          </h2>
          <p className="mb-10 text-[14px] text-[#768a9e] md:text-[15px]">
            Generate a cinematic snapshot of what happened on the planet during
            your visit.
          </p>
        </motion.div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" width={1080} height={1080} />

        {/* Cinematic Preview Card - shown in idle or error state */}
        {(state === "idle" || state === "error") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-[90vw] sm:max-w-[500px]"
          >
            {/* Cinematic Card Container */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 24,
                minHeight: 520,
                marginBottom: 24,
              }}
            >
              {/* Layer 1 - Rich gradient background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, #0a0e17 0%, #0d1b2a 25%, #1b2a4a 50%, #0f2027 75%, #0a0e17 100%)",
                }}
              />

              {/* Layer 2 - Earth image */}
              <div
                style={{
                  position: "absolute",
                  top: "-60%",
                  right: "-35%",
                  width: 900,
                  height: 900,
                  aspectRatio: "1 / 1",
                  borderRadius: "50%",
                  opacity: 0.45,
                  backgroundImage:
                    "url('/earth-globe.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Layer 3 - Stars */}
              {Array.from({ length: 50 }).map((_, i) => {
                const seed = i * 7919;
                const left = (seed * 13) % 100;
                const top = (seed * 17) % 100;
                const size = 1 + ((seed * 23) % 2);
                const opacity = 0.2 + ((seed * 29) % 40) / 100;
                return (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      top: `${top}%`,
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: "#ffffff",
                      opacity: opacity,
                    }}
                  />
                );
              })}

              {/* Layer 4 - Dark gradient transition */}
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: 0,
                  right: 0,
                  height: "35%",
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(10,14,23,0.95) 100%)",
                  zIndex: 2,
                }}
              />

              {/* Layer 5 - Bottom fill */}
              <div
                style={{
                  position: "absolute",
                  top: "60%",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(10,14,23,0.95)",
                  zIndex: 2,
                }}
              />

              {/* Layer 6 - Content */}
              <div
                style={{
                  position: "relative",
                  zIndex: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minHeight: 520,
                }}
              >
                {/* Header */}
                <div style={{ padding: "28px 0", textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#ffffff",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    EarthNow
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      color: "#768a9e",
                      marginTop: 4,
                      display: "block",
                      letterSpacing: "0.1em",
                    }}
                  >
                    THE PLANET IN REAL TIME
                  </span>
                </div>

                {/* Glass panel */}
                <div
                  style={{
                    marginTop: "auto",
                    marginBottom: 32,
                    width: "78%",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    padding: "32px 28px",
                    textAlign: "center",
                    zIndex: 3,
                  }}
                >
                  {/* Intro text */}
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 18,
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: 12,
                    }}
                  >
                    "While I watched, Earth kept moving."
                  </p>

                  {/* Live time counter */}
                  <LiveTimeCounter startTime={startTimeRef.current} />

                  {/* 9 stats in 3x3 grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px 20px",
                      marginTop: 16,
                      marginBottom: 12,
                    }}
                  >
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={4.4}
                      label="Births"
                      color="#22c55e"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={1.8}
                      label="Deaths"
                      color="#ef4444"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={1337}
                      label="CO2 (kg)"
                      color="#eab308"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={0.23}
                      label="Trees (ha)"
                      color="#ef4444"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={18287}
                      label="Energy (MWh)"
                      color="#eab308"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={4340000}
                      label="Water (L)"
                      color="#06b6d4"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={98380}
                      label="Searches"
                      color="#3b82f6"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={38194}
                      label="Meals Wasted"
                      color="#f43f5e"
                      isSmall
                    />
                    <LiveStat
                      startTime={startTimeRef.current}
                      rate={54398}
                      label="Photos"
                      color="#14b8a6"
                      isSmall
                    />
                  </div>

                  {/* Tagline */}
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 8,
                    }}
                  >
                    Every second counts.
                  </p>

                  {/* Footer */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 16,
                      display: "block",
                    }}
                  >
                    earthnow.app
                  </span>
                </div>
              </div>
            </div>

            {/* Generate button */}
            <motion.button
              onClick={handleGenerate}
              className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] font-medium text-white transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.1) 100%)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                boxShadow: "0 0 30px rgba(20, 184, 166, 0.15)",
              }}
              whileHover={{ boxShadow: "0 0 40px rgba(20, 184, 166, 0.25)" }}
            >
              <Share2 className="h-5 w-5" />
              Create My Moment
            </motion.button>

            {state === "error" && errorMessage && (
              <p className="mt-4 text-[13px] text-red-400">{errorMessage}</p>
            )}
          </motion.div>
        )}

        {/* Generating state */}
        {state === "generating" && (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#14b8a6] border-t-transparent" />
            <p className="text-[14px] text-[#768a9e]">Creating your moment...</p>
          </motion.div>
        )}

        {/* Success state */}
        {state === "success" && imageDataUrl && (
          <motion.div
            className="mx-auto max-w-[90vw] sm:max-w-[540px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Card Preview */}
            <div
              className="mb-6 overflow-hidden rounded-2xl"
              style={{
                boxShadow:
                  "0 0 60px rgba(20, 184, 166, 0.15), 0 20px 40px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                aspectRatio: "1 / 1",
                maxWidth: "540px",
                width: "100%",
              }}
            >
              <img
                src={imageDataUrl}
                alt="Your moment on Earth"
                className="h-full w-full object-cover"
                style={{ display: "block" }}
              />
            </div>

            {/* Share Actions */}
            <div className="relative flex items-center justify-center gap-3">
              {canShareFiles ? (
                <div className="relative" ref={shareMenuRef}>
                  <button
                    onClick={() => setShareMenuOpen(!shareMenuOpen)}
                    className="flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.15) 100%)",
                      border: "1px solid rgba(20, 184, 166, 0.4)",
                      boxShadow: "0 0 20px rgba(20, 184, 166, 0.15)",
                    }}
                    aria-expanded={shareMenuOpen}
                    aria-haspopup="menu"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>

                  {/* Share Popover Menu */}
                  {shareMenuOpen && (
                    <div
                      className="absolute bottom-full left-1/2 z-50 mb-2 w-[220px] -translate-x-1/2 animate-in fade-in-0 slide-in-from-bottom-2"
                      style={{
                        background: "rgba(15, 20, 30, 0.97)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        boxShadow:
                          "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                      }}
                      role="menu"
                      aria-label="Share options"
                    >
                      <div className="p-1.5">
                        <button
                          onClick={handleShare}
                          disabled={isShareAction}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50"
                          role="menuitem"
                        >
                          {isShareAction ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Share2 className="h-4 w-4 text-[#94a3b8]" />
                          )}
                          {isShareAction ? "Generating..." : "Share this moment"}
                        </button>

                        <button
                          onClick={handleCopyImage}
                          disabled={isShareAction}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50"
                          role="menuitem"
                        >
                          {isShareAction ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Copy className="h-4 w-4 text-[#94a3b8]" />
                          )}
                          {isShareAction ? "Generating..." : "Copy image"}
                        </button>

                        <button
                          onClick={handleDownload}
                          disabled={isShareAction}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-white transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none disabled:opacity-50"
                          role="menuitem"
                        >
                          {isShareAction ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Download className="h-4 w-4 text-[#94a3b8]" />
                          )}
                          {isShareAction ? "Generating..." : "Download image"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleCopyImage}
                    disabled={isShareAction}
                    className="flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.15) 100%)",
                      border: "1px solid rgba(20, 184, 166, 0.4)",
                      boxShadow: "0 0 20px rgba(20, 184, 166, 0.15)",
                    }}
                  >
                    {isShareAction ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {isShareAction ? "Copying..." : "Copy Image"}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={isShareAction}
                    className="flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {isShareAction ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isShareAction ? "Downloading..." : "Download"}
                  </button>
                </>
              )}
            </div>

            {/* Regenerate option */}
            <button
              onClick={handleRegenerate}
              className="mt-6 text-[13px] text-[#768a9e] transition-colors hover:text-white"
            >
              Regenerate with current time
            </button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

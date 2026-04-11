"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Download, Copy, Check, Share2 } from "lucide-react";
import { useDonationCheckout } from "@/hooks/use-donation-checkout";
import { StripePaymentForm } from "@/components/stripe-payment-form";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copied, setCopied] = useState<"image" | "text" | null>(null);
  const [cardGenerated, setCardGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supportTimeRef = useRef<Date>(new Date());

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

  // Generate support moment card on canvas
  const generateSupportCard = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0e17');
    gradient.addColorStop(0.5, '#0d1220');
    gradient.addColorStop(1, '#070b11');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle glow in center
    const glowGradient = ctx.createRadialGradient(width/2, height/2 - 50, 0, width/2, height/2, 350);
    glowGradient.addColorStop(0, 'rgba(20, 184, 166, 0.1)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);

    // Top accent line
    ctx.fillStyle = 'rgba(20, 184, 166, 0.3)';
    ctx.fillRect(0, 0, width, 3);

    // Main text - "While I was here,"
    ctx.font = 'italic 56px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('While I was here,', width/2, 380);

    // "the planet kept moving."
    ctx.font = '56px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('the planet kept moving.', width/2, 460);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width/2 - 120, 520);
    ctx.lineTo(width/2 + 120, 520);
    ctx.stroke();

    // "I chose to support what comes next."
    ctx.font = 'italic 36px Georgia, serif';
    ctx.fillStyle = '#14b8a6';
    ctx.fillText('I chose to support what comes next.', width/2, 600);

    // Timestamp
    const now = supportTimeRef.current;
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Joined EarthNow supporters · ${dateStr}`, width/2, 680);

    // Footer URL
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('EarthNow.app', width/2, 950);

    // Brand mark in bottom-right corner
    const markX = width - 28 - 36;
    const markY = height - 28 - 36;
    const markSize = 36;

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.shadowColor = 'rgba(54, 226, 198, 0.5)';
    ctx.shadowBlur = 12;

    // Globe circle
    ctx.beginPath();
    ctx.arc(markX + markSize/2, markY + markSize/2, markSize/2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#36E2C6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Latitude line
    ctx.beginPath();
    ctx.moveTo(markX + 5, markY + markSize/2);
    ctx.lineTo(markX + markSize - 5, markY + markSize/2);
    ctx.stroke();

    // Longitude arc
    ctx.beginPath();
    ctx.ellipse(markX + markSize/2, markY + markSize/2, 7, markSize/2 - 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Bottom accent
    ctx.fillStyle = 'rgba(20, 184, 166, 0.3)';
    ctx.fillRect(0, height - 3, width, 3);

    setCardGenerated(true);
    return canvas;
  }, []);

  // Download image
  const downloadImage = async () => {
    const canvas = await generateSupportCard();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `earthnow-supporter-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Copy image to clipboard
  const copyImage = async () => {
    const canvas = await generateSupportCard();
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied('image');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback: download instead
      await downloadImage();
    }
  };

  // Copy share text
  const copyShareText = async () => {
    const text = "While I was here, the planet kept moving. I chose to support what comes next.\n\nJoin me at EarthNow.app";
    try {
      await navigator.clipboard.writeText(text);
      setCopied('text');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Silent fail
    }
  };

  // Handle modal close with state reset
  const handleClose = useCallback(() => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      reset();
      setCardGenerated(false);
      setCopied(null);
    }, 300);
  }, [onClose, reset]);

  // Handle ESC key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  }, [handleClose]);

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

  const handleDonationTypeChange = (type: "one-time" | "monthly") => {
    setDonationType(type);
    // If switching to monthly and custom is selected, auto-select $10
    if (type === "monthly" && selectedAmount === "custom") {
      setSelectedAmount(10);
    }
  };

  const handleDonate = () => {
    const amount = selectedAmount === "custom" ? parseInt(customAmount, 10) : selectedAmount;
    if (!amount || amount < 1) return;
    startCheckout({ frequency: donationType, amount });
  };

  const handlePaymentComplete = useCallback(() => {
    supportTimeRef.current = new Date();
    handleComplete();
    // Generate share card after transition
    setTimeout(() => generateSupportCard(), 100);
  }, [handleComplete, generateSupportCard]);

  // Determine modal width — wider during checkout for payment form
  const maxWidth = view === "checkout" ? "600px" : "520px";

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
              background: "rgba(10,14,23,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[101] w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
            style={{
              maxWidth,
              background: "linear-gradient(180deg, rgba(20,25,35,0.98) 0%, rgba(10,14,23,0.98) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px rgba(20,184,166,0.1)",
              overflow: "visible",
              transition: "max-width 0.3s ease",
            }}
          >
            {/* Close button - positioned inside modal, top-left */}
            <button
              onClick={handleClose}
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
              aria-label="Close donate modal"
            >
              <X className="h-5 w-5 text-[#94a3b8]" />
            </button>

            {/* Content - extra top padding to avoid close button collision */}
            <div style={{ padding: "52px 20px 24px 20px" }}>
              {view === "form" ? (
                <>
                  {/* Mission Identity Line */}
                  <p className="mb-4 text-center text-[13px] tracking-wide text-[#94a3b8]">
                    You&apos;re helping build a real-time view of the planet.
                  </p>

                  {/* Header */}
                  <div className="mb-6 text-center">
                    <h2 className="font-serif text-[24px] font-semibold text-white">
                      Support EarthNow
                    </h2>
                  </div>

                  {/* Donation Type Toggle */}
                  <div className="mb-5 flex justify-center gap-2">
                    <button
                      onClick={() => handleDonationTypeChange("one-time")}
                      className="rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: donationType === "one-time" ? "#14b8a6" : "transparent",
                        border: donationType === "one-time" ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.15)",
                        color: donationType === "one-time" ? "white" : "#94a3b8",
                        boxShadow: donationType === "one-time" ? "0 0 12px rgba(20,184,166,0.3)" : "none",
                      }}
                    >
                      One-Time
                    </button>
                    <button
                      onClick={() => handleDonationTypeChange("monthly")}
                      className="rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: donationType === "monthly" ? "#14b8a6" : "transparent",
                        border: donationType === "monthly" ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.15)",
                        color: donationType === "monthly" ? "white" : "#94a3b8",
                        boxShadow: donationType === "monthly" ? "0 0 12px rgba(20,184,166,0.3)" : "none",
                      }}
                    >
                      Monthly
                    </button>
                  </div>

                  {/* Small Contribution Encouragement */}
                  <p className="mb-3 text-center text-[13px] italic text-[#94a3b8]">
                    Even small contributions make a real difference.
                  </p>

                  {/* Amount Buttons - stacked vertically on mobile */}
                  <div className="mb-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-2">
                    {amounts.map((amount) => {
                      const isPopular = amount === 10 && donationType === "monthly";
                      const isSelected = selectedAmount === amount;

                      return (
                        <div key={amount} className="relative flex flex-col items-center">
                          {/* Recommended Label */}
                          {isPopular && (
                            <span
                              className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider"
                              style={{ color: '#14b8a6' }}
                            >
                              Recommended
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedAmount(amount)}
                            className="w-full rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 sm:w-auto sm:rounded-full sm:px-4 sm:py-2"
                            style={{
                              background: isSelected ? "#14b8a6" : isPopular ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.05)",
                              border: isSelected
                                ? "1px solid #14b8a6"
                                : isPopular
                                  ? "1px solid rgba(20,184,166,0.4)"
                                  : "1px solid rgba(255,255,255,0.1)",
                              color: isSelected ? "white" : isPopular ? "#14b8a6" : "#94a3b8",
                              boxShadow: isSelected
                                ? "0 0 12px rgba(20,184,166,0.3)"
                                : isPopular
                                  ? "0 0 16px rgba(20,184,166,0.2)"
                                  : "none",
                              transform: isPopular && !isSelected ? "scale(1.03)" : "scale(1)",
                            }}
                          >
                            ${amount}{donationType === "monthly" && "/mo"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom button row - only for one-time donations */}
                  {donationType === "one-time" && (
                    <div className="mb-4 flex justify-center">
                      <button
                        onClick={() => setSelectedAmount("custom")}
                        className="rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200"
                        style={{
                          background: selectedAmount === "custom" ? "#14b8a6" : "rgba(255,255,255,0.05)",
                          border: selectedAmount === "custom" ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.1)",
                          color: selectedAmount === "custom" ? "white" : "#94a3b8",
                          boxShadow: selectedAmount === "custom" ? "0 0 12px rgba(20,184,166,0.3)" : "none",
                        }}
                      >
                        Custom Amount
                      </button>
                    </div>
                  )}

                  {/* Custom Amount Input - only for one-time donations */}
                  {donationType === "one-time" && selectedAmount === "custom" && (
                    <div className="mb-4 flex justify-center">
                      <div className="relative w-full sm:w-auto">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">$</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          min={1}
                          className="w-full rounded-lg border py-3 pl-8 pr-4 text-center font-sans text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-[180px]"
                          style={{
                            background: "#1e293b",
                            borderColor: "#334155",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Donate Button */}
                  <motion.button
                    onClick={handleDonate}
                    disabled={loading || (selectedAmount === "custom" && (!customAmount || parseInt(customAmount) < 1))}
                    className="w-full rounded-full px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 disabled:opacity-50"
                    style={{
                      background: loading
                        ? "rgba(20,184,166,0.5)"
                        : "linear-gradient(135deg, #0f766e, #14b8a6)",
                      border: "1px solid rgba(20,184,166,0.4)",
                      boxShadow: loading
                        ? "none"
                        : "0 0 20px rgba(20,184,166,0.25), 0 4px 15px rgba(0,0,0,0.3)",
                    }}
                    whileHover={loading ? {} : {
                      scale: 1.02,
                      boxShadow: "0 0 35px rgba(20,184,166,0.4), 0 4px 15px rgba(0,0,0,0.3)",
                    }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Setting up payment...
                      </span>
                    ) : donationType === "monthly" ? (
                      "Continue to Payment"
                    ) : (
                      "Continue to Payment"
                    )}
                  </motion.button>

                  {/* Micro Impact Text */}
                  <p className="mt-3 text-center text-[12px] text-[#94a3b8]">
                    Supports real-time planetary data and tools.
                  </p>

                  {/* Trust Indicator */}
                  <div
                    className="mt-4 flex items-center justify-center gap-1.5 text-center"
                    style={{ opacity: 0.6 }}
                  >
                    <Lock className="h-3 w-3 text-[#64748b]" />
                    <span className="text-[13px] tracking-wide text-[#94a3b8]">
                      Secure payments powered by Stripe
                    </span>
                  </div>

                  {process.env.NODE_ENV === "development" && (
                    <button
                      onClick={() => {
                        supportTimeRef.current = new Date();
                        handleComplete();
                        setTimeout(() => generateSupportCard(), 100);
                      }}
                      className="mt-4 w-full text-center text-[11px] text-[#64748b] hover:text-[#94a3b8]"
                    >
                      (Test: Show success view)
                    </button>
                  )}
                </>
              ) : view === "checkout" && clientSecret ? (
                /* Checkout View - Stripe Payment Form */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    amount={checkoutAmount}
                    frequency={checkoutFrequency}
                    onComplete={handlePaymentComplete}
                    onBack={reset}
                  />
                </motion.div>
              ) : (
                /* Success View - Share Your Support */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="mb-6 text-center">
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(20,184,166,0.15)' }}>
                      <Check className="h-6 w-6 text-[#14b8a6]" />
                    </div>
                    <h2 className="mt-3 font-serif text-[22px] font-semibold text-white">
                      Thank you for your support
                    </h2>
                    <p className="mt-1 text-[13px] text-[#64748b]">
                      You&apos;re helping build a real-time view of the planet.
                    </p>
                  </div>

                  {/* Share Card Preview */}
                  <div className="mb-5">
                    <p className="mb-3 flex items-center justify-center gap-2 text-[13px] uppercase tracking-wider text-[#94a3b8]">
                      <Share2 className="h-3.5 w-3.5" />
                      Share Your Support
                    </p>
                    <div
                      className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-xl"
                      style={{
                        background: 'linear-gradient(180deg, #0a0e17 0%, #0d1220 50%, #070b11 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(20,184,166,0.08)',
                      }}
                    >
                      {/* Mini preview of the card content */}
                      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                        <p className="font-serif text-[14px] italic text-white/80">While I was here,</p>
                        <p className="font-serif text-[14px] text-white">the planet kept moving.</p>
                        <div className="my-3 h-px w-12 bg-white/10" />
                        <p className="font-serif text-[13px] italic text-[#14b8a6]">I chose to support what comes next.</p>
                      </div>
                    </div>
                  </div>

                  {/* Share Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={downloadImage}
                      className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(20,184,166,0.15)',
                        border: '1px solid rgba(20,184,166,0.3)',
                        color: '#14b8a6',
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download Image
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={copyImage}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: copied === 'image' ? '#14b8a6' : '#94a3b8',
                        }}
                      >
                        {copied === 'image' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied === 'image' ? 'Copied!' : 'Copy Image'}
                      </button>
                      <button
                        onClick={copyShareText}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: copied === 'text' ? '#14b8a6' : '#94a3b8',
                        }}
                      >
                        {copied === 'text' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied === 'text' ? 'Copied!' : 'Copy Text'}
                      </button>
                    </div>
                  </div>

                  {/* Done button */}
                  <button
                    onClick={handleClose}
                    className="mt-5 w-full text-center text-[13px] text-[#64748b] transition-colors hover:text-white"
                  >
                    Done
                  </button>

                  {/* Hidden canvas for card generation */}
                  <canvas ref={canvasRef} className="hidden" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

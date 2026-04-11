"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { monthlyLinks, oneTimeLinks } from "@/lib/payment-links";

interface DonateSectionProps {
  /** Optional ID for the section (for anchor links) */
  id?: string;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
}

export function DonateSection({ 
  id = "support",
  title = "Support EarthNow",
  description = "EarthNow is an independent project visualizing the real-time state of our planet.\n\nIf you find it meaningful, consider supporting its development.",
}: DonateSectionProps) {
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("monthly");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(10);
  const [customAmount, setCustomAmount] = useState<string>("");

  const amounts = [1, 5, 10, 25, 50, 100];

  const handleDonationTypeChange = (type: "one-time" | "monthly") => {
    setDonationType(type);
    // If switching to monthly and custom is selected, auto-select $10
    if (type === "monthly" && selectedAmount === "custom") {
      setSelectedAmount(10);
    }
  };

  const handleDonate = () => {
    let link: string;
    if (donationType === "monthly") {
      link = monthlyLinks[selectedAmount as number];
    } else {
      link = oneTimeLinks[selectedAmount];
    }
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <motion.section
      id={id}
      className="relative overflow-hidden px-6 py-24 md:px-12"
      style={{
        background: `
          radial-gradient(ellipse at center, rgba(234,179,8,0.04) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 50%, rgba(20,184,166,0.03) 0%, transparent 50%),
          #0a0e17
        `,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[800px]">
        {/* Section Heading */}
        <div className="mb-6 text-center">
          <h2 className="font-serif text-[36px] font-semibold text-white">
            {title}
          </h2>
        </div>

        {/* Body Text */}
        <p className="mx-auto mb-4 max-w-2xl whitespace-pre-line text-center text-[16px] leading-relaxed text-[#94a3b8]">
          {description}
        </p>

        {/* Social Proof */}
        <p className="mb-8 text-center text-[15px] font-medium text-[#64748b]">
          Join the people helping keep EarthNow alive.
        </p>

        {/* Supporter Identity */}
        <p className="mb-6 text-center font-serif text-[20px] text-white">
          Become an EarthNow Supporter
        </p>

        {/* Donation Type Toggle */}
        <div className="mb-6 flex justify-center gap-2">
          <button
            onClick={() => handleDonationTypeChange("one-time")}
            className="rounded-full px-6 py-2 text-[14px] font-medium transition-all duration-200"
            style={{
              background: donationType === "one-time" ? "#14b8a6" : "transparent",
              border: donationType === "one-time" ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)",
              color: donationType === "one-time" ? "white" : "#94a3b8",
              boxShadow: donationType === "one-time" ? "0 0 12px rgba(20,184,166,0.3)" : "none",
            }}
          >
            One-Time
          </button>
          <button
            onClick={() => handleDonationTypeChange("monthly")}
            className="rounded-full px-6 py-2 text-[14px] font-medium transition-all duration-200"
            style={{
              background: donationType === "monthly" ? "#14b8a6" : "transparent",
              border: donationType === "monthly" ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)",
              color: donationType === "monthly" ? "white" : "#94a3b8",
              boxShadow: donationType === "monthly" ? "0 0 12px rgba(20,184,166,0.3)" : "none",
            }}
          >
            Monthly
          </button>
        </div>

        {/* Small Contribution Encouragement */}
        <p className="mb-4 text-center text-[13px] italic text-[#64748b]">
          Even small contributions make a real difference.
        </p>

        {/* Amount Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {amounts.map((amount) => {
            const isPopular = amount === 10 && donationType === "monthly";
            const isSelected = selectedAmount === amount;
            
            return (
              <div key={amount} className="relative flex flex-col items-center">
                {/* Most Popular Label */}
                {isPopular && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-[#3b82f6]">
                    Most Popular
                  </span>
                )}
                <button
                  onClick={() => setSelectedAmount(amount)}
                  className="rounded-full px-5 py-2 text-[14px] font-medium transition-all duration-200"
                  style={{
                    background: isSelected ? "#14b8a6" : isPopular ? "rgba(59,130,246,0.1)" : "transparent",
                    border: isSelected 
                      ? "1px solid #14b8a6" 
                      : isPopular 
                        ? "1px solid rgba(255,255,255,0.25)" 
                        : "1px solid rgba(255,255,255,0.2)",
                    color: isSelected ? "white" : "#94a3b8",
                    boxShadow: isSelected 
                      ? "0 0 12px rgba(20,184,166,0.3)" 
                      : isPopular 
                        ? "0 0 12px rgba(120,180,255,0.15)" 
                        : "none",
                    transform: isPopular && !isSelected ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  ${amount}{donationType === "monthly" && "/mo"}
                </button>
              </div>
            );
          })}
          {/* Custom button only shown for one-time donations */}
          {donationType === "one-time" && (
            <button
              onClick={() => setSelectedAmount("custom")}
              className="rounded-full px-5 py-2 text-[14px] font-medium transition-all duration-200"
              style={{
                background: selectedAmount === "custom" ? "#14b8a6" : "transparent",
                border: selectedAmount === "custom" ? "1px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)",
                color: selectedAmount === "custom" ? "white" : "#94a3b8",
                boxShadow: selectedAmount === "custom" ? "0 0 12px rgba(20,184,166,0.3)" : "none",
              }}
            >
              Custom
            </button>
          )}
        </div>

        {/* Custom Amount Input - only for one-time donations */}
        {donationType === "one-time" && selectedAmount === "custom" && (
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                min={1}
                className="w-[180px] rounded-lg border py-3 pl-8 pr-4 text-center font-sans text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-teal-500"
                style={{
                  background: "#1e293b",
                  borderColor: "#334155",
                }}
              />
            </div>
          </div>
        )}

        {/* Donate Button */}
        <div className="mb-6 flex justify-center">
          <motion.button
            onClick={handleDonate}
            className="w-full max-w-md rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              border: "1px solid rgba(20,184,166,0.4)",
              boxShadow: "0 0 20px rgba(20,184,166,0.25), 0 4px 15px rgba(0,0,0,0.3)",
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 35px rgba(20,184,166,0.4), 0 4px 15px rgba(0,0,0,0.3)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            {donationType === "monthly" ? "Donate Monthly with Stripe" : "Donate with Stripe"}
          </motion.button>
        </div>

        {/* Footnote */}
        <p className="mb-4 text-center text-[13px] text-[#94a3b8]">
          Every contribution helps keep EarthNow fast, independent, and ad-free.
        </p>

        {/* Disclaimer */}
        <p className="text-center text-[11px] text-[#64748b]">
          Payments securely processed by Stripe. Monthly donations can be cancelled anytime. 
          EarthNow is a project of The Raven Group LLC.
        </p>
      </div>
    </motion.section>
  );
}

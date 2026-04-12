"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { type Appearance } from "@stripe/stripe-js";
import { getStripeClient } from "@/lib/stripe-client";
import { Lock } from "lucide-react";

// EarthNow dark theme for Stripe Elements
const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#14b8a6",
    colorBackground: "#0f1729",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorTextPlaceholder: "#768a9e",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "8px",
    spacingUnit: "4px",
    fontSizeBase: "14px",
  },
  rules: {
    ".Input": {
      backgroundColor: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "none",
      transition: "border-color 0.15s ease",
    },
    ".Input:focus": {
      border: "1px solid #14b8a6",
      boxShadow: "0 0 0 1px #14b8a6",
    },
    ".Label": {
      color: "#94a3b8",
      fontSize: "12px",
      fontWeight: "500",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    ".Tab": {
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    ".Tab--selected": {
      backgroundColor: "rgba(20,184,166,0.1)",
      border: "1px solid rgba(20,184,166,0.3)",
      color: "#ffffff",
    },
    ".Tab:hover": {
      backgroundColor: "rgba(255,255,255,0.06)",
    },
  },
};

interface CheckoutFormProps {
  amount: number;
  frequency: "one-time" | "monthly";
  onComplete: () => void;
  onBack: () => void;
}

function CheckoutForm({ amount, frequency, onComplete, onBack }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment validation failed");
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setIsProcessing(false);
    } else {
      // Payment succeeded without redirect
      onComplete();
    }
  };

  const displayAmount = `$${amount}${frequency === "monthly" ? "/month" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount summary */}
      <div
        className="flex items-center justify-between rounded-lg px-4 py-3"
        style={{
          background: "rgba(20,184,166,0.08)",
          border: "1px solid rgba(20,184,166,0.15)",
        }}
      >
        <span className="text-[13px] tracking-wide text-[#94a3b8]">
          {frequency === "monthly" ? "Monthly support" : "One-time donation"}
        </span>
        <span className="font-mono text-[18px] font-semibold text-[#14b8a6]">
          {displayAmount}
        </span>
      </div>

      {/* Stripe PaymentElement */}
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {/* Error message */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-[13px] text-[#ef4444]"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-full py-3.5 text-[15px] font-medium text-white transition-all duration-200 disabled:opacity-50"
        style={{
          background: isProcessing
            ? "rgba(20,184,166,0.5)"
            : "linear-gradient(135deg, #14b8a6, #0d9488)",
          boxShadow: isProcessing
            ? "none"
            : "0 0 20px rgba(20,184,166,0.25)",
        }}
      >
        {isProcessing ? (
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
            Processing...
          </span>
        ) : (
          `Pay ${displayAmount}`
        )}
      </button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3 text-[#768a9e]" />
        <span className="text-[12px] tracking-wide text-[#768a9e]">
          Secured by Stripe
        </span>
      </div>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isProcessing}
        className="w-full text-center text-[13px] text-[#768a9e] transition-colors hover:text-[#94a3b8] disabled:opacity-50"
      >
        ← Change amount
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  frequency: "one-time" | "monthly";
  onComplete: () => void;
  onBack: () => void;
}

export function StripePaymentForm({
  clientSecret,
  amount,
  frequency,
  onComplete,
  onBack,
}: StripePaymentFormProps) {
  return (
    <Elements
      stripe={getStripeClient()}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <CheckoutForm
        amount={amount}
        frequency={frequency}
        onComplete={onComplete}
        onBack={onBack}
      />
    </Elements>
  );
}

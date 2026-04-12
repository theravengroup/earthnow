"use client";

import { useState, FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { getStripeClient } from "@/lib/stripe-client";

const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#14b8a6",
    colorBackground: "#0f1724",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorTextPlaceholder: "#64748b",
    colorDanger: "#ef4444",
    colorIcon: "#94a3b8",
    colorIconHover: "#e2e8f0",
    fontFamily: "Outfit, system-ui, sans-serif",
    fontSizeBase: "15px",
    spacingUnit: "4px",
    borderRadius: "8px",
    focusBoxShadow: "0 0 0 2px rgba(20, 184, 166, 0.3)",
    focusOutline: "none",
  },
  rules: {
    ".Input": {
      backgroundColor: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#e2e8f0",
      padding: "12px 14px",
    },
    ".Input:focus": {
      borderColor: "#14b8a6",
      boxShadow: "0 0 0 2px rgba(20, 184, 166, 0.2)",
    },
    ".Input:hover": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    ".Input--invalid": {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.2)",
    },
    ".Label": {
      color: "#94a3b8",
      fontSize: "13px",
      fontWeight: "500",
      marginBottom: "6px",
    },
    ".Tab": {
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#94a3b8",
    },
    ".Tab:hover": {
      backgroundColor: "rgba(255,255,255,0.06)",
      color: "#e2e8f0",
    },
    ".Tab--selected": {
      backgroundColor: "rgba(20, 184, 166, 0.15)",
      borderColor: "#14b8a6",
      color: "#14b8a6",
    },
    ".TabIcon--selected": {
      fill: "#14b8a6",
    },
    ".Error": {
      color: "#ef4444",
      fontSize: "13px",
    },
  },
};

function CheckoutForm({
  amount,
  frequency,
  onComplete,
  onBack,
  returnUrl,
}: {
  amount: number;
  frequency: "one-time" | "monthly";
  onComplete: () => void;
  onBack: () => void;
  returnUrl?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || `${window.location.origin}/thank-you`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount summary */}
      <div className="mb-4 text-center">
        <p className="text-[13px] text-[#94a3b8]">
          {frequency === "monthly" ? "Monthly donation" : "One-time donation"}
        </p>
        <p className="text-[24px] font-semibold text-white">
          ${amount}
          {frequency === "monthly" && (
            <span className="text-[14px] font-normal text-[#768a9e]">/mo</span>
          )}
        </p>
      </div>

      <PaymentElement
        options={{
          layout: "accordion",
        }}
      />

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-full px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 disabled:opacity-50"
        style={{
          background: processing
            ? "rgba(20,184,166,0.5)"
            : "linear-gradient(135deg, #0f766e, #14b8a6)",
          border: "1px solid rgba(20,184,166,0.4)",
          boxShadow: processing
            ? "none"
            : "0 0 20px rgba(20,184,166,0.25), 0 4px 15px rgba(0,0,0,0.3)",
        }}
      >
        {processing
          ? "Processing..."
          : `Pay $${amount}${frequency === "monthly" ? "/mo" : ""}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-[13px] text-[#768a9e] transition-colors hover:text-[#94a3b8]"
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
  returnUrl?: string;
}

export function StripePaymentForm({
  clientSecret,
  amount,
  frequency,
  onComplete,
  onBack,
  returnUrl,
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
        returnUrl={returnUrl}
      />
    </Elements>
  );
}

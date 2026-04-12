"use client";

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe-client";

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  frequency: "one-time" | "monthly";
  onComplete: () => void;
  onBack: () => void;
}

export function StripePaymentForm({
  clientSecret,
  onBack,
}: StripePaymentFormProps) {
  return (
    <div className="space-y-4">
      <EmbeddedCheckoutProvider
        stripe={getStripeClient()}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-[13px] text-[#768a9e] transition-colors hover:text-[#94a3b8]"
      >
        ← Change amount
      </button>
    </div>
  );
}

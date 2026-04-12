"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type View = "form" | "checkout" | "success";

interface CheckoutState {
  view: View;
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
  checkoutAmount: number;
  checkoutFrequency: "one-time" | "monthly";
}

export function useDonationCheckout() {
  const [state, setState] = useState<CheckoutState>({
    view: "form",
    clientSecret: null,
    loading: false,
    error: null,
    checkoutAmount: 0,
    checkoutFrequency: "one-time",
  });

  const startCheckout = useCallback(
    async (params: {
      frequency: "one-time" | "monthly";
      amount: number;
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "donation", ...params }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to start checkout");
        }

        setState({
          view: "checkout",
          clientSecret: data.clientSecret,
          loading: false,
          error: null,
          checkoutAmount: params.amount,
          checkoutFrequency: params.frequency,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Payment failed";
        setState((prev) => ({ ...prev, loading: false, error: message }));
        toast.error(message);
      }
    },
    []
  );

  const startTerraCheckout = useCallback(
    async (params: { plan: "monthly" | "annual"; quantity: number }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "terra", ...params }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to start checkout");
        }

        setState({
          view: "checkout",
          clientSecret: data.clientSecret,
          loading: false,
          error: null,
          checkoutAmount: params.plan === "monthly" ? 179 : 1788,
          checkoutFrequency: "monthly",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Payment failed";
        setState((prev) => ({ ...prev, loading: false, error: message }));
        toast.error(message);
      }
    },
    []
  );

  const handleComplete = useCallback(() => {
    setState((prev) => ({ ...prev, view: "success" }));
  }, []);

  const reset = useCallback(() => {
    setState({
      view: "form",
      clientSecret: null,
      loading: false,
      error: null,
      checkoutAmount: 0,
      checkoutFrequency: "one-time",
    });
  }, []);

  return {
    ...state,
    startCheckout,
    startTerraCheckout,
    handleComplete,
    reset,
  };
}

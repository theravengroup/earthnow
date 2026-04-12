import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import {
  MONTHLY_PRICE_IDS,
  MONTHLY_PRODUCT_ID,
  TERRA_PRICE_IDS,
} from "@/lib/stripe-prices";

const donationSchema = z.object({
  type: z.literal("donation"),
  frequency: z.enum(["one-time", "monthly"]),
  amount: z.number().min(1).max(10000),
});

const terraSchema = z.object({
  type: z.literal("terra"),
  plan: z.enum(["monthly", "annual"]),
  quantity: z.number().min(1).max(100),
});

const requestSchema = z.discriminatedUnion("type", [
  donationSchema,
  terraSchema,
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const stripe = getStripe();

    if (parsed.type === "donation") {
      const { frequency, amount } = parsed;

      if (frequency === "one-time") {
        // One-time donation → PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100,
          currency: "usd",
          payment_method_types: ["card"],
          metadata: { type: "donation", frequency: "one-time" },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
      }

      // Monthly donation → Subscription (incomplete until payment confirmed)
      const customer = await stripe.customers.create();
      const priceId = MONTHLY_PRICE_IDS[amount];

      let items: Stripe.SubscriptionCreateParams.Item[];
      if (priceId) {
        items = [{ price: priceId, quantity: 1 }];
      } else {
        // Subscriptions API doesn't support inline price_data — create a Price first
        const price = await stripe.prices.create({
          currency: "usd",
          product: MONTHLY_PRODUCT_ID,
          unit_amount: amount * 100,
          recurring: { interval: "month" },
        });
        items = [{ price: price.id, quantity: 1 }];
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items,
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
        metadata: { type: "donation", frequency: "monthly" },
      });

      // Stripe API returns payment_intent on the expanded invoice, but the
      // v22 SDK types don't include it. Access via runtime shape.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = subscription.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret as string | undefined;
      if (!clientSecret) {
        throw new Error("Subscription created but no client secret returned");
      }

      return NextResponse.json({ clientSecret });
    }

    if (parsed.type === "terra") {
      const { plan, quantity } = parsed;
      const priceId =
        plan === "monthly"
          ? TERRA_PRICE_IDS.monthly
          : TERRA_PRICE_IDS.annual;

      const customer = await stripe.customers.create();

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId, quantity }],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
        metadata: { type: "terra", plan },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = subscription.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret as string | undefined;
      if (!clientSecret) {
        throw new Error("Subscription created but no client secret returned");
      }

      return NextResponse.json({ clientSecret });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

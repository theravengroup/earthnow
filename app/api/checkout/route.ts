import { NextResponse } from "next/server";
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
          metadata: {
            type: "donation",
            frequency: "one-time",
          },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
      }

      // Monthly donation → Subscription with incomplete payment
      const customer = await stripe.customers.create({
        metadata: { source: "earthnow", type: "monthly_donor" },
      });

      const priceId = MONTHLY_PRICE_IDS[amount];

      let subscription;
      if (priceId) {
        // Preset monthly amount — use existing Price
        subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: "default_incomplete",
          payment_settings: {
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
          metadata: { type: "donation", frequency: "monthly" },
        });
      } else {
        // Custom monthly amount — create inline price via price_data on the invoice item
        // We need to use a different approach: create subscription with price_data
        subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price_data: {
                currency: "usd",
                product: MONTHLY_PRODUCT_ID,
                unit_amount: amount * 100,
                recurring: { interval: "month" },
              },
            },
          ],
          payment_behavior: "default_incomplete",
          payment_settings: {
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
          metadata: { type: "donation", frequency: "monthly" },
        });
      }

      // Extract the PaymentIntent client_secret from the subscription's invoice
      // latest_invoice is expanded to an Invoice object, and payment_intent
      // is expanded to a PaymentIntent object (via the expand param above)
      const invoice = subscription.latest_invoice as unknown as {
        payment_intent: { client_secret: string };
      };

      return NextResponse.json({
        clientSecret: invoice.payment_intent.client_secret,
      });
    }

    if (parsed.type === "terra") {
      const { plan, quantity } = parsed;
      const priceId =
        plan === "monthly"
          ? TERRA_PRICE_IDS.monthly
          : TERRA_PRICE_IDS.annual;

      const customer = await stripe.customers.create({
        metadata: { source: "earthnow", type: "terra" },
      });

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

      // latest_invoice is expanded to an Invoice object, and payment_intent
      // is expanded to a PaymentIntent object (via the expand param above)
      const invoice = subscription.latest_invoice as unknown as {
        payment_intent: { client_secret: string };
      };

      return NextResponse.json({
        clientSecret: invoice.payment_intent.client_secret,
      });
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
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

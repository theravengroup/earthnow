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
    const origin = request.headers.get("origin") || "https://www.earthnow.app";

    if (parsed.type === "donation") {
      const { frequency, amount } = parsed;

      if (frequency === "one-time") {
        // One-time donation → PaymentIntent (embedded form)
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

      // Monthly donation → Checkout Session (redirect to Stripe)
      const priceId = MONTHLY_PRICE_IDS[amount];

      const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
        mode: "subscription",
        success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/#support`,
        metadata: { type: "donation", frequency: "monthly" },
      };

      if (priceId) {
        sessionParams.line_items = [{ price: priceId, quantity: 1 }];
      } else {
        // Custom amount — use inline price_data
        sessionParams.line_items = [
          {
            price_data: {
              currency: "usd",
              product: MONTHLY_PRODUCT_ID,
              unit_amount: amount * 100,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return NextResponse.json({ url: session.url });
    }

    if (parsed.type === "terra") {
      const { plan, quantity } = parsed;
      const priceId =
        plan === "monthly"
          ? TERRA_PRICE_IDS.monthly
          : TERRA_PRICE_IDS.annual;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity }],
        success_url: `${origin}/terra/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/terra`,
        metadata: { type: "terra", plan },
      });

      return NextResponse.json({ url: session.url });
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

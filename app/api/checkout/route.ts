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
        // One-time donation → Embedded Checkout Session (payment mode)
        const session = await stripe.checkout.sessions.create({
          ui_mode: "embedded_page",
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: { name: "EarthNow Donation" },
                unit_amount: amount * 100,
              },
              quantity: 1,
            },
          ],
          return_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
          metadata: { type: "donation", frequency: "one-time" },
        });

        return NextResponse.json({ clientSecret: session.client_secret });
      }

      // Monthly donation → Embedded Checkout Session (subscription mode)
      const priceId = MONTHLY_PRICE_IDS[amount];

      let lineItems;
      if (priceId) {
        lineItems = [{ price: priceId, quantity: 1 }];
      } else {
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product: MONTHLY_PRODUCT_ID,
              unit_amount: amount * 100,
              recurring: { interval: "month" as const },
            },
            quantity: 1,
          },
        ];
      }

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded_page",
        mode: "subscription",
        line_items: lineItems,
        return_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        metadata: { type: "donation", frequency: "monthly" },
      });

      return NextResponse.json({ clientSecret: session.client_secret });
    }

    if (parsed.type === "terra") {
      const { plan, quantity } = parsed;
      const priceId =
        plan === "monthly"
          ? TERRA_PRICE_IDS.monthly
          : TERRA_PRICE_IDS.annual;

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded_page",
        mode: "subscription",
        line_items: [{ price: priceId, quantity }],
        return_url: `${origin}/terra/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        metadata: { type: "terra", plan },
      });

      return NextResponse.json({ clientSecret: session.client_secret });
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

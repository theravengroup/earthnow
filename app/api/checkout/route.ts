import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import {
  MONTHLY_PRICE_IDS,
  ONE_TIME_PRICE_IDS,
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
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://earthnow.app";

    if (parsed.type === "donation") {
      const { frequency, amount } = parsed;
      const isMonthly = frequency === "monthly";
      const mode = isMonthly ? "subscription" : "payment";

      // Check for a preset price ID
      const priceIds = isMonthly ? MONTHLY_PRICE_IDS : ONE_TIME_PRICE_IDS;
      const presetPriceId = priceIds[amount];

      let lineItems: Array<{
        price?: string;
        price_data?: {
          currency: string;
          product: string;
          unit_amount: number;
          recurring?: { interval: "month" };
        };
        quantity: number;
      }>;

      if (presetPriceId) {
        // Use existing price
        lineItems = [{ price: presetPriceId, quantity: 1 }];
      } else {
        // Custom amount — create inline price_data
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product: MONTHLY_PRODUCT_ID,
              unit_amount: amount * 100,
              ...(isMonthly ? { recurring: { interval: "month" as const } } : {}),
            },
            quantity: 1,
          },
        ];
      }

      const session = await stripe.checkout.sessions.create({
        mode,
        line_items: lineItems,
        ui_mode: "elements",
        return_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
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
        mode: "subscription",
        line_items: [{ price: priceId, quantity }],
        ui_mode: "elements",
        return_url: `${baseUrl}/terra/thank-you?session_id={CHECKOUT_SESSION_ID}`,
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
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

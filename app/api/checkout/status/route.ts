import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Missing payment_intent" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment status" },
      { status: 500 }
    );
  }
}

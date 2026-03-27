import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

let resend: Resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  screensOrdered: z.number().min(1, "At least one screen must be ordered"),
  specialInstructions: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors.map(e => e.message).join(", ");
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

    const {
      fullName,
      companyName,
      email,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      screensOrdered,
      specialInstructions,
    } = result.data;

    const emailBody = `
Terra Order — Shipping Details

Full Name: ${fullName}
Company Name: ${companyName}
Email: ${email}

SHIPPING ADDRESS:
${streetAddress}
${city}, ${state} ${zipCode}
${country}

Number of Screens Ordered: ${screensOrdered}

Special Instructions:
${specialInstructions || "None"}
    `.trim();

    await getResend().emails.send({
      from: "Terra <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "terra@earthnow.app",
      subject: `Terra Order — Shipping Details — ${companyName}`,
      text: emailBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Terra shipping email error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}

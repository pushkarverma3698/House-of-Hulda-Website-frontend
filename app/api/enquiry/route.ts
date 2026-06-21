import { NextResponse } from "next/server";
import { BUSINESS } from "@/lib/site-config";

/**
 * Server-side enquiry capture. The booking panel's primary path is a WhatsApp
 * deep-link (works with zero backend), but we ALSO POST here so no lead is ever
 * lost if the guest abandons WhatsApp. This:
 *   1. validates the payload,
 *   2. emails the owner via Resend IF `RESEND_API_KEY` is set (optional),
 *   3. always logs server-side so enquiries are visible in deploy logs.
 *
 * No secrets reach the client. If Resend isn't configured the endpoint still
 * succeeds — the WhatsApp link remains the guaranteed delivery channel.
 */

interface EnquiryPayload {
  mood: string;
  packageName: string;
  arrive: string;
  nights: number;
  total: number;
  name?: string;
  contact?: string;
}

function isValidEnquiry(body: unknown): body is EnquiryPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.mood === "string" &&
    typeof b.packageName === "string" &&
    typeof b.arrive === "string" &&
    typeof b.nights === "number" &&
    typeof b.total === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidEnquiry(body)) {
    return NextResponse.json({ ok: false, error: "Invalid enquiry" }, { status: 422 });
  }

  const enquiry = body;
  const summary =
    `New enquiry · ${enquiry.packageName} (${enquiry.mood}) · ` +
    `arrive ${enquiry.arrive} · ${enquiry.nights} nights · ₹${enquiry.total.toLocaleString("en-IN")}` +
    (enquiry.name ? ` · ${enquiry.name}` : "") +
    (enquiry.contact ? ` · ${enquiry.contact}` : "");

  // Always visible in Vercel logs as a fallback capture.
  console.info("[enquiry]", summary);

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.ENQUIRY_FROM ?? "House of Hulda <onboarding@resend.dev>",
          to: BUSINESS.email,
          subject: `Stay enquiry — ${enquiry.packageName}`,
          text: summary,
        }),
      });
    } catch (error: unknown) {
      // Email is best-effort; WhatsApp is the guaranteed channel. Don't fail the request.
      console.error("[enquiry] email failed", error);
    }
  }

  return NextResponse.json({ ok: true });
}

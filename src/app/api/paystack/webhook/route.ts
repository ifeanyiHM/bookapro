import { NextResponse } from "next/server";
import { confirmPayment, getBookingById } from "@/lib/bookings";
import { notifyPaid } from "@/lib/notify";
import { verifyWebhookSignature } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let event: { event?: string; data?: { reference?: string; amount?: number; currency?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }
  if (event.event === "charge.success" && event.data?.reference && event.data.status === "success" && event.data.currency === "NGN") {
    const result = await confirmPayment(event.data.reference, { amountKobo: event.data.amount ?? 0, raw: event });
    if (result.state === "confirmed" && result.bookingId) {
      const booking = await getBookingById(result.bookingId);
      if (booking) await notifyPaid(booking);
    }
  }
  // Always acknowledge so Paystack does not keep retrying events we have handled or can't act on.
  return NextResponse.json({ received: true });
}

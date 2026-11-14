import { NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { grantBookingAccess } from "@/lib/auth";
import { confirmPayment, getBookingById, getBookingRefForPayment } from "@/lib/bookings";
import { notifyPaid } from "@/lib/notify";
import { verifyTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";

/** Paystack sends the customer back here. We never trust the redirect: the payment is verified with Paystack first. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";
  const ref = reference ? await getBookingRefForPayment(reference) : null;
  if (!ref) return NextResponse.redirect(new URL("/booking", SITE.url));

  let outcome = "failed";
  try {
    const v = await verifyTransaction(reference);
    if (v.success && v.currency === "NGN") {
      const result = await confirmPayment(reference, { amountKobo: v.amountKobo, raw: v.raw });
      if (result.state === "confirmed" && result.bookingId) {
        const booking = await getBookingById(result.bookingId);
        if (booking) await notifyPaid(booking);
      }
      outcome = result.state === "mismatch" ? "failed" : "paid";
    }
  } catch (err) {
    console.error("[paystack callback] verify failed", err);
  }
  await grantBookingAccess(ref);
  return NextResponse.redirect(new URL(`/booking/${ref}?payment=${outcome}`, SITE.url));
}

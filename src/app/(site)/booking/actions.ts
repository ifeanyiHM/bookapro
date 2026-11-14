"use server";

import { redirect } from "next/navigation";
import { HOLD_MINUTES } from "@/config/booking";
import { grantBookingAccess, readBookingAccess } from "@/lib/auth";
import { getBookingByRef, startPayment } from "@/lib/bookings";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { lookupSchema } from "@/lib/validation";

export interface LookupState {
  error?: string;
  ref?: string;
  phone?: string;
}

export async function lookupAction(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const raw = { ref: String(formData.get("ref") ?? ""), phone: String(formData.get("phone") ?? "") };
  if (!rateLimit(`lookup:${await clientIp()}`, 10, 10 * 60_000)) {
    return { ...raw, error: "Too many tries. Please wait a few minutes and try again." };
  }
  const parsed = lookupSchema.safeParse(raw);
  if (!parsed.success) {
    return { ...raw, error: "Enter your booking reference (it starts with IC-) and the Nigerian phone number you booked with." };
  }
  const booking = await getBookingByRef(parsed.data.ref);
  // Same message whether the reference or the phone number is wrong, so this can't be used to find references.
  if (!booking || booking.customerPhone !== parsed.data.phone) {
    return { ...raw, error: "We could not find a booking with those details. Check the reference in your confirmation email and the phone number you used." };
  }
  await grantBookingAccess(booking.ref);
  redirect(`/booking/${booking.ref}`);
}

export async function retryPaymentAction(formData: FormData) {
  const ref = String(formData.get("ref") ?? "");
  const access = await readBookingAccess();
  const booking = access.includes(ref) ? await getBookingByRef(ref) : null;
  if (!booking) redirect("/booking");

  const expired = Date.now() - new Date(booking.createdAt).getTime() > HOLD_MINUTES * 60_000;
  if (booking.status !== "pending_payment" || expired) redirect(`/booking/${ref}`);

  let url: string | null = null;
  try {
    url = (await startPayment(booking)).url;
  } catch (err) {
    console.error("[retry payment] failed", err);
  }
  redirect(url ?? `/booking/${ref}?payment=failed`);
}

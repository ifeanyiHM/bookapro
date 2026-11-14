import { NextResponse } from "next/server";
import { canBook, nextStep } from "@/lib/access";
import { getCustomerProfile } from "@/lib/accounts";
import { getCurrentUser, grantBookingAccess } from "@/lib/auth";
import { createBooking, startPayment } from "@/lib/bookings";
import { clearDrafts } from "@/lib/drafts";
import { isSameOrigin } from "@/lib/origin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { bookingSchema, zodFieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ ok: false, message: "Request not allowed." }, { status: 403 });

  // The server decides who may book and pay. The page only reflects it.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, code: "auth_required", message: "Sign in or create an account to book." },
      { status: 401 },
    );
  }
  if (user.role === "admin" || user.role === "technician") {
    return NextResponse.json(
      { ok: false, message: "Admin and technician accounts cannot make bookings. Sign in with a customer account." },
      { status: 403 },
    );
  }
  if (!canBook(user)) {
    return NextResponse.json(
      { ok: false, code: "onboarding_required", message: "Finish setting up your account before paying.", redirectUrl: nextStep(user) ?? "/" },
      { status: 403 },
    );
  }

  if (!(await rateLimit(`book-user:${user.id}`, 10, 10 * 60_000)) || !(await rateLimit(`book-ip:${await clientIp()}`, 30, 10 * 60_000))) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: zodFieldErrors(parsed.error) }, { status: 400 });
  }
  // The honeypot field was filled in: pretend it worked.
  if (parsed.data.company) return NextResponse.json({ ok: true, redirectUrl: "/" });

  const profile = await getCustomerProfile(user.id);
  if (!profile) return NextResponse.json({ ok: false, code: "onboarding_required", message: "Finish your profile first.", redirectUrl: "/onboarding/customer" }, { status: 403 });

  const result = await createBooking(parsed.data, { userId: user.id, name: profile.name, phone: profile.phone, email: user.email });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.field ? { [result.field]: result.message } : undefined, message: result.message },
      { status: 409 },
    );
  }
  await grantBookingAccess(result.booking.ref);
  await clearDrafts(user.id);
  try {
    const { url } = await startPayment(result.booking);
    return NextResponse.json({ ok: true, redirectUrl: url });
  } catch (err) {
    console.error("[booking] could not start payment", err);
    // The booking exists and holds its slot for a while; the customer can retry payment from its page.
    return NextResponse.json({ ok: true, redirectUrl: `/booking/${result.booking.ref}?payment=failed` });
  }
}

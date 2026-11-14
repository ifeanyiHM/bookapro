import { NextResponse } from "next/server";
import { canBook, nextStep } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";
import { isWindowBookable } from "@/lib/availability";
import { getAreaById, getServiceBySlug } from "@/lib/catalog";
import { saveDraft } from "@/lib/drafts";
import { isSameOrigin } from "@/lib/origin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { bookingSchema, zodFieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Saves a booking in progress for someone who still has to register, confirm their email or finish a profile.
 * Nothing is reserved and nothing is charged. The same checks as a real booking run first, so a saved draft
 * is always one the person could have finished.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ ok: false, message: "Request not allowed." }, { status: 403 });
  if (!(await rateLimit(`draft:${await clientIp()}`, 30, 10 * 60_000))) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, errors: zodFieldErrors(parsed.error) }, { status: 400 });
  if (parsed.data.company) return NextResponse.json({ ok: true, redirectUrl: "/get-started" });

  const user = await getCurrentUser();
  if (user && (user.role === "admin" || user.role === "technician")) {
    return NextResponse.json({ ok: false, message: "Admin and technician accounts cannot make bookings. Sign in with a customer account." }, { status: 403 });
  }

  const [service, area] = await Promise.all([getServiceBySlug(parsed.data.serviceSlug), getAreaById(parsed.data.areaId)]);
  if (!service?.active) return NextResponse.json({ ok: false, errors: { serviceSlug: "That service is not available." } }, { status: 400 });
  if (!area?.active) return NextResponse.json({ ok: false, errors: { areaId: "We do not cover that area yet." } }, { status: 400 });
  if (!isWindowBookable(parsed.data.date, parsed.data.window)) {
    return NextResponse.json({ ok: false, errors: { window: "That time can no longer be booked. Pick another window." } }, { status: 400 });
  }

  const { company: _company, ...draft } = parsed.data;
  await saveDraft(draft, user?.id ?? null);
  const redirectUrl = !user ? "/get-started" : canBook(user) ? "/book?resume=1" : (nextStep(user) ?? "/book?resume=1");
  return NextResponse.json({ ok: true, redirectUrl });
}

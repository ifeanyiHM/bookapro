import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LookupForm } from "@/components/booking/LookupForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "@/components/ui/Ticket";
import { HOLD_MINUTES } from "@/config/booking";
import { SITE } from "@/config/site";
import { getCurrentUser, readBookingAccess } from "@/lib/auth";
import { getBookingByRef, getBookingEvents } from "@/lib/bookings";
import { formatDateTime, formatDayLong, formatNaira, windowLabel } from "@/lib/format";
import { space, type } from "@/lib/scale";
import { retryPaymentAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

const EVENT_LABEL: Record<string, string> = {
  pending_payment: "Booking created",
  paid: "Payment received",
  assigned: "Technician assigned",
  in_progress: "Work started",
  completed: "Job completed",
  cancelled: "Booking cancelled",
};

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { ref: rawRef } = await params;
  const ref = decodeURIComponent(rawRef).toUpperCase();
  const { payment } = await searchParams;

  const access = await readBookingAccess();
  const user = await getCurrentUser();
  const existing = user ? await getBookingByRef(ref) : null;
  const isOwner = !!user && !!existing && existing.customerUserId === user.id;
  if (!access.includes(ref) && !isOwner) {
    return (
      <Container className={`${space.sectionTight} max-w-2xl xl1:max-w-3xl xl3:max-w-4xl`}>
        <h1 className={type.h1}>Check a booking</h1>
        <p className={`${type.lead} mb-8 mt-3`}>Enter the phone number you booked with to see this booking.</p>
        <LookupForm initialRef={ref} />
      </Container>
    );
  }

  const booking = await getBookingByRef(ref);
  if (!booking) notFound();
  const events = await getBookingEvents(booking.id);

  const expired =
    booking.status === "pending_payment" && Date.now() - new Date(booking.createdAt).getTime() > HOLD_MINUTES * 60_000;
  const awaiting = booking.status === "pending_payment" && !expired;

  return (
    <Container className={`${space.sectionTight} grid gap-10 lg:grid-cols-[1fr_1.1fr] xl1:gap-20 xl3:gap-28`}>
      <div className="space-y-6 xl1:space-y-8">
        <h1 className={type.h1}>{booking.status === "completed" ? "Job completed" : "Your booking"}</h1>

        {payment === "paid" && booking.status !== "pending_payment" && (
          <p role="status" className="flex items-start gap-2 rounded-md border border-success/40 bg-success-tint p-4 text-success xl1:p-5 xl1:text-lg">
            <CheckCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 xl1:size-6" />
            Payment received. Your booking is confirmed and we are assigning a technician.
          </p>
        )}
        {awaiting && (
          <div role="status" className="rounded-md border border-warning/40 bg-warning-tint p-4 text-warning xl1:p-5 xl1:text-lg">
            <p className="flex items-start gap-2 font-semibold">
              <WarningCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 xl1:size-6" />
              {payment === "failed" ? "We could not confirm a payment for this booking." : "This booking is waiting for payment."}
            </p>
            <p className="mt-1">Your time slot is held for {HOLD_MINUTES} minutes from when you booked.</p>
            <form action={retryPaymentAction} className="mt-3">
              <input type="hidden" name="ref" value={booking.ref} />
              <Button type="submit">Pay {formatNaira(booking.priceKobo)} with Paystack</Button>
            </form>
          </div>
        )}
        {expired && (
          <div role="status" className="rounded-md border border-line-strong bg-surface-2 p-4 xl1:p-5 xl1:text-lg">
            <p className="font-semibold">This booking expired because it was not paid in time.</p>
            <p className="mt-1">If you already paid, our team will see it and contact you. Otherwise you can book again.</p>
            <ButtonLink href={`/book`} className="mt-3">
              Book again
            </ButtonLink>
          </div>
        )}

        <div>
          <h2 className={`${type.h3} mb-3`}>Progress</h2>
          <ol className="space-y-3 border-l-2 border-line-strong pl-5 xl3:space-y-4">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span aria-hidden="true" className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-brand xl3:top-2.5" />
                <p className={`${type.body} font-medium`}>{EVENT_LABEL[e.status] ?? e.status}</p>
                <p className="text-sm text-muted xl1:text-base">{formatDateTime(e.createdAt)}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-2 text-sm text-ink-soft xl1:text-base">
          <p className="flex items-start gap-2">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
            <span>
              To change or cancel this booking, {SITE.teamEmail ? (
                <>
                  email <a className="font-semibold text-brand underline underline-offset-4" href={`mailto:${SITE.teamEmail}?subject=${encodeURIComponent(`Booking ${booking.ref}`)}`}>{SITE.teamEmail}</a> with your reference.
                </>
              ) : (
                "reply to your confirmation email and quote your reference."
              )}
            </span>
          </p>
          <p>
            Large or new-build job?{" "}
            <Link href="/contact-team" className="font-semibold text-brand underline underline-offset-4">
              Contact our team.
            </Link>
          </p>
        </div>
      </div>

      <div className="self-start">
        <Ticket
          reference={booking.ref}
          title={booking.serviceName}
          status={<StatusBadge status={booking.status} label={expired ? "Expired" : undefined} />}
          rows={[
            { label: "Area", value: booking.areaName },
            { label: "Date", value: formatDayLong(booking.slotDate) },
            { label: "Arrival window", value: windowLabel(booking.slotWindow) },
            { label: "Address", value: booking.landmark ? `${booking.address} (${booking.landmark})` : booking.address },
            { label: "Technician", value: booking.technicianName ?? <span className="text-muted">Not assigned yet</span> },
          ]}
          total={{ label: "Price", value: formatNaira(booking.priceKobo) }}
        />
      </div>
    </Container>
  );
}

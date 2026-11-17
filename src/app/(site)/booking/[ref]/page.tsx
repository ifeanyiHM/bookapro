import { LookupForm } from "@/components/booking/LookupForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "@/components/ui/Ticket";
import { HOLD_MINUTES } from "@/config/booking";
import { SITE } from "@/config/site";
import { getCurrentUser, readBookingAccess } from "@/lib/auth";
import { getBookingByRef, getBookingEvents } from "@/lib/bookings";
import {
  formatDateTime,
  formatDayLong,
  formatNaira,
  windowLabel,
} from "@/lib/format";
import { space, type } from "@/lib/scale";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  WarningCircle,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { retryPaymentAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false },
};

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
      <Container
        className={`${space.sectionTight} max-w-2xl xl1:max-w-3xl xl3:max-w-4xl`}
      >
        <div className="mx-auto max-w-xl">
          <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <CalendarCheck size={26} weight="duotone" />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Booking lookup
          </p>
          <h1 className={type.h1}>Let's find your booking.</h1>
          <p className={`${type.lead} mb-8 mt-3`}>
            Enter the phone number you booked with to verify your details and
            view your booking.
          </p>

          <div className="rounded-xl border border-line bg-white p-5 sm:p-7">
            <LookupForm initialRef={ref} />
          </div>
        </div>
      </Container>
    );
  }

  const booking = await getBookingByRef(ref);
  if (!booking) notFound();

  const events = await getBookingEvents(booking.id);

  const expired =
    booking.status === "pending_payment" &&
    Date.now() - new Date(booking.createdAt).getTime() > HOLD_MINUTES * 60_000;

  const awaiting = booking.status === "pending_payment" && !expired;

  const heading =
    booking.status === "completed"
      ? "Job completed"
      : booking.status === "cancelled"
        ? "Booking cancelled"
        : "Your booking";

  return (
    <Container
      className={`${space.sectionTight} max-w-6xl xl1:max-w-7xl xl3:max-w-360`}
    >
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end xl1:mb-10">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Booking details
          </p>
          <h1 className={type.h1}>{heading}</h1>
          <p className={`${type.body} mt-2 text-ink-soft`}>
            Track your service, check your schedule and view your booking
            information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted">Reference: {booking.ref}</span>
          <StatusBadge
            status={booking.status}
            label={expired ? "Expired" : undefined}
          />
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr] xl1:gap-12 xl3:gap-16">
        {/* Booking progress */}
        <div className="min-w-0 space-y-7 xl1:space-y-9">
          {/* Payment and booking alerts */}
          {payment === "paid" && booking.status !== "pending_payment" && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-tint p-4 text-success xl1:p-5"
            >
              <CheckCircle
                aria-hidden="true"
                weight="fill"
                className="mt-0.5 size-6 shrink-0"
              />
              <div>
                <p className="font-semibold">Payment received</p>
                <p className="mt-1 text-sm leading-6">
                  Your booking is confirmed. We are processing the next steps
                  for your service.
                </p>
              </div>
            </div>
          )}

          {awaiting && (
            <div
              role="status"
              className="rounded-xl border border-warning/40 bg-warning-tint p-4 text-warning xl1:p-5"
            >
              <div className="flex items-start gap-3">
                <WarningCircle
                  aria-hidden="true"
                  weight="fill"
                  className="mt-0.5 size-6 shrink-0"
                />
                <div>
                  <p className="font-semibold">
                    {payment === "failed"
                      ? "We could not confirm your payment."
                      : "Payment is needed to confirm your booking."}
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    Your time slot is held for {HOLD_MINUTES} minutes from when
                    you booked. Complete your payment to secure it.
                  </p>
                </div>
              </div>

              <form action={retryPaymentAction} className="mt-4">
                <input type="hidden" name="ref" value={booking.ref} />
                <Button type="submit">
                  Pay {formatNaira(booking.priceKobo)} with Paystack
                  <ArrowRight aria-hidden="true" className="ml-2" />
                </Button>
              </form>
            </div>
          )}

          {expired && (
            <div
              role="status"
              className="rounded-xl border border-line bg-surface-2 p-5 xl1:p-6"
            >
              <div className="flex items-start gap-3">
                <Clock
                  aria-hidden="true"
                  className="mt-0.5 size-6 shrink-0 text-muted"
                />
                <div>
                  <p className="font-semibold text-ink">
                    This booking has expired.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">
                    This booking expired because it was not paid in time. If you
                    already paid, our team will see it and contact you.
                    Otherwise, you can make a new booking.
                  </p>
                  <ButtonLink href="/book" className="mt-4">
                    Book again
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <section
            className="rounded-xl border border-line bg-white p-5 sm:p-6 xl1:p-8"
            aria-labelledby="progress-heading"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">
                  Live updates
                </p>
                <h2 id="progress-heading" className={`${type.h2} mt-1`}>
                  Booking progress
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Follow each stage of your service.
                </p>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                <Wrench size={23} weight="duotone" />
              </div>
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-muted">
                No progress updates are available yet.
              </p>
            ) : (
              <ol className="space-y-0">
                {events.map((e, index) => {
                  const isLast = index === events.length - 1;
                  const isCompleted = e.status === "completed";

                  return (
                    <li
                      key={e.id}
                      className="relative flex gap-4 pb-7 last:pb-0"
                    >
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 left-2.75 top-6 w-px bg-line-strong"
                        />
                      )}

                      <span
                        className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-success text-white"
                            : "bg-brand-tint text-brand"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle
                            aria-hidden="true"
                            weight="fill"
                            size={16}
                          />
                        ) : (
                          <span className="size-2 rounded-full bg-current" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="font-semibold text-ink">
                          {EVENT_LABEL[e.status] ?? e.status}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {formatDateTime(e.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Booking support */}
          <section className="space-y-4">
            <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Info
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-brand"
                />
                <div>
                  <p className="font-semibold text-ink">
                    Need to change or cancel your booking?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">
                    To change or cancel this booking,{" "}
                    {SITE.teamEmail ? (
                      <>
                        email{" "}
                        <a
                          className="font-semibold text-brand underline underline-offset-4"
                          href={`mailto:${SITE.teamEmail}?subject=${encodeURIComponent(
                            `Booking ${booking.ref}`,
                          )}`}
                        >
                          {SITE.teamEmail}
                        </a>{" "}
                        with your booking reference.
                      </>
                    ) : (
                      "reply to your confirmation email and quote your reference."
                    )}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-ink-soft">
              Have a large or new-build job?{" "}
              <Link
                href="/contact-team"
                className="font-semibold text-brand underline underline-offset-4"
              >
                Contact our team.
              </Link>
            </p>
          </section>
        </div>

        {/* Booking ticket */}
        <aside className="min-w-0 lg:sticky lg:top-28">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">
              Your reservation
            </p>
            <h2 className={`${type.h2} mt-1`}>Booking summary</h2>
          </div>

          <Ticket
            reference={booking.ref}
            title={booking.serviceName}
            status={
              <StatusBadge
                status={booking.status}
                label={expired ? "Expired" : undefined}
              />
            }
            rows={[
              { label: "Area", value: booking.areaName },
              { label: "Date", value: formatDayLong(booking.slotDate) },
              {
                label: "Arrival window",
                value: windowLabel(booking.slotWindow),
              },
              {
                label: "Address",
                value: booking.landmark
                  ? `${booking.address} (${booking.landmark})`
                  : booking.address,
              },
              {
                label: "Technician",
                value: booking.technicianName ?? (
                  <span className="text-muted">Not assigned yet</span>
                ),
              },
            ]}
            total={{
              label: "Total price",
              value: formatNaira(booking.priceKobo),
            }}
          />

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-white p-4">
            <MapPin
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-brand"
            />
            <p className="text-sm leading-6 text-ink-soft">
              Please make sure the service address and contact details are
              correct before your scheduled arrival.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}

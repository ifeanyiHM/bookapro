import { logoutAction } from "@/app/(auth)/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { homeFor, nextStep } from "@/lib/access";
import { getCustomerProfile } from "@/lib/accounts";
import { requireUser } from "@/lib/auth";
import { listCustomerBookings } from "@/lib/bookings";
import { formatDayLong, formatNaira, windowLabel } from "@/lib/format";
import { space, type } from "@/lib/scale";
import {
  CalendarCheck,
  Clock,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountPage() {
  const user = await requireUser("/account");
  const step = nextStep(user);

  if (step) redirect(step);
  if (user.role !== "customer") redirect(homeFor(user));

  const [profile, bookings] = await Promise.all([
    getCustomerProfile(user.id),
    listCustomerBookings(user.id),
  ]);

  const activeBookings = bookings.filter(
    (booking) =>
      !["completed", "cancelled", "rejected"].includes(booking.status),
  );

  return (
    <Container
      className={`${space.sectionTight} max-w-5xl xl1:max-w-6xl xl3:max-w-7xl`}
    >
      <div className="space-y-8 xl1:space-y-10">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Customer dashboard
            </p>
            <h1 className={type.h1}>My account</h1>
            <p className={`${type.body} mt-2 text-ink-soft`}>
              Manage your details and keep track of your home service bookings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/book">Book a service</ButtonLink>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </div>

        {/* Account overview */}
        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex min-w-0 items-start gap-4 rounded-xl border border-line bg-surface p-5 xl1:p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
              <UserCircle size={26} weight="duotone" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted">Your account</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-ink">
                {profile?.name || "Customer"}
              </h2>
              <p className="mt-1 break-all text-sm text-ink-soft">
                {user.email}
              </p>
              <Link
                href="/onboarding/customer"
                className="mt-3 inline-flex text-sm font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
              >
                Edit personal details
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 xl1:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Total bookings</p>
              <CalendarCheck
                size={22}
                weight="duotone"
                className="text-brand"
              />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              {bookings.length}
            </p>
            <p className="mt-1 text-sm text-muted">
              {bookings.length === 1 ? "Booking made" : "Bookings made"}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 xl1:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">Active bookings</p>
              <Clock size={22} weight="duotone" className="text-brand" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              {activeBookings.length}
            </p>
            <p className="mt-1 text-sm text-muted">
              {activeBookings.length === 1
                ? "Booking in progress"
                : "Bookings in progress"}
            </p>
          </div>
        </section>

        {/* Bookings */}
        <section aria-labelledby="bookings-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">
                Your activity
              </p>
              <h2 id="bookings-heading" className={`${type.h2} mt-1`}>
                My bookings
              </h2>
              <p className="mt-1 text-sm text-muted">
                View your booking details, schedules and payment status.
              </p>
            </div>

            {bookings.length > 0 && (
              <Link
                href="/services"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Explore services
              </Link>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-tint text-brand">
                <CalendarCheck size={28} weight="duotone" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                No bookings yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Your bookings will appear here once you have made your first
                payment. Find a service and let us take care of the rest.
              </p>
              <ButtonLink href="/services" className="mt-5">
                Browse services
              </ButtonLink>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-xl border border-line bg-white">
              {bookings.map((b) => (
                <li key={b.id} className="border-b border-line last:border-b-0">
                  <Link
                    href={`/booking/${b.ref}`}
                    className="group flex flex-col gap-4 p-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between sm:px-5 xl1:px-6 xl1:py-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-ink transition-colors group-hover:text-brand xl1:text-lg">
                          {b.serviceName}
                        </h3>
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
                          {b.ref}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                        {formatDayLong(b.slotDate)}, {windowLabel(b.slotWindow)}
                      </p>
                      <p className="text-sm text-muted">{b.areaName}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-5">
                      <span className="font-semibold tabular-nums text-ink">
                        {formatNaira(b.priceKobo)}
                      </span>
                      <StatusBadge status={b.status} />
                      <span className="hidden text-muted transition-transform group-hover:translate-x-1 sm:inline">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Account details */}
        <section className="flex flex-col justify-between gap-4 rounded-xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:px-6 xl1:p-7">
          <div>
            <h2 className="font-semibold xl1:text-lg">
              Need to update your information?
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Keep your contact details up to date so we can reach you about
              your bookings.
            </p>
          </div>
          <Link
            href="/onboarding/customer"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 hover:text-amber"
          >
            Update my details
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
    </Container>
  );
}

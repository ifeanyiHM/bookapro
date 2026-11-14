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

  return (
    <Container
      className={`${space.sectionTight} max-w-5xl xl1:max-w-6xl xl3:max-w-7xl`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className={type.h1}>My account</h1>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/book">Book a service</ButtonLink>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>{" "}
      </div>
      <p className={`${type.body} mt-3 text-ink-soft`}>
        {profile?.name}, {profile?.phone}, {user.email}.{" "}
        <Link
          href="/onboarding/customer"
          className="font-semibold text-brand underline underline-offset-4"
        >
          Change my details
        </Link>
      </p>

      <h2 className={`${type.h2} mb-2 mt-10 xl1:mt-14`}>My bookings</h2>
      {bookings.length === 0 ? (
        <p
          className={`${type.body} rounded-md border border-dashed border-line-strong p-6 text-muted`}
        >
          You have no paid bookings yet.{" "}
          <Link
            href="/services"
            className="font-semibold text-brand underline underline-offset-4"
          >
            See services and prices
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/booking/${b.ref}`}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 hover:bg-surface xl1:py-5"
              >
                <span>
                  <span className="block font-semibold xl1:text-lg">
                    {b.serviceName}
                  </span>
                  <span className="block text-sm text-muted xl1:text-base">
                    {formatDayLong(b.slotDate)}, {windowLabel(b.slotWindow)} ·{" "}
                    {b.areaName} · {b.ref}
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-semibold">
                    {formatNaira(b.priceKobo)}
                  </span>
                  <StatusBadge status={b.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

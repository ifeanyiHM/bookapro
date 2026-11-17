import { LookupForm } from "@/components/booking/LookupForm";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import { space, type } from "@/lib/scale";
import {
  EnvelopeSimple,
  MagnifyingGlass,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Check a booking",
  alternates: { canonical: "/booking" },
};

export default async function BookingLookupPage() {
  // Signed-in customers see all their bookings in their account.
  const user = await getCurrentUser();

  if (user?.role === "customer") redirect("/account");

  return (
    <section
      className={`${space.sectionTight} relative overflow-hidden bg-surface-2`}
    >
      <Container className="relative max-w-5xl">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl1:gap-20">
          {/* Introduction */}
          <div className="pt-2 lg:pt-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
              <MagnifyingGlass weight="bold" className="size-4" />
              Booking lookup
            </span>

            <h1 className={`${type.h1} mt-5`}>
              Your booking,
              <span className="text-brand"> just a few details away.</span>
            </h1>

            <p className={`${type.lead} mt-5 max-w-lg text-muted`}>
              Check your booking details, appointment information and current
              status using the reference sent to your email.
            </p>

            <div className="mt-9 space-y-5">
              <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-brand shadow-sm">
                  <EnvelopeSimple weight="duotone" className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Find your reference</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Check the booking confirmation email we sent you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-brand shadow-sm">
                  <ShieldCheck weight="duotone" className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Verify your details</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Enter the phone number you used when making the booking.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-9 border-t border-line pt-5 text-sm text-muted">
              Need help finding your booking?{" "}
              <Link
                href="/contact-team"
                className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
              >
                Contact our team
              </Link>
              .
            </p>
          </div>

          {/* Lookup form */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8 xl1:p-10">
            <div className="mb-7">
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">
                Booking details
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Find your booking
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                Enter the details below to securely retrieve your booking.
              </p>
            </div>

            <LookupForm />

            <div className="mt-7 flex items-start gap-3 rounded-xl bg-surface-2 p-4">
              <ShieldCheck
                aria-hidden="true"
                weight="duotone"
                className="mt-0.5 size-5 shrink-0 text-brand"
              />
              <p className="text-xs leading-relaxed text-muted sm:text-sm">
                Your booking reference and phone number are used to verify your
                booking before its details are displayed.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

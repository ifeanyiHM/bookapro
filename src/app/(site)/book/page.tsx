import {
  BookingForm,
  type BookingAccount,
} from "@/components/booking/BookingForm";
import { Container } from "@/components/ui/Container";
import { canBook } from "@/lib/access";
import { getCustomerProfile } from "@/lib/accounts";
import { getCurrentUser } from "@/lib/auth";
import { listAreas, listServices } from "@/lib/catalog";
import { loadDraft } from "@/lib/drafts";
import { space, type } from "@/lib/scale";
import {
  CalendarCheck,
  CheckCircle,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a service",
  description:
    "Choose a service, your area and an arrival window, then pay securely with Paystack.",
  alternates: { canonical: "/book" },
};

const STEPS = [
  { number: "01", label: "Choose service" },
  { number: "02", label: "Pick a time" },
  { number: "03", label: "Your location" },
];

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  const [services, areas, user] = await Promise.all([
    listServices(),
    listAreas(),
    getCurrentUser(),
  ]);

  let account: BookingAccount = { state: "guest" };

  if (user) {
    if (user.role === "admin" || user.role === "technician") {
      account = { state: "other" };
    } else if (canBook(user)) {
      const profile = await getCustomerProfile(user.id);

      account = profile
        ? {
            state: "ready",
            name: profile.name,
            phone: profile.phone,
            email: user.email,
          }
        : { state: "incomplete" };
    } else {
      account = { state: "incomplete" };
    }
  }

  // A saved booking comes back after sign-up, unless the person arrived
  // from a different service's page.
  const draft = await loadDraft(user?.id ?? null);
  const initial =
    draft && (!service || service === draft.serviceSlug) ? draft : undefined;

  return (
    <div className={`${space.sectionTight} bg-surface-2`}>
      <Container className="max-w-7xl xl3:max-w-360">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            <CalendarCheck size={16} weight="duotone" />
            Simple online booking
          </span>

          <h1 className={`${type.h1} mt-5`}>
            Book your service
            <span className="text-brand"> with confidence.</span>
          </h1>

          <p className={`${type.lead} mx-auto mt-3 max-w-2xl text-ink-soft`}>
            Tell us what you need, choose a convenient arrival window, and get
            your booking confirmed. You see the full price before you pay.
          </p>
        </div>

        {/* Booking steps */}
        <div className="mx-auto mb-8 mt-8 max-w-3xl xl1:mb-10 xl1:mt-10">
          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className="flex items-center gap-2 border-t-2 border-brand pt-3 sm:gap-3"
              >
                <span className="text-xs font-bold tabular-nums text-brand">
                  {step.number}
                </span>
                <span className="text-xs font-semibold text-ink sm:text-sm">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {services.length === 0 || areas.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
              <CalendarCheck size={25} weight="duotone" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink">
              Booking is not open yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Our booking options are being updated. Please check back soon.
            </p>
          </div>
        ) : (
          <>
            <BookingForm
              services={services}
              areas={areas}
              initialServiceSlug={service}
              initial={initial}
              account={account}
            />

            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted xl1:mt-10">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand" />
                Secure Paystack payment
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle size={18} className="text-brand" />
                Full price shown upfront
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarCheck size={18} className="text-brand" />
                Choose your arrival window
              </span>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

import { ServiceGrid } from "@/components/booking/ServiceGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import { SERVICE_FAQS } from "@/config/content";
import { listServices } from "@/lib/catalog";
import { space, type } from "@/lib/scale";
import { CalendarCheck, CreditCard, Tag } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services and prices",
  description:
    "Fixed prices for AC, electrical, plumbing and cleaning jobs in Lagos.",
  alternates: { canonical: "/services" },
};

const POINTS = [
  {
    Icon: Tag,
    title: "One fixed price",
    text: "The price you see is the price you pay.",
  },
  {
    Icon: CalendarCheck,
    title: "Choose your time",
    text: "Pick a three-hour arrival window that works for you.",
  },
  {
    Icon: CreditCard,
    title: "Secure payment",
    text: "Pay securely with Paystack and receive a booking reference.",
  },
];

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <>
      {/* Intro */}
      <section className="relative overflow-hidden border-b border-line bg-surface-2">
        <Container className="relative py-14 sm:py-16 lg:py-20 xl3:py-28">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
              <span className="size-1.5 rounded-full bg-brand" />
              Services and pricing
            </span>

            <h1 className={`${type.h1} max-w-3xl`}>
              Reliable help for your home.
              <span className="text-brand"> Clear prices, no guesswork.</span>
            </h1>

            <p className={`${type.lead} mt-5 max-w-2xl text-ink-soft`}>
              From AC servicing to plumbing and electrical repairs, find the
              service you need and know the price before you book.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-muted">
              <span>Professional home services</span>
              <span className="hidden size-1 rounded-full bg-line-strong sm:block" />
              <span>Serving Lagos</span>
              <span className="hidden size-1 rounded-full bg-line-strong sm:block" />
              <span>Transparent pricing</span>
            </div>
          </div>

          {/* Booking assurances */}
          <ul className="mt-12 grid overflow-hidden rounded-2xl border border-line bg-white shadow-card md:grid-cols-3 md:divide-x md:divide-line">
            {POINTS.map(({ Icon, title, text }, index) => (
              <li
                key={title}
                className="flex items-start gap-4 px-5 py-5 sm:px-6 sm:py-6 xl3:px-8"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                  <Icon
                    aria-hidden="true"
                    weight="duotone"
                    className="size-6"
                  />
                </span>

                <div>
                  <p className="font-semibold text-ink xl1:text-lg">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted xl1:text-base">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Service catalogue */}
      <section aria-label="Available services" className="pb-8">
        <Container className="pb-4 pt-8 sm:pt-10">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">
                Explore our services
              </span>
              <h2 className={`${type.h2} mt-2`}>What can we help you with?</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted sm:text-right">
              Browse by category, compare services and choose what works for
              your home.
            </p>
          </div>

          <ServiceGrid services={services} />
        </Container>
      </section>

      {/* FAQs */}
      <section
        className={`${space.section} mt-10 border-t border-line`}
        aria-labelledby="faq-heading"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.5fr] xl1:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">
              Need to know
            </span>
            <h2 id="faq-heading" className={`${type.h2} mt-2`}>
              Before you book
            </h2>
            <p className={`${type.body} mt-3 max-w-md text-muted`}>
              A few helpful answers about our prices, arrival times and payment
              process.
            </p>
          </div>

          <Faq items={SERVICE_FAQS} />
        </Container>
      </section>

      {/* Larger projects CTA */}
      <section className={`${space.sectionTight} pb-16 xl3:pb-28`}>
        <Container>
          <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-6 py-9 text-white sm:px-9 sm:py-11 lg:flex lg:items-center lg:justify-between lg:gap-10 xl3:px-14 xl3:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-28 -z-10 size-80 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-16 -z-10 size-56 rounded-full border border-white/10"
            />

            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/75">
                Larger projects
              </span>
              <h2 className={`${type.h2} mt-4 text-white`}>
                Planning a build or renovation?
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-white/70 sm:text-lg">
                New-build wiring, full plumbing installations and larger AC
                projects need a tailored quote. Tell us about your project and
                our team will be in touch.
              </p>
            </div>

            <div className="mt-7 shrink-0 lg:mt-0">
              <ButtonLink href="/contact-team" size="lg" arrow>
                Contact our team
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

import {
  CompareBlock,
  FeaturedServices,
  TechnicianCta,
  TrustStrip,
  WhyBookAPro,
} from "@/components/home/HomeSections";
import {
  BookingSteps,
  SampleBooking,
  ServiceCards,
} from "@/components/home/ServiceShowcase";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "@/components/ui/Ticket";
import { FAQS } from "@/config/content";
import { listAreas, listServices } from "@/lib/catalog";
import { space, type } from "@/lib/scale";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { addDays, lagosToday } from "../../lib/availability";
import { formatDay } from "../../lib/format";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [services, areas] = await Promise.all([listServices(), listAreas()]);

  // The sample ticket always shows a believable upcoming date instead of one that goes stale.
  const sampleDate = formatDay(addDays(lagosToday(), 2));

  return (
    <>
      <section className="items-center pb-12 pt-10 md:pt-14 lg:flex lg:min-h-[80vh] xl1:pb-20 xl1:pt-20 xl3:pb-24 xl3:pt-24 xl4:pb-32 xl4:pt-28">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14 xl1:gap-20 xl3:gap-28 xl4:gap-32">
          <div>
            <span className="mb-5 inline-block rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
              Home services in Lagos
            </span>
            <h1 className={type.display}>
              Fixed-price home repairs and cleaning in Lagos
            </h1>
            <p
              className={`${type.lead} mt-6 max-w-xl xl1:mt-8 xl1:max-w-2xl xl3:mt-10 xl4:max-w-3xl`}
            >
              Choose a service, your area and an arrival window. You see the
              price before you pay, and a technician is assigned once you have.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 xl1:mt-10 xl3:mt-12">
              <ButtonLink href="/book" size="lg" arrow>
                Book a service
              </ButtonLink>
              <Link
                href="/contact-team"
                className="font-semibold text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark xl1:text-lg xl3:text-xl"
              >
                Large or new-build job? Contact our team
              </Link>
            </div>
          </div>

          <div className="lg:hidden mx-auto w-full max-w-md lg:max-w-none xl3:max-w-xl">
            <Ticket
              sample
              brand
              reference="IC-7K4M2Q"
              title="Split AC service, 1 unit"
              status={<StatusBadge status="assigned" />}
              rows={[
                { label: "Area", value: "Yaba" },
                { label: "Date", value: sampleDate },
                { label: "Arrival window", value: "11:00 am to 2:00 pm" },
              ]}
              total={{ label: "Price", value: "₦15,000" }}
              className="text-ink drop-shadow-[0_5px_5px_rgba(0,0,0,0.15)] lg:-rotate-2"
            />
          </div>
          <div className="hidden lg:block mx-auto w-full max-w-md lg:max-w-none xl3:max-w-xl">
            <Ticket
              sample
              // brand
              reference="IC-7K4M2Q"
              title="Split AC service, 1 unit"
              status={<StatusBadge status="assigned" />}
              rows={[
                { label: "Area", value: "Yaba" },
                { label: "Date", value: sampleDate },
                { label: "Arrival window", value: "11:00 am to 2:00 pm" },
              ]}
              total={{ label: "Price", value: "₦15,000" }}
              className="text-ink drop-shadow-[0_5px_5px_rgba(0,0,0,0.15)] lg:-rotate-2"
            />
          </div>
        </Container>
      </section>

      <TrustStrip />

      <section
        id="services"
        className={space.section}
        aria-labelledby="services-heading"
      >
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end xl3:mb-16">
            <div className="max-w-2xl">
              <span className="mb-4 inline-block rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
                Our services
              </span>
              <h2 id="services-heading" className={type.h1}>
                Services and prices
              </h2>
              <p className={`${type.lead} mt-3`}>
                Professional help for your home, with clear upfront pricing.
              </p>
            </div>
            <ButtonLink href="/services" arrow className="w-fit">
              Explore all services
            </ButtonLink>
          </div>

          <ServiceCards services={services} />

          <div className="mt-12 xl3:mt-16">
            <BookingSteps />
          </div>

          <div className="mt-10 xl3:mt-14">
            <SampleBooking
              photo="https://i.pinimg.com/736x/9f/9a/bb/9f9abbaafb4e3b2aa466068c4af4955c.jpg"
              title="Split AC service"
              area="Yaba, Lagos"
              when={`${sampleDate}, 11:00 am to 2:00 pm`}
              price="₦15,000"
            />
          </div>
          <p className={`${type.small} mt-5 max-w-3xl text-muted`}>
            You pay the listed price in naira on Paystack's secure page. Arrival
            windows are three hours long, and you get a booking reference by
            email.
          </p>
        </Container>
      </section>

      <WhyBookAPro />

      <FeaturedServices services={services} />

      <CompareBlock />

      <TechnicianCta />

      <section
        className={`${space.section} relative overflow-hidden border-t border-line`}
        aria-labelledby="home-faq-heading"
      >
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.5fr] lg:gap-20 xl1:gap-24">
          {/* FAQ introduction */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
              <span className="size-1.5 rounded-full bg-brand" />
              FAQ
            </span>

            <h2 id="home-faq-heading" className={type.h1}>
              Questions,
              <span className="block text-brand">answered.</span>
            </h2>

            <p className={`${type.body} mt-5 max-w-md text-muted`}>
              Everything you need to know before you book. From choosing the
              right service to what happens after your booking.
            </p>

            <ButtonLink
              href="/contact-team"
              variant="secondary"
              arrow
              className="mt-7"
            >
              Contact our team
            </ButtonLink>

            <div className="mt-10 hidden border-t border-line pt-5 sm:block">
              <p className="text-sm text-muted">
                Can't find what you're looking for?
                <span className="mt-1 block font-medium text-ink">
                  We're always happy to help.
                </span>
              </p>
            </div>
          </div>

          {/* FAQ accordion */}
          <div className="min-w-0">
            <Faq items={FAQS} />
          </div>
        </Container>
      </section>

      <section
        className={`${space.sectionTight} relative overflow-hidden border-y border-line bg-surface-2`}
        aria-labelledby="areas-heading"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:items-center lg:gap-16 xl1:gap-24">
          {/* Introduction */}
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
              <MapPin weight="fill" className="size-3.5" />
              Our coverage
            </span>

            <h2 id="areas-heading" className={type.h2}>
              Local service.
              <span className="block text-brand">Across Lagos.</span>
            </h2>

            <p className={`${type.body} mt-4 max-w-md text-muted`}>
              We're bringing reliable home services closer to you. Explore the
              areas we currently serve and select yours when making a booking.
            </p>

            <div className="mt-7 inline-flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-3">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-30" />
                <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
              </span>

              <span className="text-sm font-semibold text-ink">
                Currently serving Lagos
              </span>
            </div>
          </div>

          {/* Service areas */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7 xl3:p-9">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Available locations
                </p>
                <p className="mt-1 text-sm text-muted">
                  Select your area when booking
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-brand-tint px-3 py-1 text-xs font-bold text-brand-dark">
                {areas.length} areas
              </span>
            </div>

            <ul className="flex flex-wrap gap-2.5 xl3:gap-3">
              {areas.map((a) => (
                <li
                  key={a.id}
                  className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm font-medium text-ink transition-all duration-200 hover:border-brand/40 hover:bg-brand-tint hover:text-brand-dark sm:px-4 sm:py-3 sm:text-base"
                >
                  <MapPin
                    aria-hidden="true"
                    weight="fill"
                    className="size-4 shrink-0 text-brand transition-transform duration-200 group-hover:-translate-y-0.5"
                  />
                  {a.name}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-center gap-2 border-t border-line pt-5">
              <span className="text-sm text-muted">
                More locations coming as we grow.
              </span>
            </div>
          </div>
        </Container>
      </section>

      <section className={space.section} aria-labelledby="cta-heading">
        <Container>
          <div className="relative isolate overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center sm:px-12 sm:py-16 xl3:py-24">
            {/* Decorative background elements */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-32 -z-10 size-80 rounded-full border border-white/10 sm:size-112"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-20 -z-10 size-60 rounded-full border border-white/10 sm:size-84"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -left-20 -z-10 size-72 rounded-full bg-white/6 blur-3xl"
            />

            <div className="mx-auto max-w-3xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Your home, in good hands
              </span>

              <h2 id="cta-heading" className={`${type.h2} text-white`}>
                Ready to get things
                <span className="block text-white/75">taken care of?</span>
              </h2>

              <p className={`${type.lead} mx-auto mt-5 max-w-xl text-white/75`}>
                Choose your service, pick a convenient time and see your price
                upfront. Booking a trusted professional is just a few steps
                away.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <ButtonLink
                  href="/book"
                  size="lg"
                  arrow
                  className="bg-white text-brand-dark hover:bg-white/90"
                >
                  Book a service
                </ButtonLink>
              </div>

              <p className="mt-6 text-sm font-medium text-white/65">
                Simple booking. Clear pricing. Reliable professionals.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

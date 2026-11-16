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

          <div className="mx-auto w-full max-w-md lg:max-w-none xl3:max-w-xl">
            <Ticket
              sample
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
            {/* <p className="mt-5 text-sm text-muted xl1:text-base">
              This is what you get after booking: one ticket with your
              reference, time and price.
            </p> */}
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
        className={`${space.section} border-t border-line`}
        aria-labelledby="home-faq-heading"
      >
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] xl1:gap-16">
          <div>
            <span className="mb-4 inline-block rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
              FAQ
            </span>
            <h2 id="home-faq-heading" className={type.h1}>
              Questions, answered
            </h2>
            <p className={`${type.body} mt-3 max-w-md text-muted`}>
              Everything you need to know before you book. Still unsure? Our
              team is happy to help.
            </p>
            <ButtonLink
              href="/contact-team"
              variant="secondary"
              arrow
              className="mt-6"
            >
              Contact our team
            </ButtonLink>
          </div>
          <Faq items={FAQS} />
        </Container>
      </section>

      <section
        className={`${space.sectionTight} border-y border-line bg-surface-2`}
        aria-labelledby="areas-heading"
      >
        <Container className="grid gap-6 lg:grid-cols-[1fr_1.5fr] xl1:gap-20 xl3:gap-28">
          <div>
            <h2 id="areas-heading" className={type.h2}>
              Where we work
            </h2>
            <p className={`${type.body} mt-3 max-w-md text-muted`}>
              Lagos only for now. Pick your area when you book.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-2.5 gap-y-3 self-center xl3:gap-x-3 xl3:gap-y-4">
            {areas.map((a) => (
              <li
                key={a.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white py-1.5 pl-3 pr-4 text-[0.95rem] font-medium xl1:py-2 xl1:pl-3.5 xl1:pr-5 xl1:text-base xl3:text-lg"
              >
                <MapPin
                  aria-hidden="true"
                  weight="fill"
                  className="size-4 text-brand xl1:size-5"
                />
                {a.name}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={space.section} aria-labelledby="cta-heading">
        <Container>
          <div className="rounded-3xl border border-line bg-brand-tint px-6 py-12 text-center sm:px-12 xl3:py-20">
            <h2 id="cta-heading" className={type.h2}>
              Ready to book?
            </h2>
            <p className={`${type.lead} mx-auto mt-3 max-w-xl`}>
              Pick a service, choose a time and see your price before you pay.
            </p>
            <ButtonLink href="/book" size="lg" arrow className="mt-8">
              Book a service
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

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
    text: "The price on the card is the price you pay, in naira.",
  },
  {
    Icon: CalendarCheck,
    title: "You pick the time",
    text: "Choose a three-hour arrival window that suits you.",
  },
  {
    Icon: CreditCard,
    title: "Pay on Paystack",
    text: "Secure payment, with a booking reference by email.",
  },
];

export default async function ServicesPage() {
  const services = await listServices();
  return (
    <>
      <section className="border-b border-line bg-surface-2 py-12 md:py-16 xl1:py-20 xl3:py-28">
        <Container>
          <span className="mb-4 inline-block rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
            Our services
          </span>
          <h1 className={type.h1}>Services and prices</h1>
          <p className={`${type.lead} mt-3 max-w-2xl xl3:mt-5`}>
            Professional help for your home in Lagos. Each service has one fixed
            price, so you know what you will pay before you book.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3 xl1:mt-10 xl1:gap-6">
            {POINTS.map(({ Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-4 shadow-card xl3:p-6"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand xl3:size-14">
                  <Icon
                    aria-hidden="true"
                    weight="duotone"
                    className="size-5 xl3:size-7"
                  />
                </span>
                <div>
                  <p className="font-semibold xl1:text-lg xl3:text-2xl">
                    {title}
                  </p>
                  <p className="text-sm text-muted xl1:text-base xl3:text-lg">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="pb-4 pt-2">
        <ServiceGrid services={services} />
      </Container>

      <section
        className={`${space.section} border-t border-line mt-14 xl1:mt-20`}
        aria-labelledby="faq-heading"
      >
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] xl1:gap-16">
          <div>
            <h2 id="faq-heading" className={type.h2}>
              Before you book
            </h2>
            <p className={`${type.body} mt-3 max-w-md text-muted`}>
              Quick answers about prices, timing and payment.
            </p>
          </div>
          <Faq items={SERVICE_FAQS} />
        </Container>
      </section>

      <section className={`${space.sectionTight} pb-16 xl3:pb-28`}>
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-brand-tint p-8 md:flex-row md:items-center xl3:p-14">
            <div className="max-w-2xl">
              <h2 className={type.h2}>Building or renovating?</h2>
              <p className={`${type.body} mt-2 text-ink-soft`}>
                New-build wiring, full plumbing installations and larger AC
                projects are not priced online. Tell us what you need and our
                team will contact you.
              </p>
            </div>
            <ButtonLink href="/contact-team" size="lg" arrow>
              Contact our team
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

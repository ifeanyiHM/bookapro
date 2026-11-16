import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Container } from "@/components/ui/Container";
import { DAYS_AHEAD, LEAD_HOURS } from "@/config/booking";
import { formatDuration, formatNaira } from "@/lib/format";
import { space, type } from "@/lib/scale";
import type { Service } from "@/types";
import { type Icon } from "@phosphor-icons/react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  CreditCard,
  Envelope,
  Receipt,
  ShieldCheck,
  Tag,
  X,
} from "@phosphor-icons/react/dist/ssr";

const tile =
  "grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand xl3:size-14";

/** Slim row of four promises right under the hero. */
export function TrustStrip() {
  const items: { Icon: Icon; title: string; text: string }[] = [
    {
      Icon: Tag,
      title: "Upfront pricing",
      text: "Know the cost before booking",
    },
    {
      Icon: ShieldCheck,
      title: "Verified professionals",
      text: "Every technician is reviewed",
    },
    {
      Icon: CreditCard,
      title: "Secure payments",
      text: "Convenient payments with Paystack",
    },
    {
      Icon: Receipt,
      title: "Booking protection",
      text: "Track every booking with a reference",
    },
  ];

  return (
    <section
      aria-label="The Bookapro difference"
      className="border-y border-[#E8E8E8] bg-white"
    >
      <Container>
        <ul className="grid grid-cols-1 divide-y divide-[#E8E8E8] py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:py-7 xl3:py-9">
          {items.map(({ Icon, title, text }, index) => (
            <li
              key={title}
              className="
                group flex items-center gap-4 px-3 py-4
                transition-colors duration-200
                hover:bg-[#F8F8F8]
                sm:px-5
                lg:px-5 lg:py-2
                xl1:gap-4 xl1:px-6
                xl3:gap-5 xl3:px-8
              "
            >
              <span className={tile}>
                <Icon
                  aria-hidden="true"
                  weight="duotone"
                  className="size-5 xl1:size-5.5 xl3:size-6"
                />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[-0.02em] text-[#080808] xl1:text-base xl3:text-lg">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#808080] xl1:text-sm xl3:text-base">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Heading({
  pill,
  title,
  lead,
  id,
}: {
  pill: string;
  title: string;
  lead?: string;
  id: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14 xl3:mb-16">
      <span className="mb-4 inline-block rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
        {pill}
      </span>
      <h2 id={id} className={type.h1}>
        {title}
      </h2>
      {lead && <p className={`${type.lead} mt-3`}>{lead}</p>}
    </div>
  );
}

/** Six reasons to book, each one something the app really does. */
export function WhyBookAPro() {
  const items: { Icon: Icon; title: string; text: string }[] = [
    {
      Icon: Tag,
      title: "One fixed price",
      text: "Every service has a single price in naira, shown before you book. No quotes to chase.",
    },
    {
      Icon: ShieldCheck,
      title: "Approved technicians",
      text: "Each technician submits a government ID and a certificate or reference letter. Our team approves them before they get jobs.",
    },
    {
      Icon: CalendarCheck,
      title: "Pick your own time",
      text: `Choose a three-hour arrival window from ${LEAD_HOURS} hours ahead, up to ${DAYS_AHEAD} days away.`,
    },
    {
      Icon: CreditCard,
      title: "Pay securely",
      text: "You pay on Paystack's secure page. We never see your card details.",
    },
    {
      Icon: Receipt,
      title: "Easy to track",
      text: "Every booking gets a reference. Use it with your phone number to check the booking any time.",
    },
    {
      Icon: Envelope,
      title: "Updates by email",
      text: "A confirmation after you pay, and another when a technician is assigned.",
    },
  ];

  return (
    <>
      <section
        className={`${space.section} border-t border-line`}
        aria-labelledby="why-heading"
      >
        <Container>
          <Heading
            id="why-heading"
            pill="Why BookAPro"
            title="Home services without the guesswork"
            lead="Booking a technician should be clear from the first click to the day of the job."
          />

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ Icon, title, text }) => (
              <li
                key={title}
                className="flex min-h-39 flex-col justify-between rounded-[18px] bg-surface-2 p-5 transition-colors duration-200 xl3:p-6"
              >
                <div>
                  <h3 className="font-display text-[17px] font-semibold text-ink xl3:text-md">
                    {title}
                  </h3>

                  <p className="mt-1.5 text-[15px] leading-normal text-muted">
                    {text}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Icon
                    aria-hidden="true"
                    weight="regular"
                    className="size-6 text-brand"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

/** A handful of real services with their prices, ready to book. */

export function FeaturedServices({ services }: { services: Service[] }) {
  const list = services.slice(0, 6);

  if (list.length === 0) return null;

  return (
    <section
      className={`${space.section} border-t border-line bg-surface-2`}
      aria-labelledby="featured-heading"
    >
      <Container>
        <Heading
          id="featured-heading"
          pill="Book in minutes"
          title="Services you can book today"
          lead="Pick one, choose a time, and see your price before you pay."
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <li
              key={s.id}
              className="group flex flex-col rounded-[20px] border border-line bg-surface-2 p-1.5 transition-colors duration-200 hover:border-brand/30"
            >
              {/* Card content */}
              <div className="flex min-h-48.5 flex-1 flex-col rounded-[15px] border border-line bg-white p-6 transition-shadow duration-200 group-hover:shadow-sm">
                {/* Icon */}
                <span className="grid size-11 place-items-center rounded-xl bg-brand text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <CategoryIcon category={s.category} className="size-5.5" />
                </span>

                {/* Service details */}
                <h3 className="mt-5 font-display text-base font-semibold text-ink xl3:text-lg">
                  {s.name}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {s.summary}
                </p>

                {/* Price and duration */}
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-muted">
                  <span className="font-bold text-brand-dark">
                    {formatNaira(s.priceKobo)}
                  </span>

                  <span className="text-line-strong">·</span>

                  <span className="flex items-center gap-1.5">
                    <Clock aria-hidden="true" className="size-3.5" />
                    About {formatDuration(s.durationMinutes)}
                  </span>
                </div>
              </div>

              {/* Bottom action */}
              <ButtonLink
                href={`/book?service=${s.slug}`}
                className="bg-transparent hover:bg-transparent flex items-center justify-between px-3 py-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand"
              >
                <span className="transition-colors group-hover:text-brand">
                  Book service
                  <span className="sr-only"> {s.name}</span>
                </span>

                <span
                  aria-hidden="true"
                  className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand"
                >
                  →
                </span>
              </ButtonLink>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <ButtonLink href="/services" variant="secondary" arrow>
            See all services and prices
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

/** The usual way of hiring a technician next to booking here. */

export function CompareBlock() {
  const usual = [
    "Call around for quotes",
    "Agree the price at the door",
    "Wait for a callback to fix a time",
    "No record of what was agreed",
  ];

  const here = [
    "See one fixed price up front",
    "Pick a three-hour window yourself",
    "Pay securely online on Paystack",
    "Get a booking reference and email updates",
  ];

  return (
    <section
      className={`${space.section} border-t border-line bg-surface-2`}
      aria-labelledby="compare-heading"
    >
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center xl1:mb-16">
          <Heading
            id="compare-heading"
            pill="A better way"
            title="Skip the back and forth"
            lead="A simpler, more transparent way to get your home services sorted."
          />
        </div>

        <div className="relative mx-auto grid max-w-5xl gap-5 md:grid-cols-2 xl1:gap-7">
          {/* The usual way */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-6 py-7 sm:px-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Traditional approach
                </span>

                <span className="text-sm font-semibold text-muted">01</span>
              </div>

              <h3 className={`${type.h3} mt-5`}>The usual way</h3>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                Too many calls, unclear prices and unnecessary waiting.
              </p>
            </div>

            <ul className="flex-1 divide-y divide-line px-6 sm:px-8">
              {usual.map((item, i) => (
                <li key={item} className="flex items-center gap-4 py-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-xs font-bold text-muted">
                    0{i + 1}
                  </span>

                  <span className="flex-1 text-sm leading-relaxed text-muted sm:text-base">
                    {item}
                  </span>

                  <X
                    aria-hidden="true"
                    weight="bold"
                    className="size-5 shrink-0 text-danger"
                  />
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-surface-2 px-6 py-5 sm:px-8">
              <p className="text-sm font-medium text-muted">
                More effort. Less certainty.
              </p>
            </div>
          </div>

          {/* With BookAPro */}
          <div className="relative flex flex-col overflow-hidden rounded-xl border border-brand-dark bg-brand-dark shadow-xl">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />

            <div className="relative border-b border-white/15 px-6 py-7 sm:px-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
                  The BookAPro difference
                </span>

                <span className="text-sm font-semibold text-white/50">02</span>
              </div>

              <h3 className="mt-5 font-display text-xl font-bold text-white xl1:text-2xl">
                With BookAPro
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Everything you need, from pricing to booking confirmation, in
                one straightforward process.
              </p>
            </div>

            <ul className="relative flex-1 divide-y divide-white/10 px-6 sm:px-8">
              {here.map((item, i) => (
                <li key={item} className="flex items-center gap-4 py-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-bold text-white/70">
                    0{i + 1}
                  </span>

                  <span className="flex-1 text-sm font-medium leading-relaxed text-white sm:text-base">
                    {item}
                  </span>

                  <CheckCircle
                    aria-hidden="true"
                    weight="fill"
                    className="size-5 shrink-0 text-brand-tint"
                  />
                </li>
              ))}
            </ul>

            <div className="relative border-t border-white/15 bg-white/5 px-6 py-5 sm:px-8">
              <p className="text-sm font-semibold text-white">
                Less uncertainty. More peace of mind.
              </p>
            </div>
          </div>

          {/* VS indicator */}
          <div className="absolute left-1/2 top-1/2 z-10 hidden size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-surface-2 bg-white text-xs font-extrabold text-brand shadow-md md:flex">
            VS
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:px-8">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Home services, made straightforward.
            </h3>
            <p className="mt-1 text-sm text-muted">
              Find a service and book at a price you already know.
            </p>
          </div>

          <ButtonLink href="/book" size="lg">
            Book a service
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

/** Invites skilled technicians to apply. The application flow already exists at /get-started. */

export function TechnicianCta() {
  const steps = [
    "Create an account and choose “technician”",
    "Submit your profile, ID and a certificate or reference letter",
    "Our team reviews your application",
    "Once approved, you can be assigned jobs",
  ];

  return (
    <section
      className={`${space.section} border-t border-line`}
      aria-labelledby="tech-heading"
    >
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-brand-tint px-6 py-10 sm:px-10 sm:py-14 xl3:px-16 xl3:py-16">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full border border-brand/10" />
          <div className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full border border-brand/10" />

          {/* Heading area */}
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-brand-dark shadow-sm">
                <span className="size-2 rounded-full bg-brand" />
                For technicians
              </span>

              <h2
                id="tech-heading"
                className={`${type.h1} mt-6 max-w-xl text-brand-dark`}
              >
                Good at what you do? Let's get you booked.
              </h2>

              <p className={`${type.lead} mt-4 max-w-xl text-brand-dark/70`}>
                Join BookAPro and connect with customers across Lagos. Get
                assigned jobs with the details and payment arrangements in place
                before you arrive.
              </p>
            </div>

            <div className="relative shrink-0">
              <ButtonLink href="/get-started" size="lg" arrow>
                Become a technician
              </ButtonLink>
            </div>
          </div>

          {/* Application journey */}
          <div className="relative mt-12 border-t border-brand/15 pt-9 sm:mt-16 sm:pt-11">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-brand-dark">
                How to get started
              </h3>

              <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark/50">
                4 simple steps
              </span>
            </div>

            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {steps.map((step, i) => (
                <li key={step} className="relative">
                  {/* Connecting line */}
                  {i !== steps.length - 1 && (
                    <span className="absolute left-5 top-5 hidden h-px w-[calc(100%+1.25rem)] bg-brand/20 lg:block" />
                  )}

                  <div className="relative flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-brand/20 bg-white font-display text-sm font-bold text-brand-dark shadow-sm">
                      0{i + 1}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider text-brand/70">
                      Step {i + 1}
                    </span>
                  </div>

                  <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-brand-dark sm:text-base">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Bottom message */}
          <div className="mt-10 flex flex-col gap-3 border-t border-brand/15 pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-brand">
                <ShieldCheck
                  aria-hidden="true"
                  weight="duotone"
                  className="size-5"
                />
              </span>

              <p className="text-sm font-medium text-brand-dark/80">
                Every technician is reviewed before receiving job assignments.
              </p>
            </div>

            <ButtonLink
              href="/get-started"
              className="bg-transparent hover:bg-transparent inline-flex items-center gap-2 text-sm font-bold text-brand-dark transition-colors hover:text-brand"
            >
              Start your application
              <span aria-hidden="true">→</span>
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

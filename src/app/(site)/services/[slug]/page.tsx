import {
  BookingSteps,
  CATEGORY_PHOTOS,
} from "@/components/home/ServiceShowcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import { CATEGORIES } from "@/config/booking";
import { SERVICE_FAQS } from "@/config/content";
import { getServiceBySlug, listServices } from "@/lib/catalog";
import { formatDuration, formatNaira } from "@/lib/format";
import { space, type } from "@/lib/scale";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import {
  ArrowUpRight,
  CalendarCheck,
  CaretRight,
  CheckCircle,
  Clock,
  CreditCard,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);

  if (!s || !s.active) return {};

  const url = `/services/${s.slug}`;

  return {
    title: s.name,
    description: s.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: s.name,
      description: s.summary,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: s.name,
      description: s.summary,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);

  if (!s || !s.active) notFound();

  const category =
    CATEGORIES.find((c) => c.id === s.category)?.label ?? s.category;

  const photo = CATEGORY_PHOTOS[s.category];

  // Same-category services appear first.
  const all = (await listServices()).filter((x) => x.id !== s.id);

  const related = [
    ...all.filter((x) => x.category === s.category),
    ...all.filter((x) => x.category !== s.category),
  ].slice(0, 3);

  return (
    <>
      <JsonLd data={serviceJsonLd(s, category)} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.name, path: `/services/${s.slug}` },
        ])}
      />

      {/* Service introduction */}
      <section className="border-b border-line bg-surface-2">
        <Container className="py-8 sm:py-10 lg:py-14 xl3:py-20">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/" className="transition-colors hover:text-brand">
              Home
            </Link>
            <CaretRight aria-hidden="true" className="size-3.5" />
            <Link
              href="/services"
              className="transition-colors hover:text-brand"
            >
              Services
            </Link>
            <CaretRight aria-hidden="true" className="size-3.5" />
            <span aria-current="page" className="font-medium text-ink">
              {s.name}
            </span>
          </nav>

          <div className="grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl1:gap-16 xl3:gap-20">
            <div className="min-w-0">
              <Link
                href="/services"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark transition-colors hover:border-brand/30"
              >
                <CategoryIcon category={s.category} className="size-5" />
                {category}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>

              <h1 className={type.h1}>{s.name}</h1>

              <p className={`${type.lead} mt-5 max-w-2xl text-ink-soft`}>
                {s.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-soft">
                  <Clock aria-hidden="true" className="size-4 text-brand" />
                  {formatDuration(s.durationMinutes)}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-soft">
                  <ShieldCheck
                    aria-hidden="true"
                    className="size-4 text-brand"
                  />
                  Approved technician
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href={`/book?service=${s.slug}`} size="lg" arrow>
                  Book this service
                </ButtonLink>

                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-brand"
                >
                  Explore all services
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>

            {/* Service image */}
            <div className="relative">
              <div className="aspect-4/3 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-5 sm:left-5 sm:right-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <CheckCircle
                      aria-hidden="true"
                      weight="fill"
                      className="size-5"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      Clear, upfront pricing
                    </p>
                    <p className="text-xs text-muted sm:text-sm">
                      Know the cost before you book
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 rounded-full bg-brand-tint px-3 py-1 text-xs font-bold text-brand-dark sm:inline-flex">
                  Fixed price
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Service details and booking panel */}
      <Container
        className={`${space.sectionTight} grid items-start gap-10 lg:grid-cols-[1.55fr_0.85fr] xl1:gap-16 xl3:gap-24`}
      >
        <div className="min-w-0">
          {/* What's included */}
          <section aria-labelledby="included-heading">
            <div className="mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">
                The service
              </span>
              <h2 id="included-heading" className={`${type.h2} mt-2`}>
                What&apos;s included
              </h2>
              <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
                Here&apos;s what you can expect when you book this service.
              </p>
            </div>

            <ul className="grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-card sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4 sm:p-7 xl3:p-9">
              {s.includes.map((item) => (
                <li
                  key={item}
                  className={`${type.body} flex items-start gap-3`}
                >
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                    <CheckCircle
                      aria-hidden="true"
                      weight="fill"
                      className="size-4"
                    />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Booking steps */}
          <section
            aria-labelledby="booking-heading"
            className="mt-12 xl3:mt-16"
          >
            <div className="mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">
                Simple process
              </span>
              <h2 id="booking-heading" className={`${type.h2} mt-2`}>
                How booking works
              </h2>
              <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
                Getting professional help for your home takes just a few steps.
              </p>
            </div>

            <BookingSteps />
          </section>

          {/* FAQs */}
          <section
            aria-labelledby="service-faq-heading"
            className="mt-12 xl3:mt-16"
          >
            <div className="mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">
                Helpful information
              </span>
              <h2 id="service-faq-heading" className={`${type.h2} mt-2`}>
                Good to know
              </h2>
              <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
                Answers to common questions about booking, timing and payment.
              </p>
            </div>

            <Faq items={SERVICE_FAQS} />
          </section>
        </div>

        {/* Sticky booking panel */}
        <aside
          className="self-start lg:sticky lg:top-28"
          aria-label="Price and booking"
        >
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="bg-brand p-6 text-white sm:p-7 xl3:p-9">
              <p className="text-sm font-semibold text-white/75">
                Your fixed service price
              </p>

              <p className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl xl3:text-6xl">
                {formatNaira(s.priceKobo)}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90">
                <Clock aria-hidden="true" className="size-4" />
                About {formatDuration(s.durationMinutes)}
              </div>
            </div>

            <div className="p-6 sm:p-7 xl3:p-8">
              <ButtonLink
                href={`/book?service=${s.slug}`}
                size="lg"
                arrow
                className="w-full"
              >
                Book this service
              </ButtonLink>

              <p className="mt-3 text-center text-xs leading-relaxed text-muted">
                You&apos;ll choose your preferred date and arrival window next.
              </p>

              <div className="my-6 border-t border-line" />

              <p className="mb-4 text-sm font-bold text-ink">
                Your booking includes
              </p>

              <ul className="space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                <li className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <CalendarCheck
                      aria-hidden="true"
                      weight="duotone"
                      className="size-5"
                    />
                  </span>
                  <span className="pt-1.5">
                    Choose a three-hour arrival window
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <CreditCard
                      aria-hidden="true"
                      weight="duotone"
                      className="size-5"
                    />
                  </span>
                  <span className="pt-1.5">
                    Secure payment through Paystack
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <ShieldCheck
                      aria-hidden="true"
                      weight="duotone"
                      className="size-5"
                    />
                  </span>
                  <span className="pt-1.5">
                    Assignment to an approved technician
                  </span>
                </li>
              </ul>

              <div className="mt-6 rounded-xl bg-surface-2 p-4">
                <p className="text-sm leading-relaxed text-muted">
                  Need something outside this service?
                  <Link
                    href="/contact-team"
                    className="ml-1 font-semibold text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand-dark"
                  >
                    Talk to our team
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </aside>
      </Container>

      {/* Related services */}
      {related.length > 0 && (
        <section
          className={`${space.sectionTight} border-t border-line bg-surface-2`}
          aria-labelledby="related-heading"
        >
          <Container>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-brand">
                  Explore more
                </span>
                <h2 id="related-heading" className={`${type.h2} mt-2`}>
                  You may also need
                </h2>
                <p className={`${type.body} mt-2 max-w-xl text-muted`}>
                  Other services that can help keep your home in good shape.
                </p>
              </div>

              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                View all services
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl1:gap-6">
              {related.map((r) => (
                <li key={r.id}>
                  <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_40px_-20px_rgba(16,24,40,0.28)] sm:p-6 xl3:p-8">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                        <CategoryIcon
                          category={r.category}
                          className="size-6"
                        />
                      </span>

                      <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
                        {formatDuration(r.durationMinutes)}
                      </span>
                    </div>

                    <h3 className={`${type.h3} mt-5`}>
                      <Link
                        href={`/services/${r.slug}`}
                        className="transition-colors group-hover:text-brand"
                      >
                        {r.name}
                      </Link>
                    </h3>

                    <p className={`${type.body} mt-2 flex-1 text-muted`}>
                      {r.summary}
                    </p>

                    <div className="mt-6 flex items-end justify-between gap-3 border-t border-line pt-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Fixed price
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold text-ink xl3:text-3xl">
                          {formatNaira(r.priceKobo)}
                        </p>
                      </div>

                      <Link
                        href={`/services/${r.slug}`}
                        aria-label={`View ${r.name} details`}
                        className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-all group-hover:border-brand group-hover:bg-brand group-hover:text-white"
                      >
                        <ArrowUpRight aria-hidden="true" className="size-5" />
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}

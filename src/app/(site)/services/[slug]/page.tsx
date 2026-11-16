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
  // Inactive services 404, so they get no metadata either.
  if (!s || !s.active) return {};
  const url = `/services/${s.slug}`;
  return {
    title: s.name,
    description: s.summary,
    alternates: { canonical: url },
    openGraph: { type: "website", title: s.name, description: s.summary, url },
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

  // Other services to suggest: same category first, then anything else.
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

      <Container
        className={`${space.sectionTight} grid gap-10 lg:grid-cols-[1.6fr_1fr] xl1:gap-16 xl3:gap-24`}
      >
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted xl1:text-base"
          >
            <Link href="/" className="hover:text-brand">
              Home
            </Link>
            <CaretRight aria-hidden="true" className="size-3.5" />
            <Link href="/services" className="hover:text-brand">
              Services
            </Link>
            <CaretRight aria-hidden="true" className="size-3.5" />
            <span aria-current="page" className="font-medium text-ink">
              {s.name}
            </span>
          </nav>

          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-semibold text-brand-dark xl1:text-base">
            <CategoryIcon category={s.category} className="size-5" />
            {category}
          </p>
          <h1 className={type.h1}>{s.name}</h1>
          <p className={`${type.lead} mt-4 max-w-2xl`}>{s.description}</p>

          <div className="mt-8 aspect-21/9 overflow-hidden rounded-2xl border border-line bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              decoding="async"
              className="size-full object-cover"
            />
          </div>

          <h2 className={`${type.h3} mt-10 xl3:mt-14`}>What is included</h2>
          <ul className="mt-4 grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-card sm:grid-cols-2 xl3:p-8">
            {s.includes.map((i) => (
              <li key={i} className={`${type.body} flex items-start gap-2.5`}>
                <CheckCircle
                  aria-hidden="true"
                  weight="fill"
                  className="mt-0.5 size-5 shrink-0 text-success xl1:size-6"
                />
                {i}
              </li>
            ))}
          </ul>

          <h2 className={`${type.h3} mt-10 xl3:mt-14`}>How booking works</h2>
          <div className="mt-5">
            <BookingSteps />
          </div>

          <h2 className={`${type.h3} mt-10 xl3:mt-14`}>Good to know</h2>
          <div className="mt-4">
            <Faq items={SERVICE_FAQS} />
          </div>
        </div>

        <aside
          className="self-start rounded-2xl border border-line bg-white p-6 shadow-card lg:sticky lg:top-24 xl1:p-8 xl3:p-10"
          aria-label="Price and booking"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-muted xl1:text-base">
            Fixed price
          </p>
          <p className="mt-1 font-display text-4xl font-bold xl1:text-5xl xl3:text-6xl">
            {formatNaira(s.priceKobo)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-muted xl1:text-lg">
            <Clock aria-hidden="true" className="size-5" /> About{" "}
            {formatDuration(s.durationMinutes)}
          </p>
          <ButtonLink
            href={`/book?service=${s.slug}`}
            size="lg"
            arrow
            className="mt-6 w-full"
          >
            Book this service
          </ButtonLink>
          <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm xl1:text-base">
            <li className="flex items-start gap-2.5">
              <CalendarCheck
                aria-hidden="true"
                weight="duotone"
                className="mt-0.5 size-5 shrink-0 text-brand"
              />{" "}
              Pick a three-hour arrival window
            </li>
            <li className="flex items-start gap-2.5">
              <CreditCard
                aria-hidden="true"
                weight="duotone"
                className="mt-0.5 size-5 shrink-0 text-brand"
              />{" "}
              Pay securely on Paystack
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck
                aria-hidden="true"
                weight="duotone"
                className="mt-0.5 size-5 shrink-0 text-brand"
              />{" "}
              Assigned to an approved technician
            </li>
          </ul>
          <p className="mt-5 text-sm text-muted xl1:text-base">
            Large or new-build job?{" "}
            <Link
              href="/contact-team"
              className="font-semibold text-brand underline underline-offset-4"
            >
              Contact our team
            </Link>
            .
          </p>
        </aside>
      </Container>

      {related.length > 0 && (
        <section
          className={`${space.sectionTight} border-t border-line bg-surface-2`}
          aria-labelledby="related-heading"
        >
          <Container>
            <h2 id="related-heading" className={type.h2}>
              You may also need
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-3 xl1:gap-7">
              {related.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card xl3:p-9"
                >
                  <h3 className={type.h3}>
                    <Link
                      href={`/services/${r.slug}`}
                      className="hover:text-brand"
                    >
                      {r.name}
                    </Link>
                  </h3>
                  <p className={`${type.body} mt-2 flex-1 text-muted`}>
                    {r.summary}
                  </p>
                  <p className="mt-4 font-display text-2xl font-bold xl3:text-4xl">
                    {formatNaira(r.priceKobo)}
                  </p>
                  <ButtonLink
                    href={`/book?service=${r.slug}`}
                    arrow
                    className="mt-4 w-full"
                  >
                    Book service
                    <span className="sr-only"> {r.name}</span>
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}

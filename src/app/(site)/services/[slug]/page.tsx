import { CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIES } from "@/config/booking";
import { getServiceBySlug } from "@/lib/catalog";
import { formatDuration, formatNaira } from "@/lib/format";
import { space, type } from "@/lib/scale";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
    twitter: { card: "summary_large_image", title: s.name, description: s.summary },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);
  if (!s || !s.active) notFound();
  const category = CATEGORIES.find((c) => c.id === s.category)?.label ?? s.category;

  return (
    <Container className={`${space.sectionTight} grid gap-10 lg:grid-cols-[1.5fr_1fr] xl1:gap-20 xl3:gap-28`}>
      <JsonLd data={serviceJsonLd(s, category)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.name, path: `/services/${s.slug}` },
        ])}
      />
      <div>
        <p className="mb-3 flex items-center gap-2 font-semibold text-brand-dark xl1:text-lg">
          <CategoryIcon category={s.category} />
          {category}
        </p>
        <h1 className={type.h1}>{s.name}</h1>
        <p className={`${type.lead} mt-4 max-w-2xl`}>{s.description}</p>
        <h2 className={`${type.h3} mt-10 xl3:mt-14`}>What is included</h2>
        <ul className="mt-3 space-y-2.5 xl1:space-y-3">
          {s.includes.map((i) => (
            <li key={i} className={`${type.body} flex items-start gap-2.5`}>
              <CheckCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0 text-success xl1:size-6" />
              {i}
            </li>
          ))}
        </ul>
      </div>

      <aside className="self-start rounded-md border border-line bg-surface p-6 xl1:p-8 xl3:p-10 lg:sticky lg:top-6" aria-label="Price and booking">
        <p className="font-display text-4xl font-bold xl1:text-5xl xl3:text-6xl">{formatNaira(s.priceKobo)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-muted xl1:text-lg">
          <Clock aria-hidden="true" className="size-5" /> About {formatDuration(s.durationMinutes)}
        </p>
        <ButtonLink href={`/book?service=${s.slug}`} size="lg" className="mt-6 w-full">
          Book this service
        </ButtonLink>
        <p className="mt-5 text-sm text-muted xl1:text-base">
          Large or new-build job?{" "}
          <Link href="/contact-team" className="font-semibold text-brand underline underline-offset-4">
            Contact our team
          </Link>
          .
        </p>
      </aside>
    </Container>
  );
}

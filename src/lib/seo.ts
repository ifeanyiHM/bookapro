import { SITE } from "@/config/site";
import type { Service } from "@/types";

/** Turns a site path into an absolute URL. */
export const absoluteUrl = (path: string): string =>
  `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Business entity shown on every page (root layout). */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["HomeAndConstructionBusiness", "LocalBusiness"],
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  logo: absoluteUrl("/icon"),
  image: absoluteUrl("/opengraph-image"),
  priceRange: "₦₦",
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.city,
    addressCountry: "NG",
  },
  areaServed: { "@type": "City", name: SITE.city },
  ...(SITE.teamEmail ? { email: SITE.teamEmail } : {}),
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  inLanguage: "en-NG",
  publisher: { "@id": `${SITE.url}/#organization` },
};

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** A bookable service with its fixed Naira price. */
export function serviceJsonLd(s: Service, categoryLabel: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description || s.summary,
    serviceType: categoryLabel,
    url: absoluteUrl(`/services/${s.slug}`),
    provider: { "@id": `${SITE.url}/#organization` },
    areaServed: { "@type": "City", name: SITE.city },
    offers: {
      "@type": "Offer",
      price: (s.priceKobo / 100).toFixed(2),
      priceCurrency: SITE.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/book?service=${s.slug}`),
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

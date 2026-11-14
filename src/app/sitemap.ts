import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { listServices } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await listServices();
  return [
    ...["", "/services", "/book", "/contact-team", "/booking"].map((p) => ({ url: `${SITE.url}${p}` })),
    ...services.map((s) => ({ url: `${SITE.url}/services/${s.slug}` })),
  ];
}

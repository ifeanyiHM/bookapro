import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/technician", "/login", "/api/", "/booking/", "/dev/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2ea",
    theme_color: "#0f5e73",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}

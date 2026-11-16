import { SITE } from "@/config/site";
import { ImageResponse } from "next/og";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated share image (Google, WhatsApp, Facebook, X). Drop an opengraph-image.png beside this file to use your own. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#ffffff",
        color: "#15181c",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 40,
          fontWeight: 700,
          color: "#0f5e73",
        }}
      >
        {SITE.name}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.1,
          maxWidth: 980,
        }}
      >
        {SITE.tagline}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 36,
          fontSize: 32,
          color: "#2b3036",
        }}
      >
        AC · Electrical · Plumbing · Cleaning
      </div>
    </div>,
    size,
  );
}

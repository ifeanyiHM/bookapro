/** Store-wide settings. The brand name lives here and updates everywhere. */
export const SITE = {
  name: "BookAPro",
  tagline: "Home repairs and cleaning in Lagos, booked at a fixed price",
  description:
    "Book an AC technician, electrician, plumber or cleaner in Lagos. Pick the service, area and time slot, see the price before you pay, and pay securely with Paystack.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  city: "Lagos",
  /** Shown in the footer and used as the reply-to on customer emails. Set MAIL_TEAM_TO in .env. */
  teamEmail: process.env.MAIL_TEAM_TO ?? "",
  currency: "NGN" as const,
} as const;

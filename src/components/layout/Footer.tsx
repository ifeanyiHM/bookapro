import { Container } from "@/components/ui/Container";
import { SITE } from "@/config/site";
import { ArrowUpRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { Wordmark } from "./Header";

const link =
  "group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-200 hover:text-white xl1:text-base xl3:text-lg";

const heading =
  "mb-5 text-sm font-bold uppercase tracking-[0.12em] text-white/90 xl1:text-base";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white">
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full border border-white/4"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border border-white/4"
      />

      <Container className="relative">
        {/* Main footer */}
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10 xl1:gap-16 xl1:py-20 xl3:py-24">
          {/* Brand */}
          <div className="max-w-md">
            <Wordmark light />

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60 xl1:text-base xl3:text-lg">
              Fixed-price home repairs and cleaning, booked online. Reliable
              professionals and straightforward pricing, all in one place.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
              <MapPin
                weight="fill"
                className="size-4 text-brand"
                aria-hidden="true"
              />
              Serving {SITE.city}
            </div>

            {/* <Link
              href="/book"
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-tint xl1:text-base"
            >
              Book a service
              <ArrowUpRight
                weight="bold"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link> */}
          </div>

          {/* Booking links */}
          <nav aria-label="Book and check">
            <h2 className={heading}>Get started</h2>

            <ul className="space-y-3.5">
              <li>
                <Link href="/services" className={link}>
                  Services and prices
                  <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/book" className={link}>
                  Book a service
                  <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/booking" className={link}>
                  Check a booking
                  <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company links */}
          <nav aria-label="Company">
            <h2 className={heading}>Company</h2>

            <ul className="space-y-3.5">
              <li>
                <Link href="/contact-team" className={link}>
                  Large or new-build job
                  <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </Link>
              </li>

              {SITE.teamEmail && (
                <li>
                  <a href={`mailto:${SITE.teamEmail}`} className={link}>
                    {SITE.teamEmail}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Your account">
            <h2 className={heading}>Your account</h2>

            <ul className="space-y-3.5">
              <AuthNav variant="footer" linkClass={link} />
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between xl1:py-7">
          <p className="text-xs leading-relaxed text-white/45 xl1:text-sm">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>

          <p className="text-xs text-white/45 xl1:text-sm">
            Prices are in Nigerian naira (₦).
          </p>
        </div>
      </Container>
    </footer>
  );
}

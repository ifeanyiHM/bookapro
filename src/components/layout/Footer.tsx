import { Container } from "@/components/ui/Container";
import { SITE } from "@/config/site";
import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { Wordmark } from "./Header";

const link =
  "text-[0.95rem] text-white/75 hover:text-white xl1:text-base xl3:text-lg xl4:text-xl";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] xl1:gap-16 xl1:py-16 xl3:py-20 xl4:py-24">
        <div>
          <Wordmark light />
          <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-white/75 xl1:max-w-md xl1:text-base xl3:max-w-lg xl3:text-lg">
            Fixed-price home repairs and cleaning, booked online. {SITE.city}{" "}
            only for now.
          </p>
        </div>
        <nav aria-label="Book and check">
          <h2 className="mb-4 text-sm font-semibold text-white xl1:text-base xl3:text-lg">
            Book
          </h2>
          <ul className="space-y-2.5 xl1:space-y-3">
            <li>
              <Link href="/services" className={link}>
                Services and prices
              </Link>
            </li>
            <li>
              <Link href="/book" className={link}>
                Book a service
              </Link>
            </li>
            <li>
              <Link href="/booking" className={link}>
                Check a booking
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="mb-4 text-sm font-semibold text-white xl1:text-base xl3:text-lg">
            Our team
          </h2>
          <ul className="space-y-2.5 xl1:space-y-3">
            <li>
              <Link href="/contact-team" className={link}>
                Large or new-build job
              </Link>
            </li>
            {SITE.teamEmail && (
              <li>
                <a href={`mailto:${SITE.teamEmail}`} className={link}>
                  {SITE.teamEmail}
                </a>
              </li>
            )}
            <AuthNav variant="footer" linkClass={link} />
          </ul>
        </nav>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-5 text-sm text-white/60 xl1:py-6 xl1:text-base xl3:text-lg">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Prices are in Nigerian
            naira (₦).
          </p>
        </Container>
      </div>
    </footer>
  );
}

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/config/site";
import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { MobileNav, type NavItem } from "./MobileNav";

export const NAV: NavItem[] = [
  { href: "/services", label: "Services and prices" },
  { href: "/booking", label: "Check a booking" },
  // { href: "/contact-team", label: "Large or new-build job" },
];

export function Wordmark({ light }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} home`}
      className="inline-flex items-baseline font-display text-2xl font-bold tracking-tight xl1:text-[1.7rem] xl3:text-3xl xl4:text-4xl"
    >
      <span className={light ? "text-paper" : "text-ink"}>
        Book<span className={light ? "text-amber" : "text-brand"}>A</span>Pro
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between gap-6 xl1:h-18 xl2:h-19 xl3:h-22 xl4:h-24">
        <Wordmark />
        <nav
          aria-label="Main"
          className="hidden items-center gap-1 lg:flex xl1:gap-2 xl3:gap-3"
        >
          {NAV.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-ink-soft hover:bg-surface-2 xl1:px-4 xl1:text-base xl3:px-5 xl3:text-lg"
            >
              {i.label}
            </Link>
          ))}
          <AuthNav variant="desktop" />
          <ButtonLink href="/book" arrow className="ml-2 xl3:ml-4">
            Book a service
          </ButtonLink>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <ButtonLink href="/book" size="sm">
            Book Now
          </ButtonLink>
          <MobileNav items={NAV}>
            <AuthNav variant="mobile" />
          </MobileNav>
        </div>
      </Container>
    </header>
  );
}

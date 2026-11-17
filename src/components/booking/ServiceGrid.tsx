import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORIES } from "@/config/booking";
import { formatDuration, formatNaira } from "@/lib/format";
import { type } from "@/lib/scale";
import type { Service } from "@/types";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const SHOWN = 3;

/**
 * Services grouped by category with sticky navigation,
 * clear pricing and a consistent card layout.
 */
export function ServiceGrid({ services }: { services: Service[] }) {
  const groups = CATEGORIES.map((category) => ({
    ...category,
    items: services.filter((service) => service.category === category.id),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface-2 px-6 py-12 text-center">
        <p className={type.body}>No services are listed yet.</p>
        <p className="mt-1 text-sm text-muted">Please check back soon.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category navigation */}
      <nav
        aria-label="Service categories"
        className="sticky top-16 z-30 -mx-4 border-y border-line bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 xl1:top-18 xl2:top-19 xl3:top-22 xl4:top-24"
      >
        <ul className="flex gap-2 overflow-x-auto py-3 scrollbar-none [&::-webkit-scrollbar]:hidden xl3:gap-3 xl3:py-4">
          {groups.map((group) => (
            <li key={group.id} className="shrink-0">
              <a
                href={`#cat-${group.id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft transition-all duration-200 hover:border-brand/40 hover:bg-brand-tint hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:px-4 xl1:text-base"
              >
                <CategoryIcon
                  category={group.id}
                  className="size-5 text-muted transition-colors group-hover:text-brand"
                />
                {group.label}
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted transition-colors group-hover:bg-white group-hover:text-brand-dark">
                  {group.items.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Category groups */}
      <div className="space-y-14 pt-9 sm:pt-11 xl1:space-y-20 xl1:pt-14 xl3:space-y-24">
        {groups.map((group) => {
          const from = Math.min(
            ...group.items.map((service) => service.priceKobo),
          );

          return (
            <section
              key={group.id}
              id={`cat-${group.id}`}
              aria-labelledby={`cat-title-${group.id}`}
              className="scroll-mt-36 xl3:scroll-mt-48"
            >
              {/* Category heading */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl3:mb-8">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-tint text-brand sm:size-14 xl3:size-16">
                    <CategoryIcon
                      category={group.id}
                      className="size-6 sm:size-7 xl3:size-8"
                    />
                  </span>

                  <div>
                    <h2 id={`cat-title-${group.id}`} className={type.h2}>
                      {group.label}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {group.items.length}{" "}
                      {group.items.length === 1 ? "service" : "services"}{" "}
                      available
                    </p>
                  </div>
                </div>

                <p className="w-fit rounded-full border border-line bg-surface-2 px-3.5 py-2 text-sm font-medium text-muted">
                  Starting from{" "}
                  <span className="font-bold text-ink">
                    {formatNaira(from)}
                  </span>
                </p>
              </div>

              {/* Service cards */}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl1:gap-6">
                {group.items.map((service) => (
                  <li key={service.id} className="min-w-0">
                    <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_40px_-20px_rgba(16,24,40,0.28)] sm:p-6 xl3:p-8">
                      {/* Service title and summary */}
                      <div>
                        <h3 className={`${type.h3} leading-snug`}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="transition-colors hover:text-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            {service.name}
                          </Link>
                        </h3>

                        <p className={`${type.body} mt-2 text-muted`}>
                          {service.summary}
                        </p>
                      </div>

                      {/* What's included */}
                      {service.includes.length > 0 && (
                        <div className="mt-5 border-t border-line pt-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
                            What&apos;s included
                          </p>

                          <ul className="space-y-2.5">
                            {service.includes.slice(0, SHOWN).map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft xl1:text-base"
                              >
                                <CheckCircle
                                  aria-hidden="true"
                                  weight="fill"
                                  className="mt-0.5 size-4 shrink-0 text-success"
                                />
                                <span>{item}</span>
                              </li>
                            ))}

                            {service.includes.length > SHOWN && (
                              <li>
                                <Link
                                  href={`/services/${service.slug}`}
                                  className="inline-flex items-center gap-1 pl-6 text-sm font-semibold text-brand transition-colors hover:text-brand-dark hover:underline"
                                >
                                  +{service.includes.length - SHOWN} more
                                  <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-3.5"
                                  />
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Price and actions */}
                      <div className="mt-auto pt-6">
                        <div className="flex items-end justify-between gap-3 border-t border-line pt-5">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                              Fixed price
                            </p>
                            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink xl1:text-3xl xl3:text-4xl">
                              {formatNaira(service.priceKobo)}
                            </p>
                          </div>

                          <p className="mb-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted sm:text-sm">
                            <Clock aria-hidden="true" className="size-4" />
                            {formatDuration(service.durationMinutes)}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2.5">
                          <ButtonLink
                            href={`/book?service=${service.slug}`}
                            arrow
                            className="w-full"
                          >
                            Book
                            <span className="sr-only"> {service.name}</span>
                          </ButtonLink>

                          <ButtonLink
                            href={`/services/${service.slug}`}
                            variant="secondary"
                            className="w-full"
                          >
                            View details
                            <span className="sr-only"> for {service.name}</span>
                          </ButtonLink>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

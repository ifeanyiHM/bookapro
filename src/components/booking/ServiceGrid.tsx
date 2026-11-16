import Link from "next/link";
import { CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORIES } from "@/config/booking";
import { formatDuration, formatNaira } from "@/lib/format";
import { type } from "@/lib/scale";
import type { Service } from "@/types";

const SHOWN = 3;

/** Services grouped by category: a sticky jump bar, then a card grid per category with prices, time and what is included. */
export function ServiceGrid({ services }: { services: Service[] }) {
  const groups = CATEGORIES.map((c) => ({ ...c, items: services.filter((s) => s.category === c.id) })).filter((g) => g.items.length > 0);
  if (groups.length === 0) return <p className={type.body}>No services are listed yet. Please check back soon.</p>;

  return (
    <div>
      <nav
        aria-label="Service categories"
        className="sticky top-16 z-30 -mx-4 border-b border-line bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 xl1:top-18 xl2:top-19 xl3:top-22 xl4:top-24"
      >
        <ul className="flex gap-2 overflow-x-auto py-3 xl3:gap-3 xl3:py-4">
          {groups.map((g) => (
            <li key={g.id} className="shrink-0">
              <a
                href={`#cat-${g.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand-dark xl1:text-base xl3:px-5 xl3:py-2.5 xl3:text-lg"
              >
                <CategoryIcon category={g.id} className="size-5 xl3:size-6" />
                {g.label}
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted xl1:text-sm">{g.items.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14 pt-10 xl1:space-y-20 xl1:pt-14 xl3:space-y-24">
        {groups.map((g) => {
          const from = Math.min(...g.items.map((s) => s.priceKobo));
          return (
            <section key={g.id} id={`cat-${g.id}`} aria-labelledby={`cat-title-${g.id}`} className="scroll-mt-40 xl3:scroll-mt-52">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 xl3:mb-9">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand xl3:size-16">
                    <CategoryIcon category={g.id} className="size-6 xl3:size-8" />
                  </span>
                  <h2 id={`cat-title-${g.id}`} className={type.h2}>
                    {g.label}
                  </h2>
                </div>
                <p className="rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-semibold text-muted xl1:text-base">
                  {g.items.length} {g.items.length === 1 ? "service" : "services"} · from {formatNaira(from)}
                </p>
              </div>

              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl1:gap-7 xl3:gap-9">
                {g.items.map((s) => (
                  <li key={s.id} className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-shadow hover:shadow-[0_16px_36px_-14px_rgba(16,24,40,0.28)] xl3:p-9">
                    <h3 className={type.h3}>
                      <Link href={`/services/${s.slug}`} className="hover:text-brand">
                        {s.name}
                      </Link>
                    </h3>
                    <p className={`${type.body} mt-2 text-muted`}>{s.summary}</p>
                    {s.includes.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {s.includes.slice(0, SHOWN).map((i) => (
                          <li key={i} className="flex items-start gap-2 text-sm xl1:text-base xl3:text-lg">
                            <CheckCircle aria-hidden="true" weight="fill" className="mt-0.5 size-4 shrink-0 text-success xl1:size-5" />
                            {i}
                          </li>
                        ))}
                        {s.includes.length > SHOWN && (
                          <li className="pl-6 text-sm text-muted xl1:text-base">
                            <Link href={`/services/${s.slug}`} className="font-semibold text-brand hover:underline">
                              +{s.includes.length - SHOWN} more included
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                    <div className="mt-auto pt-6">
                      <div className="flex items-end justify-between gap-3 border-t border-line pt-5">
                        <p className="font-display text-2xl font-bold xl1:text-[1.7rem] xl3:text-4xl">{formatNaira(s.priceKobo)}</p>
                        <p className="flex items-center gap-1.5 text-sm text-muted xl1:text-base">
                          <Clock aria-hidden="true" className="size-4 xl1:size-5" /> About {formatDuration(s.durationMinutes)}
                        </p>
                      </div>
                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2.5">
                        <ButtonLink href={`/book?service=${s.slug}`} arrow>
                          Book service
                          <span className="sr-only"> {s.name}</span>
                        </ButtonLink>
                        <ButtonLink href={`/services/${s.slug}`} variant="secondary">
                          Details
                          <span className="sr-only"> for {s.name}</span>
                        </ButtonLink>
                      </div>
                    </div>
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

import Link from "next/link";
import { ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import { CATEGORIES } from "@/config/booking";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { buttonClass } from "@/components/ui/Button";
import { formatDuration, formatNaira } from "@/lib/format";
import { type } from "@/lib/scale";
import type { Service } from "@/types";

/** Services grouped by category as a list of rows with the price on the right, so prices are easy to compare. */
export function ServiceRows({ services }: { services: Service[] }) {
  const groups = CATEGORIES.map((c) => ({ ...c, items: services.filter((s) => s.category === c.id) })).filter(
    (g) => g.items.length > 0,
  );
  if (groups.length === 0) {
    return <p className={type.body}>No services are listed yet. Please check back soon.</p>;
  }
  return (
    <div className="space-y-10 xl1:space-y-14 xl3:space-y-16">
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`cat-${g.id}`}>
          <h3 id={`cat-${g.id}`} className="flex items-center gap-2.5 font-display text-xl font-bold text-brand-dark xl1:text-2xl xl3:text-[1.7rem]">
            <CategoryIcon category={g.id} />
            {g.label}
          </h3>
          <ul className="mt-3 divide-y divide-line border-y border-line xl3:mt-4">
            {g.items.map((s) => (
              <li
                key={s.id}
                className="grid gap-x-6 gap-y-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center xl1:py-6 xl3:gap-x-10 xl3:py-8"
              >
                <div>
                  <h4 className={type.h3}>
                    <Link href={`/services/${s.slug}`} className="hover:underline hover:decoration-brand hover:decoration-2 hover:underline-offset-4">
                      {s.name}
                    </Link>
                  </h4>
                  <p className={`${type.body} mt-1 max-w-2xl text-muted`}>{s.summary}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted xl1:text-base">
                    <Clock aria-hidden="true" className="size-4 xl1:size-5" />
                    About {formatDuration(s.durationMinutes)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end xl3:gap-8">
                  <p className="font-display text-2xl font-bold xl1:text-[1.7rem] xl3:text-4xl">{formatNaira(s.priceKobo)}</p>
                  <Link href={`/book?service=${s.slug}`} className={buttonClass("primary", "md")}>
                    Book
                    <ArrowRight aria-hidden="true" weight="bold" />
                    <span className="sr-only"> {s.name}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

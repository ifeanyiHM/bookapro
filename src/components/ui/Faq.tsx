import { JsonLd } from "@/components/seo/JsonLd";
import type { FaqItem } from "@/config/content";
import { type } from "@/lib/scale";
import { faqJsonLd } from "@/lib/seo";
import { Plus } from "@phosphor-icons/react/dist/ssr";

/**
 * Accessible FAQ accordion using native details elements.
 * Includes animated answer expansion and icon rotation.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <>
      <JsonLd data={faqJsonLd(items)} />

      <div className="divide-y divide-line border-y border-line">
        {items.map((f, index) => (
          <details key={f.id} className="faq-item group">
            <summary className="faq-summary flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left marker:content-none xl2:py-7 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-start gap-4">
                <span className="mt-1 hidden shrink-0 text-xs font-bold tabular-nums text-brand/60 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-base font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-brand-dark group-open:text-brand-dark sm:text-lg xl1:text-xl">
                  {f.question}
                </span>
              </span>

              <span className="faq-icon grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-all duration-300 group-hover:border-brand group-hover:bg-brand-tint group-hover:text-brand group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-white sm:size-10">
                <Plus
                  aria-hidden="true"
                  weight="bold"
                  className="size-4 sm:size-4.5"
                />
              </span>
            </summary>

            <div className="faq-answer">
              <div className="faq-answer-inner">
                <p
                  className={`${type.body} max-w-3xl pb-6 text-muted sm:pb-7 sm:pl-8`}
                >
                  {f.answer}
                </p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}

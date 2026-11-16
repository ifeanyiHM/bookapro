import { Plus } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/seo/JsonLd";
import type { FaqItem } from "@/config/content";
import { faqJsonLd } from "@/lib/seo";
import { type } from "@/lib/scale";

/** Frequently asked questions as plain <details> elements: no JavaScript, keyboard friendly, and marked up for Google. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <>
      <JsonLd data={faqJsonLd(items)} />
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {items.map((f) => (
          <details key={f.id} className="group px-5 py-1 sm:px-7 xl3:px-10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold marker:content-none xl1:text-lg xl3:py-6 xl3:text-2xl [&::-webkit-details-marker]:hidden">
              {f.question}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-tint text-brand transition-transform duration-200 group-open:rotate-45 xl3:size-10">
                <Plus aria-hidden="true" weight="bold" className="size-4 xl3:size-5" />
              </span>
            </summary>
            <p className={`${type.body} max-w-3xl pb-5 text-muted xl3:pb-7`}>{f.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}

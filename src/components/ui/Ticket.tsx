import { cn } from "@/lib/cn";

export function Ticket({
  reference,
  title,
  status,
  rows,
  total,
  sample,
  brand = false,
  className,
  children,
}: {
  reference: string;
  title: string;
  status?: React.ReactNode;
  rows: { label: string; value: React.ReactNode }[];
  total?: { label: string; value: string };
  sample?: boolean;
  brand?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          "ticket-top rounded-t-md border border-b-0 px-5 pb-6 pt-5 xl1:px-6 xl1:pb-7 xl1:pt-6 xl3:px-8 xl3:pt-8",
          brand
            ? "border-brand-dark bg-brand-dark text-white"
            : "border-line bg-surface text-ink",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider xl1:text-sm xl3:text-base",
                brand ? "text-white/85" : "text-muted",
              )}
            >
              {sample ? "Sample job ticket" : "Job ticket"}
            </p>

            <p className="mt-1 font-display text-2xl font-bold tracking-wide xl1:text-3xl xl3:text-[2.2rem]">
              {reference}
            </p>
          </div>
          {status}
        </div>

        <p className="mt-4 text-lg font-semibold leading-snug xl1:mt-5 xl1:text-xl xl3:text-2xl">
          {title}
        </p>
      </div>

      <div
        className={cn(
          "ticket-bottom relative rounded-b-md border border-t-0 px-5 pb-5 pt-6 xl1:px-6 xl1:pb-6 xl1:pt-7 xl3:px-8 xl3:pb-8",
          brand
            ? "border-brand-dark bg-brand-dark text-white"
            : "border-line bg-surface text-ink",
          "before:absolute before:inset-x-5 before:top-0 before:border-t before:border-dashed xl1:before:inset-x-6 xl3:before:inset-x-8",
          brand ? "before:border-white/30" : "before:border-line-strong",
        )}
      >
        <dl className="space-y-3 text-sm xl1:space-y-3.5 xl1:text-base xl3:space-y-4 xl3:text-lg">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4">
              <dt className={brand ? "text-white/85" : "text-muted"}>
                {r.label}
              </dt>
              <dd className="text-right font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>

        {total && (
          <div
            className={cn(
              "mt-5 flex items-baseline justify-between gap-4 border-t pt-4 xl3:mt-6 xl3:pt-5",
              brand ? "border-white/20" : "border-line",
            )}
          >
            <span className="font-semibold xl1:text-lg xl3:text-xl">
              {total.label}
            </span>
            <span className="font-display text-2xl font-bold xl1:text-3xl xl3:text-4xl">
              {total.value}
            </span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

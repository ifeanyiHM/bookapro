import { cn } from "@/lib/cn";

/**
 * The brand's defining detail: a booking shown as a job ticket with a perforation. The same ticket is used
 * in the booking form, the booking page and the dashboards, so a customer recognises it everywhere.
 */
export function Ticket({
  reference,
  title,
  status,
  rows,
  total,
  sample,
  className,
  children,
}: {
  reference: string;
  title: string;
  status?: React.ReactNode;
  rows: { label: string; value: React.ReactNode }[];
  total?: { label: string; value: string };
  sample?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="ticket-top rounded-t-md border border-b-0 border-line bg-surface px-5 pb-6 pt-5 xl1:px-6 xl1:pb-7 xl1:pt-6 xl3:px-8 xl3:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted xl1:text-sm xl3:text-base">
              {sample ? "Sample job ticket" : "Job ticket"}
            </p>
            <p className="mt-1 font-display text-2xl font-bold tracking-wide xl1:text-3xl xl3:text-[2.2rem]">{reference}</p>
          </div>
          {status}
        </div>
        <p className="mt-4 text-lg font-semibold leading-snug xl1:mt-5 xl1:text-xl xl3:text-2xl">{title}</p>
      </div>

      <div
        className={cn(
          "ticket-bottom relative rounded-b-md border border-t-0 border-line bg-surface px-5 pb-5 pt-6 xl1:px-6 xl1:pb-6 xl1:pt-7 xl3:px-8 xl3:pb-8",
          "before:absolute before:inset-x-5 before:top-0 before:border-t before:border-dashed before:border-line-strong xl1:before:inset-x-6 xl3:before:inset-x-8",
        )}
      >
        <dl className="space-y-3 text-sm xl1:space-y-3.5 xl1:text-base xl3:space-y-4 xl3:text-lg">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
        {total && (
          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4 xl3:mt-6 xl3:pt-5">
            <span className="font-semibold xl1:text-lg xl3:text-xl">{total.label}</span>
            <span className="font-display text-2xl font-bold xl1:text-3xl xl3:text-4xl">{total.value}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

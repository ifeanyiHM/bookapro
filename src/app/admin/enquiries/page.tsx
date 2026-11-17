import { EnquiryBadge } from "@/components/ui/StatusBadge";
import { Table, Td, Th } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { listEnquiries } from "@/lib/enquiries";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { ENQUIRY_TRADES } from "@/lib/validation";
import type { EnquiryStatus } from "@/types";
import {
  ArrowRight,
  CalendarBlank,
  ClipboardText,
  MapPin,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const FILTERS: { id: EnquiryStatus | "all"; label: string }[] = [
  { id: "all", label: "All enquiries" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
];

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const active = (["new", "contacted", "closed"] as const).find(
    (s) => s === status,
  );

  const enquiries = await listEnquiries(active);

  return (
    <div className="space-y-6 xl1:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Customer enquiries
          </p>

          <h1 className={type.h1}>Project enquiries</h1>

          <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
            Manage large projects and new-build requests submitted through the
            Contact our team page.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand">
            <ClipboardText size={21} weight="duotone" />
          </span>

          <div>
            <p className="font-display text-2xl font-bold leading-none tabular-nums text-ink">
              {enquiries.length}
            </p>
            <p className="mt-1 text-xs text-muted">
              {enquiries.length === 1 ? "Enquiry found" : "Enquiries found"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-ink">Filter enquiries</h2>
          <p className="mt-1 text-xs text-muted">
            View enquiries by their current status.
          </p>
        </div>

        <nav
          aria-label="Filter by status"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {FILTERS.map((f) => {
            const on = (f.id === "all" && !active) || f.id === active;

            return (
              <Link
                key={f.id}
                href={
                  f.id === "all"
                    ? "/admin/enquiries"
                    : `/admin/enquiries?status=${f.id}`
                }
                aria-current={on ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                  on
                    ? "bg-ink text-white shadow-sm"
                    : "border border-line bg-surface text-muted hover:border-brand/40 hover:bg-brand-tint/40 hover:text-ink",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
      </section>

      {/* Enquiry records */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Enquiry records</h2>
            <p className="mt-1 text-xs text-muted">
              {active
                ? `Showing ${active} enquiries`
                : "All submitted project enquiries"}
            </p>
          </div>

          <CalendarBlank
            size={21}
            weight="duotone"
            className="shrink-0 text-muted"
          />
        </div>

        {enquiries.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface px-5 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-muted">
              <ClipboardText size={25} weight="duotone" />
            </span>

            <h3 className="mt-4 text-sm font-bold text-ink">
              No enquiries found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
              {active
                ? `There are currently no ${active} project enquiries.`
                : "New project enquiries will appear here when customers submit the contact form."}
            </p>

            {active && (
              <Link
                href="/admin/enquiries"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                View all enquiries
                <ArrowRight size={15} weight="bold" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <Table>
              <thead>
                <tr className="bg-surface-2">
                  <Th>Received</Th>
                  <Th>Contact</Th>
                  <Th>Trades</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {enquiries.map((q) => (
                  <tr
                    key={q.id}
                    className="group transition-colors hover:bg-surface-2"
                  >
                    <Td label="Received">
                      <Link
                        href={`/admin/enquiries/${q.id}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-brand underline-offset-4 hover:underline"
                      >
                        {formatDateTime(q.createdAt)}
                        <ArrowRight
                          size={13}
                          weight="bold"
                          className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </Td>

                    <Td label="Contact">
                      <div className="flex items-start gap-2">
                        <UserCircle
                          size={19}
                          weight="duotone"
                          className="mt-0.5 shrink-0 text-muted"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{q.name}</p>
                          <p className="mt-0.5 text-xs text-muted">{q.phone}</p>
                        </div>
                      </div>
                    </Td>

                    <Td label="Trades">
                      <div className="flex max-w-xs flex-wrap gap-1.5">
                        {q.trades.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-line bg-surface-2 px-2 py-1 text-xs font-medium text-ink-soft"
                          >
                            {ENQUIRY_TRADES.find((x) => x.id === t)?.label ?? t}
                          </span>
                        ))}
                      </div>
                    </Td>

                    <Td label="Location">
                      <span className="inline-flex items-start gap-1.5 text-sm text-ink-soft">
                        <MapPin
                          size={15}
                          weight="duotone"
                          className="mt-0.5 shrink-0 text-muted"
                        />
                        {q.location}
                      </span>
                    </Td>

                    <Td label="Status">
                      <EnquiryBadge status={q.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, Td, Th } from "@/components/ui/Table";
import { BOOKING_STATUSES, type BookingStatus } from "@/config/booking";
import { listBookings } from "@/lib/bookings";
import { cn } from "@/lib/cn";
import { formatDay, windowLabel } from "@/lib/format";
import { type } from "@/lib/scale";
import {
  ArrowRight,
  CalendarBlank,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const FILTERS: { id: BookingStatus | "all"; label: string }[] = [
  { id: "all", label: "All bookings" },
  ...BOOKING_STATUSES.map((s) => ({
    id: s,
    label: {
      pending_payment: "Unpaid",
      paid: "To assign",
      assigned: "Assigned",
      in_progress: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
    }[s],
  })),
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const active = BOOKING_STATUSES.includes(status as BookingStatus)
    ? (status as BookingStatus)
    : undefined;

  const bookings = await listBookings({ status: active, search: q });

  return (
    <div className="space-y-6 xl1:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Operations
          </p>
          <h1 className={type.h1}>Bookings</h1>
          <p className={`${type.body} mt-2 text-muted`}>
            Manage customer bookings, assignments and service progress.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
          <CalendarBlank size={20} weight="duotone" className="text-brand" />
          <div>
            <p className="text-xl font-bold leading-none tabular-nums text-ink">
              {bookings.length}
            </p>
            <p className="mt-1 text-xs text-muted">
              {bookings.length === 1 ? "Booking found" : "Bookings found"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <section className="space-y-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-sm font-bold text-ink">Filter bookings</p>
          <p className="mt-1 text-xs text-muted">
            Choose a status to narrow down your bookings.
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
                    ? q
                      ? `/admin/bookings?q=${encodeURIComponent(q)}`
                      : "/admin/bookings"
                    : `/admin/bookings?status=${f.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                }
                aria-current={on ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200",
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

        <div className="border-t border-line pt-4">
          <form className="flex flex-col gap-2 sm:flex-row" role="search">
            {active && <input type="hidden" name="status" value={active} />}

            <label htmlFor="q" className="sr-only">
              Search by reference, name or phone
            </label>

            <div className="relative min-w-0 flex-1">
              <MagnifyingGlass
                size={19}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="q"
                name="q"
                defaultValue={q}
                placeholder="Search reference, customer name or phone..."
                className={cn(inputClass, "w-full pl-10")}
              />
            </div>

            <Button type="submit" variant="secondary" className="shrink-0">
              Search bookings
            </Button>

            {q && (
              <Link
                href={
                  active
                    ? `/admin/bookings?status=${active}`
                    : "/admin/bookings"
                }
                className="inline-flex h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                Clear
              </Link>
            )}
          </form>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Booking records</h2>
            <p className="mt-1 text-xs text-muted">
              {active
                ? `Showing ${FILTERS.find((f) => f.id === active)?.label.toLowerCase()} bookings`
                : "All booking activity"}
              {q ? ` matching "${q}"` : ""}
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface px-5 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-muted">
              <CalendarBlank size={25} weight="duotone" />
            </span>

            <h3 className="mt-4 text-sm font-bold text-ink">
              No bookings found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
              {q
                ? "No bookings match your search. Try another reference, customer name or phone number."
                : "There are no bookings in this category at the moment."}
            </p>

            {(q || active) && (
              <Link
                href="/admin/bookings"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                View all bookings
                <ArrowRight size={15} weight="bold" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <Table>
              <thead>
                <tr className="bg-surface-2">
                  <Th>Reference</Th>
                  <Th>Customer</Th>
                  <Th>Service</Th>
                  <Th>When</Th>
                  <Th>Technician</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="group transition-colors hover:bg-surface-2"
                  >
                    <Td label="Reference">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-brand underline-offset-4 hover:underline"
                      >
                        {b.ref}
                        <ArrowRight
                          size={13}
                          weight="bold"
                          className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </Td>

                    <Td label="Customer">
                      <span className="font-semibold text-ink">
                        {b.customerName}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {b.customerPhone}
                      </span>
                    </Td>

                    <Td label="Service">
                      <span className="font-medium text-ink">
                        {b.serviceName}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {b.areaName}
                      </span>
                    </Td>

                    <Td label="When">
                      <span className="font-medium text-ink">
                        {formatDay(b.slotDate)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {windowLabel(b.slotWindow)}
                      </span>
                    </Td>

                    <Td label="Technician">
                      {b.technicianName ? (
                        <span className="font-medium text-ink">
                          {b.technicianName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                          <span className="size-1.5 rounded-full bg-warning" />
                          Not assigned
                        </span>
                      )}
                    </Td>

                    <Td label="Status">
                      <StatusBadge status={b.status} />
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

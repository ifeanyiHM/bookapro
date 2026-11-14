import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, Td, Th } from "@/components/ui/Table";
import { BOOKING_STATUSES, type BookingStatus } from "@/config/booking";
import { listBookings } from "@/lib/bookings";
import { formatDay, windowLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { type } from "@/lib/scale";
import { inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const FILTERS: { id: BookingStatus | "all"; label: string }[] = [
  { id: "all", label: "All paid" },
  ...BOOKING_STATUSES.map((s) => ({ id: s, label: { pending_payment: "Unpaid", paid: "To assign", assigned: "Assigned", in_progress: "In progress", completed: "Completed", cancelled: "Cancelled" }[s] })),
];

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const active = BOOKING_STATUSES.includes(status as BookingStatus) ? (status as BookingStatus) : undefined;
  const bookings = await listBookings({ status: active, search: q });

  return (
    <div>
      <h1 className={type.h1}>Bookings</h1>
      <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-4 xl1:mb-6 xl3:mb-8">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5 xl1:gap-2">
          {FILTERS.map((f) => {
            const on = (f.id === "all" && !active) || f.id === active;
            return (
              <Link
                key={f.id}
                href={f.id === "all" ? "/admin/bookings" : `/admin/bookings?status=${f.id}`}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium xl1:px-4 xl1:text-base xl3:px-5 xl3:py-2.5 xl3:text-lg",
                  on ? "bg-ink text-white" : "border border-line-strong bg-surface hover:border-ink",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
        <form className="flex gap-2" role="search">
          {active && <input type="hidden" name="status" value={active} />}
          <label htmlFor="q" className="sr-only">
            Search by reference, name or phone
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Reference, name or phone" className={cn(inputClass, "w-56 xl1:w-64 xl3:w-80")} />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {bookings.length === 0 ? (
        <p className={`${type.body} rounded-md border border-dashed border-line-strong p-6 text-muted`}>No bookings match this view.</p>
      ) : (
        <Table>
          <thead>
            <tr>
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
              <tr key={b.id} className="hover:bg-paper">
                <Td label="Reference">
                  <Link href={`/admin/bookings/${b.id}`} className="font-semibold text-brand underline underline-offset-4">
                    {b.ref}
                  </Link>
                </Td>
                <Td label="Customer">
                  {b.customerName}
                  <span className="block text-muted">{b.customerPhone}</span>
                </Td>
                <Td label="Service">
                  {b.serviceName}
                  <span className="block text-muted">{b.areaName}</span>
                </Td>
                <Td label="When">
                  {formatDay(b.slotDate)}
                  <span className="block text-muted">{windowLabel(b.slotWindow)}</span>
                </Td>
                <Td label="Technician">{b.technicianName ?? <span className="text-muted">None</span>}</Td>
                <Td label="Status">
                  <StatusBadge status={b.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

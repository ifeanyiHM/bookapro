import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "@/components/ui/Ticket";
import { eligibleTechnicians, getBookingById, getBookingEvents } from "@/lib/bookings";
import { formatDateTime, formatDayLong, formatNaira, windowLabel } from "@/lib/format";
import { type } from "@/lib/scale";
import { assignAction, payoutAction, statusAction } from "../../actions";

export const metadata = { title: "Booking" };

function StatusButton({ id, to, children, danger }: { id: string; to: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <form action={statusAction}>
      <input type="hidden" name="bookingId" value={id} />
      <input type="hidden" name="to" value={to} />
      <Button type="submit" variant={danger ? "danger" : "secondary"}>
        {children}
      </Button>
    </form>
  );
}

export default async function AdminBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const { notice, error } = await searchParams;
  const b = await getBookingById(id);
  if (!b) notFound();
  const [events, techs] = await Promise.all([getBookingEvents(b.id), eligibleTechnicians(b)]);
  const canAssign = b.status === "paid" || b.status === "assigned";

  return (
    <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr] xl1:gap-14 xl3:gap-20">
      <div className="space-y-10 xl3:space-y-14">
        <div>
          <Link href="/admin/bookings" className="text-sm font-semibold text-brand underline underline-offset-4 xl1:text-base">
            All bookings
          </Link>
          <h1 className={`${type.h1} mt-2`}>{b.ref}</h1>
        </div>
        <Notice notice={notice} error={error} />

        <section aria-labelledby="customer-h">
          <h2 id="customer-h" className={`${type.h3} mb-3`}>Customer</h2>
          <dl className={`${type.body} grid gap-x-8 gap-y-2 sm:grid-cols-[10rem_1fr] xl1:grid-cols-[12rem_1fr]`}>
            <dt className="text-muted">Name</dt><dd className="font-medium">{b.customerName}</dd>
            <dt className="text-muted">Phone</dt><dd><a className="font-medium text-brand underline underline-offset-4" href={`tel:${b.customerPhone}`}>{b.customerPhone}</a></dd>
            <dt className="text-muted">Email</dt><dd><a className="font-medium text-brand underline underline-offset-4" href={`mailto:${b.customerEmail}`}>{b.customerEmail}</a></dd>
            <dt className="text-muted">Address</dt><dd className="font-medium">{b.address}{b.landmark ? ` (${b.landmark})` : ""}</dd>
            {b.notes && (<><dt className="text-muted">Notes</dt><dd className="font-medium">{b.notes}</dd></>)}
          </dl>
        </section>

        {canAssign && (
          <section aria-labelledby="assign-h">
            <h2 id="assign-h" className={`${type.h3} mb-3`}>{b.technicianId ? "Reassign technician" : "Assign a technician"}</h2>
            {techs.length === 0 ? (
              <p className={`${type.body} rounded-md border border-danger/40 bg-danger-tint p-4 text-danger`}>
                No active technician covers {b.areaName} for this service. Add or update a technician first.
              </p>
            ) : (
              <form action={assignAction} className="flex flex-wrap items-end gap-3 xl3:gap-4">
                <input type="hidden" name="bookingId" value={b.id} />
                <Field id="technicianId" label="Technician" className="min-w-64 flex-1">
                  {(a) => (
                    <select {...a} name="technicianId" className={inputClass} defaultValue={b.technicianId ?? ""} required>
                      <option value="" disabled>Choose a technician</option>
                      {techs.map((t) => (
                        <option key={t.id} value={t.id} disabled={t.busy && t.id !== b.technicianId}>
                          {t.name}{t.busy && t.id !== b.technicianId ? " (busy in this window)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Button type="submit">Assign and notify</Button>
              </form>
            )}
          </section>
        )}

        {b.status !== "completed" && b.status !== "cancelled" && (
        <section aria-labelledby="actions-h">
          <h2 id="actions-h" className={`${type.h3} mb-3`}>Actions</h2>
          <div className="flex flex-wrap gap-3">
            {b.status === "assigned" && <StatusButton id={b.id} to="in_progress">Mark in progress</StatusButton>}
            {b.status === "in_progress" && <StatusButton id={b.id} to="completed">Mark completed</StatusButton>}
            {b.status === "assigned" && <StatusButton id={b.id} to="paid">Remove technician</StatusButton>}
          </div>
          {["pending_payment", "paid", "assigned"].includes(b.status) && (
            <details className="mt-4 rounded-md border border-line bg-surface p-4 xl1:p-5">
              <summary className="cursor-pointer font-semibold">Cancel this booking</summary>
              <p className={`${type.body} mb-3 mt-2 text-muted`}>
                The customer is emailed. Refunds are not automatic: if they paid, refund them in your Paystack dashboard.
              </p>
              <StatusButton id={b.id} to="cancelled" danger>Cancel booking</StatusButton>
            </details>
          )}
        </section>
        )}

        {(b.status === "completed" || b.technicianId) && (
          <section aria-labelledby="payout-h">
            <h2 id="payout-h" className={`${type.h3} mb-1`}>Technician payout</h2>
            <p className={`${type.body} mb-3 text-muted`}>Tracked here for your records. Pay the technician yourself, then mark it paid.</p>
            <form action={payoutAction} className="flex flex-wrap items-end gap-4">
              <input type="hidden" name="bookingId" value={b.id} />
              <Field id="amountNaira" label="Payout (₦)" className="w-48">
                {(a) => <input {...a} name="amountNaira" inputMode="decimal" className={inputClass} defaultValue={b.technicianPayoutKobo != null ? b.technicianPayoutKobo / 100 : ""} />}
              </Field>
              <label className="flex min-h-12 items-center gap-2 font-medium">
                <input type="checkbox" name="paid" defaultChecked={!!b.payoutPaidAt} className="size-4 accent-brand" />
                Paid{b.payoutPaidAt ? ` on ${formatDateTime(b.payoutPaidAt)}` : ""}
              </label>
              <Button type="submit" variant="secondary">Save payout</Button>
            </form>
          </section>
        )}

        <section aria-labelledby="history-h">
          <h2 id="history-h" className={`${type.h3} mb-3`}>History</h2>
          <ol className="space-y-3 border-l-2 border-line-strong pl-5">
            {events.map((e) => (
              <li key={e.id}>
                <p className={`${type.body} font-medium`}>
                  {e.status.replace("_", " ")}{e.note ? `: ${e.note}` : ""}
                </p>
                <p className="text-sm text-muted xl1:text-base">{formatDateTime(e.createdAt)}{e.actor ? ` · ${e.actor}` : ""}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="self-start xl:sticky xl:top-6">
        <Ticket
          reference={b.ref}
          title={b.serviceName}
          status={<StatusBadge status={b.status} />}
          rows={[
            { label: "Area", value: b.areaName },
            { label: "Date", value: formatDayLong(b.slotDate) },
            { label: "Arrival window", value: windowLabel(b.slotWindow) },
            { label: "Technician", value: b.technicianName ?? <span className="text-muted">None</span> },
          ]}
          total={{ label: "Price", value: formatNaira(b.priceKobo) }}
        />
      </div>
    </div>
  );
}

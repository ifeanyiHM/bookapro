import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Ticket } from "@/components/ui/Ticket";
import {
  eligibleTechnicians,
  getBookingById,
  getBookingEvents,
} from "@/lib/bookings";
import {
  formatDateTime,
  formatDayLong,
  formatNaira,
  windowLabel,
} from "@/lib/format";
import { type } from "@/lib/scale";
import {
  ArrowLeft,
  ArrowUpRight,
  ClipboardText,
  Clock,
  ClockCounterClockwise,
  CreditCard,
  EnvelopeSimple,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle,
  WarningCircle,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assignAction, payoutAction, statusAction } from "../../actions";

export const metadata = { title: "Booking" };

function StatusButton({
  id,
  to,
  children,
  danger,
}: {
  id: string;
  to: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
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

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
        <Icon size={21} weight="duotone" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 border-b border-line py-3 last:border-0 sm:grid-cols-[130px_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium leading-6 text-ink">
        {children}
      </dd>
    </div>
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

  const [events, techs] = await Promise.all([
    getBookingEvents(b.id),
    eligibleTechnicians(b),
  ]);

  const canAssign = b.status === "paid" || b.status === "assigned";

  return (
    <div className="space-y-7 xl1:space-y-9">
      {/* Page header */}
      <div>
        <Link
          href="/admin/bookings"
          className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft
            size={17}
            weight="bold"
            className="transition-transform group-hover:-translate-x-1"
          />
          All bookings
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Booking management
            </p>
            <h1 className={`${type.h1} mt-2`}>{b.ref}</h1>
            <p className="mt-2 text-sm text-muted">
              Manage booking details, technician assignment and payment.
            </p>
          </div>

          <div className="w-fit">
            <StatusBadge status={b.status} />
          </div>
        </div>
      </div>

      <Notice notice={notice} error={error} />

      {/* Main layout */}
      <div className="grid items-start gap-6 xl:grid-cols-[1.35fr_0.85fr] xl1:gap-8">
        {/* Management column */}
        <div className="min-w-0 space-y-6">
          {/* Customer details */}
          <section
            aria-labelledby="customer-h"
            className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <SectionHeading
              icon={UserCircle}
              title="Customer information"
              description="Contact and service location details."
            />

            <dl>
              <DetailRow label="Full name">{b.customerName}</DetailRow>

              <DetailRow label="Phone number">
                <a
                  href={`tel:${b.customerPhone}`}
                  className="inline-flex items-center gap-2 text-brand underline-offset-4 hover:underline"
                >
                  <Phone size={15} weight="bold" />
                  {b.customerPhone}
                  <ArrowUpRight size={13} />
                </a>
              </DetailRow>

              <DetailRow label="Email address">
                <a
                  href={`mailto:${b.customerEmail}`}
                  className="inline-flex items-center gap-2 break-all text-brand underline-offset-4 hover:underline"
                >
                  <EnvelopeSimple size={15} weight="bold" />
                  {b.customerEmail}
                  <ArrowUpRight size={13} />
                </a>
              </DetailRow>

              <DetailRow label="Service address">
                <span className="inline-flex items-start gap-2">
                  <MapPin
                    size={16}
                    weight="duotone"
                    className="mt-1 shrink-0 text-muted"
                  />
                  <span>
                    {b.address}
                    {b.landmark ? ` (${b.landmark})` : ""}
                  </span>
                </span>
              </DetailRow>

              {b.notes && (
                <DetailRow label="Customer notes">{b.notes}</DetailRow>
              )}
            </dl>
          </section>

          {/* Technician assignment */}
          {canAssign && (
            <section
              aria-labelledby="assign-h"
              className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
            >
              <SectionHeading
                icon={Wrench}
                title={
                  b.technicianId
                    ? "Technician assignment"
                    : "Assign a technician"
                }
                description={
                  b.technicianId
                    ? "Change the technician assigned to this booking."
                    : `Find an available technician covering ${b.areaName}.`
                }
              />

              {techs.length === 0 ? (
                <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-tint p-4 text-danger">
                  <WarningCircle
                    size={21}
                    weight="fill"
                    className="mt-0.5 shrink-0"
                  />
                  <p className="text-sm leading-6">
                    No active technician covers {b.areaName} for this service.
                    Add or update a technician first.
                  </p>
                </div>
              ) : (
                <form action={assignAction} className="space-y-4">
                  <input type="hidden" name="bookingId" value={b.id} />

                  <Field
                    id="technicianId"
                    label="Select technician"
                    className="w-full"
                  >
                    {(a) => (
                      <select
                        {...a}
                        name="technicianId"
                        className={inputClass}
                        defaultValue={b.technicianId ?? ""}
                        required
                      >
                        <option value="" disabled>
                          Choose a technician
                        </option>
                        {techs.map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={t.busy && t.id !== b.technicianId}
                          >
                            {t.name}
                            {t.busy && t.id !== b.technicianId
                              ? " (busy in this window)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>

                  <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-muted">
                      The technician will be notified after assignment.
                    </p>
                    <Button type="submit" className="w-full sm:w-auto">
                      Assign and notify
                    </Button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* Booking actions */}
          {b.status !== "completed" && b.status !== "cancelled" && (
            <section
              aria-labelledby="actions-h"
              className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
            >
              <SectionHeading
                icon={ClipboardText}
                title="Booking actions"
                description="Update the booking as work progresses."
              />

              <div className="flex flex-wrap gap-3">
                {b.status === "assigned" && (
                  <StatusButton id={b.id} to="in_progress">
                    Mark in progress
                  </StatusButton>
                )}

                {b.status === "in_progress" && (
                  <StatusButton id={b.id} to="completed">
                    Mark completed
                  </StatusButton>
                )}

                {b.status === "assigned" && (
                  <StatusButton id={b.id} to="paid">
                    Remove technician
                  </StatusButton>
                )}
              </div>

              {["pending_payment", "paid", "assigned"].includes(b.status) && (
                <details className="mt-5 overflow-hidden rounded-lg border border-danger/20 bg-danger-tint/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold text-danger [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2">
                      <WarningCircle size={18} weight="duotone" />
                      Cancel this booking
                    </span>
                    <span className="text-xs">Expand</span>
                  </summary>

                  <div className="border-t border-danger/15 p-4">
                    <p className="mb-4 text-sm leading-6 text-ink-soft">
                      The customer is emailed. Refunds are not automatic: if
                      they paid, refund them in your Paystack dashboard.
                    </p>
                    <StatusButton id={b.id} to="cancelled" danger>
                      Cancel booking
                    </StatusButton>
                  </div>
                </details>
              )}
            </section>
          )}

          {/* Technician payout */}
          {(b.status === "completed" || b.technicianId) && (
            <section
              aria-labelledby="payout-h"
              className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
            >
              <SectionHeading
                icon={CreditCard}
                title="Technician payout"
                description="Record the amount paid to the technician."
              />

              <div className="mb-5 flex items-start gap-3 rounded-lg border border-brand/15 bg-brand-tint/30 p-3.5">
                <ShieldCheck
                  size={20}
                  weight="duotone"
                  className="mt-0.5 shrink-0 text-brand"
                />
                <p className="text-xs leading-5 text-ink-soft">
                  Payouts are tracked here for your records. Pay the technician
                  yourself, then mark the payout as paid.
                </p>
              </div>

              <form action={payoutAction} className="space-y-4">
                <input type="hidden" name="bookingId" value={b.id} />

                <Field
                  id="amountNaira"
                  label="Payout amount (₦)"
                  className="w-full sm:max-w-xs"
                >
                  {(a) => (
                    <input
                      {...a}
                      name="amountNaira"
                      inputMode="decimal"
                      className={inputClass}
                      defaultValue={
                        b.technicianPayoutKobo != null
                          ? b.technicianPayoutKobo / 100
                          : ""
                      }
                    />
                  )}
                </Field>

                <div className="flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      name="paid"
                      defaultChecked={!!b.payoutPaidAt}
                      className="size-4 accent-brand"
                    />
                    <span>
                      Mark as paid
                      {b.payoutPaidAt && (
                        <span className="mt-0.5 block text-xs font-normal text-muted">
                          {formatDateTime(b.payoutPaidAt)}
                        </span>
                      )}
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Save payout
                  </Button>
                </div>
              </form>
            </section>
          )}

          {/* Booking history */}
          <section
            aria-labelledby="history-h"
            className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <SectionHeading
              icon={ClockCounterClockwise}
              title="Booking history"
              description="A timeline of recorded booking activity."
            />

            {events.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line-strong p-5 text-sm text-muted">
                No booking history is available yet.
              </p>
            ) : (
              <ol className="relative ml-2 space-y-5 border-l-2 border-line-strong pl-6">
                {events.map((e, index) => (
                  <li key={e.id} className="relative">
                    <span
                      className={`absolute -left-7.75 top-1 grid size-4 place-items-center rounded-full border-2 border-surface ${
                        index === 0 ? "bg-brand" : "bg-muted/50"
                      }`}
                    >
                      {index === 0 && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </span>

                    <p className="text-sm font-semibold capitalize text-ink">
                      {e.status.replace("_", " ")}
                    </p>

                    {e.note && (
                      <p className="mt-1 text-sm leading-5 text-ink-soft">
                        {e.note}
                      </p>
                    )}

                    <p className="mt-1.5 text-xs text-muted">
                      {formatDateTime(e.createdAt)}
                      {e.actor ? ` · ${e.actor}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Booking summary */}
        <aside className="min-w-0 xl:sticky xl:top-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Booking summary</h2>
            <span className="text-xs font-medium text-muted">{b.ref}</span>
          </div>

          <Ticket
            reference={b.ref}
            title={b.serviceName}
            status={<StatusBadge status={b.status} />}
            rows={[
              { label: "Area", value: b.areaName },
              { label: "Date", value: formatDayLong(b.slotDate) },
              { label: "Arrival window", value: windowLabel(b.slotWindow) },
              {
                label: "Technician",
                value: b.technicianName ?? (
                  <span className="text-muted">None assigned</span>
                ),
              },
            ]}
            total={{
              label: "Booking price",
              value: formatNaira(b.priceKobo),
            }}
          />

          <div className="mt-4 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start gap-3">
              <Clock
                size={19}
                weight="duotone"
                className="mt-0.5 shrink-0 text-brand"
              />
              <div>
                <p className="text-sm font-semibold text-ink">
                  Scheduled service
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {formatDayLong(b.slotDate)} · {windowLabel(b.slotWindow)}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

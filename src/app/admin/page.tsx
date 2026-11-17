import { adminOverview } from "@/lib/bookings";
import { type } from "@/lib/scale";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardText,
  ClockCountdown,
  CreditCard,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const o = await adminOverview();

  const items = [
    {
      n: o.needsAssigning,
      label: "Paid bookings waiting for a technician",
      description: "Assign a technician to confirmed bookings.",
      href: "/admin/bookings?status=paid",
      urgent: true,
      icon: Wrench,
      action: "View bookings",
    },
    {
      n: o.today,
      label: "Jobs scheduled for today",
      description: "Keep track of today's scheduled work.",
      href: "/admin/bookings?status=assigned",
      icon: CalendarCheck,
      action: "View schedule",
    },
    {
      n: o.pendingApplications,
      label: "Technician applications",
      description: "Review applications awaiting approval.",
      href: "/admin/applications?status=pending",
      urgent: true,
      icon: ClipboardText,
      action: "Review applications",
    },
    {
      n: o.newEnquiries,
      label: "New project enquiries",
      description: "Follow up with customers about their projects.",
      href: "/admin/enquiries?status=new",
      urgent: true,
      icon: ClipboardText,
      action: "View enquiries",
    },
    {
      n: o.awaitingPayment,
      label: "Awaiting payment",
      description: "Bookings started but not paid in the last 24 hours.",
      href: "/admin/bookings?status=pending_payment",
      icon: CreditCard,
      action: "View bookings",
    },
  ];

  const urgentCount = items
    .filter((item) => item.urgent)
    .reduce((total, item) => total + item.n, 0);

  return (
    <div className="space-y-8 xl3:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Administration
          </p>
          <h1 className={type.h1}>Overview</h1>
          <p className={`${type.body} mt-2 text-muted`}>
            Your operational snapshot. Here&apos;s what needs attention.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-muted">
          <span
            className={`size-2 rounded-full ${
              urgentCount > 0 ? "bg-brand" : "bg-success"
            }`}
          />
          {urgentCount > 0
            ? `${urgentCount} items need attention`
            : "You're all caught up"}
        </div>
      </div>

      {/* Overview cards */}
      <section
        aria-label="Booking and application summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const hasUrgentWork = item.urgent && item.n > 0;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md xl1:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${
                    hasUrgentWork
                      ? "bg-brand-tint text-brand"
                      : "bg-surface-2 text-muted"
                  }`}
                >
                  <Icon size={21} weight="duotone" />
                </span>

                {hasUrgentWork && (
                  <span className="rounded-full border border-brand/20 bg-brand-tint px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                    Action needed
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-4xl font-bold tracking-tight text-ink xl1:text-5xl">
                    {item.n}
                  </p>
                  <h2 className="mt-1 text-sm font-semibold leading-5 text-ink">
                    {item.label}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {item.description}
                  </p>
                </div>

                <span className="mb-1 grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-200 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                  <ArrowRight size={15} weight="bold" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Attention list */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Needs your attention
            </h2>
            <p className="mt-1 text-sm text-muted">
              Prioritise these tasks to keep operations moving.
            </p>
          </div>

          <ClockCountdown
            size={22}
            weight="duotone"
            className="shrink-0 text-muted"
            aria-hidden="true"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {items
            .filter((item) => item.urgent && item.n > 0)
            .map((item, index, urgentItems) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5 ${
                    index !== urgentItems.length - 1
                      ? "border-b border-line"
                      : ""
                  }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <Icon size={20} weight="duotone" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {item.description}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-display text-xl font-bold tabular-nums text-brand">
                      {item.n}
                    </span>
                    <ArrowRight
                      size={17}
                      weight="bold"
                      className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand"
                    />
                  </span>
                </Link>
              );
            })}

          {urgentCount === 0 && (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-success-tint text-success">
                <ClipboardText size={24} weight="duotone" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">
                Nothing needs your attention
              </p>
              <p className="mt-1 text-xs text-muted">
                All urgent bookings, applications and enquiries are up to date.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

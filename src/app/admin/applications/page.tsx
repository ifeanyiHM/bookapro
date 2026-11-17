import { Table, Td, Th } from "@/components/ui/Table";
import { CATEGORIES } from "@/config/booking";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { listApplications } from "@/lib/technician-applications";
import type { ApplicationStatus } from "@/types";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Clock,
  UserCircle,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = { title: "Applications" };

const TABS: { id: ApplicationStatus | "all"; label: string }[] = [
  { id: "pending", label: "Waiting" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All applications" },
];

const TONE = {
  pending: "bg-warning-tint text-warning",
  approved: "bg-success-tint text-success",
  rejected: "bg-danger-tint text-danger",
} as const;

const LABEL = {
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const current = TABS.some((t) => t.id === status)
    ? (status as ApplicationStatus | "all")
    : "pending";

  const rows = await listApplications(current === "all" ? undefined : current);

  const activeTab = TABS.find((t) => t.id === current);

  return (
    <div className="max-w-6xl space-y-7 xl1:space-y-9">
      {/* Header */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
          <UsersThree size={17} weight="duotone" />
          Team management
        </div>

        <h1 className={type.h1}>Technician applications</h1>

        <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
          Review technician applications, check submitted details and documents,
          and decide who can join your service network. Applicants cannot
          receive bookings until approved.
        </p>
      </div>

      {/* Overview */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">
              {current === "all" ? "All applications" : activeTab?.label}
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-brand-tint text-brand">
              <UsersThree size={19} weight="duotone" />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {rows.length}
          </p>

          <p className="mt-1 text-xs text-muted">
            {current === "all"
              ? "Applications across all statuses"
              : "Applications in this category"}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">
              Review process
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-success-tint text-success">
              <CheckCircle size={19} weight="duotone" />
            </span>
          </div>

          <p className="mt-3 text-lg font-bold tracking-tight text-ink">
            Manual approval
          </p>

          <p className="mt-1 text-xs text-muted">
            Every technician must be reviewed before receiving bookings.
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-ink">Filter applications</h2>
          <p className="mt-1 text-xs text-muted">
            View applicants by their review status.
          </p>
        </div>

        <nav
          aria-label="Filter by status"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/admin/applications?status=${t.id}`}
              aria-current={current === t.id ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors",
                current === t.id
                  ? "border-brand bg-brand text-white shadow-sm"
                  : "border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-2",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </section>

      {/* Applications */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">
              {current === "all"
                ? "All applicants"
                : `${activeTab?.label ?? "Applications"} applicants`}
            </h2>
            <p className="mt-1 text-xs text-muted">
              Review applicant profiles and submitted skills.
            </p>
          </div>

          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted tabular-nums">
            {rows.length} {rows.length === 1 ? "application" : "applications"}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
              {current === "pending" ? (
                <Clock size={26} weight="duotone" />
              ) : current === "approved" ? (
                <CheckCircle size={26} weight="duotone" />
              ) : current === "rejected" ? (
                <XCircle size={26} weight="duotone" />
              ) : (
                <UsersThree size={26} weight="duotone" />
              )}
            </span>

            <h3 className="mt-5 text-base font-bold text-ink">
              {current === "pending"
                ? "No applications waiting"
                : current === "approved"
                  ? "No approved applications"
                  : current === "rejected"
                    ? "No rejected applications"
                    : "No applications yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              {current === "pending"
                ? "You're all caught up. New technician applications will appear here when submitted."
                : "There are currently no applications in this category."}
            </p>

            {current !== "all" && (
              <Link
                href="/admin/applications?status=all"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                View all applications
                <ArrowRight size={15} weight="bold" />
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Applicant</Th>
                <Th>Skills</Th>
                <Th>Submitted</Th>
                <Th>Status</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.userId}
                  className="group transition-colors hover:bg-paper"
                >
                  <Td label="Applicant">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
                        <UserCircle size={20} weight="duotone" />
                      </span>

                      <div className="min-w-0">
                        <Link
                          href={`/admin/applications/${r.userId}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-brand underline-offset-4 transition-colors hover:underline"
                        >
                          {r.name}
                          <ArrowRight
                            size={13}
                            weight="bold"
                            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                          />
                        </Link>

                        <span className="mt-0.5 block break-all text-xs text-muted">
                          {r.email}
                        </span>
                      </div>
                    </div>
                  </Td>

                  <Td label="Skills">
                    <div className="flex max-w-xs flex-wrap gap-1.5">
                      {r.skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1 text-xs font-medium text-ink-soft"
                        >
                          <Briefcase
                            size={12}
                            weight="duotone"
                            className="text-muted"
                          />
                          {CATEGORIES.find((c) => c.id === s)?.label ?? s}
                        </span>
                      ))}
                    </div>
                  </Td>

                  <Td label="Submitted">
                    <span className="text-sm text-ink-soft">
                      {formatDateTime(r.submittedAt)}
                    </span>

                    {r.attempt > 1 && (
                      <span className="mt-1 block text-xs text-muted">
                        Attempt {r.attempt}
                      </span>
                    )}
                  </Td>

                  <Td label="Status">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                        TONE[r.status],
                      )}
                    >
                      {r.status === "pending" ? (
                        <Clock size={13} weight="bold" />
                      ) : r.status === "approved" ? (
                        <CheckCircle size={13} weight="bold" />
                      ) : (
                        <XCircle size={13} weight="bold" />
                      )}
                      {LABEL[r.status]}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

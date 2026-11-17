import { Notice } from "@/components/admin/Notice";
import { Table, Td, Th } from "@/components/ui/Table";
import { CATEGORIES } from "@/config/booking";
import { type } from "@/lib/scale";
import { listTechnicians } from "@/lib/users";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  ClipboardText,
  Clock,
  MapPin,
  Phone,
  UserCheck,
  UserCircle,
  UsersThree,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = { title: "Technicians" };

const STATUS = {
  approved: "Approved",
  pending: "In review",
  rejected: "Rejected",
} as const;

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
          <Icon size={21} weight="duotone" />
        </span>
      </div>
    </div>
  );
}

function ReviewStatus({ status }: { status: keyof typeof STATUS }) {
  const styles = {
    approved: "bg-success-tint text-success",
    pending: "bg-warning-tint text-warning",
    rejected: "bg-danger-tint text-danger",
  };

  const Icon = {
    approved: CheckCircle,
    pending: Clock,
    rejected: XCircle,
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <Icon size={14} weight="bold" />
      {STATUS[status]}
    </span>
  );
}

function AccountStatus({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        active ? "text-success" : "text-muted"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          active ? "bg-success" : "bg-muted"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default async function AdminTechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const techs = await listTechnicians();

  const approvedCount = techs.filter(
    (t) => t.applicationStatus === "approved",
  ).length;

  const pendingCount = techs.filter(
    (t) => t.applicationStatus === "pending",
  ).length;

  const activeCount = techs.filter((t) => t.active).length;

  return (
    <div className="max-w-7xl space-y-7 xl1:space-y-9">
      {/* Page heading */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Team management
          </p>

          <h1 className={`${type.h1} mt-2`}>Technicians</h1>

          <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
            Manage your service professionals, review their application status
            and monitor account availability.
          </p>
        </div>

        <Link
          href="/admin/applications"
          className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand"
        >
          <ClipboardText size={18} weight="duotone" />
          View applications
          <ArrowRight size={15} weight="bold" />
        </Link>
      </div>

      <Notice notice={notice} />

      {/* Availability information */}
      <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-tint/30 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
          <Briefcase size={19} weight="duotone" />
        </span>

        <div>
          <p className="text-sm font-bold text-ink">
            How technician availability works
          </p>
          <p className="mt-1 text-xs leading-5 text-ink-soft sm:text-sm">
            A time slot shows as free only while at least one approved, active
            technician covers the customer's selected area and skill. New
            applications are managed separately in the applications section.
          </p>
        </div>
      </div>

      {/* Summary */}
      <section
        aria-label="Technician statistics"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total technicians"
          value={techs.length}
          description="Registered professionals"
          icon={UsersThree}
        />

        <StatCard
          label="Approved"
          value={approvedCount}
          description="Applications approved"
          icon={UserCheck}
        />

        <StatCard
          label="Awaiting review"
          value={pendingCount}
          description="Applications pending"
          icon={ClipboardText}
        />

        <StatCard
          label="Active accounts"
          value={activeCount}
          description="Currently enabled accounts"
          icon={UserCircle}
        />
      </section>

      {/* Directory */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-col gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold tracking-tight text-ink">
              Technician directory
            </h2>
            <p className="mt-1 text-xs text-muted">
              {techs.length} {techs.length === 1 ? "technician" : "technicians"}{" "}
              registered
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted">
            <UsersThree size={15} />
            Team records
          </span>
        </div>

        {techs.length === 0 ? (
          <div className="px-5 py-14 text-center sm:px-8">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-2 text-muted">
              <UsersThree size={28} weight="duotone" />
            </span>

            <h3 className="mt-4 text-sm font-bold text-ink">
              No technicians yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Technicians will appear here when they register. Customers will
              see no available times until a technician is approved and active.
            </p>

            <Link
              href="/admin/applications"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4"
            >
              Review applications
              <ArrowRight size={15} weight="bold" />
            </Link>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Technician</Th>
                <Th>Skills</Th>
                <Th>Coverage</Th>
                <Th>Application</Th>
                <Th>Account</Th>
              </tr>
            </thead>

            <tbody>
              {techs.map((t) => {
                const skills = t.skills.map(
                  (s) => CATEGORIES.find((c) => c.id === s)?.label ?? s,
                );

                return (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-surface-2"
                  >
                    <Td label="Technician">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/technicians/${t.id}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-brand underline-offset-4 hover:underline"
                        >
                          {t.name}
                          <ArrowRight
                            size={13}
                            weight="bold"
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </Link>

                        <a
                          href={`tel:${t.phone}`}
                          className="mt-1 flex items-center gap-1.5 text-xs text-muted hover:text-brand"
                        >
                          <Phone size={12} />
                          {t.phone}
                        </a>
                      </div>
                    </Td>

                    <Td label="Skills">
                      {skills.length > 0 ? (
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {skills.map((skill, index) => (
                            <span
                              key={`${t.skills[index]}-${index}`}
                              className="rounded-md border border-line bg-surface-2 px-2 py-1 text-xs font-medium text-ink-soft"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">
                          No skills listed
                        </span>
                      )}
                    </Td>

                    <Td label="Coverage">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                        <MapPin
                          size={15}
                          weight="duotone"
                          className="text-muted"
                        />
                        {t.areaIds?.length ?? 0}{" "}
                        {(t.areaIds?.length ?? 0) === 1 ? "area" : "areas"}
                      </span>
                    </Td>

                    <Td label="Application">
                      {t.applicationStatus ? (
                        <Link
                          href={`/admin/applications/${t.id}`}
                          className="inline-flex rounded-full transition-opacity hover:opacity-75"
                        >
                          <ReviewStatus status={t.applicationStatus} />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">
                          No application
                        </span>
                      )}
                    </Td>

                    <Td label="Account">
                      <AccountStatus active={t.active} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

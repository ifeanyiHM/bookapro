import Link from "next/link";
import { Table, Td, Th } from "@/components/ui/Table";
import { CATEGORIES } from "@/config/booking";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { listApplications } from "@/lib/technician-applications";
import type { ApplicationStatus } from "@/types";

export const metadata = { title: "Applications" };

const TABS: { id: ApplicationStatus | "all"; label: string }[] = [
  { id: "pending", label: "Waiting" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];
const TONE = { pending: "bg-warning-tint text-warning", approved: "bg-success-tint text-success", rejected: "bg-danger-tint text-danger" } as const;
const LABEL = { pending: "Waiting for review", approved: "Approved", rejected: "Rejected" } as const;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = TABS.some((t) => t.id === status) ? (status as ApplicationStatus | "all") : "pending";
  const rows = await listApplications(current === "all" ? undefined : current);
  return (
    <div>
      <h1 className={type.h1}>Technician applications</h1>
      <p className={`${type.body} mb-6 mt-2 max-w-2xl text-muted`}>
        Check each applicant's details and documents, then approve or reject. Nobody receives bookings before approval.
      </p>
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/applications?status=${t.id}`}
            aria-current={current === t.id ? "page" : undefined}
            className={cn(
              "rounded-md border px-3.5 py-2 text-sm font-medium xl1:text-base",
              current === t.id ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-ink-soft hover:bg-surface-2",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className={`${type.body} rounded-md border border-dashed border-line-strong p-6 text-muted`}>No applications here.</p>
      ) : (
        <Table>
          <thead><tr><Th>Applicant</Th><Th>Skills</Th><Th>Submitted</Th><Th>Status</Th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId} className="hover:bg-paper">
                <Td label="Applicant">
                  <Link href={`/admin/applications/${r.userId}`} className="font-semibold text-brand underline underline-offset-4">{r.name}</Link>
                  <span className="block text-muted">{r.email}</span>
                </Td>
                <Td label="Skills">{r.skills.map((s) => CATEGORIES.find((c) => c.id === s)?.label ?? s).join(", ")}</Td>
                <Td label="Submitted">{formatDateTime(r.submittedAt)}{r.attempt > 1 && <span className="block text-muted">Attempt {r.attempt}</span>}</Td>
                <Td label="Status">
                  <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold xl1:text-sm", TONE[r.status])}>{LABEL[r.status]}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

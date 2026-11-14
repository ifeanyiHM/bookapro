import Link from "next/link";
import { EnquiryBadge } from "@/components/ui/StatusBadge";
import { Table, Td, Th } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { listEnquiries } from "@/lib/enquiries";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { ENQUIRY_TRADES } from "@/lib/validation";
import type { EnquiryStatus } from "@/types";

const FILTERS: { id: EnquiryStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
];

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = (["new", "contacted", "closed"] as const).find((s) => s === status);
  const enquiries = await listEnquiries(active);
  return (
    <div>
      <h1 className={type.h1}>Project enquiries</h1>
      <p className={`${type.body} mb-5 mt-2 text-muted`}>Large and new-build jobs sent from the Contact our team page.</p>
      <nav aria-label="Filter by status" className="mb-5 flex flex-wrap gap-1.5 xl1:gap-2 xl3:mb-8">
        {FILTERS.map((f) => {
          const on = (f.id === "all" && !active) || f.id === active;
          return (
            <Link
              key={f.id}
              href={f.id === "all" ? "/admin/enquiries" : `/admin/enquiries?status=${f.id}`}
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
      {enquiries.length === 0 ? (
        <p className={`${type.body} rounded-md border border-dashed border-line-strong p-6 text-muted`}>No enquiries in this view.</p>
      ) : (
        <Table>
          <thead>
            <tr><Th>Received</Th><Th>Name</Th><Th>Trades</Th><Th>Location</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {enquiries.map((q) => (
              <tr key={q.id} className="hover:bg-paper">
                <Td label="Received">
                  <Link href={`/admin/enquiries/${q.id}`} className="font-semibold text-brand underline underline-offset-4">
                    {formatDateTime(q.createdAt)}
                  </Link>
                </Td>
                <Td label="Name">{q.name}<span className="block text-muted">{q.phone}</span></Td>
                <Td label="Trades">{q.trades.map((t) => ENQUIRY_TRADES.find((x) => x.id === t)?.label ?? t).join(", ")}</Td>
                <Td label="Location">{q.location}</Td>
                <Td label="Status"><EnquiryBadge status={q.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

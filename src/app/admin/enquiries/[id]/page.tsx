import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { EnquiryBadge } from "@/components/ui/StatusBadge";
import { getEnquiry } from "@/lib/enquiries";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { ENQUIRY_PROJECT_TYPES, ENQUIRY_START_WINDOWS, ENQUIRY_TRADES } from "@/lib/validation";
import { enquiryAction } from "../../actions";

export const metadata = { title: "Enquiry" };

export default async function AdminEnquiryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const { notice, error } = await searchParams;
  const q = await getEnquiry(id);
  if (!q) notFound();
  const rows: [string, React.ReactNode][] = [
    ["Received", formatDateTime(q.createdAt)],
    ["Phone", <a key="p" className="text-brand underline underline-offset-4" href={`tel:${q.phone}`}>{q.phone}</a>],
    ["Email", q.email ? <a key="e" className="text-brand underline underline-offset-4" href={`mailto:${q.email}`}>{q.email}</a> : "Not given"],
    ["Prefers", q.contactMethod],
    ["Project type", ENQUIRY_PROJECT_TYPES.find((p) => p.id === q.projectType)?.label ?? q.projectType],
    ["Trades", q.trades.map((t) => ENQUIRY_TRADES.find((x) => x.id === t)?.label ?? t).join(", ")],
    ["Location", q.location],
    ["Size", q.sizeNote ?? "Not given"],
    ["Wants to start", ENQUIRY_START_WINDOWS.find((s) => s.id === q.startWindow)?.label ?? "Not given"],
  ];
  return (
    <div className="max-w-4xl xl3:max-w-5xl">
      <Link href="/admin/enquiries" className="text-sm font-semibold text-brand underline underline-offset-4 xl1:text-base">All enquiries</Link>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h1 className={type.h1}>{q.name}</h1>
        <EnquiryBadge status={q.status} />
      </div>
      <div className="mt-6"><Notice notice={notice} error={error} /></div>
      <dl className={`${type.body} grid gap-x-8 gap-y-2 sm:grid-cols-[11rem_1fr] xl1:grid-cols-[13rem_1fr]`}>
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <h2 className={`${type.h3} mb-2 mt-8`}>Project details</h2>
      <p className={`${type.body} whitespace-pre-wrap rounded-md border border-line bg-surface p-4 xl1:p-6`}>{q.description}</p>

      <form action={enquiryAction} className="mt-10 grid gap-5 sm:grid-cols-[14rem_1fr] xl1:gap-6">
        <input type="hidden" name="id" value={q.id} />
        <Field id="status" label="Status">
          {(a) => (
            <select {...a} name="status" className={inputClass} defaultValue={q.status}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </Field>
        <Field id="internalNote" label="Internal note" hint="Only your team sees this.">
          {(a) => <textarea {...a} name="internalNote" rows={4} className={textareaClass} defaultValue={q.internalNote ?? ""} />}
        </Field>
        <div className="sm:col-span-2"><Button type="submit">Save</Button></div>
      </form>
    </div>
  );
}

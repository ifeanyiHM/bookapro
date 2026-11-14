import { FileImage, FilePdf } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, textareaClass } from "@/components/ui/Field";
import { CATEGORIES } from "@/config/booking";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { getApplicationDetail } from "@/lib/technician-applications";
import { reviewApplicationAction } from "../../actions";

export const metadata = { title: "Review application" };

const STATUS = { pending: "Waiting for review", approved: "Approved", rejected: "Rejected" } as const;
const KIND = { id: "Government ID", credential: "Certificate, trade card or reference letter" } as const;
const size = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const { notice, error } = await searchParams;
  const a = await getApplicationDetail(id);
  if (!a) notFound();

  return (
    <div className="max-w-5xl xl1:max-w-6xl xl3:max-w-7xl">
      <p className="mb-2 text-sm xl1:text-base">
        <Link href="/admin/applications" className="font-semibold text-brand underline underline-offset-4">All applications</Link>
      </p>
      <h1 className={type.h1}>{a.name}</h1>
      <p className={`${type.body} mb-6 mt-1 text-muted`}>
        {STATUS[a.status]}. Submitted {formatDateTime(a.submittedAt)}{a.attempt > 1 ? `, attempt ${a.attempt}` : ""}.
      </p>
      <Notice notice={notice} error={error} />

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] xl1:gap-14">
        <div className="space-y-8">
          <section aria-labelledby="details-h">
            <h2 id="details-h" className={`${type.h3} mb-3`}>Details</h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[10rem_1fr] xl1:text-lg">
              <dt className="text-muted">Email</dt><dd className="break-all font-medium">{a.email}</dd>
              <dt className="text-muted">Phone</dt><dd className="font-medium">{a.phone}</dd>
              <dt className="text-muted">Experience</dt><dd className="font-medium">{a.yearsExperience === null ? "Not given" : `${a.yearsExperience} years`}</dd>
              <dt className="text-muted">Skills</dt><dd className="font-medium">{a.skills.map((s) => CATEGORIES.find((c) => c.id === s)?.label ?? s).join(", ") || "None"}</dd>
              <dt className="text-muted">Areas</dt><dd className="font-medium">{a.areas.map((x) => x.name).join(", ") || "None"}</dd>
              <dt className="text-muted">About their work</dt><dd className="whitespace-pre-line">{a.bio || "Nothing written."}</dd>
              <dt className="text-muted">Qualifications</dt><dd className="whitespace-pre-line">{a.qualifications || "None listed."}</dd>
            </dl>
          </section>

          <section aria-labelledby="docs-h">
            <h2 id="docs-h" className={`${type.h3} mb-3`}>Documents</h2>
            {a.documents.length === 0 ? (
              <p className="rounded-md border border-dashed border-line-strong p-4 text-muted">No documents were uploaded. This account was created before applications existed.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {a.documents.map((d) => {
                  const href = `/admin/applications/${a.userId}/documents/${d.id}`;
                  const isImage = d.mime.startsWith("image/");
                  return (
                    <li key={d.id} className="rounded-md border border-line bg-surface p-3 xl1:p-4">
                      <p className="mb-2 text-sm font-semibold xl1:text-base">{KIND[d.kind]}</p>
                      {isImage ? (
                        <a href={href} className="mb-2 block overflow-hidden rounded bg-surface-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={href} alt={`${KIND[d.kind]}: ${d.filename}`} className="max-h-64 w-full object-contain" />
                        </a>
                      ) : null}
                      <a href={href} className="inline-flex items-center gap-2 font-semibold text-brand underline underline-offset-4">
                        {isImage ? <FileImage aria-hidden="true" size={20} /> : <FilePdf aria-hidden="true" size={20} />}
                        Download {d.filename}
                      </a>
                      <span className="ml-2 text-sm text-muted">{size(d.sizeBytes)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside aria-labelledby="decision-h" className="self-start rounded-md border border-line bg-surface p-5 xl1:p-7">
          <h2 id="decision-h" className={`${type.h3} mb-3`}>Decision</h2>
          {a.status === "pending" ? (
            <form action={reviewApplicationAction} className="space-y-4">
              <input type="hidden" name="userId" value={a.userId} />
              <Field id="note" label="Note to the applicant" hint="Required when you reject. They receive it by email and on their status page." optional>
                {(f) => <textarea {...f} name="note" rows={4} maxLength={1000} className={textareaClass} />}
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" name="decision" value="approved">Approve</Button>
                <Button type="submit" name="decision" value="rejected" variant="danger">Reject</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 xl1:text-lg">
              <p><strong>{STATUS[a.status]}</strong>{a.reviewedAt ? ` on ${formatDateTime(a.reviewedAt)}` : ""}{a.reviewerName ? ` by ${a.reviewerName}` : ""}.</p>
              {a.reviewNote && <p className="whitespace-pre-line rounded-md bg-surface-2 p-3">{a.reviewNote}</p>}
              {a.status === "approved" && (
                <p><Link href={`/admin/technicians/${a.userId}`} className="font-semibold text-brand underline underline-offset-4">Manage this technician</Link></p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, textareaClass } from "@/components/ui/Field";
import { CATEGORIES } from "@/config/booking";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import { getApplicationDetail } from "@/lib/technician-applications";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CheckCircle,
  ClipboardText,
  Clock,
  DownloadSimple,
  EnvelopeSimple,
  FileImage,
  FilePdf,
  IdentificationCard,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reviewApplicationAction } from "../../actions";

export const metadata = { title: "Review application" };

const STATUS = {
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Rejected",
} as const;

const KIND = {
  id: "Government ID",
  credential: "Certificate, trade card or reference letter",
} as const;

const size = (n: number) =>
  n > 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;

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

      <div>
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
    <div className="grid gap-1.5 border-b border-line py-3 last:border-0 sm:grid-cols-[145px_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium leading-6 text-ink">
        {children}
      </dd>
    </div>
  );
}

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

  const skills = a.skills.map(
    (s) => CATEGORIES.find((c) => c.id === s)?.label ?? s,
  );

  const statusStyle = {
    pending: "bg-warning-tint text-warning",
    approved: "bg-success-tint text-success",
    rejected: "bg-danger-tint text-danger",
  } as const;

  return (
    <div className="max-w-6xl space-y-7 xl1:space-y-9">
      {/* Header */}
      <div>
        <Link
          href="/admin/applications"
          className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft
            size={17}
            weight="bold"
            className="transition-transform group-hover:-translate-x-1"
          />
          All applications
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Technician recruitment
            </p>

            <h1 className={`${type.h1} mt-2 wrap-break-word`}>{a.name}</h1>

            <p className="mt-2 text-sm text-muted">
              Submitted {formatDateTime(a.submittedAt)}
              {a.attempt > 1 ? ` · Attempt ${a.attempt}` : ""}
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[a.status]}`}
          >
            {a.status === "pending" ? (
              <Clock size={14} weight="bold" />
            ) : a.status === "approved" ? (
              <CheckCircle size={14} weight="bold" />
            ) : (
              <XCircle size={14} weight="bold" />
            )}
            {STATUS[a.status]}
          </span>
        </div>
      </div>

      <Notice notice={notice} error={error} />

      <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr] xl1:gap-8">
        {/* Main content */}
        <div className="min-w-0 space-y-6">
          {/* Applicant details */}
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={UserCircle}
              title="Applicant details"
              description="Personal information and professional background."
            />

            <dl>
              <DetailRow label="Full name">{a.name}</DetailRow>

              <DetailRow label="Email address">
                <a
                  href={`mailto:${a.email}`}
                  className="inline-flex items-center gap-2 break-all text-brand underline-offset-4 hover:underline"
                >
                  <EnvelopeSimple size={15} weight="bold" />
                  {a.email}
                  <ArrowUpRight size={13} />
                </a>
              </DetailRow>

              <DetailRow label="Phone number">
                <a
                  href={`tel:${a.phone}`}
                  className="inline-flex items-center gap-2 text-brand underline-offset-4 hover:underline"
                >
                  <Phone size={15} weight="bold" />
                  {a.phone}
                  <ArrowUpRight size={13} />
                </a>
              </DetailRow>

              <DetailRow label="Experience">
                {a.yearsExperience === null
                  ? "Not provided"
                  : `${a.yearsExperience} years`}
              </DetailRow>

              <DetailRow label="Skills">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={`${a.skills[index]}-${index}`}
                        className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-soft"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">None listed</span>
                )}
              </DetailRow>

              <DetailRow label="Service areas">
                {a.areas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {a.areas.map((area) => (
                      <span
                        key={area.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-soft"
                      >
                        <MapPin
                          size={13}
                          weight="duotone"
                          className="text-muted"
                        />
                        {area.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">None selected</span>
                )}
              </DetailRow>
            </dl>
          </section>

          {/* Professional background */}
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={Briefcase}
              title="Professional background"
              description="Information provided about the applicant's work and qualifications."
            />

            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-xs font-semibold text-muted">
                  About their work
                </h3>
                <div className="rounded-lg border border-line bg-surface-2 p-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-ink-soft">
                    {a.bio || "No information provided."}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold text-muted">
                  Qualifications
                </h3>
                <div className="rounded-lg border border-line bg-surface-2 p-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-ink-soft">
                    {a.qualifications || "No qualifications listed."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={IdentificationCard}
              title="Verification documents"
              description="Review the identity and professional documents submitted by the applicant."
            />

            {a.documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line-strong bg-surface-2 px-4 py-8 text-center">
                <FilePdf
                  size={27}
                  weight="duotone"
                  className="mx-auto text-muted"
                />
                <p className="mt-3 text-sm font-semibold text-ink">
                  No documents uploaded
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  This account was created before applications existed.
                </p>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {a.documents.map((d) => {
                  const href = `/admin/applications/${a.userId}/documents/${d.id}`;
                  const isImage = d.mime.startsWith("image/");

                  return (
                    <li
                      key={d.id}
                      className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                        <p className="text-xs font-bold text-ink">
                          {KIND[d.kind]}
                        </p>

                        <span className="shrink-0 text-xs text-muted">
                          {size(d.sizeBytes)}
                        </span>
                      </div>

                      {isImage && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden bg-surface-2"
                          aria-label={`View ${KIND[d.kind]}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={href}
                            alt={`${KIND[d.kind]}: ${d.filename}`}
                            className="h-52 w-full object-contain p-2 transition-transform duration-300 hover:scale-[1.02]"
                          />
                        </a>
                      )}

                      <div className="flex items-center gap-3 p-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
                          {isImage ? (
                            <FileImage size={21} weight="duotone" />
                          ) : (
                            <FilePdf size={21} weight="duotone" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">
                            {d.filename}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {isImage ? "Image document" : "PDF document"}
                          </p>
                        </div>

                        <a
                          href={href}
                          className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand"
                          aria-label={`Download ${d.filename}`}
                          title="Download document"
                        >
                          <DownloadSimple size={18} weight="bold" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Decision sidebar */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeading
              icon={ShieldCheck}
              title="Application decision"
              description="Review the application and record your decision."
            />

            {a.status === "pending" ? (
              <form action={reviewApplicationAction} className="space-y-5">
                <input type="hidden" name="userId" value={a.userId} />

                <Field
                  id="note"
                  label="Note to applicant"
                  hint="Required when rejecting. The applicant receives this by email and on their status page."
                  optional
                >
                  {(f) => (
                    <textarea
                      {...f}
                      name="note"
                      rows={5}
                      maxLength={1000}
                      className={textareaClass}
                      placeholder="Add feedback or explain your decision..."
                    />
                  )}
                </Field>

                <div className="space-y-3 border-t border-line pt-5">
                  <p className="text-xs font-semibold text-muted">
                    Choose an action
                  </p>

                  <Button
                    type="submit"
                    name="decision"
                    value="approved"
                    className="inline-flex w-full items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} weight="bold" />
                    Approve application
                  </Button>

                  <Button
                    type="submit"
                    name="decision"
                    value="rejected"
                    variant="danger"
                    className="inline-flex w-full items-center justify-center gap-2"
                  >
                    <XCircle size={18} weight="bold" />
                    Reject application
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div
                  className={`rounded-lg p-4 ${
                    a.status === "approved"
                      ? "bg-success-tint"
                      : "bg-danger-tint"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {a.status === "approved" ? (
                      <CheckCircle
                        size={21}
                        weight="fill"
                        className="text-success"
                      />
                    ) : (
                      <XCircle
                        size={21}
                        weight="fill"
                        className="text-danger"
                      />
                    )}

                    <p className="text-sm font-bold text-ink">
                      {STATUS[a.status]}
                    </p>
                  </div>

                  {a.reviewedAt && (
                    <p className="mt-2 text-xs leading-5 text-ink-soft">
                      Reviewed on {formatDateTime(a.reviewedAt)}
                    </p>
                  )}

                  {a.reviewerName && (
                    <p className="mt-1 text-xs text-ink-soft">
                      By {a.reviewerName}
                    </p>
                  )}
                </div>

                {a.reviewNote && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-muted">
                      Review note
                    </p>
                    <p className="whitespace-pre-line rounded-lg border border-line bg-surface-2 p-4 text-sm leading-6 text-ink-soft">
                      {a.reviewNote}
                    </p>
                  </div>
                )}

                {a.status === "approved" && (
                  <Link
                    href={`/admin/technicians/${a.userId}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-tint"
                  >
                    Manage this technician
                    <ArrowUpRight size={16} weight="bold" />
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Review reminder */}
          <div className="rounded-xl border border-brand/20 bg-brand-tint/30 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                weight="duotone"
                className="mt-0.5 shrink-0 text-brand"
              />
              <div>
                <p className="text-sm font-bold text-ink">
                  Review before approving
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  Check the applicant's identity documents, qualifications,
                  experience and selected service areas before making a
                  decision.
                </p>
              </div>
            </div>
          </div>

          {/* Submission information */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start gap-3">
              <ClipboardText
                size={19}
                weight="duotone"
                className="mt-0.5 shrink-0 text-muted"
              />

              <div>
                <p className="text-xs font-medium text-muted">
                  Application submitted
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatDateTime(a.submittedAt)}
                </p>

                {a.attempt > 1 && (
                  <p className="mt-1 text-xs text-muted">
                    Submission attempt {a.attempt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

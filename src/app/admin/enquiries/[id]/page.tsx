import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { EnquiryBadge } from "@/components/ui/StatusBadge";
import { getEnquiry } from "@/lib/enquiries";
import { formatDateTime } from "@/lib/format";
import { type } from "@/lib/scale";
import {
  ENQUIRY_PROJECT_TYPES,
  ENQUIRY_START_WINDOWS,
  ENQUIRY_TRADES,
} from "@/lib/validation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarBlank,
  ChatCircleText,
  ClipboardText,
  Clock,
  EnvelopeSimple,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { enquiryAction } from "../../actions";

export const metadata = { title: "Enquiry" };

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
    <div className="grid gap-1.5 border-b border-line py-3 last:border-0 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium leading-6 text-ink">
        {children}
      </dd>
    </div>
  );
}

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

  const projectType =
    ENQUIRY_PROJECT_TYPES.find((p) => p.id === q.projectType)?.label ??
    q.projectType;

  const startWindow =
    ENQUIRY_START_WINDOWS.find((s) => s.id === q.startWindow)?.label ??
    "Not given";

  const trades = q.trades.map(
    (t) => ENQUIRY_TRADES.find((x) => x.id === t)?.label ?? t,
  );

  return (
    <div className="max-w-5xl space-y-7 xl1:space-y-9">
      {/* Header */}
      <div>
        <Link
          href="/admin/enquiries"
          className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft
            size={17}
            weight="bold"
            className="transition-transform group-hover:-translate-x-1"
          />
          All enquiries
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Project enquiry
            </p>

            <h1 className={`${type.h1} mt-2 wrap-break-word`}>{q.name}</h1>

            <p className="mt-2 text-sm text-muted">
              Received {formatDateTime(q.createdAt)}
            </p>
          </div>

          <div className="w-fit">
            <EnquiryBadge status={q.status} />
          </div>
        </div>
      </div>

      <Notice notice={notice} error={error} />

      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr] xl1:gap-8">
        {/* Main information */}
        <div className="min-w-0 space-y-6">
          {/* Contact information */}
          <section
            aria-labelledby="contact-heading"
            className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <SectionHeading
              icon={UserCircle}
              title="Contact information"
              description="Customer details and preferred communication method."
            />

            <dl>
              <DetailRow label="Full name">{q.name}</DetailRow>

              <DetailRow label="Phone number">
                <a
                  href={`tel:${q.phone}`}
                  className="inline-flex items-center gap-2 text-brand underline-offset-4 hover:underline"
                >
                  <Phone size={15} weight="bold" />
                  {q.phone}
                  <ArrowUpRight size={13} />
                </a>
              </DetailRow>

              <DetailRow label="Email address">
                {q.email ? (
                  <a
                    href={`mailto:${q.email}`}
                    className="inline-flex items-center gap-2 break-all text-brand underline-offset-4 hover:underline"
                  >
                    <EnvelopeSimple size={15} weight="bold" />
                    {q.email}
                    <ArrowUpRight size={13} />
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </DetailRow>

              <DetailRow label="Preferred contact">
                <span className="capitalize">{q.contactMethod}</span>
              </DetailRow>
            </dl>
          </section>

          {/* Project information */}
          <section
            aria-labelledby="project-heading"
            className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <SectionHeading
              icon={ClipboardText}
              title="Project information"
              description="The scope and requirements submitted by the customer."
            />

            <dl>
              <DetailRow label="Project type">{projectType}</DetailRow>

              <DetailRow label="Trades required">
                <div className="flex flex-wrap gap-2">
                  {trades.map((trade, index) => (
                    <span
                      key={`${q.trades[index]}-${index}`}
                      className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-soft"
                    >
                      {trade}
                    </span>
                  ))}
                </div>
              </DetailRow>

              <DetailRow label="Project location">
                <span className="inline-flex items-start gap-2">
                  <MapPin
                    size={16}
                    weight="duotone"
                    className="mt-1 shrink-0 text-muted"
                  />
                  {q.location}
                </span>
              </DetailRow>

              <DetailRow label="Project size">
                {q.sizeNote ?? <span className="text-muted">Not provided</span>}
              </DetailRow>

              <DetailRow label="Expected start">
                <span className="inline-flex items-center gap-2">
                  <CalendarBlank
                    size={16}
                    weight="duotone"
                    className="text-muted"
                  />
                  {startWindow}
                </span>
              </DetailRow>
            </dl>
          </section>

          {/* Project description */}
          <section
            aria-labelledby="description-heading"
            className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <SectionHeading
              icon={ChatCircleText}
              title="Project description"
              description="Additional information provided by the customer."
            />

            <div className="rounded-lg border border-line bg-surface-2 p-4 sm:p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-ink-soft">
                {q.description}
              </p>
            </div>
          </section>
        </div>

        {/* Management sidebar */}
        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">
          {/* Status and internal notes */}
          <section
            aria-labelledby="management-heading"
            className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
          >
            <SectionHeading
              icon={Wrench}
              title="Manage enquiry"
              description="Update the enquiry status and add team notes."
            />

            <form action={enquiryAction} className="space-y-5">
              <input type="hidden" name="id" value={q.id} />

              <Field id="status" label="Enquiry status">
                {(a) => (
                  <select
                    {...a}
                    name="status"
                    className={inputClass}
                    defaultValue={q.status}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
              </Field>

              <div>
                <Field
                  id="internalNote"
                  label="Internal note"
                  hint="Only your team can see this note."
                >
                  {(a) => (
                    <textarea
                      {...a}
                      name="internalNote"
                      rows={6}
                      className={textareaClass}
                      defaultValue={q.internalNote ?? ""}
                      placeholder="Add follow-up details, discussions or next steps..."
                    />
                  )}
                </Field>
              </div>

              <div className="border-t border-line pt-4">
                <Button type="submit" className="w-full">
                  Save changes
                </Button>
              </div>
            </form>
          </section>

          {/* Internal note information */}
          <div className="rounded-xl border border-brand/20 bg-brand-tint/30 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                weight="duotone"
                className="mt-0.5 shrink-0 text-brand"
              />

              <div>
                <p className="text-sm font-bold text-ink">
                  Internal team workspace
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">
                  Keep enquiry updates and follow-up notes here so your team can
                  track the progress of this project.
                </p>
              </div>
            </div>
          </div>

          {/* Received date */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start gap-3">
              <Clock
                size={19}
                weight="duotone"
                className="mt-0.5 shrink-0 text-muted"
              />
              <div>
                <p className="text-xs font-medium text-muted">
                  Enquiry received
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatDateTime(q.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

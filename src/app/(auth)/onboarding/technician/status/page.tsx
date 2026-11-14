// import { AuthCard } from "@/components/auth/AuthCard";
// import { ButtonLink } from "@/components/ui/Button";
// import { requireUser } from "@/lib/auth";
// import { landingPath } from "@/lib/sign-in";
// import {
//   CheckCircle,
//   Hourglass,
//   XCircle,
// } from "@phosphor-icons/react/dist/ssr";
// import type { Metadata } from "next";
// import { redirect } from "next/navigation";

// export const metadata: Metadata = { title: "Application status" };

// export default async function ApplicationStatusPage() {
//   const user = await requireUser();
//   if (!user.emailVerified) redirect("/verify-email");
//   if (user.role !== "technician") redirect(await landingPath(user));
//   if (!user.applicationStatus) redirect("/onboarding/technician");
//   if (user.applicationStatus === "approved") redirect("/technician");

//   if (user.applicationStatus === "pending") {
//     return (
//       <AuthCard
//         title="Application in review"
//         lead="Thank you. Our team is checking your details and documents."
//       >
//         <div className="space-y-4 xl1:text-lg">
//           <p className="flex items-start gap-2.5">
//             <Hourglass
//               aria-hidden="true"
//               size={26}
//               weight="fill"
//               className="mt-0.5 shrink-0 text-warning"
//             />
//             <span>
//               You cannot take bookings until you are approved. We will email{" "}
//               <strong>{user.email}</strong> with the decision.
//             </span>
//           </p>
//           <ButtonLink href="/onboarding/technician?edit=1" variant="secondary">
//             Edit my application
//           </ButtonLink>
//         </div>
//       </AuthCard>
//     );
//   }
//   return (
//     <AuthCard
//       title="Application not approved"
//       lead="We could not approve it this time."
//     >
//       <div className="space-y-4 xl1:text-lg">
//         <p className="flex items-start gap-2.5">
//           <XCircle
//             aria-hidden="true"
//             size={26}
//             weight="fill"
//             className="mt-0.5 shrink-0 text-danger"
//           />
//           <span>Reason from our team:</span>
//         </p>
//         <blockquote className="whitespace-pre-line rounded-md bg-surface-2 p-4">
//           {user.reviewNote ?? "No reason was recorded."}
//         </blockquote>
//         <p className="flex items-start gap-2.5 text-ink-soft">
//           <CheckCircle
//             aria-hidden="true"
//             size={22}
//             className="mt-0.5 shrink-0"
//           />
//           <span>
//             If you can fix this, update your details or documents and submit
//             again.
//           </span>
//         </p>
//         <ButtonLink href="/onboarding/technician">
//           Update and submit again
//         </ButtonLink>
//       </div>
//     </AuthCard>
//   );
// }

import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { type } from "@/lib/scale";
import { landingPath } from "@/lib/sign-in";
import {
  Check,
  EnvelopeSimple,
  Hourglass,
  Note,
  PencilSimple,
  X,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Application status" };

type StepState = "done" | "current" | "failed" | "upcoming";
type Step = { label: string; caption: string; state: StepState };

/** Caution-tape band along the top of the ticket. Amber and ink while we review, solid red when not approved. */
const TAPE_PENDING =
  "repeating-linear-gradient(-45deg, var(--color-amber) 0 12px, var(--color-ink) 12px 24px)";
const TAPE_REJECTED = "var(--color-danger)";

function Node({ state }: { state: StepState }) {
  const base =
    "relative z-10 grid size-9 place-items-center rounded-full xl1:size-10 xl3:size-12";
  if (state === "done")
    return (
      <span className={cn(base, "bg-brand text-white")}>
        <Check aria-hidden="true" weight="bold" size={18} />
      </span>
    );
  if (state === "failed")
    return (
      <span className={cn(base, "bg-danger text-white")}>
        <X aria-hidden="true" weight="bold" size={18} />
      </span>
    );
  if (state === "current")
    return (
      <span className={cn(base, "bg-amber text-ink")}>
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-amber opacity-50"
        />
        <Hourglass aria-hidden="true" weight="fill" size={18} />
      </span>
    );
  return (
    <span
      className={cn(
        base,
        "border-2 border-dashed border-line-strong bg-surface",
      )}
    />
  );
}

/** Submitted, in review, decision. The line is solid where the application has already been, dashed where it has not. */
function Track({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid grid-cols-3">
      {steps.map((s, i) => (
        <li
          key={s.label}
          aria-current={s.state === "current" ? "step" : undefined}
          className="relative flex flex-col items-center text-center"
        >
          {i > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute right-1/2 top-4.5 h-0 w-full -translate-y-1/2 border-t-2 xl1:top-5 xl3:top-6",
                s.state === "upcoming"
                  ? "border-dashed border-line-strong"
                  : "border-brand",
              )}
            />
          )}
          <Node state={s.state} />
          <span className={cn(type.label, "mt-3")}>{s.label}</span>
          <span className={cn(type.small, "text-muted")}>{s.caption}</span>
        </li>
      ))}
    </ol>
  );
}

/** The ticket from the booking pages, here carrying the application instead of a job. */
function ApplicationTicket({
  tone,
  email,
  badge,
  steps,
  children,
}: {
  tone: "pending" | "rejected";
  email: string;
  badge: React.ReactNode;
  steps: Step[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="ticket-top overflow-hidden rounded-t-md border border-b-0 border-line bg-surface">
        <div
          aria-hidden="true"
          className="h-2.5 xl3:h-3"
          style={{
            background: tone === "pending" ? TAPE_PENDING : TAPE_REJECTED,
          }}
        />
        <div className="px-5 pb-7 pt-5 xl1:px-7 xl1:pt-6 xl3:px-9 xl3:pb-9 xl3:pt-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn(type.small, "text-muted")}>
                Technician application
              </p>
              <p className="mt-1 break-all font-display text-xl font-bold tracking-wide xl1:text-2xl xl3:text-3xl">
                {email}
              </p>
            </div>
            {badge}
          </div>
          <div className="mt-8 xl3:mt-10">
            <Track steps={steps} />
          </div>
        </div>
      </div>

      <div className="ticket-bottom relative rounded-b-md border border-t-0 border-line bg-surface px-5 pb-6 pt-7 before:absolute before:inset-x-5 before:top-0 before:border-t before:border-dashed before:border-line-strong xl1:px-7 xl1:pb-7 xl1:pt-8 xl1:before:inset-x-7 xl3:px-9 xl3:pb-9 xl3:before:inset-x-9">
        {children}
      </div>
    </div>
  );
}

export default async function ApplicationStatusPage() {
  const user = await requireUser();
  if (!user.emailVerified) redirect("/verify-email");
  if (user.role !== "technician") redirect(await landingPath(user));
  if (!user.applicationStatus) redirect("/onboarding/technician");
  if (user.applicationStatus === "approved") redirect("/technician");

  const shell = "w-full max-w-2xl xl1:max-w-3xl xl3:max-w-4xl";

  if (user.applicationStatus === "pending") {
    return (
      <div className={shell}>
        <h1 className={`${type.h1} mb-2`}>Your application is in review</h1>
        <p className={`${type.body} mb-8 max-w-prose text-muted xl1:mb-10`}>
          Our team is checking your details and documents. You cannot take
          bookings until you are approved.
        </p>

        <ApplicationTicket
          tone="pending"
          email={user.email}
          badge={
            <span className="inline-flex items-center gap-2 rounded-full bg-warning-tint px-3 py-1 text-sm font-semibold text-warning xl1:text-base">
              <span
                className="size-2 rounded-full bg-amber"
                aria-hidden="true"
              />
              In review
            </span>
          }
          steps={[
            { label: "Submitted", caption: "Received", state: "done" },
            { label: "In review", caption: "Checking now", state: "current" },
            { label: "Decision", caption: "Sent by email", state: "upcoming" },
          ]}
        >
          <p className={cn(type.label, "mb-4")}>When we decide</p>
          <ul className={cn(type.body, "space-y-4")}>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-success-tint text-success">
                <Check aria-hidden="true" weight="bold" size={15} />
              </span>
              <span>
                <strong>Approved:</strong> your technician dashboard opens and
                you can start taking jobs.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-danger-tint text-danger">
                <X aria-hidden="true" weight="bold" size={15} />
              </span>
              <span>
                <strong>Not approved:</strong> the reason appears on this page
                and you can fix it and apply again.
              </span>
            </li>
          </ul>
        </ApplicationTicket>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 xl1:mt-8">
          <p
            className={cn(
              type.small,
              "flex min-w-0 items-center gap-2 text-ink-soft",
            )}
          >
            <EnvelopeSimple
              aria-hidden="true"
              size={20}
              className="shrink-0 text-brand"
            />
            <span className="break-all">
              We will email <strong>{user.email}</strong> with the decision.
            </span>
          </p>
          <ButtonLink href="/onboarding/technician?edit=1" variant="secondary">
            <PencilSimple aria-hidden="true" size={18} />
            Edit my application
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <h1 className={`${type.h1} mb-2`}>Your application was not approved</h1>
      <p className={`${type.body} mb-8 max-w-prose text-muted xl1:mb-10`}>
        Here is what our team said, and how to try again.
      </p>

      <ApplicationTicket
        tone="rejected"
        email={user.email}
        badge={
          <span className="inline-flex items-center gap-2 rounded-full bg-danger-tint px-3 py-1 text-sm font-semibold text-danger xl1:text-base">
            <X aria-hidden="true" weight="bold" size={14} />
            Not approved
          </span>
        }
        steps={[
          { label: "Submitted", caption: "Received", state: "done" },
          { label: "In review", caption: "Checked", state: "done" },
          { label: "Decision", caption: "Not approved", state: "failed" },
        ]}
      >
        <p className={cn(type.label, "mb-3 flex items-center gap-2")}>
          <Note
            aria-hidden="true"
            size={20}
            weight="fill"
            className="text-danger"
          />
          Reason from our team
        </p>
        <blockquote
          className={cn(
            type.body,
            "whitespace-pre-line rounded-r-md border-l-4 border-danger bg-danger-tint/60 px-4 py-3 text-ink xl1:px-5 xl1:py-4",
          )}
        >
          {user.reviewNote ?? "No reason was recorded."}
        </blockquote>

        <p className={cn(type.label, "mb-3 mt-8")}>To try again</p>
        <ol className={cn(type.body, "space-y-3 text-ink-soft")}>
          {[
            "Read the note above.",
            "Update your details or documents.",
            "Submit your application again.",
          ].map((t, i) => (
            <li key={t} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-line-strong font-display text-sm font-bold text-ink">
                {i + 1}
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </ApplicationTicket>

      <div className="mt-6 xl1:mt-8">
        <ButtonLink href="/onboarding/technician" size="lg">
          Update and submit again
        </ButtonLink>
      </div>
    </div>
  );
}

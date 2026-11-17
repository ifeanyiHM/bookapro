import { AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { getServiceBySlug } from "@/lib/catalog";
import { loadDraft } from "@/lib/drafts";
import { formatDayLong, windowLabel } from "@/lib/format";
import { landingPath } from "@/lib/sign-in";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Get started" };

const STEPS = [
  {
    number: "01",
    title: "Confirm your email",
    text: "We'll send a verification link to the email address you register with.",
  },
  {
    number: "02",
    title: "Choose how you'll use BookAPro",
    text: "Join as a customer booking services or as a technician taking on jobs.",
  },
  {
    number: "03",
    title: "Complete your profile",
    text: "Add your contact details or, if you're a technician, your work details and ID.",
  },
];

export default async function GetStartedPage() {
  const user = await getCurrentUser();

  if (user) redirect(await landingPath(user));

  const draft = await loadDraft(null);
  const service = draft ? await getServiceBySlug(draft.serviceSlug) : null;

  return (
    <AuthCard
      title="Get started"
      lead={
        draft && service ? (
          <>Create your account to continue with your saved booking.</>
        ) : (
          "One account gets you started, whether you need a service or want to provide one."
        )
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand underline underline-offset-4 transition-colors hover:text-brand-dark"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {draft && service && (
          <div className="relative overflow-hidden rounded-xl border border-brand/20 bg-brand-tint/40 p-4 sm:p-5">
            <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-brand/10" />

            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand" />
                <p className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Booking saved
                </p>
              </div>

              <h2 className="text-base font-bold text-ink sm:text-lg">
                {service.name}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
                <span>{formatDayLong(draft.date)}</span>
                <span aria-hidden="true" className="text-brand/50">
                  •
                </span>
                <span>{windowLabel(draft.window)}</span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Your booking details are saved. Create an account to continue to
                payment.
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="mb-3">
            <h2 className="text-sm font-bold text-ink">Create your account</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Choose your preferred sign-up method.
            </p>
          </div>

          <div className="space-y-3">
            <GoogleButton label="Sign up with Google" />

            <ButtonLink
              href="/register"
              size="lg"
              className="w-full shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Sign up with email
            </ButtonLink>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-ink">What happens next?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Just three steps before you're ready to go.
            </p>
          </div>

          <ol className="space-y-4">
            {STEPS.map((step) => (
              <li key={step.number} className="group flex gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-xs font-bold tabular-nums text-brand transition-colors duration-200 group-hover:border-brand/30 group-hover:bg-brand-tint">
                  {step.number}
                </span>

                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg bg-surface-2 px-3.5 py-3">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-tint text-xs font-bold text-brand"
          >
            ✓
          </span>
          <p className="text-xs leading-relaxed text-ink-soft">
            Your account is free to create. You can choose whether to book
            services or apply as a technician after signing up.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

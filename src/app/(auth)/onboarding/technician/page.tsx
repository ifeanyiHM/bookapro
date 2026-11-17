import { TechnicianApplicationForm } from "@/components/auth/TechnicianApplicationForm";
import { Container } from "@/components/ui/Container";
import { requireUser } from "@/lib/auth";
import { listAreas } from "@/lib/catalog";
import { landingPath } from "@/lib/sign-in";
import { getOwnApplication } from "@/lib/technician-applications";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Technician application" };

const steps = [
  {
    number: "01",
    title: "Personal details",
    description: "Your contact information and experience.",
  },
  {
    number: "02",
    title: "Your expertise",
    description: "The services you offer and where you work.",
  },
  {
    number: "03",
    title: "Verification",
    description: "Your identity and supporting documents.",
  },
];

export default async function TechnicianApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const user = await requireUser();

  if (!user.emailVerified) redirect("/verify-email");
  if (user.role !== "technician") redirect(await landingPath(user));
  if (user.applicationStatus === "approved") redirect("/technician");

  // A pending application can only be edited intentionally.
  if (user.applicationStatus === "pending" && !edit) {
    redirect("/onboarding/technician/status");
  }

  const [areas, own] = await Promise.all([
    listAreas(),
    getOwnApplication(user.id),
  ]);

  const editing = !!own;

  return (
    <main className="min-h-screen bg-surface-2 py-8 sm:py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-5xl">
          {/* Page heading */}
          <div className="mb-8 sm:mb-10">
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-muted">
              <span>Technician onboarding</span>
              <span aria-hidden="true">/</span>
              <span className="text-brand">
                {editing ? "Update application" : "New application"}
              </span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand">
                  <span className="size-1.5 rounded-full bg-brand" />
                  Professional registration
                </span>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                  {editing
                    ? "Update your application"
                    : "Become a BookAPro technician"}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-7 text-ink-soft sm:text-base">
                  {editing
                    ? "Review your professional information, make any necessary changes, and resubmit your application for review."
                    : "Show us what you do best. Tell us about your experience, the services you offer, and the areas you cover."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-tint text-brand">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Secure application
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Your details are protected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application steps */}
          <section
            aria-label="Application steps"
            className="mb-6 grid gap-3 sm:grid-cols-3"
          >
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-sm font-bold text-brand">
                  {step.number}
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <span
                    className="absolute right-4 top-4 hidden text-muted/50 sm:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </section>

          {/* Review notice */}
          <section className="mb-8 overflow-hidden rounded-xl border border-brand/20 bg-brand-tint/40">
            <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-brand shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>

              <div>
                <p className="text-sm font-bold text-ink">
                  Every application is reviewed
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  Our team checks your information and documents before you can
                  receive bookings. We&apos;ll email you when a decision is
                  made.
                </p>
              </div>
            </div>
          </section>

          {/* Form section */}
          <section
            aria-labelledby="application-form-heading"
            className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
          >
            <div className="border-b border-line px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">
                    Professional profile
                  </p>
                  <h2
                    id="application-form-heading"
                    className="mt-1.5 text-xl font-bold tracking-tight text-ink sm:text-2xl"
                  >
                    {editing
                      ? "Your application details"
                      : "Tell us about yourself"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Provide accurate information so we can review your
                    application.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted">
                  <span className="size-1.5 rounded-full bg-danger" />
                  Required fields marked
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <TechnicianApplicationForm areas={areas} own={own} />
            </div>
          </section>

          <p className="mt-6 text-center text-xs leading-6 text-muted">
            Need help with your application?{" "}
            <a
              href="/contact-team"
              className="font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-strong hover:underline"
            >
              Contact our team
            </a>
          </p>
        </div>
      </Container>
    </main>
  );
}

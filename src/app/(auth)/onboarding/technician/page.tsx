import { AuthCard } from "@/components/auth/AuthCard";
import { TechnicianApplicationForm } from "@/components/auth/TechnicianApplicationForm";
import { requireUser } from "@/lib/auth";
import { listAreas } from "@/lib/catalog";
import { landingPath } from "@/lib/sign-in";
import { getOwnApplication } from "@/lib/technician-applications";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Technician application" };

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
    <AuthCard
      wide
      title={
        editing ? "Update your application" : "Become a BookAPro technician"
      }
      lead={
        editing
          ? "Review your information, update anything that has changed, and resubmit your application if needed."
          : "Show us what you do best. Complete your professional profile and submit your documents for our team to review."
      }
    >
      <div className="space-y-7">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Your details",
              text: "Contact and experience",
            },
            {
              number: "02",
              title: "Your expertise",
              text: "Skills and service areas",
            },
            {
              number: "03",
              title: "Your documents",
              text: "ID and supporting proof",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-tint text-xs font-bold text-brand">
                {item.number}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-tint/40 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-brand">
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
            <p className="text-sm font-semibold text-ink">
              Every application is reviewed
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Our team checks your information and documents before you can
              receive bookings. We'll email you when a decision is made.
            </p>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">
              Professional profile
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">
              {editing ? "Your application details" : "Tell us about yourself"}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Fields marked as required must be completed before submission.
            </p>
          </div>

          <TechnicianApplicationForm areas={areas} own={own} />
        </div>
      </div>
    </AuthCard>
  );
}

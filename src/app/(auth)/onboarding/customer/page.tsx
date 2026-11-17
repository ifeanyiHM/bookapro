import { AuthCard } from "@/components/auth/AuthCard";
import { CustomerProfileForm } from "@/components/auth/forms";
import { getCustomerProfile } from "@/lib/accounts";
import { requireUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Your details" };

export default async function CustomerProfilePage() {
  const user = await requireUser();

  if (!user.emailVerified) redirect("/verify-email");
  if (user.role !== "customer") redirect(await landingPath(user));

  const profile = user.hasCustomerProfile
    ? await getCustomerProfile(user.id)
    : null;

  const editing = !!profile;

  return (
    <AuthCard
      title={editing ? "Your details" : "Complete your profile"}
      lead={
        editing
          ? "Keep your contact information up to date so we can make every booking experience smooth."
          : "Just a few details and you'll be ready to book trusted professionals for your home."
      }
    >
      <div className="space-y-6">
        {/* Profile status */}
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            editing
              ? "border-success/30 bg-success-tint/40"
              : "border-brand/20 bg-brand-tint/40"
          }`}
        >
          <div
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${
              editing ? "bg-success/10 text-success" : "bg-brand/10 text-brand"
            }`}
          >
            {editing ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21a7 7 0 0 1 14 0" />
              </svg>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">
              {editing ? "Profile ready" : "One last step"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {editing
                ? "Your customer profile is set up. You can update your details whenever they change."
                : "We need your contact details to coordinate appointments and keep you informed about your bookings."}
            </p>
          </div>
        </div>

        {/* Form heading */}
        <div className="border-b border-line pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            Customer information
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">
            {editing ? "Update your information" : "Your contact details"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {editing
              ? "Make sure your information is accurate."
              : "These details help our team and technicians serve you better."}
          </p>
        </div>

        <CustomerProfileForm
          defaults={profile ?? undefined}
          editing={editing}
        />

        {!editing && (
          <p className="text-center text-xs leading-relaxed text-muted">
            Your information is used to manage your bookings and coordinate your
            service appointments.
          </p>
        )}
      </div>
    </AuthCard>
  );
}

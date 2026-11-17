import { AuthCard } from "@/components/auth/AuthCard";
import { RoleForm } from "@/components/auth/forms";
import { requireUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "How will you use BookAPro?" };

export default async function RolePage() {
  const user = await requireUser();

  if (!user.emailVerified) redirect("/verify-email");
  if (user.role === "admin") redirect(await landingPath(user));

  // Once a profile exists the role is settled, so there is nothing to choose.
  if (user.role && (user.hasCustomerProfile || user.hasTechnicianProfile)) {
    redirect(await landingPath(user));
  }

  const current =
    user.role === "customer" || user.role === "technician" ? user.role : null;

  return (
    <AuthCard
      title="How will you use BookAPro?"
      lead="Choose the experience that fits you. You can change your selection until you complete your profile."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-brand/20 bg-brand-tint/40 p-4">
          <p className="text-sm font-semibold text-ink">
            Choose your account type
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Whether you need a helping hand at home or want to offer your
            professional skills, there's a place for you here.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-tint text-brand">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9v12h14V9M9 21v-7h6v7" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Find the right fit</h2>
              <p className="text-xs text-ink-soft">
                Select how you'd like to get started.
              </p>
            </div>
          </div>

          <RoleForm current={current} />
        </div>

        <div className="flex items-start gap-2.5 border-t border-line pt-5">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-tint text-success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>
          <p className="text-xs leading-relaxed text-ink-soft">
            You can change your selection before completing your profile. Once
            your profile is complete, your account type is settled.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

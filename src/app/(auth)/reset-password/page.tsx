import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/forms";
import { peekToken } from "@/lib/tokens";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await peekToken(token, "reset_password") : null;

  if (!token || !valid) {
    return (
      <AuthCard
        title="This link no longer works"
        lead="Your password reset link may have expired or already been used."
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M12 9v4m0 4h.01" />
                <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Reset link expired
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Reset links can only be used once and expire after one hour.
                Request a fresh link to continue.
              </p>
            </div>
          </div>

          <Link
            href="/forgot-password"
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-dark hover:shadow-md"
          >
            Request a new reset link
          </Link>

          <p className="text-center text-sm text-muted">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      lead="Create a strong password to secure your BookAPro account."
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="size-5"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Your account security
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Saving your new password will sign you out on all your devices.
            </p>
          </div>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </AuthCard>
  );
}

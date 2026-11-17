import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/forms";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Forgot your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      lead="No worries. Enter the email address linked to your account and we'll help you get back in."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-semibold text-brand underline underline-offset-4 transition-colors hover:text-brand-dark"
        >
          <span aria-hidden="true">←</span>
          Back to sign in
        </Link>
      }
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
              Secure password recovery
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              We'll send a one-time reset link to your registered email address.
            </p>
          </div>
        </div>

        <ForgotPasswordForm />
      </div>
    </AuthCard>
  );
}

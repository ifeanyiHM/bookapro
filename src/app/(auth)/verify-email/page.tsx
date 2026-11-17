import { Alert, AuthCard } from "@/components/auth/AuthCard";
import {
  ConfirmEmailForm,
  ResendVerificationForm,
} from "@/components/auth/forms";
import { getCurrentUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";
import { peekToken } from "@/lib/tokens";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    // Opening the link only checks it. The token is used up when the person
    // presses the button, so email scanners cannot spend it.
    const valid = await peekToken(token, "verify_email");

    if (valid) {
      return (
        <AuthCard
          title="Confirm your email"
          lead="You're almost there. Confirm your email address to activate your account."
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-tint/40 p-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-brand shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Verification link ready
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Press the button below to confirm your email. Your link hasn't
                  been used yet.
                </p>
              </div>
            </div>

            <ConfirmEmailForm token={token} />
          </div>
        </AuthCard>
      );
    }
  }

  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthCard
        title="This link no longer works"
        lead="Your verification link may have expired or already been used."
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-soft sm:text-base">
            Sign in to your account and we'll help you request a new
            verification link.
          </p>

          <Link
            href="/login"
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-dark hover:shadow-md"
          >
            Sign in to continue
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (user.emailVerified) redirect(await landingPath(user));

  return (
    <AuthCard
      title="Confirm your email to continue"
      lead={
        <>
          We sent a confirmation link to{" "}
          <strong className="break-all text-ink">{user.email}</strong>. Open it
          to confirm your address, then choose how you'll use BookAPro.
        </>
      }
    >
      <div className="space-y-5">
        {token && (
          <Alert tone="error">
            That link has expired or was already used. Request a new one below.
          </Alert>
        )}

        <div className="rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-sm font-semibold text-ink">
            Still waiting for your email?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            You can request another confirmation link below. Don't forget to
            check your spam folder.
          </p>
        </div>

        <ResendVerificationForm />

        <p className="text-xs leading-relaxed text-muted sm:text-sm">
          Wrong email address? Sign out and register again with the correct one.
        </p>
      </div>
    </AuthCard>
  );
}

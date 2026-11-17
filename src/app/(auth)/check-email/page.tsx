import { AuthCard } from "@/components/auth/AuthCard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const shown = email?.slice(0, 120);

  return (
    <AuthCard
      title="Check your email"
      lead="You're one step away from getting started with BookAPro."
      footer={
        <>
          Wrong email address?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand underline underline-offset-4 transition-colors hover:text-brand-dark"
          >
            Start again
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center rounded-xl border border-brand/20 bg-brand-tint/40 px-5 py-7 text-center sm:py-9">
          <div className="grid size-16 place-items-center rounded-2xl bg-surface text-brand shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="size-8"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-wider text-brand-dark">
            Verification email sent
          </p>

          {shown ? (
            <p className="mt-2 break-all text-base font-bold text-ink sm:text-lg">
              {shown}
            </p>
          ) : (
            <p className="mt-2 text-base font-bold text-ink sm:text-lg">
              Check your inbox
            </p>
          )}

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Open the link in the email to confirm your email address and
            continue setting up your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-bold text-brand">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Open your inbox</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Look for the verification email from BookAPro.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-bold text-brand">
              2
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Click the confirmation link
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                The link works once and expires after 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-surface-2 px-4 py-3.5">
          <p className="text-sm font-semibold text-ink">
            Didn't receive the email?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Wait a few minutes and check your spam folder. If you already have
            an account with this address, the message will tell you.
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

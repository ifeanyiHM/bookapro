import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, AuthCard } from "@/components/auth/AuthCard";
import { ConfirmEmailForm, ResendVerificationForm } from "@/components/auth/forms";
import { getCurrentUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";
import { peekToken } from "@/lib/tokens";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (token) {
    // Opening the link only checks it. The token is used up when the person presses the button, so email
    // scanners that open links ahead of time cannot spend it.
    const valid = await peekToken(token, "verify_email");
    if (valid) {
      return (
        <AuthCard title="Confirm your email" lead="One click and your email address is confirmed.">
          <ConfirmEmailForm token={token} />
        </AuthCard>
      );
    }
  }

  const user = await getCurrentUser();
  if (!user) {
    return (
      <AuthCard title="This link no longer works" lead="It may have expired, or it was already used.">
        <p className="xl1:text-lg">
          <Link href="/login" className="font-semibold text-brand underline underline-offset-4">Sign in</Link> and we will send you a new one.
        </p>
      </AuthCard>
    );
  }
  if (user.emailVerified) redirect(await landingPath(user));

  return (
    <AuthCard
      title="Confirm your email to continue"
      lead={<>We sent a link to <strong className="text-ink">{user.email}</strong>. Open it to confirm this address, then you can choose how you will use BookAPro.</>}
    >
      <div className="space-y-5">
        {token && <Alert tone="error">That link has expired or was already used. Send yourself a new one below.</Alert>}
        <ResendVerificationForm />
        <p className="text-sm text-muted xl1:text-base">Check your spam folder too. Wrong address? Sign out and register again with the right one.</p>
      </div>
    </AuthCard>
  );
}

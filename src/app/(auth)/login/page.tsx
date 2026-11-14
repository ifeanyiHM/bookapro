import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/forms";
import { getCurrentUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";

export const metadata: Metadata = { title: "Sign in" };

const GOOGLE_ERRORS: Record<string, string> = {
  expired: "The Google sign-in expired. Please try again.",
  failed: "We could not complete the Google sign-in. Please try again.",
  no_email: "Google did not share an email address, so we cannot sign you in with it.",
  unverified: "Google has not verified that email address, so we cannot use it. Register with email and password instead.",
  inactive: "This account is not active. Contact us if you think that is a mistake.",
  other_google: "This email is already linked to a different Google account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; verified?: string; error?: string }>;
}) {
  const { next, reset, verified, error } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(await landingPath(user, next));
  return (
    <AuthCard
      title="Sign in"
      footer={
        <>
          New here?{" "}
          <Link href="/get-started" className="font-semibold text-brand underline underline-offset-4">Create an account</Link>
        </>
      }
    >
      <div className="space-y-5">
        {reset && <Alert tone="success">Your password was changed. Sign in with the new one.</Alert>}
        {verified && <Alert tone="success">Your email is confirmed. Sign in to continue.</Alert>}
        {error && <Alert tone="error">{GOOGLE_ERRORS[error] ?? "Sign-in failed. Please try again."}</Alert>}
        <GoogleButton />
        <LoginForm next={next} />
      </div>
    </AuthCard>
  );
}

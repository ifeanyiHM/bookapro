import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/forms";
import { peekToken } from "@/lib/tokens";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = token ? await peekToken(token, "reset_password") : null;
  if (!token || !valid) {
    return (
      <AuthCard title="This link no longer works" lead="Reset links work once and expire after 1 hour.">
        <Link href="/forgot-password" className="font-semibold text-brand underline underline-offset-4 xl1:text-lg">
          Ask for a new reset link
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Choose a new password" lead="You will be signed out on all your devices when you save it.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}

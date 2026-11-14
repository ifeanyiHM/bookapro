import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Forgot your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      lead="Enter your email and we will send a link to choose a new one."
      footer={<Link href="/login" className="font-semibold text-brand underline underline-offset-4">Back to sign in</Link>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

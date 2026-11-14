import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/forms";
import { getCurrentUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(await landingPath(user));
  return (
    <AuthCard
      title="Create your account"
      lead="Just an email and a password. You will confirm your email next."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand underline underline-offset-4">Sign in</Link></>}
    >
      <GoogleButton label="Sign up with Google" />
      <RegisterForm />
    </AuthCard>
  );
}

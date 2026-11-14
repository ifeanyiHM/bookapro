import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  const shown = email?.slice(0, 120);
  return (
    <AuthCard
      title="Check your email"
      footer={<>Wrong address? <Link href="/register" className="font-semibold text-brand underline underline-offset-4">Start again</Link></>}
    >
      <div className="space-y-3 xl1:text-lg">
        <p>
          {shown ? <>We sent a message to <strong>{shown}</strong>.</> : "We sent you a message."} Open the link in it to confirm your email address. It works once and expires in 24 hours.
        </p>
        <p className="text-ink-soft">
          Nothing arrived after a few minutes? Check your spam folder. If you already have an account with this address, the message tells you so.
        </p>
      </div>
    </AuthCard>
  );
}

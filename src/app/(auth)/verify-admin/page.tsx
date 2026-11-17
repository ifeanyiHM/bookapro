import { AuthCard } from "@/components/auth/AuthCard";
import { AdminVerifyForm } from "@/components/auth/forms";
import { safePath } from "@/lib/access";
import { ADMIN_COOKIE, getCurrentUser, readAdminToken } from "@/lib/auth";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin verification" };

export default async function VerifyAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();

  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" || !user.emailVerified) redirect("/");

  const target = safePath(next, "/admin");
  const dest = target.startsWith("/admin") ? target : "/admin";
  const proof = (await cookies()).get(ADMIN_COOKIE)?.value;
  const valid = proof ? await readAdminToken(proof) : null;

  if (
    valid &&
    valid.userId === user.id &&
    valid.sessionVersion === user.sessionVersion
  ) {
    redirect(dest);
  }

  return (
    <AuthCard
      title="Admin verification"
      lead="One more security check before you access your dashboard."
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
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Protected admin access
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Enter your admin password to unlock the dashboard. Verification
              remains valid for two hours.
            </p>
          </div>
        </div>

        <AdminVerifyForm next={dest} />
      </div>
    </AuthCard>
  );
}

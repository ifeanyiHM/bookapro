import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AdminVerifyForm } from "@/components/auth/forms";
import { safePath } from "@/lib/access";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, getCurrentUser, readAdminToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin verification" };

export default async function VerifyAdminPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" || !user.emailVerified) redirect("/");

  const target = safePath(next, "/admin");
  const dest = target.startsWith("/admin") ? target : "/admin";
  const proof = (await cookies()).get(ADMIN_COOKIE)?.value;
  const valid = proof ? await readAdminToken(proof) : null;
  if (valid && valid.userId === user.id && valid.sessionVersion === user.sessionVersion) redirect(dest);

  return (
    <AuthCard title="Admin verification" lead="Enter your admin password to open the dashboard. It lasts 2 hours.">
      <AdminVerifyForm next={dest} />
    </AuthCard>
  );
}

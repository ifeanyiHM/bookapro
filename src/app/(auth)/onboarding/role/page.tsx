import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { RoleForm } from "@/components/auth/forms";
import { requireUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";

export const metadata: Metadata = { title: "How will you use BookAPro?" };

export default async function RolePage() {
  const user = await requireUser();
  if (!user.emailVerified) redirect("/verify-email");
  if (user.role === "admin") redirect(await landingPath(user));
  // Once a profile exists the role is settled, so there is nothing to choose.
  if (user.role && (user.hasCustomerProfile || user.hasTechnicianProfile)) redirect(await landingPath(user));
  return (
    <AuthCard title="How will you use BookAPro?" lead="Pick one. You can switch until you finish your profile.">
      <RoleForm current={user.role === "customer" || user.role === "technician" ? user.role : null} />
    </AuthCard>
  );
}

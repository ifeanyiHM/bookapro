import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { CustomerProfileForm } from "@/components/auth/forms";
import { getCustomerProfile } from "@/lib/accounts";
import { requireUser } from "@/lib/auth";
import { landingPath } from "@/lib/sign-in";

export const metadata: Metadata = { title: "Your details" };

export default async function CustomerProfilePage() {
  const user = await requireUser();
  if (!user.emailVerified) redirect("/verify-email");
  if (user.role !== "customer") redirect(await landingPath(user));
  const profile = user.hasCustomerProfile ? await getCustomerProfile(user.id) : null;
  const editing = !!profile;
  return (
    <AuthCard
      title={editing ? "Your details" : "Complete your profile"}
      lead={editing ? "These are used for your bookings." : "We need this before you can pay for a booking. Your saved booking is waiting."}
    >
      <CustomerProfileForm defaults={profile ?? undefined} editing={editing} />
    </AuthCard>
  );
}

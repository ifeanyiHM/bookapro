import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { TechnicianApplicationForm } from "@/components/auth/TechnicianApplicationForm";
import { requireUser } from "@/lib/auth";
import { listAreas } from "@/lib/catalog";
import { landingPath } from "@/lib/sign-in";
import { getOwnApplication } from "@/lib/technician-applications";

export const metadata: Metadata = { title: "Technician application" };

export default async function TechnicianApplicationPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const user = await requireUser();
  if (!user.emailVerified) redirect("/verify-email");
  if (user.role !== "technician") redirect(await landingPath(user));
  if (user.applicationStatus === "approved") redirect("/technician");
  // A pending application is being reviewed; it can still be edited on purpose, but not by accident.
  if (user.applicationStatus === "pending" && !edit) redirect("/onboarding/technician/status");

  const [areas, own] = await Promise.all([listAreas(), getOwnApplication(user.id)]);
  return (
    <AuthCard
      wide
      title={user.applicationStatus ? "Update your application" : "Your professional profile"}
      lead="Tell us about your work and upload your documents. Our team reviews every application before any bookings are assigned, and we email you the result."
    >
      <TechnicianApplicationForm areas={areas} own={own} />
    </AuthCard>
  );
}

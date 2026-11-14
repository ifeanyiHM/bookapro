import { notFound } from "next/navigation";
import { TechnicianForm } from "@/components/admin/TechnicianForm";
import { listAreas } from "@/lib/catalog";
import { getTechnician } from "@/lib/users";
import { type } from "@/lib/scale";

export const metadata = { title: "Edit technician" };

export default async function EditTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tech, areas] = await Promise.all([/^[0-9a-f-]{36}$/i.test(id) ? getTechnician(id) : null, listAreas({ includeInactive: true })]);
  if (!tech) notFound();
  return (
    <div className="max-w-4xl xl3:max-w-5xl">
      <h1 className={`${type.h1} mb-8`}>Edit technician</h1>
      <TechnicianForm technician={tech} areas={areas} />
    </div>
  );
}

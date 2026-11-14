import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { getServiceById } from "@/lib/catalog";
import { type } from "@/lib/scale";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  const service = Number.isInteger(n) ? await getServiceById(n) : null;
  if (!service) notFound();
  return (
    <div className="max-w-4xl xl3:max-w-5xl">
      <h1 className={`${type.h1} mb-8`}>Edit service</h1>
      <ServiceForm service={service} />
    </div>
  );
}

import { ServiceForm } from "@/components/admin/ServiceForm";
import { type } from "@/lib/scale";

export const metadata = { title: "Add a service" };

export default function NewServicePage() {
  return (
    <div className="max-w-4xl xl3:max-w-5xl">
      <h1 className={`${type.h1} mb-8`}>Add a service</h1>
      <ServiceForm />
    </div>
  );
}

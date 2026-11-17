import { ServiceForm } from "@/components/admin/ServiceForm";
import { getServiceById } from "@/lib/catalog";
import { type } from "@/lib/scale";
import { ArrowLeft, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  const service = Number.isInteger(n) ? await getServiceById(n) : null;

  if (!service) notFound();

  return (
    <div className="max-w-5xl space-y-7 xl1:space-y-9">
      <div>
        <Link
          href="/admin/services"
          className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft
            size={17}
            weight="bold"
            className="transition-transform group-hover:-translate-x-1"
          />
          All services
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-tint text-brand">
            <PencilSimple size={22} weight="duotone" />
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Catalogue management
            </p>
            <h1 className={`${type.h1} mt-1`}>Edit service</h1>
          </div>
        </div>

        <p className={`${type.body} mt-3 max-w-2xl text-muted`}>
          Update the service details, pricing and availability displayed to
          customers.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div>
            <h2 className="text-base font-bold text-ink">{service.name}</h2>
            <p className="mt-1 text-sm text-muted">
              Make your changes below and save when you're ready.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              service.active
                ? "bg-success-tint text-success"
                : "bg-surface-2 text-muted"
            }`}
          >
            {service.active ? "Visible on website" : "Hidden from website"}
          </span>
        </div>

        <ServiceForm service={service} />
      </div>
    </div>
  );
}

import { ServiceForm } from "@/components/admin/ServiceForm";
import { type } from "@/lib/scale";
import { ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = { title: "Add a service" };

export default function NewServicePage() {
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
            <Plus size={23} weight="bold" />
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Catalogue management
            </p>
            <h1 className={`${type.h1} mt-1`}>Add a service</h1>
          </div>
        </div>

        <p className={`${type.body} mt-3 max-w-2xl text-muted`}>
          Create a service that customers can explore and book through your
          website.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-7">
        <div className="mb-6 border-b border-line pb-5">
          <h2 className="text-base font-bold text-ink">Service information</h2>
          <p className="mt-1 text-sm text-muted">
            Complete the details below to add a new service to your catalogue.
          </p>
        </div>

        <ServiceForm />
      </div>
    </div>
  );
}

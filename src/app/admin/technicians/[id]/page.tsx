import { TechnicianForm } from "@/components/admin/TechnicianForm";
import { listAreas } from "@/lib/catalog";
import { type } from "@/lib/scale";
import { getTechnician } from "@/lib/users";
import {
  ArrowLeft,
  PencilSimple,
  ShieldCheck,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit technician" };

export default async function EditTechnicianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tech, areas] = await Promise.all([
    /^[0-9a-f-]{36}$/i.test(id) ? getTechnician(id) : null,
    listAreas({ includeInactive: true }),
  ]);

  if (!tech) notFound();

  return (
    <div className="max-w-5xl space-y-7 xl1:space-y-9">
      {/* Header */}
      <div>
        <Link
          href={`/admin/technicians/${id}`}
          className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft
            size={17}
            weight="bold"
            className="transition-transform group-hover:-translate-x-1"
          />
          Technician profile
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Team management
            </p>

            <h1 className={`${type.h1} mt-2`}>Edit technician</h1>

            <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
              Update this technician&apos;s profile, skills, service coverage
              and account settings.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-xs font-semibold text-muted">
            <PencilSimple size={15} weight="bold" />
            Profile editing
          </span>
        </div>
      </div>

      {/* Technician identity */}
      <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand sm:size-14">
          <UserCircle size={30} weight="duotone" />
        </span>

        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{tech.name}</p>
          <p className="mt-1 text-sm text-muted">Technician account</p>
        </div>
      </div>

      {/* Form */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
            <ShieldCheck size={21} weight="duotone" />
          </span>

          <div>
            <h2 className="text-base font-bold text-ink">
              Technician information
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Changes made here will update the technician&apos;s existing
              account.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 lg:p-7">
          <TechnicianForm technician={tech} areas={areas} />
        </div>
      </section>
    </div>
  );
}

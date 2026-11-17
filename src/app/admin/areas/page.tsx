import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { listAreas } from "@/lib/catalog";
import { type } from "@/lib/scale";
import {
  CheckCircle,
  Eye,
  EyeSlash,
  MapPin,
  MapTrifold,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { addAreaAction, toggleAreaAction } from "../actions";

export const metadata = { title: "Areas" };

export default async function AdminAreasPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { notice, error } = await searchParams;
  const areas = await listAreas({ includeInactive: true });

  const activeCount = areas.filter((area) => area.active).length;
  const hiddenCount = areas.length - activeCount;

  return (
    <div className="max-w-5xl space-y-7 xl1:space-y-9">
      {/* Header */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
          <MapPin size={16} weight="duotone" />
          Service coverage
        </div>

        <h1 className={type.h1}>Areas</h1>

        <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
          Manage the locations where customers can book services. Hiding an area
          prevents new bookings there. Remember to assign service areas to
          technicians on their profiles.
        </p>
      </div>

      <Notice notice={notice} error={error} />

      {/* Overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">Total areas</span>
            <span className="grid size-9 place-items-center rounded-lg bg-brand-tint text-brand">
              <MapTrifold size={19} weight="duotone" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {areas.length}
          </p>
          <p className="mt-1 text-xs text-muted">All configured locations</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">
              Open for booking
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-success-tint text-success">
              <Eye size={19} weight="duotone" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-muted">Available to customers</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">Hidden areas</span>
            <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-muted">
              <EyeSlash size={19} weight="duotone" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {hiddenCount}
          </p>
          <p className="mt-1 text-xs text-muted">Not accepting new bookings</p>
        </div>
      </div>

      {/* Add area */}
      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
            <Plus size={21} weight="bold" />
          </span>

          <div>
            <h2 className="text-base font-bold text-ink">Add a service area</h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Add a location where customers can request services.
            </p>
          </div>
        </div>

        <form
          action={addAreaAction}
          className="flex flex-col items-end gap-4 sm:flex-row"
        >
          <Field
            id="name"
            label="Area name"
            className="w-full flex-1"
            hint="Use a recognisable neighbourhood or location name."
          >
            {(a) => (
              <input
                {...a}
                name="name"
                className={inputClass}
                placeholder="For example, Oniru"
                required
              />
            )}
          </Field>

          <Button
            type="submit"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto"
          >
            <Plus size={18} weight="bold" />
            Add area
          </Button>
        </form>
      </section>

      {/* Areas table */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">Configured areas</h2>
            <p className="mt-1 text-xs text-muted">
              Manage where your services are available.
            </p>
          </div>

          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted tabular-nums">
            {areas.length} {areas.length === 1 ? "area" : "areas"}
          </span>
        </div>

        {areas.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Area</Th>
                <Th>Status</Th>
                <Th>
                  <span className="sr-only">Action</span>
                </Th>
              </tr>
            </thead>

            <tbody>
              {areas.map((area) => (
                <tr key={area.id} className="transition-colors hover:bg-paper">
                  <Td label="Area">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
                        <MapPin size={18} weight="duotone" />
                      </span>

                      <span className="font-semibold text-ink">
                        {area.name}
                      </span>
                    </div>
                  </Td>

                  <Td label="Status">
                    {area.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint px-2.5 py-1 text-xs font-semibold text-success">
                        <CheckCircle size={13} weight="fill" />
                        Open for booking
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                        <EyeSlash size={13} weight="bold" />
                        Hidden
                      </span>
                    )}
                  </Td>

                  <Td label="Action">
                    <form action={toggleAreaAction}>
                      <input type="hidden" name="id" value={area.id} />

                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        className="min-w-16"
                      >
                        {area.active ? "Hide" : "Show"}
                      </Button>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="px-5 py-16 text-center sm:px-8">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
              <MapPin size={26} weight="duotone" />
            </span>

            <h3 className="mt-5 text-base font-bold text-ink">
              No service areas yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Add your first service area to start defining where customers can
              book your services.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

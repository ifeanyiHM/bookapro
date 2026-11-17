import { Notice } from "@/components/admin/Notice";
import { ButtonLink } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { CATEGORIES } from "@/config/booking";
import { listServices } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { type } from "@/lib/scale";
import {
  ArrowRight,
  Eye,
  EyeSlash,
  Plus,
  SquaresFour,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = { title: "Services" };

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const services = await listServices({ includeInactive: true });

  const activeCount = services.filter((s) => s.active).length;
  const hiddenCount = services.length - activeCount;

  return (
    <div className="max-w-6xl space-y-7 xl1:space-y-9">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            <Wrench size={16} weight="duotone" />
            Catalogue management
          </div>

          <h1 className={type.h1}>Services</h1>

          <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
            Manage the services customers can book, including their
            descriptions, categories and pricing.
          </p>
        </div>

        <ButtonLink
          href="/admin/services/new"
          className="inline-flex shrink-0 items-center justify-center gap-2"
        >
          <Plus size={18} weight="bold" />
          Add a service
        </ButtonLink>
      </div>

      <Notice notice={notice} />

      {/* Pricing reminder */}
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-tint/40 p-4 sm:p-5">
        <span className="grid size-10 text-md shrink-0 place-items-center rounded-xl bg-warning/10 text-warning">
          ₦ {/* <CurrencyNaira size={21} weight="duotone" /> */}
        </span>

        <div>
          <p className="text-sm font-bold text-ink">
            Review your service prices before launch
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Prices and descriptions here are what customers see. The starter
            list contains sample data, so review every price before making your
            services available.
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">
              Total services
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-brand-tint text-brand">
              <SquaresFour size={19} weight="duotone" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {services.length}
          </p>
          <p className="mt-1 text-xs text-muted">Across all categories</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted">
              Visible services
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
            <span className="text-sm font-medium text-muted">
              Hidden services
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-muted">
              <EyeSlash size={19} weight="duotone" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {hiddenCount}
          </p>
          <p className="mt-1 text-xs text-muted">Not shown to customers</p>
        </div>
      </div>

      {/* Services table */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">Service catalogue</h2>
            <p className="mt-1 text-xs text-muted">
              Select a service to manage its details and availability.
            </p>
          </div>

          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted tabular-nums">
            {services.length} {services.length === 1 ? "service" : "services"}
          </span>
        </div>

        {services.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Service</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Visibility</Th>
              </tr>
            </thead>

            <tbody>
              {services.map((s) => {
                const category = CATEGORIES.find((c) => c.id === s.category);

                return (
                  <tr
                    key={s.id}
                    className="group transition-colors hover:bg-paper"
                  >
                    <Td label="Service">
                      <Link
                        href={`/admin/services/${s.id}`}
                        className="inline-flex items-center gap-2 font-semibold text-brand underline-offset-4 transition-colors hover:underline"
                      >
                        {s.name}
                        <ArrowRight
                          size={14}
                          weight="bold"
                          className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </Td>

                    <Td label="Category">
                      <span className="text-sm text-ink-soft">
                        {category?.label ?? s.category}
                      </span>
                    </Td>

                    <Td label="Price">
                      <span className="font-semibold tabular-nums text-ink">
                        {formatNaira(s.priceKobo)}
                      </span>
                    </Td>

                    <Td label="Visibility">
                      {s.active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint px-2.5 py-1 text-xs font-semibold text-success">
                          <Eye size={13} weight="bold" />
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                          <EyeSlash size={13} weight="bold" />
                          Hidden
                        </span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <div className="px-5 py-16 text-center sm:px-8">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
              <Wrench size={26} weight="duotone" />
            </span>

            <h3 className="mt-5 text-base font-bold text-ink">
              No services yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Your service catalogue is empty. Add your first service to start
              building the list customers can book.
            </p>

            <div className="mt-5">
              <ButtonLink
                href="/admin/services/new"
                className="inline-flex items-center gap-2"
              >
                <Plus size={17} weight="bold" />
                Add your first service
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

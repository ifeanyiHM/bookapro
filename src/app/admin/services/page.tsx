import Link from "next/link";
import { Notice } from "@/components/admin/Notice";
import { ButtonLink } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { CATEGORIES } from "@/config/booking";
import { listServices } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { type } from "@/lib/scale";

export const metadata = { title: "Services" };

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const services = await listServices({ includeInactive: true });
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={type.h1}>Services</h1>
          <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
            Prices and descriptions here are what customers see. The starter list is sample data: review every price before launch.
          </p>
        </div>
        <ButtonLink href="/admin/services/new">Add a service</ButtonLink>
      </div>
      <Notice notice={notice} />
      <Table>
        <thead><tr><Th>Service</Th><Th>Category</Th><Th>Price</Th><Th>Shown</Th></tr></thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="hover:bg-paper">
              <Td label="Service">
                <Link href={`/admin/services/${s.id}`} className="font-semibold text-brand underline underline-offset-4">{s.name}</Link>
              </Td>
              <Td label="Category">{CATEGORIES.find((c) => c.id === s.category)?.label}</Td>
              <Td label="Price">{formatNaira(s.priceKobo)}</Td>
              <Td label="Shown">{s.active ? "Yes" : <span className="text-muted">Hidden</span>}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

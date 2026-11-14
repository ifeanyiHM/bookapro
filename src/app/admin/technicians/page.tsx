import Link from "next/link";
import { Notice } from "@/components/admin/Notice";
import { Table, Td, Th } from "@/components/ui/Table";
import { CATEGORIES } from "@/config/booking";
import { listTechnicians } from "@/lib/users";
import { type } from "@/lib/scale";

export const metadata = { title: "Technicians" };

const STATUS = { approved: "Approved", pending: "In review", rejected: "Rejected" } as const;

export default async function AdminTechniciansPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const techs = await listTechnicians();
  return (
    <div>
      <div className="mb-6">
        <h1 className={type.h1}>Technicians</h1>
        <p className={`${type.body} mt-2 max-w-2xl text-muted`}>
          Technicians register and apply themselves. A time slot shows as free only while at least one approved, active technician covers that area and skill.
          New applications are under <Link href="/admin/applications" className="font-semibold text-brand underline underline-offset-4">Applications</Link>.
        </p>
      </div>
      <Notice notice={notice} />
      {techs.length === 0 ? (
        <p className={`${type.body} rounded-md border border-dashed border-line-strong p-6 text-muted`}>
          No technicians yet. Customers will see no available times until one is approved.
        </p>
      ) : (
        <Table>
          <thead><tr><Th>Name</Th><Th>Skills</Th><Th>Areas</Th><Th>Review</Th><Th>Account</Th></tr></thead>
          <tbody>
            {techs.map((t) => (
              <tr key={t.id} className="hover:bg-paper">
                <Td label="Name">
                  <Link href={`/admin/technicians/${t.id}`} className="font-semibold text-brand underline underline-offset-4">{t.name}</Link>
                  <span className="block text-muted">{t.phone}</span>
                </Td>
                <Td label="Skills">{t.skills.map((s) => CATEGORIES.find((c) => c.id === s)?.label ?? s).join(", ")}</Td>
                <Td label="Areas">{t.areaIds?.length ?? 0} areas</Td>
                <Td label="Review">
                  {t.applicationStatus ? (
                    <Link href={`/admin/applications/${t.id}`} className="underline underline-offset-4">{STATUS[t.applicationStatus]}</Link>
                  ) : "No application"}
                </Td>
                <Td label="Account">{t.active ? "Active" : <span className="text-muted">Inactive</span>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

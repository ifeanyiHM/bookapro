import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { listAreas } from "@/lib/catalog";
import { type } from "@/lib/scale";
import { addAreaAction, toggleAreaAction } from "../actions";

export const metadata = { title: "Areas" };

export default async function AdminAreasPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { notice, error } = await searchParams;
  const areas = await listAreas({ includeInactive: true });
  return (
    <div className="max-w-4xl xl3:max-w-5xl">
      <h1 className={type.h1}>Areas</h1>
      <p className={`${type.body} mb-6 mt-2 text-muted`}>Areas customers can book in. Hiding an area stops new bookings there. Assign areas to technicians on their profile.</p>
      <Notice notice={notice} error={error} />
      <form action={addAreaAction} className="mb-8 flex flex-wrap items-end gap-3">
        <Field id="name" label="Add an area" className="min-w-64 flex-1">
          {(a) => <input {...a} name="name" className={inputClass} placeholder="For example, Oniru" required />}
        </Field>
        <Button type="submit">Add area</Button>
      </form>
      <Table>
        <thead><tr><Th>Area</Th><Th>Status</Th><Th><span className="sr-only">Action</span></Th></tr></thead>
        <tbody>
          {areas.map((a) => (
            <tr key={a.id}>
              <Td label="Area"><span className="font-medium">{a.name}</span></Td>
              <Td label="Status">{a.active ? "Open for booking" : <span className="text-muted">Hidden</span>}</Td>
              <Td label="Action">
                <form action={toggleAreaAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <Button type="submit" variant="secondary" size="sm">{a.active ? "Hide" : "Show"}</Button>
                </form>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

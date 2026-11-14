import { db } from "./db";
import type { EnquiryInput } from "./validation";
import type { Enquiry, EnquiryStatus } from "@/types";

type Row = Omit<Enquiry, "createdAt"> & { createdAt: Date };
const COLS = `id, name, phone, email, contact_method, project_type, trades, location, size_note, start_window,
  description, status, internal_note, created_at`;

const map = (r: Row): Enquiry => ({ ...r, createdAt: r.createdAt.toISOString() });

export async function createEnquiry(input: EnquiryInput): Promise<Enquiry> {
  const q = db();
  const [row] = await q<Row[]>`
    insert into enquiries (name, phone, email, contact_method, project_type, trades, location, size_note, start_window, description)
    values (${input.name}, ${input.phone}, ${input.email ?? null}, ${input.contactMethod}, ${input.projectType},
      ${input.trades}, ${input.location}, ${input.sizeNote ?? null}, ${input.startWindow ?? null}, ${input.description})
    returning ${q.unsafe(COLS)}
  `;
  return map(row);
}

export async function listEnquiries(status?: EnquiryStatus): Promise<Enquiry[]> {
  const q = db();
  const rows = await q<Row[]>`
    select ${q.unsafe(COLS)} from enquiries
    ${status ? q`where status = ${status}` : q``}
    order by created_at desc limit 200
  `;
  return rows.map(map);
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const q = db();
  const [row] = await q<Row[]>`select ${q.unsafe(COLS)} from enquiries where id = ${id}`;
  return row ? map(row) : null;
}

export async function updateEnquiry(id: string, status: EnquiryStatus, internalNote: string | null): Promise<void> {
  await db()`update enquiries set status = ${status}, internal_note = ${internalNote} where id = ${id}`;
}

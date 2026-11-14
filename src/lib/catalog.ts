import { db } from "./db";
import type { Area, Service } from "@/types";

const SERVICE_COLS = `id, slug, name, category, summary, description, includes, price_kobo, duration_minutes, active, sort`;

export async function listServices(opts: { includeInactive?: boolean } = {}): Promise<Service[]> {
  const q = db();
  return q<Service[]>`
    select ${q.unsafe(SERVICE_COLS)} from services
    where ${opts.includeInactive ? q`true` : q`active`}
    order by sort, name
  `;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const q = db();
  const [row] = await q<Service[]>`select ${q.unsafe(SERVICE_COLS)} from services where slug = ${slug}`;
  return row ?? null;
}

export async function getServiceById(id: number): Promise<Service | null> {
  const q = db();
  const [row] = await q<Service[]>`select ${q.unsafe(SERVICE_COLS)} from services where id = ${id}`;
  return row ?? null;
}

export async function listAreas(opts: { includeInactive?: boolean } = {}): Promise<Area[]> {
  const q = db();
  return q<Area[]>`
    select id, slug, name, active, sort from areas
    where ${opts.includeInactive ? q`true` : q`active`}
    order by sort, name
  `;
}

export async function getAreaById(id: number): Promise<Area | null> {
  const [row] = await db()<Area[]>`select id, slug, name, active, sort from areas where id = ${id}`;
  return row ?? null;
}

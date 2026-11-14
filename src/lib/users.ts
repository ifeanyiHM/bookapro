import { db } from "./db";
import type { StaffUser } from "@/types";
import type { CategoryId } from "@/config/booking";

const SELECT = `
  select u.id, u.email, coalesce(u.name, u.email) as name, u.phone, u.role, u.skills, u.active,
    a.status as application_status,
    coalesce(array_agg(ta.area_id) filter (where ta.area_id is not null), '{}') as area_ids
  from users u
  left join technician_applications a on a.user_id = u.id
  left join technician_areas ta on ta.user_id = u.id
`;

export async function listTechnicians(): Promise<StaffUser[]> {
  const q = db();
  return q<StaffUser[]>`
    ${q.unsafe(SELECT)}
    where u.role = 'technician' and u.email_verified_at is not null
    group by u.id, a.status
    order by (a.status = 'approved') desc, name
  `;
}

export async function getTechnician(id: string): Promise<StaffUser | null> {
  const q = db();
  const [row] = await q<StaffUser[]>`
    ${q.unsafe(SELECT)}
    where u.id = ${id} and u.role = 'technician'
    group by u.id, a.status
  `;
  return row ?? null;
}

/**
 * Admin changes to an existing technician: what they cover and whether the account is active.
 * Name, phone and email come from the technician's own profile and are not edited here.
 * A technician is only offered bookings once the application is approved, whatever is set here.
 */
export async function updateTechnician(
  id: string,
  input: { skills: CategoryId[]; areaIds: number[]; active: boolean },
): Promise<boolean> {
  return db().begin(async (tx) => {
    const rows = await tx`
      update users set skills = ${input.skills as string[]}, active = ${input.active}
      where id = ${id} and role = 'technician' returning id
    `;
    if (rows.length === 0) return false;
    await tx`delete from technician_areas where user_id = ${id}`;
    for (const areaId of input.areaIds) {
      await tx`insert into technician_areas (user_id, area_id) values (${id}, ${areaId})`;
    }
    return true;
  });
}

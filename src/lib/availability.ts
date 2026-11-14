import type postgres from "postgres";
import { db } from "./db";
import {
  DAYS_AHEAD,
  HOLD_MINUTES,
  LAGOS_UTC_OFFSET_HOURS,
  LEAD_HOURS,
  SLOT_WINDOWS,
  type CategoryId,
} from "@/config/booking";
import type { DayAvailability } from "@/types";

type Q = postgres.Sql | postgres.TransactionSql;

/** Today's date in Lagos as YYYY-MM-DD. */
export function lagosToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function windowStartMs(date: string, startHour: number): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d, startHour - LAGOS_UTC_OFFSET_HOURS);
}

/** Is this date and window inside the booking horizon and far enough from now? */
export function isWindowBookable(date: string, windowId: string): boolean {
  const w = SLOT_WINDOWS.find((x) => x.id === windowId);
  if (!w) return false;
  const today = lagosToday();
  if (date < today || date > addDays(today, DAYS_AHEAD - 1)) return false;
  return windowStartMs(date, w.startHour) >= Date.now() + LEAD_HOURS * 3_600_000;
}

export async function countCapacity(q: Q, areaId: number, category: CategoryId): Promise<number> {
  const [row] = await q<{ n: number }[]>`
    select count(*)::int as n
    from users u
    where u.role = 'technician' and u.active
      and u.email_verified_at is not null
      and exists (select 1 from technician_applications app where app.user_id = u.id and app.status = 'approved')
      and u.skills @> ARRAY[${category}]::text[]
      and exists (select 1 from technician_areas ta where ta.user_id = u.id and ta.area_id = ${areaId})
  `;
  return row?.n ?? 0;
}

const HOLDING = "status in ('paid','assigned','in_progress')";

export async function countBooked(
  q: Q,
  areaId: number,
  category: CategoryId,
  date: string,
  windowId: string,
): Promise<number> {
  const [row] = await q<{ n: number }[]>`
    select count(*)::int as n
    from bookings
    where area_id = ${areaId} and category = ${category}
      and slot_date = ${date} and slot_window = ${windowId}
      and (${q.unsafe(HOLDING)}
        or (status = 'pending_payment' and created_at > now() - (${HOLD_MINUTES} * interval '1 minute')))
  `;
  return row?.n ?? 0;
}

/** Which windows can still be booked over the booking horizon, for one area and service category. */
export async function getAvailability(areaId: number, category: CategoryId): Promise<DayAvailability[]> {
  const q = db();
  const today = lagosToday();
  const last = addDays(today, DAYS_AHEAD - 1);
  const capacity = await countCapacity(q, areaId, category);

  const rows = await q<{ slotDate: string; slotWindow: string; n: number }[]>`
    select slot_date, slot_window, count(*)::int as n
    from bookings
    where area_id = ${areaId} and category = ${category}
      and slot_date between ${today} and ${last}
      and (${q.unsafe(HOLDING)}
        or (status = 'pending_payment' and created_at > now() - (${HOLD_MINUTES} * interval '1 minute')))
    group by slot_date, slot_window
  `;
  const booked = new Map(rows.map((r) => [`${r.slotDate}|${r.slotWindow}`, r.n]));

  const days: DayAvailability[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = addDays(today, i);
    days.push({
      date,
      windows: SLOT_WINDOWS.map((w) => ({
        id: w.id,
        label: w.label,
        available: isWindowBookable(date, w.id) && (booked.get(`${date}|${w.id}`) ?? 0) < capacity,
      })),
    });
  }
  return days;
}

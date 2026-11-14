import { randomBytes } from "node:crypto";
import { db } from "./db";
import { countBooked, countCapacity, isWindowBookable } from "./availability";
import { getAreaById, getServiceBySlug } from "./catalog";
import { initializeTransaction } from "./paystack";
import { newBookingRef } from "./ref";
import type { BookingInput } from "./validation";
import type { BookingStatus, CategoryId } from "@/config/booking";
import type { Booking, BookingEvent } from "@/types";

const COLS = `b.id, b.ref, b.service_id, b.area_id, b.service_name, b.area_name, b.category, b.price_kobo,
  b.slot_date, b.slot_window, b.address, b.landmark, b.notes, b.customer_name, b.customer_phone,
  b.customer_email, b.status, b.technician_id, b.technician_payout_kobo, b.payout_paid_at,
  b.customer_user_id, b.created_at, b.updated_at, u.name as technician_name`;
const FROM = `bookings b left join users u on u.id = b.technician_id`;

type Row = Omit<Booking, "createdAt" | "updatedAt" | "payoutPaidAt"> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  payoutPaidAt: Date | string | null;
};

function iso(v: Date | string | null): string | null {
  if (v === null) return null;
  return v instanceof Date ? v.toISOString() : v;
}

function mapBooking(r: Row): Booking {
  return { ...r, createdAt: iso(r.createdAt)!, updatedAt: iso(r.updatedAt)!, payoutPaidAt: iso(r.payoutPaidAt) };
}

export async function getBookingByRef(ref: string): Promise<Booking | null> {
  const q = db();
  const [row] = await q<Row[]>`select ${q.unsafe(COLS)} from ${q.unsafe(FROM)} where b.ref = ${ref}`;
  return row ? mapBooking(row) : null;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const q = db();
  const [row] = await q<Row[]>`select ${q.unsafe(COLS)} from ${q.unsafe(FROM)} where b.id = ${id}`;
  return row ? mapBooking(row) : null;
}

export async function getBookingEvents(bookingId: string): Promise<BookingEvent[]> {
  const rows = await db()<(Omit<BookingEvent, "createdAt"> & { createdAt: Date })[]>`
    select id, booking_id, status, note, actor, created_at from booking_events
    where booking_id = ${bookingId} order by id
  `;
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; field?: string; message: string };

export interface BookingCustomer {
  userId: string;
  name: string;
  phone: string;
  email: string;
}

/** The customer comes from the signed-in account, never from the request body. */
export async function createBooking(input: BookingInput, customer: BookingCustomer): Promise<CreateBookingResult> {
  const service = await getServiceBySlug(input.serviceSlug);
  if (!service || !service.active) return { ok: false, field: "serviceSlug", message: "That service is not available." };
  const area = await getAreaById(input.areaId);
  if (!area || !area.active) return { ok: false, field: "areaId", message: "We do not cover that area yet." };
  if (!isWindowBookable(input.date, input.window)) {
    return { ok: false, field: "window", message: "That time can no longer be booked. Pick another window." };
  }

  const q = db();
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = newBookingRef();
    try {
      return await q.begin(async (tx) => {
        // One booking at a time per area, day, window and category, so two people can't take the last slot together.
        await tx`select pg_advisory_xact_lock(hashtext(${`${area.id}:${input.date}:${input.window}:${service.category}`}))`;
        const capacity = await countCapacity(tx, area.id, service.category);
        if (capacity === 0) {
          return { ok: false as const, field: "areaId", message: "No technician covers this service in that area yet." };
        }
        const booked = await countBooked(tx, area.id, service.category, input.date, input.window);
        if (booked >= capacity) {
          return { ok: false as const, field: "window", message: "That window was just taken. Pick another." };
        }
        const [row] = await tx<Row[]>`
          insert into bookings (ref, service_id, area_id, service_name, area_name, category, price_kobo,
            slot_date, slot_window, address, landmark, notes, customer_name, customer_phone, customer_email, customer_user_id)
          values (${ref}, ${service.id}, ${area.id}, ${service.name}, ${area.name}, ${service.category},
            ${service.priceKobo}, ${input.date}, ${input.window}, ${input.address}, ${input.landmark ?? null},
            ${input.notes ?? null}, ${customer.name}, ${customer.phone}, ${customer.email}, ${customer.userId})
          returning id, ref, service_id, area_id, service_name, area_name, category, price_kobo, slot_date,
            slot_window, address, landmark, notes, customer_name, customer_phone, customer_email, status,
            technician_id, technician_payout_kobo, payout_paid_at, customer_user_id, created_at, updated_at
        `;
        await tx`insert into booking_events (booking_id, status, note, actor)
          values (${row.id}, 'pending_payment', 'Booking created', 'customer')`;
        return { ok: true as const, booking: mapBooking(row) };
      });
    } catch (err) {
      if ((err as { code?: string }).code === "23505") continue; // reference collision, try another
      throw err;
    }
  }
  throw new Error("Could not generate a unique booking reference");
}

/** Creates a payment attempt for a booking that is still awaiting payment and returns where to send the customer. */
export async function startPayment(booking: Booking): Promise<{ url: string }> {
  const reference = `${booking.ref}-${randomBytes(3).toString("hex")}`;
  await db()`insert into payments (booking_id, reference, amount_kobo) values (${booking.id}, ${reference}, ${booking.priceKobo})`;
  const { authorizationUrl } = await initializeTransaction({
    email: booking.customerEmail,
    amountKobo: booking.priceKobo,
    reference,
    bookingRef: booking.ref,
  });
  return { url: authorizationUrl };
}

export async function getBookingRefForPayment(reference: string): Promise<string | null> {
  const [row] = await db()<{ ref: string }[]>`
    select b.ref from payments p join bookings b on b.id = p.booking_id where p.reference = ${reference}
  `;
  return row?.ref ?? null;
}

export type ConfirmState = "confirmed" | "already" | "paid_late" | "mismatch" | "unknown";

/** Called by both the Paystack callback and the webhook. Safe to run twice: only the first run returns "confirmed". */
export async function confirmPayment(
  reference: string,
  paid: { amountKobo: number; raw: unknown },
): Promise<{ state: ConfirmState; bookingId?: string }> {
  return db().begin(async (tx) => {
    const [p] = await tx<{ id: number; bookingId: string; amountKobo: number; status: string }[]>`
      select id, booking_id, amount_kobo, status from payments where reference = ${reference} for update
    `;
    if (!p) return { state: "unknown" as const };
    if (p.status === "success") return { state: "already" as const, bookingId: p.bookingId };
    if (paid.amountKobo !== p.amountKobo) {
      await tx`update payments set status = 'failed', provider_payload = ${tx.json(paid.raw as never)} where id = ${p.id}`;
      return { state: "mismatch" as const, bookingId: p.bookingId };
    }
    await tx`update payments set status = 'success', paid_at = now(), provider_payload = ${tx.json(paid.raw as never)} where id = ${p.id}`;
    const updated = await tx`
      update bookings set status = 'paid', updated_at = now()
      where id = ${p.bookingId} and status = 'pending_payment' returning id
    `;
    if (updated.length === 0) {
      await tx`insert into booking_events (booking_id, status, note, actor)
        values (${p.bookingId}, 'paid', 'Payment arrived but the booking was no longer awaiting payment. Check and refund if needed.', 'system')`;
      return { state: "paid_late" as const, bookingId: p.bookingId };
    }
    await tx`insert into booking_events (booking_id, status, note, actor)
      values (${p.bookingId}, 'paid', 'Payment received', 'system')`;
    return { state: "confirmed" as const, bookingId: p.bookingId };
  });
}

// ---- Admin and technician operations -------------------------------------------------------------

export async function listBookings(opts: { status?: BookingStatus; search?: string; limit?: number } = {}): Promise<Booking[]> {
  const q = db();
  const search = opts.search?.trim();
  const rows = await q<Row[]>`
    select ${q.unsafe(COLS)} from ${q.unsafe(FROM)}
    where ${opts.status ? q`b.status = ${opts.status}` : q`b.status <> 'pending_payment'`}
      ${search ? q`and (b.ref ilike ${"%" + search + "%"} or b.customer_name ilike ${"%" + search + "%"} or b.customer_phone ilike ${"%" + search + "%"})` : q``}
    order by b.slot_date desc, b.created_at desc
    limit ${opts.limit ?? 100}
  `;
  return rows.map(mapBooking);
}

export interface EligibleTechnician {
  id: string;
  name: string;
  phone: string | null;
  busy: boolean;
}

export async function eligibleTechnicians(b: Booking): Promise<EligibleTechnician[]> {
  return db()<EligibleTechnician[]>`
    select u.id, u.name, u.phone,
      exists (
        select 1 from bookings x
        where x.technician_id = u.id and x.slot_date = ${b.slotDate} and x.slot_window = ${b.slotWindow}
          and x.status in ('assigned', 'in_progress') and x.id <> ${b.id}
      ) as busy
    from users u
    where u.role = 'technician' and u.active
      and u.email_verified_at is not null
      and exists (select 1 from technician_applications app where app.user_id = u.id and app.status = 'approved')
      and u.skills @> ARRAY[${b.category}]::text[]
      and exists (select 1 from technician_areas ta where ta.user_id = u.id and ta.area_id = ${b.areaId})
    order by busy, u.name
  `;
}

export type OpResult = { ok: true; booking: Booking } | { ok: false; message: string };

async function reload(id: string): Promise<Booking> {
  const b = await getBookingById(id);
  if (!b) throw new Error("Booking vanished");
  return b;
}

export async function assignTechnician(bookingId: string, technicianId: string, actor: string): Promise<OpResult & { technician?: { name: string; email: string } }> {
  const b = await getBookingById(bookingId);
  if (!b) return { ok: false, message: "Booking not found." };
  if (b.status !== "paid" && b.status !== "assigned") {
    return { ok: false, message: "Only paid bookings can be assigned." };
  }
  const options = await eligibleTechnicians(b);
  const pick = options.find((t) => t.id === technicianId);
  if (!pick) return { ok: false, message: "That technician does not cover this area and service." };
  if (pick.busy) return { ok: false, message: "That technician already has a job in this window." };
  await db().begin(async (tx) => {
    await tx`update bookings set technician_id = ${technicianId}, status = 'assigned', updated_at = now() where id = ${bookingId}`;
    await tx`insert into booking_events (booking_id, status, note, actor)
      values (${bookingId}, 'assigned', ${`Assigned to ${pick.name}`}, ${actor})`;
  });
  const [tech] = await db()<{ name: string; email: string }[]>`select name, email from users where id = ${technicianId}`;
  return { ok: true, booking: await reload(bookingId), technician: tech };
}

const TRANSITIONS: Record<string, BookingStatus[]> = {
  in_progress: ["assigned"],
  completed: ["in_progress"],
  cancelled: ["pending_payment", "paid", "assigned"],
  paid: ["assigned"], // un-assign
};

export async function changeStatus(
  bookingId: string,
  to: BookingStatus,
  actor: string,
  opts: { technicianId?: string; note?: string } = {},
): Promise<OpResult> {
  const b = await getBookingById(bookingId);
  if (!b) return { ok: false, message: "Booking not found." };
  if (opts.technicianId && b.technicianId !== opts.technicianId) {
    return { ok: false, message: "This job is not assigned to you." };
  }
  if (!TRANSITIONS[to]?.includes(b.status)) {
    return { ok: false, message: `A booking that is "${b.status.replace("_", " ")}" can't move to "${to.replace("_", " ")}".` };
  }
  await db().begin(async (tx) => {
    if (to === "paid") {
      await tx`update bookings set status = 'paid', technician_id = null, updated_at = now() where id = ${bookingId}`;
    } else {
      await tx`update bookings set status = ${to}, updated_at = now() where id = ${bookingId}`;
    }
    await tx`insert into booking_events (booking_id, status, note, actor)
      values (${bookingId}, ${to}, ${opts.note ?? (to === "paid" ? "Technician removed" : null)}, ${actor})`;
  });
  return { ok: true, booking: await reload(bookingId) };
}

export async function setPayout(bookingId: string, kobo: number | null, paid: boolean): Promise<void> {
  await db()`
    update bookings set technician_payout_kobo = ${kobo},
      payout_paid_at = ${paid ? db()`coalesce(payout_paid_at, now())` : null}
    where id = ${bookingId}
  `;
}

export async function listTechnicianJobs(userId: string): Promise<Booking[]> {
  const q = db();
  const rows = await q<Row[]>`
    select ${q.unsafe(COLS)} from ${q.unsafe(FROM)}
    where b.technician_id = ${userId}
      and (b.status in ('assigned', 'in_progress') or (b.status = 'completed' and b.updated_at > now() - interval '14 days'))
    order by b.slot_date, b.slot_window
  `;
  return rows.map(mapBooking);
}

export async function listCustomerBookings(userId: string): Promise<Booking[]> {
  const q = db();
  const rows = await q<Row[]>`
    select ${q.unsafe(COLS)} from ${q.unsafe(FROM)}
    where b.customer_user_id = ${userId} and b.status <> 'pending_payment'
    order by b.slot_date desc, b.created_at desc
    limit 100
  `;
  return rows.map(mapBooking);
}

export async function getTechnicianJob(userId: string, id: string): Promise<Booking | null> {
  const b = await getBookingById(id);
  return b && b.technicianId === userId ? b : null;
}

export async function adminOverview() {
  const [row] = await db()<{ needsAssigning: number; today: number; newEnquiries: number; awaitingPayment: number; pendingApplications: number }[]>`
    select
      (select count(*)::int from bookings where status = 'paid') as needs_assigning,
      (select count(*)::int from bookings where slot_date = (now() at time zone 'Africa/Lagos')::date and status in ('paid','assigned','in_progress')) as today,
      (select count(*)::int from enquiries where status = 'new') as new_enquiries,
      (select count(*)::int from technician_applications where status = 'pending') as pending_applications,
      (select count(*)::int from bookings where status = 'pending_payment' and created_at > now() - interval '24 hours') as awaiting_payment
  `;
  return row;
}

export type { CategoryId };

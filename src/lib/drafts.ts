import { cookies } from "next/headers";
import { db } from "./db";
import { bookingSchema, type BookingInput } from "./validation";

/**
 * A booking in progress, kept on the server so it survives registering, confirming an email and finishing a
 * profile (even in another tab). The browser holds only an unguessable id in an httpOnly cookie. Once the
 * person is signed in, the draft is tied to their account too, so it also follows them to another device.
 */
export const DRAFT_COOKIE = "ic_draft";
const DAYS = 7;

export type BookingDraft = Omit<BookingInput, "company">;

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DAYS * 86400,
};

const UUID = /^[0-9a-f-]{36}$/i;

async function cookieId(): Promise<string | null> {
  const id = (await cookies()).get(DRAFT_COOKIE)?.value;
  return id && UUID.test(id) ? id : null;
}

function parse(data: unknown): BookingDraft | null {
  const r = bookingSchema.safeParse({ ...(data as object), company: undefined });
  if (!r.success) return null;
  const { company: _company, ...draft } = r.data;
  return draft;
}

/** Saves (or replaces) the current draft. Call from a route handler or server action. */
export async function saveDraft(input: BookingDraft, userId: string | null): Promise<void> {
  const q = db();
  const jar = await cookies();
  const id = await cookieId();
  const data = q.json(input as never);
  if (id) {
    const rows = await q`
      update booking_drafts set data = ${data}, expires_at = now() + make_interval(days => ${DAYS}),
        user_id = coalesce(user_id, ${userId})
      where id = ${id} and (user_id is null or user_id = ${userId}) returning id
    `;
    if (rows.length) return;
  }
  if (userId) await q`delete from booking_drafts where user_id = ${userId}`;
  const [row] = await q<{ id: string }[]>`insert into booking_drafts (user_id, data) values (${userId}, ${data}) returning id`;
  jar.set(DRAFT_COOKIE, row.id, cookieOpts);
}

/** The draft for this browser (if it belongs to nobody yet or to this user), else the user's latest one. */
export async function loadDraft(userId: string | null): Promise<BookingDraft | null> {
  const q = db();
  const id = await cookieId();
  if (id) {
    const [row] = await q<{ data: unknown }[]>`
      select data from booking_drafts where id = ${id} and expires_at > now() and (user_id is null or user_id = ${userId})
    `;
    const draft = row && parse(row.data);
    if (draft) return draft;
  }
  if (!userId) return null;
  const [row] = await q<{ data: unknown }[]>`
    select data from booking_drafts where user_id = ${userId} and expires_at > now() order by created_at desc limit 1
  `;
  return row ? parse(row.data) : null;
}

/** Ties this browser's draft to the account that just signed in, so it can be found from any device. */
export async function attachDraftToUser(userId: string): Promise<void> {
  const id = await cookieId();
  if (!id) return;
  await db()`update booking_drafts set user_id = ${userId} where id = ${id} and user_id is null`;
}

export async function hasDraft(userId: string): Promise<boolean> {
  const draft = await loadDraft(userId);
  return !!draft;
}

/** Remove drafts once the booking exists. Call from a route handler or server action (it clears the cookie). */
export async function clearDrafts(userId: string): Promise<void> {
  await db()`delete from booking_drafts where user_id = ${userId}`;
  const id = await cookieId();
  if (id) await db()`delete from booking_drafts where id = ${id}`;
  (await cookies()).delete({ name: DRAFT_COOKIE, path: "/" });
}

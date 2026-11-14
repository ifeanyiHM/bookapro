import { db } from "./db";
import { hashPassword } from "./auth";
import type { Role } from "@/types";

/** Authentication data only. Profiles and technician review live in their own modules. */

export interface LoginRow {
  id: string;
  email: string;
  passwordHash: string | null;
  active: boolean;
  role: Role | null;
  sessionVersion: number;
}

export async function findLoginByEmail(email: string): Promise<LoginRow | null> {
  const [row] = await db()<LoginRow[]>`
    select id, email, password_hash, active, role, session_version from users where email = ${email}
  `;
  return row ?? null;
}

export async function findLoginById(id: string): Promise<(LoginRow & { adminPasswordHash: string | null; emailVerified: boolean }) | null> {
  const [row] = await db()<(LoginRow & { adminPasswordHash: string | null; emailVerified: boolean })[]>`
    select id, email, password_hash, active, role, session_version, admin_password_hash,
      (email_verified_at is not null) as email_verified
    from users where id = ${id}
  `;
  return row ?? null;
}

export type RegisterResult =
  | { status: "created"; userId: string }
  | { status: "exists"; userId: string; verified: boolean };

/**
 * Creates an unverified account with no role yet. If the email is already taken the existing account is left
 * untouched (its password is never overwritten by a newcomer) and the caller is told, so it can send the
 * right email without revealing anything on screen.
 */
export async function registerWithPassword(email: string, password: string): Promise<RegisterResult> {
  const hash = await hashPassword(password);
  const [created] = await db()<{ id: string }[]>`
    insert into users (email, password_hash) values (${email}, ${hash})
    on conflict (email) do nothing returning id
  `;
  if (created) return { status: "created", userId: created.id };
  const [existing] = await db()<{ id: string; verified: boolean }[]>`
    select id, (email_verified_at is not null) as verified from users where email = ${email}
  `;
  return { status: "exists", userId: existing.id, verified: existing.verified };
}

export async function markEmailVerified(userId: string) {
  await db()`update users set email_verified_at = coalesce(email_verified_at, now()) where id = ${userId}`;
}

/**
 * Sets a new password. Raising the session version signs the account out everywhere, and a reset link
 * proves the person controls the email, so it also counts as verification.
 */
export async function setPassword(userId: string, password: string): Promise<{ email: string } | null> {
  const hash = await hashPassword(password);
  const [row] = await db()<{ email: string }[]>`
    update users set password_hash = ${hash}, password_changed_at = now(), session_version = session_version + 1,
      email_verified_at = coalesce(email_verified_at, now())
    where id = ${userId} and active returning email
  `;
  return row ?? null;
}

export async function getUserEmail(userId: string): Promise<{ email: string; verified: boolean; active: boolean } | null> {
  const [row] = await db()<{ email: string; verified: boolean; active: boolean }[]>`
    select email, (email_verified_at is not null) as verified, active from users where id = ${userId}
  `;
  return row ?? null;
}

export type OpResult = { ok: true } | { ok: false; message: string };

/**
 * Lets a verified person pick customer or technician. Admin is not accepted anywhere in this path.
 * The choice can be changed only until a profile has been completed for the current role.
 */
export async function chooseRole(userId: string, role: "customer" | "technician"): Promise<OpResult> {
  if (role !== "customer" && role !== "technician") return { ok: false, message: "Choose customer or technician." };
  return db().begin(async (tx) => {
    const [u] = await tx<{ role: Role | null; verified: boolean; hasCustomer: boolean; hasTechnician: boolean }[]>`
      select role, (email_verified_at is not null) as verified,
        exists (select 1 from customer_profiles where user_id = users.id) as has_customer,
        exists (select 1 from technician_profiles where user_id = users.id) as has_technician
      from users where id = ${userId} for update
    `;
    if (!u || !u.verified) return { ok: false as const, message: "Confirm your email first." };
    if (u.role === "admin") return { ok: false as const, message: "This account's role cannot be changed here." };
    if (u.role === role) return { ok: true as const };
    if (u.hasCustomer || u.hasTechnician) {
      return { ok: false as const, message: "Your role is set because you already completed a profile. Contact us if it is wrong." };
    }
    await tx`update users set role = ${role} where id = ${userId}`;
    return { ok: true as const };
  });
}

export async function saveCustomerProfile(userId: string, p: { name: string; phone: string }): Promise<OpResult> {
  return db().begin(async (tx) => {
    const [u] = await tx<{ role: Role | null; verified: boolean }[]>`
      select role, (email_verified_at is not null) as verified from users where id = ${userId} for update
    `;
    if (!u?.verified || u.role !== "customer") return { ok: false as const, message: "Choose the customer role first." };
    await tx`
      insert into customer_profiles (user_id, full_name, phone) values (${userId}, ${p.name}, ${p.phone})
      on conflict (user_id) do update set full_name = excluded.full_name, phone = excluded.phone, updated_at = now()
    `;
    // users.name and users.phone are a display copy of the profile, written only here.
    await tx`update users set name = ${p.name}, phone = ${p.phone} where id = ${userId}`;
    return { ok: true as const };
  });
}

export async function getCustomerProfile(userId: string): Promise<{ name: string; phone: string; email: string } | null> {
  const [row] = await db()<{ name: string; phone: string; email: string }[]>`
    select c.full_name as name, c.phone, u.email from customer_profiles c join users u on u.id = c.user_id where c.user_id = ${userId}
  `;
  return row ?? null;
}

// ---- Google -------------------------------------------------------------------------------------

export interface GoogleClaims {
  sub: string;
  email: string;
  emailVerified: boolean;
}

/**
 * Finds or creates the account for a Google sign-in. Only an email Google itself reports as verified is
 * accepted. When it links to an existing account that never verified its email, the stored password is
 * removed, so whoever registered that address first cannot keep a password into the real owner's account.
 */
export async function upsertGoogleUser(c: GoogleClaims): Promise<{ ok: true; userId: string } | { ok: false; code: "unverified" | "inactive" | "other_google" }> {
  if (!c.emailVerified) return { ok: false, code: "unverified" };
  const email = c.email.trim().toLowerCase();
  return db().begin(async (tx) => {
    const [bySub] = await tx<{ id: string; active: boolean }[]>`select id, active from users where google_sub = ${c.sub}`;
    if (bySub) {
      return bySub.active ? { ok: true as const, userId: bySub.id } : { ok: false as const, code: "inactive" as const };
    }
    const [byEmail] = await tx<{ id: string; googleSub: string | null; verified: boolean; active: boolean }[]>`
      select id, google_sub, (email_verified_at is not null) as verified, active from users where email = ${email} for update
    `;
    if (byEmail) {
      if (!byEmail.active) return { ok: false as const, code: "inactive" as const };
      if (byEmail.googleSub && byEmail.googleSub !== c.sub) {
        return { ok: false as const, code: "other_google" as const };
      }
      await tx`
        update users set google_sub = ${c.sub}, email_verified_at = coalesce(email_verified_at, now()),
          password_hash = case when email_verified_at is null then null else password_hash end
        where id = ${byEmail.id}
      `;
      return { ok: true as const, userId: byEmail.id };
    }
    const [created] = await tx<{ id: string }[]>`
      insert into users (email, google_sub, email_verified_at) values (${email}, ${c.sub}, now()) returning id
    `;
    return { ok: true as const, userId: created.id };
  });
}

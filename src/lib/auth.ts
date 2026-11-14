import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { homeFor, nextStep } from "./access";
import type { AccountUser, Role, StaffUser } from "@/types";

export const SESSION_COOKIE = "ic_session";
export const ADMIN_COOKIE = "ic_admin_ok";
const ACCESS_COOKIE = "ic_booking_access";
const SESSION_HOURS = 7 * 24;
const ADMIN_SESSION_HOURS = 8;
const ADMIN_VERIFY_HOURS = 2;

function key(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

// ---- Passwords ----------------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compared against when the account doesn't exist, so a sign-in attempt takes the same time either way. */
let dummyHash: string | null = null;

export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    dummyHash ??= await bcrypt.hash("not-a-real-password", 12);
    await bcrypt.compare(password, dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}

// ---- Sessions -----------------------------------------------------------------------------------

/**
 * Signs the person in. The token carries the account's session version: changing or resetting the password
 * raises the version in the database, which ends every session issued before it.
 */
export async function createSession(user: { id: string; role: Role | null; sessionVersion: number }) {
  const hours = user.role === "admin" ? ADMIN_SESSION_HOURS : SESSION_HOURS;
  const token = await new SignJWT({ role: user.role, sv: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${hours}h`)
    .sign(key());
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieBase, path: "/", maxAge: hours * 3600 });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete({ name: SESSION_COOKIE, path: "/" });
  jar.delete({ name: ADMIN_COOKIE, path: "/" });
}

export interface SessionClaims {
  userId: string;
  role: Role | null;
  sessionVersion: number;
}

export async function readSessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.sv !== "number") return null;
    const role = payload.role;
    if (role !== null && role !== "admin" && role !== "customer" && role !== "technician") return null;
    return { userId: payload.sub, role, sessionVersion: payload.sv };
  } catch {
    return null;
  }
}

const ACCOUNT_SQL = (id: string) => db()<AccountUser[]>`
  select u.id, u.email, u.name, u.phone, u.role, u.active, u.skills, u.session_version,
    (u.email_verified_at is not null) as email_verified,
    (u.password_hash is not null) as has_password,
    (u.google_sub is not null) as google_linked,
    (u.admin_password_hash is not null) as admin_password_set,
    exists (select 1 from customer_profiles c where c.user_id = u.id) as has_customer_profile,
    exists (select 1 from technician_profiles t where t.user_id = u.id) as has_technician_profile,
    a.status as application_status, a.review_note
  from users u
  left join technician_applications a on a.user_id = u.id
  where u.id = ${id}
`;

export async function getAccountById(id: string): Promise<AccountUser | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [user] = await ACCOUNT_SQL(id);
  return user ?? null;
}

/**
 * The signed-in account, re-read from the database on every call so a deactivated account, a changed role
 * or a password reset takes effect at once.
 */
export async function getCurrentUser(): Promise<AccountUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await readSessionToken(token);
  if (!session) return null;
  const user = await getAccountById(session.userId);
  if (!user || !user.active || user.sessionVersion !== session.sessionVersion) return null;
  return user;
}

/** Any signed-in account, whatever step of onboarding it is on. */
export async function requireUser(next?: string): Promise<AccountUser> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

function toStaff(u: AccountUser): StaffUser {
  return { id: u.id, email: u.email, name: u.name ?? u.email, phone: u.phone, role: u.role!, skills: u.skills, active: u.active };
}

/** Send a non-admin who wandered into /admin back where they came from, or home. */
async function previousPageOrHome(): Promise<string> {
  const referer = (await headers()).get("referer");
  if (!referer) return "/";
  try {
    const url = new URL(referer);
    const host = (await headers()).get("host");
    if (url.host !== host) return "/";
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/verify-admin")) return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}

/**
 * Use at the top of every protected staff page, server action and route handler. The proxy is a first gate;
 * this is the real one. An admin also needs the extra admin-password step. A technician must be approved.
 */
export async function requireRole(role: "admin" | "technician"): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${role === "admin" ? "/admin" : "/technician"}`);
  if (role === "admin") {
    if (user.role !== "admin" || !user.emailVerified) redirect(await previousPageOrHome());
    if (!(await hasAdminVerification(user))) redirect("/verify-admin");
  } else {
    if (user.role !== "technician") redirect(homeFor(user));
    const step = nextStep(user);
    if (step) redirect(step);
  }
  return toStaff(user);
}

// ---- Extra admin verification -------------------------------------------------------------------

/** Proof that this admin session also passed the admin-password check. Lives 2 hours. */
export async function grantAdminVerification(user: { id: string; sessionVersion: number }) {
  const token = await new SignJWT({ sv: user.sessionVersion, purpose: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_VERIFY_HOURS}h`)
    .sign(key());
  (await cookies()).set(ADMIN_COOKIE, token, { ...cookieBase, path: "/", maxAge: ADMIN_VERIFY_HOURS * 3600 });
}

export async function readAdminToken(token: string): Promise<{ userId: string; sessionVersion: number } | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (payload.purpose !== "admin" || !payload.sub || typeof payload.sv !== "number") return null;
    return { userId: payload.sub, sessionVersion: payload.sv };
  } catch {
    return null;
  }
}

async function hasAdminVerification(user: { id: string; sessionVersion: number }): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const proof = await readAdminToken(token);
  return !!proof && proof.userId === user.id && proof.sessionVersion === user.sessionVersion;
}

// ---- Booking access -----------------------------------------------------------------------------
// Right after paying, a short-lived cookie lists the booking references the browser may view (the
// confirmation page opens straight after Paystack). Signed-in customers can always open their own bookings.

export async function grantBookingAccess(ref: string) {
  const jar = await cookies();
  const current = await readBookingAccess();
  const refs = Array.from(new Set([ref, ...current])).slice(0, 5);
  const token = await new SignJWT({ refs })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3h")
    .sign(key());
  jar.set(ACCESS_COOKIE, token, { ...cookieBase, path: "/", maxAge: 3 * 3600 });
}

export async function readBookingAccess(): Promise<string[]> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return Array.isArray(payload.refs) ? (payload.refs as string[]) : [];
  } catch {
    return [];
  }
}

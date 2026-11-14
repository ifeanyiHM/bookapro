"use server";

import { redirect } from "next/navigation";
import { chooseRole, findLoginByEmail, findLoginById, markEmailVerified, registerWithPassword, saveCustomerProfile, setPassword } from "@/lib/accounts";
import { safePath } from "@/lib/access";
import { createSession, destroySession, getAccountById, getCurrentUser, grantAdminVerification, requireUser, verifyPassword } from "@/lib/auth";
import { sendAccountExistsEmail, sendPasswordChangedEmail, sendResetEmail, sendVerificationEmail } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { landingPath, startSession } from "@/lib/sign-in";
import { consumeToken, issueToken } from "@/lib/tokens";
import {
  customerProfileSchema, emailOnlySchema, loginSchema, registerSchema, resetPasswordSchema, roleSchema, zodFieldErrors,
} from "@/lib/validation";
import type { FieldErrors } from "@/types";

export interface AuthState {
  error?: string;
  errors?: FieldErrors;
  notice?: string;
  email?: string;
}

const MIN = 60_000;
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const TOO_MANY = "Too many attempts. Please wait a while and try again.";

// ---- Register ----------------------------------------------------------------------------------

export async function registerAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email").trim().toLowerCase();
  if (text(fd, "company")) redirect(`/check-email?email=${encodeURIComponent(email)}`); // honeypot: pretend it worked
  const parsed = registerSchema.safeParse({ email, password: text(fd, "password") });
  if (!parsed.success) return { email, errors: zodFieldErrors(parsed.error) };

  if (!(await rateLimit(`register-ip:${await clientIp()}`, 10, 60 * MIN)) || !(await rateLimit(`register-email:${email}`, 4, 60 * MIN))) {
    return { email, error: TOO_MANY };
  }

  const result = await registerWithPassword(parsed.data.email, parsed.data.password);
  // The screen is the same in every case, so it cannot be used to find out who already has an account.
  if (result.status === "exists" && result.verified) {
    await sendAccountExistsEmail(parsed.data.email);
  } else {
    await sendVerificationEmail(parsed.data.email, await issueToken(result.userId, "verify_email"));
  }
  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}`);
}

// ---- Sign in -----------------------------------------------------------------------------------

export async function loginAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email").trim().toLowerCase();
  const parsed = loginSchema.safeParse({ email, password: text(fd, "password") });
  if (!parsed.success) return { email, error: "Enter your email and password." };

  const ip = await clientIp();
  if (!(await rateLimit(`login-ip:${ip}`, 20, 15 * MIN)) || !(await rateLimit(`login-email:${email}`, 8, 15 * MIN))) {
    return { email, error: "Too many sign-in attempts. Wait 15 minutes and try again." };
  }

  const login = await findLoginByEmail(email);
  const ok = await verifyPassword(parsed.data.password, login?.passwordHash ?? null);
  if (!login || !login.active || !ok) {
    return { email, error: "Wrong email or password. If you signed up with Google, use Continue with Google." };
  }
  const user = await startSession(login.id);
  if (!user) return { email, error: "Wrong email or password." };
  redirect(await landingPath(user, text(fd, "next")));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

// ---- Email verification ------------------------------------------------------------------------

/** Used from the confirm button on the link in the email (so mail scanners opening the link cannot use it up). */
export async function confirmEmailAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  if (!(await rateLimit(`confirm-ip:${await clientIp()}`, 20, 15 * MIN))) return { error: TOO_MANY };
  const userId = await consumeToken(text(fd, "token"), "verify_email");
  if (!userId) {
    return { error: "This link has expired or was already used. Sign in and we will send you a new one." };
  }
  await markEmailVerified(userId);
  const account = await getAccountById(userId);
  // Administrators always sign in through the normal sign-in page, never straight from an email link.
  if (!account || account.role === "admin") redirect("/login?verified=1");
  const user = await startSession(userId);
  if (!user) redirect("/login?verified=1");
  redirect(await landingPath(user));
}

export async function resendVerificationAction(_prev: AuthState): Promise<AuthState> {
  const user = await requireUser();
  if (user.emailVerified) redirect(await landingPath(user));
  if (!(await rateLimit(`resend-user:${user.id}`, 3, 60 * MIN))) {
    return { error: "You have asked for several emails already. Check your inbox and spam folder, or try again in an hour." };
  }
  await sendVerificationEmail(user.email, await issueToken(user.id, "verify_email"));
  return { notice: `We sent a new link to ${user.email}.` };
}

// ---- Forgot and reset password -----------------------------------------------------------------

export async function forgotPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = emailOnlySchema.safeParse({ email: text(fd, "email") });
  if (!parsed.success) return { email: text(fd, "email"), errors: zodFieldErrors(parsed.error) };
  const { email } = parsed.data;
  if (!(await rateLimit(`forgot-ip:${await clientIp()}`, 10, 60 * MIN)) || !(await rateLimit(`forgot-email:${email}`, 3, 60 * MIN))) {
    return { email, error: TOO_MANY };
  }
  const login = await findLoginByEmail(email);
  if (login?.active) await sendResetEmail(email, await issueToken(login.id, "reset_password"));
  // Same answer whether or not the account exists.
  return { email, notice: `If an account exists for ${email}, we have sent a link to reset the password. It works once and expires in 1 hour.` };
}

export async function resetPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({ password: text(fd, "password") });
  if (!parsed.success) return { errors: zodFieldErrors(parsed.error) };
  if (!(await rateLimit(`reset-ip:${await clientIp()}`, 15, 15 * MIN))) return { error: TOO_MANY };

  const userId = await consumeToken(text(fd, "token"), "reset_password");
  if (!userId) return { error: "This reset link has expired or was already used. Ask for a new one." };
  const updated = await setPassword(userId, parsed.data.password);
  if (!updated) return { error: "This account cannot be reset. Contact us for help." };
  await sendPasswordChangedEmail(updated.email);
  redirect("/login?reset=1");
}

// ---- Role and profile --------------------------------------------------------------------------

export async function chooseRoleAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const user = await requireUser();
  const parsed = roleSchema.safeParse({ role: text(fd, "role") });
  if (!parsed.success) return { errors: zodFieldErrors(parsed.error) };
  const result = await chooseRole(user.id, parsed.data.role);
  if (!result.ok) return { error: result.message };
  const fresh = await getAccountById(user.id);
  if (!fresh) redirect("/login");
  await createSession(fresh); // the session carries the role, so refresh it
  redirect(await landingPath(fresh));
}

export async function saveCustomerProfileAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const user = await requireUser();
  if (user.role !== "customer") redirect(await landingPath(user));
  const parsed = customerProfileSchema.safeParse({ name: text(fd, "name"), phone: text(fd, "phone") });
  if (!parsed.success) return { errors: zodFieldErrors(parsed.error) };
  const result = await saveCustomerProfile(user.id, parsed.data);
  if (!result.ok) return { error: result.message };
  const fresh = await getAccountById(user.id);
  redirect(fresh ? await landingPath(fresh) : "/login");
}

// ---- Admin second step -------------------------------------------------------------------------

export async function verifyAdminAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" || !user.emailVerified) redirect("/");

  // Strict limits: this is the last gate in front of the dashboard.
  if (!(await rateLimit(`adminv-user:${user.id}`, 5, 15 * MIN)) || !(await rateLimit(`adminv-ip:${await clientIp()}`, 15, 15 * MIN))) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }
  const row = await findLoginById(user.id);
  const ok = await verifyPassword(text(fd, "adminPassword"), row?.adminPasswordHash ?? null);
  if (!row?.adminPasswordHash) {
    return { error: "No admin password is set for this account. Ask the site owner to run the admin grant script." };
  }
  if (!ok) return { error: "That admin password is not correct." };

  await grantAdminVerification(user);
  const next = safePath(text(fd, "next"), "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

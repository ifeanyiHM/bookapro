import type { AccountUser } from "@/types";

/**
 * The one place that decides which onboarding step an account must finish next.
 * Returns null when nothing is left. Every protected page, action and API calls this on the server,
 * so a step cannot be skipped by typing a URL.
 */
export function nextStep(u: AccountUser): string | null {
  if (!u.emailVerified) return "/verify-email";
  if (u.role === "admin") return null;
  if (!u.role) return "/onboarding/role";
  if (u.role === "customer") return u.hasCustomerProfile ? null : "/onboarding/customer";
  if (!u.hasTechnicianProfile || !u.applicationStatus) return "/onboarding/technician";
  if (u.applicationStatus !== "approved") return "/onboarding/technician/status";
  return null;
}

/** Where an account lands after signing in, when there is nothing else to resume. */
export function homeFor(u: AccountUser): string {
  const step = nextStep(u);
  if (step) return step;
  if (u.role === "admin") return "/admin";
  if (u.role === "technician") return "/technician";
  return "/account";
}

/** A customer who may book and pay: verified, role chosen, profile complete, account active. */
export function canBook(u: AccountUser | null): u is AccountUser {
  return !!u && u.active && u.role === "customer" && nextStep(u) === null;
}

/** Only allow redirects to a path on this site. */
export function safePath(path: unknown, fallback = "/"): string {
  if (typeof path !== "string") return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  return path;
}

import { createSession, getAccountById } from "./auth";
import { homeFor, nextStep, safePath } from "./access";
import { attachDraftToUser, hasDraft } from "./drafts";
import type { AccountUser } from "@/types";

/** Starts a session for an account that has just proved who it is (password, email link or Google). */
export async function startSession(userId: string): Promise<AccountUser | null> {
  const user = await getAccountById(userId);
  if (!user || !user.active) return null;
  await createSession(user);
  // A booking begun before signing in follows the person into their account.
  await attachDraftToUser(user.id);
  return user;
}

/**
 * Where to send someone next. Unfinished onboarding always comes first; after that a saved booking is
 * resumed; then an explicit `next` link (kept to paths this role may open); then the role's home.
 */
export async function landingPath(user: AccountUser, next?: string | null): Promise<string> {
  const step = nextStep(user);
  if (step) return step;
  if (user.role === "admin") {
    const target = safePath(next, "/admin");
    return `/verify-admin${target.startsWith("/admin") ? `?next=${encodeURIComponent(target)}` : ""}`;
  }
  if (user.role === "customer" && (await hasDraft(user.id))) return "/book?resume=1";
  const target = safePath(next, "");
  const staffOnly = target.startsWith("/admin") || target.startsWith("/verify-admin");
  if (target && !staffOnly) return target;
  return homeFor(user);
}

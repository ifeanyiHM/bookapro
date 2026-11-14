import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Rate limiter backed by Postgres, so the limits hold when several server instances run.
 * Keys are hashed before they are stored, so emails and IP addresses are not kept in this table.
 * Returns true if the action is allowed, false if the limit for the window has been reached.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const hashed = createHash("sha256").update(key).digest("hex");
  const seconds = windowMs / 1000;
  const allowed = await db().begin(async (tx) => {
    // Serialise attempts for the same key so two requests cannot both squeeze under the limit.
    await tx`select pg_advisory_xact_lock(hashtext(${`rl:${hashed}`}))`;
    await tx`delete from rate_hits where key = ${hashed} and at < now() - make_interval(secs => ${seconds})`;
    const [{ count }] = await tx<{ count: number }[]>`select count(*)::int as count from rate_hits where key = ${hashed}`;
    if (count >= limit) return false;
    await tx`insert into rate_hits (key) values (${hashed})`;
    return true;
  });
  if (Math.random() < 0.01) {
    await db()`delete from rate_hits where at < now() - interval '1 day'`.catch(() => undefined);
  }
  return allowed;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

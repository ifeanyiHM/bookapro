import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";

export type TokenPurpose = "verify_email" | "reset_password";

const TTL_MINUTES: Record<TokenPurpose, number> = {
  verify_email: 24 * 60,
  reset_password: 60,
};

const FORMAT = /^[A-Za-z0-9_-]{43}$/;
const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");

/**
 * Creates a token for a link in an email. Only its SHA-256 hash is stored, so a database leak does not
 * expose usable links. Any earlier unused token for the same purpose stops working.
 */
export async function issueToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await db().begin(async (tx) => {
    await tx`update auth_tokens set used_at = now() where user_id = ${userId} and purpose = ${purpose} and used_at is null`;
    await tx`
      insert into auth_tokens (user_id, purpose, token_hash, expires_at)
      values (${userId}, ${purpose}, ${hash(raw)}, now() + make_interval(mins => ${TTL_MINUTES[purpose]}))
    `;
  });
  return raw;
}

/** Checks a token without using it up (for showing the form behind a link). */
export async function peekToken(raw: string, purpose: TokenPurpose): Promise<string | null> {
  if (!FORMAT.test(raw)) return null;
  const [row] = await db()<{ userId: string }[]>`
    select user_id from auth_tokens
    where token_hash = ${hash(raw)} and purpose = ${purpose} and used_at is null and expires_at > now()
  `;
  return row?.userId ?? null;
}

/** Uses a token up. The single UPDATE is atomic, so two clicks (or a replay) can never both succeed. */
export async function consumeToken(raw: string, purpose: TokenPurpose): Promise<string | null> {
  if (!FORMAT.test(raw)) return null;
  const [row] = await db()<{ userId: string }[]>`
    update auth_tokens set used_at = now()
    where token_hash = ${hash(raw)} and purpose = ${purpose} and used_at is null and expires_at > now()
    returning user_id
  `;
  return row?.userId ?? null;
}

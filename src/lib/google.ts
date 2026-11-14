import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { SITE } from "@/config/site";
import type { GoogleClaims } from "./accounts";

/**
 * Sign in with Google using the authorization-code flow with PKCE, a one-time state and a nonce. The ID token
 * is verified (signature, issuer, audience, expiry, nonce) before anything in it is trusted.
 * It is switched on only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 */
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
export const OAUTH_COOKIE = "ic_oauth";

/** Short codes travel in the redirect URL; the sign-in page turns them into fixed messages. */
export type GoogleErrorCode = "expired" | "failed" | "no_email" | "unverified" | "inactive" | "other_google";

export const googleEnabled = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const redirectUri = () => `${SITE.url}/api/auth/google/callback`;
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
const b64 = (b: Buffer) => b.toString("base64url");

/** Builds the Google sign-in URL and stores the one-time values in a short-lived signed cookie. */
export async function startGoogleSignIn(): Promise<string> {
  const state = b64(randomBytes(24));
  const nonce = b64(randomBytes(24));
  const verifier = b64(randomBytes(48));
  const challenge = b64(createHash("sha256").update(verifier).digest());
  const token = await new SignJWT({ state, nonce, verifier })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(secret());
  (await cookies()).set(OAUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax", // must be lax: Google redirects back with a top-level GET
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.toString();
}

export type GoogleResult = { ok: true; claims: GoogleClaims } | { ok: false; code: GoogleErrorCode };

export async function finishGoogleSignIn(code: string | null, state: string | null): Promise<GoogleResult> {
  const jar = await cookies();
  const stored = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: "/api/auth/google" });
  if (!code || !state || !stored) return { ok: false, code: "expired" };

  let saved: { state: string; nonce: string; verifier: string };
  try {
    const { payload } = await jwtVerify(stored, secret(), { algorithms: ["HS256"] });
    saved = payload as typeof saved;
  } catch {
    return { ok: false, code: "expired" };
  }
  if (saved.state !== state) return { ok: false, code: "failed" };

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri(),
        grant_type: "authorization_code",
        code_verifier: saved.verifier,
      }),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, code: "failed" };
    const { id_token } = (await res.json()) as { id_token?: string };
    if (!id_token) return { ok: false, code: "failed" };
    const { payload } = await jwtVerify(id_token, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    if (payload.nonce !== saved.nonce) return { ok: false, code: "failed" };
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return { ok: false, code: "no_email" };
    }
    return { ok: true, claims: { sub: payload.sub, email: payload.email, emailVerified: payload.email_verified === true } };
  } catch (err) {
    console.error("[google] sign-in failed", err);
    return { ok: false, code: "failed" };
  }
}

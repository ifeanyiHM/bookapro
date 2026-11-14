import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "@/config/site";

const BASE = "https://api.paystack.co";

function secret(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY || undefined;
}

/** No Paystack key and not in production: payments use the built-in demo page so the flow can be tried end to end. */
export function isDemoPayments(): boolean {
  return !secret() && process.env.NODE_ENV !== "production";
}

export interface InitResult {
  authorizationUrl: string;
}

export async function initializeTransaction(args: {
  email: string;
  amountKobo: number;
  reference: string;
  bookingRef: string;
}): Promise<InitResult> {
  const callbackUrl = `${SITE.url}/api/paystack/callback`;
  if (isDemoPayments()) {
    return { authorizationUrl: `${SITE.url}/dev/pay?reference=${encodeURIComponent(args.reference)}` };
  }
  const key = secret();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");

  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      currency: "NGN",
      reference: args.reference,
      callback_url: callbackUrl,
      metadata: { booking_ref: args.bookingRef },
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  } | null;
  if (!res.ok || !json?.status || !json.data?.authorization_url) {
    throw new Error(`Paystack initialize failed: ${json?.message ?? res.status}`);
  }
  return { authorizationUrl: json.data.authorization_url };
}

export interface VerifyResult {
  success: boolean;
  amountKobo: number;
  currency: string;
  raw: unknown;
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const key = secret();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    status?: boolean;
    data?: { status?: string; amount?: number; currency?: string };
  } | null;
  if (!res.ok || !json?.status || !json.data) {
    throw new Error(`Paystack verify failed: ${res.status}`);
  }
  return {
    success: json.data.status === "success",
    amountKobo: json.data.amount ?? 0,
    currency: json.data.currency ?? "",
    raw: json,
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const key = secret();
  if (!key || !signature) return false;
  const expected = createHmac("sha512", key).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

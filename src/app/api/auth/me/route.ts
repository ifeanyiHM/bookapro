import { NextResponse } from "next/server";
import { homeFor } from "@/lib/access";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Tells the header whether to show "Sign in" or "My account". Returns nothing sensitive. */
export async function GET() {
  const user = await getCurrentUser();
  const body = user ? { signedIn: true, role: user.role, href: homeFor(user) } : { signedIn: false };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

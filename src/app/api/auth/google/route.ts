import { NextResponse } from "next/server";
import { googleEnabled, startGoogleSignIn } from "@/lib/google";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!googleEnabled()) return NextResponse.redirect(`${SITE.url}/login?error=failed`);
  if (!(await rateLimit(`google-start:${await clientIp()}`, 20, 10 * 60_000))) return NextResponse.redirect(`${SITE.url}/login?error=failed`);
  return NextResponse.redirect(await startGoogleSignIn());
}

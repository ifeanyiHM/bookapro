import { NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { upsertGoogleUser } from "@/lib/accounts";
import { finishGoogleSignIn, googleEnabled } from "@/lib/google";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { landingPath, startSession } from "@/lib/sign-in";

export const dynamic = "force-dynamic";

const back = (code: string) => NextResponse.redirect(`${SITE.url}/login?error=${code}`);

export async function GET(request: Request) {
  if (!googleEnabled()) return back("failed");
  if (!(await rateLimit(`google-cb:${await clientIp()}`, 30, 10 * 60_000))) return back("failed");
  const params = new URL(request.url).searchParams;
  if (params.get("error")) return back("failed"); // the person cancelled, or Google refused

  const result = await finishGoogleSignIn(params.get("code"), params.get("state"));
  if (!result.ok) return back(result.code);

  const account = await upsertGoogleUser(result.claims);
  if (!account.ok) return back(account.code);

  const user = await startSession(account.userId);
  if (!user) return back("inactive");
  return NextResponse.redirect(`${SITE.url}${await landingPath(user)}`);
}

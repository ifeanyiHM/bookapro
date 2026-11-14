import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, readAdminToken, readSessionToken, SESSION_COOKIE } from "@/lib/auth";

/**
 * First gate for the signed-in areas. It checks that a valid signed session exists and, for /admin, that the
 * session says admin and carries the extra admin-password proof. Every page, server action and route handler
 * ALSO checks the account in the database (requireRole and friends), which is the check that really counts.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin")) {
    // Not an admin: back to where they came from (same site only), or the homepage.
    if (session.role !== "admin") return NextResponse.redirect(new URL(previousPage(request), request.url));
    const proof = request.cookies.get(ADMIN_COOKIE)?.value;
    const admin = proof ? await readAdminToken(proof) : null;
    if (!admin || admin.userId !== session.userId || admin.sessionVersion !== session.sessionVersion) {
      const verify = new URL("/verify-admin", request.url);
      verify.searchParams.set("next", pathname);
      return NextResponse.redirect(verify);
    }
  }
  if (pathname.startsWith("/verify-admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

function previousPage(request: NextRequest): string {
  const referer = request.headers.get("referer");
  if (!referer) return "/";
  try {
    const url = new URL(referer);
    if (url.host !== request.nextUrl.host) return "/";
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/verify-admin")) return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}

export const config = { matcher: ["/admin/:path*", "/technician/:path*", "/account/:path*", "/verify-admin"] };

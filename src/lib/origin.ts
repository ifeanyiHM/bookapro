/**
 * State-changing route handlers accept only same-origin requests (the Origin header must match the Host).
 * Cookies are already SameSite=Lax; this closes the gap for tools that send cookies cross-site some other way.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

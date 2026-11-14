"use client";

import { logoutAction } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me =
  | { signedIn: false }
  | { signedIn: true; href: string; role: string | null };

// The answer is remembered for the page it was fetched on, so the mobile menu (which mounts when opened)
// is right straight away instead of flashing empty. A new page, or a sign-out, replaces it.
let cache: { path: string; me: Me } | null = null;

/**
 * Nav: "Sign in" while signed out, "My account" once signed in. Footer: "Sign in" and "Create an account"
 * while signed out, "My account" and "Sign out" once signed in. Done without making every public page
 * dynamic: the page is served as usual and this small piece asks the server who is signed in. Until it
 * answers, the space is held so nothing jumps.
 */
export function AuthNav({
  variant,
  linkClass,
}: {
  variant: "desktop" | "mobile" | "footer";
  linkClass?: string;
}) {
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(
    cache && cache.path === path ? cache.me : null,
  );
  useEffect(() => {
    let live = true;
    const set = (m: Me) => {
      cache = { path, me: m };
      if (live) setMe(m);
    };
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) =>
        r.ok ? (r.json() as Promise<Me>) : { signedIn: false as const },
      )
      .then(set)
      .catch(() => set({ signedIn: false }));
    return () => {
      live = false;
    };
  }, [path]);

  // Show the signed-out state the moment sign-out is pressed; the server then ends the session and redirects.
  const signOut = () => {
    cache = { path, me: { signedIn: false } };
    setMe({ signedIn: false });
  };

  const accountHref = me?.signedIn ? me.href : "/account";

  if (variant === "footer") {
    if (!me) return null;
    return me.signedIn ? (
      <>
        <li>
          <Link href={accountHref} className={linkClass}>
            My account
          </Link>
        </li>
        <li>
          <form action={logoutAction} onSubmit={signOut}>
            <button type="submit" className={linkClass}>
              Sign out
            </button>
          </form>
        </li>
      </>
    ) : (
      <>
        <li>
          <Link href="/login" className={linkClass}>
            Sign in
          </Link>
        </li>
        <li>
          <Link href="/get-started" className={linkClass}>
            Create an account
          </Link>
        </li>
      </>
    );
  }

  // Nav: the same slot reads "Sign in" or "My account". Signing out lives in the footer and on /account.
  const hidden = me ? undefined : true;
  const href = me?.signedIn ? accountHref : "/login";
  const label = !me ? "\u00a0" : me.signedIn ? "My account" : "Sign in";

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className="block border-t border-line py-3.5 text-lg font-medium"
        aria-hidden={hidden}
        tabIndex={me ? undefined : -1}
      >
        {label}
      </Link>
    );
  }

  const desktop =
    "inline-block min-w-24 rounded-md px-3.5 py-2 text-center text-[0.95rem] font-medium text-ink-soft hover:bg-surface-2 xl1:px-4 xl1:text-base xl3:px-5 xl3:text-lg";
  return (
    <Link
      href={href}
      className={desktop}
      aria-hidden={hidden}
      tabIndex={me ? undefined : -1}
    >
      {label}
    </Link>
  );
}

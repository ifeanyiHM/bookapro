import { Wordmark } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <Container className="flex h-16 items-center justify-between gap-4 xl1:h-18 xl3:h-22">
          <Wordmark />
          {user ? (
            <form action={logoutAction} className="flex items-center gap-3">
              <span className="hidden max-w-56 truncate text-sm text-muted sm:inline xl1:text-base">
                {user.email}
              </span>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <Link
              href="/book"
              className="text-sm font-semibold text-brand underline underline-offset-4 xl1:text-base"
            >
              Back to booking
            </Link>
          )}
        </Container>
      </header>
      <main
        id="main"
        className="grid flex-1 place-items-start justify-items-center px-4 py-10 sm:py-14 xl1:py-20 xl3:py-24"
      >
        {children}
      </main>
    </div>
  );
}

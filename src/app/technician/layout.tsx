import type { Metadata } from "next";
import { Wordmark } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "My jobs", template: "%s | Technician" }, robots: { index: false } };

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("technician");
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <Container className="flex h-16 items-center justify-between gap-4 xl1:h-18 xl3:h-22">
          <div className="flex items-baseline gap-3">
            <Wordmark />
            <span className="hidden text-sm text-muted sm:inline xl1:text-base">Technician</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm font-medium sm:inline xl1:text-base">{user.name}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" size="sm">Sign out</Button>
            </form>
          </div>
        </Container>
      </header>
      <div id="main">{children}</div>
    </div>
  );
}

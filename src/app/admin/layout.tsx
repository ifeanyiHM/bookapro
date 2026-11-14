import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { Wordmark } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[14rem_1fr] xl1:grid-cols-[16rem_1fr] xl2:grid-cols-[17rem_1fr] xl3:grid-cols-[19rem_1fr] xl4:grid-cols-[21rem_1fr]">
      <aside className="border-b border-line bg-surface p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r xl1:p-5 xl3:p-7">
        <div className="mb-4 flex items-center justify-between lg:mb-8 lg:block">
          <Wordmark />
          <p className="text-sm text-muted lg:mt-1 xl1:text-base">Admin</p>
        </div>
        <AdminNav />
        <div className="mt-4 border-t border-line pt-4 lg:mt-auto">
          <p className="truncate text-sm font-medium xl1:text-base">{user.name}</p>
          <p className="truncate text-sm text-muted xl1:text-base">{user.email}</p>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="secondary" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div id="main" className="min-w-0 p-4 sm:p-6 lg:p-8 xl1:p-10 xl2:p-12 xl3:p-14 xl4:p-16">
        <div className="mx-auto max-w-6xl xl1:max-w-7xl xl3:max-w-368 xl4:max-w-400">{children}</div>
      </div>
    </div>
  );
}

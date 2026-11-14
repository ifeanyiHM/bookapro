"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/areas", label: "Areas" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/technicians", label: "Technicians" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-1 xl3:gap-1.5">
      {ITEMS.map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3.5 py-2.5 text-[0.95rem] font-medium xl1:px-4 xl1:py-3 xl1:text-base xl3:px-5 xl3:text-lg",
              active ? "bg-brand text-white" : "text-ink-soft hover:bg-surface-2",
            )}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

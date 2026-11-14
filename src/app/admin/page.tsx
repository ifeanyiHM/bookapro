import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { adminOverview } from "@/lib/bookings";
import { type } from "@/lib/scale";

export default async function AdminOverviewPage() {
  const o = await adminOverview();
  const items = [
    { n: o.needsAssigning, label: "Paid bookings waiting for a technician", href: "/admin/bookings?status=paid", urgent: true },
    { n: o.today, label: "Jobs scheduled for today", href: "/admin/bookings?status=assigned" },
    { n: o.pendingApplications, label: "Technician applications waiting for review", href: "/admin/applications?status=pending", urgent: true },
    { n: o.newEnquiries, label: "New project enquiries", href: "/admin/enquiries?status=new", urgent: true },
    { n: o.awaitingPayment, label: "Bookings started but not paid (last 24 hours)", href: "/admin/bookings?status=pending_payment" },
  ];
  return (
    <div>
      <h1 className={type.h1}>Overview</h1>
      <p className={`${type.body} mb-8 mt-2 text-muted xl3:mb-12`}>What needs attention right now.</p>
      <ul className="divide-y divide-line border-y border-line">
        {items.map((i) => (
          <li key={i.label}>
            <Link href={i.href} className="group flex items-center gap-5 py-5 hover:bg-surface xl1:gap-7 xl1:py-6 xl3:py-8">
              <span
                className={`min-w-14 font-display text-4xl font-bold xl1:text-5xl xl3:min-w-20 xl3:text-6xl ${i.urgent && i.n > 0 ? "text-brand" : "text-ink"}`}
              >
                {i.n}
              </span>
              <span className={`${type.body} flex-1`}>{i.label}</span>
              <ArrowRight aria-hidden="true" weight="bold" className="size-5 text-muted group-hover:text-brand xl3:size-6" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

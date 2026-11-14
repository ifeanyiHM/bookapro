import { MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireRole } from "@/lib/auth";
import { listTechnicianJobs } from "@/lib/bookings";
import { formatDay, windowLabel } from "@/lib/format";
import { space, type } from "@/lib/scale";
import type { Booking } from "@/types";
import { techStatusAction } from "./actions";

function JobRow({ b }: { b: Booking }) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.address}, ${b.areaName}, Lagos`)}`;
  return (
    <li className="py-6 xl1:py-8 xl3:py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted xl1:text-base">
            {formatDay(b.slotDate)} · {windowLabel(b.slotWindow)}
          </p>
          <h3 className={`${type.h3} mt-1`}>{b.serviceName}</h3>
          <p className="text-sm text-muted xl1:text-base">{b.ref}</p>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <dl className={`${type.body} mt-4 space-y-1.5`}>
        <div className="flex gap-2"><dt className="sr-only">Customer</dt><dd className="font-medium">{b.customerName}</dd></div>
        <div className="flex items-start gap-2">
          <dt className="sr-only">Address</dt>
          <dd className="flex items-start gap-1.5">
            <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
            <span>{b.address}{b.landmark ? ` (${b.landmark})` : ""}, {b.areaName}</span>
          </dd>
        </div>
        {b.notes && <div><dt className="inline text-muted">Notes: </dt><dd className="inline">{b.notes}</dd></div>}
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`tel:${b.customerPhone}`} className="inline-flex h-11 items-center gap-2 rounded-md border border-ink/30 bg-surface px-4 font-semibold xl1:h-12 xl3:h-14 xl3:text-lg">
          <Phone aria-hidden="true" weight="bold" /> Call {b.customerPhone}
        </a>
        <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md border border-ink/30 bg-surface px-4 font-semibold xl1:h-12 xl3:h-14 xl3:text-lg">
          <MapPin aria-hidden="true" weight="bold" /> Open in Maps<span className="sr-only"> (new tab)</span>
        </a>
        {b.status === "assigned" && (
          <form action={techStatusAction}>
            <input type="hidden" name="bookingId" value={b.id} />
            <input type="hidden" name="to" value="in_progress" />
            <Button type="submit">Start job</Button>
          </form>
        )}
        {b.status === "in_progress" && (
          <form action={techStatusAction}>
            <input type="hidden" name="bookingId" value={b.id} />
            <input type="hidden" name="to" value="completed" />
            <Button type="submit">Mark completed</Button>
          </form>
        )}
      </div>
    </li>
  );
}

export default async function TechnicianPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const user = await requireRole("technician");
  const { notice, error } = await searchParams;
  const jobs = await listTechnicianJobs(user.id);
  const open = jobs.filter((j) => j.status !== "completed");
  const done = jobs.filter((j) => j.status === "completed");

  return (
    <Container className={`${space.sectionTight} max-w-4xl xl1:max-w-5xl xl3:max-w-6xl`}>
      <h1 className={type.h1}>My jobs</h1>
      <div className="mt-6"><Notice notice={notice} error={error} /></div>
      <h2 className={`${type.h3} mb-1`}>Upcoming</h2>
      {open.length === 0 ? (
        <p className={`${type.body} rounded-md border border-dashed border-line-strong p-6 text-muted`}>No jobs assigned to you right now.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">{open.map((b) => <JobRow key={b.id} b={b} />)}</ul>
      )}
      {done.length > 0 && (
        <>
          <h2 className={`${type.h3} mb-1 mt-12`}>Completed in the last 14 days</h2>
          <ul className="divide-y divide-line border-y border-line">{done.map((b) => <JobRow key={b.id} b={b} />)}</ul>
        </>
      )}
    </Container>
  );
}

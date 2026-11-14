import { CheckCircle, Hourglass, ProhibitInset, Receipt, UserCheck, Wrench } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import type { BookingStatus } from "@/config/booking";
import type { EnquiryStatus } from "@/types";

const BOOKING: Record<BookingStatus, { label: string; tone: string; Icon: typeof Receipt }> = {
  pending_payment: { label: "Awaiting payment", tone: "bg-warning-tint text-warning", Icon: Hourglass },
  paid: { label: "Paid", tone: "bg-brand-tint text-brand-dark", Icon: Receipt },
  assigned: { label: "Assigned", tone: "bg-brand-tint text-brand-dark", Icon: UserCheck },
  in_progress: { label: "In progress", tone: "bg-amber-tint text-warning", Icon: Wrench },
  completed: { label: "Completed", tone: "bg-success-tint text-success", Icon: CheckCircle },
  cancelled: { label: "Cancelled", tone: "bg-danger-tint text-danger", Icon: ProhibitInset },
};

const pill =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold xl1:text-sm xl3:px-3 xl3:text-base";

export function StatusBadge({ status, label }: { status: BookingStatus; label?: string }) {
  const { label: l, tone, Icon } = BOOKING[status];
  return (
    <span className={cn(pill, tone)}>
      <Icon weight="bold" aria-hidden="true" className="size-3.5 xl3:size-4" />
      {label ?? l}
    </span>
  );
}

const ENQUIRY: Record<EnquiryStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "bg-brand-tint text-brand-dark" },
  contacted: { label: "Contacted", tone: "bg-warning-tint text-warning" },
  closed: { label: "Closed", tone: "bg-surface-2 text-ink-soft" },
};

export function EnquiryBadge({ status }: { status: EnquiryStatus }) {
  const { label, tone } = ENQUIRY[status];
  return <span className={cn(pill, tone)}>{label}</span>;
}

import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

const NOTICES: Record<string, string> = {
  assigned: "Technician assigned and notified.",
  unassigned: "Technician removed. The booking is back in the queue.",
  started: "Job marked as in progress.",
  completed: "Job marked as completed and the customer was emailed.",
  cancelled: "Booking cancelled and the customer was emailed.",
  payout: "Payout details saved.",
  enquiry: "Enquiry updated.",
  saved: "Saved.",
  approved: "Application approved. The technician was emailed and can now be assigned jobs.",
  rejected: "Application rejected. The applicant was emailed your reason and can resubmit.",
};

/** Success notices come from a fixed list. Error text is shown as plain text, never as markup. */
export function Notice({ notice, error }: { notice?: string; error?: string }) {
  if (error) {
    return (
      <p role="alert" className="mb-6 flex items-start gap-2 rounded-md border border-danger/40 bg-danger-tint p-4 text-danger xl1:text-lg">
        <WarningCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0" />
        {error}
      </p>
    );
  }
  const text = notice ? NOTICES[notice] : undefined;
  if (!text) return null;
  return (
    <p role="status" className="mb-6 flex items-start gap-2 rounded-md border border-success/40 bg-success-tint p-4 text-success xl1:text-lg">
      <CheckCircle aria-hidden="true" weight="fill" className="mt-0.5 size-5 shrink-0" />
      {text}
    </p>
  );
}

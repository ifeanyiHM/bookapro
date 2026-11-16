import { DAYS_AHEAD, HOLD_MINUTES, LEAD_HOURS, SLOT_WINDOWS } from "./booking";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const windows = SLOT_WINDOWS.map((w) => w.label).join(", ");

/** Answers match how the app really works (see README and config/booking.ts). Change them here, and every FAQ updates. */
export const FAQS: FaqItem[] = [
  {
    id: "how",
    question: "How does booking work?",
    answer:
      "Pick a service, choose your area, date and arrival window, then pay on Paystack. You get a confirmation email with your booking reference, and a second email when a technician is assigned.",
  },
  {
    id: "price",
    question: "Do I see the price before I pay?",
    answer:
      "Yes. Every service has one fixed price in naira, shown on its page and again before you pay. New-build wiring, full plumbing installations and larger AC projects are not priced online: send us the details and our team will contact you.",
  },
  {
    id: "window",
    question: "How long is the arrival window?",
    answer: `Windows are three hours long (${windows}, Lagos time). A technician arrives at some point inside the one you pick. You can book from ${LEAD_HOURS} hours ahead, up to ${DAYS_AHEAD} days in advance.`,
  },
  {
    id: "pay",
    question: "How do I pay?",
    answer: `You pay in naira on Paystack's secure page. We never see your card details. Your chosen slot is held for ${HOLD_MINUTES} minutes while you pay.`,
  },
  {
    id: "technicians",
    question: "Who are the technicians?",
    answer:
      "Technicians apply with a professional profile, a government ID and a certificate or reference letter. Our team reviews every application, and only approved technicians are assigned jobs.",
  },
  {
    id: "check",
    question: "How do I check or change a booking?",
    answer:
      "Open “Check a booking” and enter your booking reference and phone number. To change or cancel a booking, contact our team with your reference.",
  },
  {
    id: "areas",
    question: "Which areas do you cover?",
    answer: "Lagos only for now. The areas you can choose from are listed when you book.",
  },
];

/** The shorter list shown on the services pages. */
export const SERVICE_FAQS: FaqItem[] = FAQS.filter((f) => ["price", "window", "pay", "technicians"].includes(f.id));

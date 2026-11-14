export interface SlotWindow {
  id: string;
  label: string;
  /** Start hour in Lagos time (24h). */
  startHour: number;
}

/** The arrival windows a customer can pick. A technician arrives at some point inside the window. */
export const SLOT_WINDOWS: SlotWindow[] = [
  { id: "morning", label: "8:00 am to 11:00 am", startHour: 8 },
  { id: "midday", label: "11:00 am to 2:00 pm", startHour: 11 },
  { id: "afternoon", label: "2:00 pm to 5:00 pm", startHour: 14 },
];

/** Earliest a window can be booked, counted from now. */
export const LEAD_HOURS = 3;
/** How many days ahead customers can book (including today). */
export const DAYS_AHEAD = 14;
/** An unpaid booking holds its slot for this long. */
export const HOLD_MINUTES = 30;
/** Lagos is UTC+1 all year (no daylight saving). */
export const LAGOS_UTC_OFFSET_HOURS = 1;

export const CATEGORIES = [
  { id: "ac", label: "Air conditioning" },
  { id: "electrical", label: "Electrical" },
  { id: "plumbing", label: "Plumbing" },
  { id: "cleaning", label: "Cleaning" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const BOOKING_STATUSES = [
  "pending_payment",
  "paid",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid, assigning technician",
  assigned: "Technician assigned",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Statuses that occupy a technician's slot. */
export const SLOT_HOLDING_STATUSES: BookingStatus[] = ["paid", "assigned", "in_progress"];

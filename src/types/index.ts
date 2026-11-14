import type { BookingStatus, CategoryId } from "@/config/booking";

export type Role = "admin" | "customer" | "technician";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Service {
  id: number;
  slug: string;
  name: string;
  category: CategoryId;
  summary: string;
  description: string;
  includes: string[];
  priceKobo: number;
  durationMinutes: number;
  active: boolean;
  sort: number;
}

export interface Area {
  id: number;
  slug: string;
  name: string;
  active: boolean;
  sort: number;
}

export interface Booking {
  id: string;
  ref: string;
  serviceId: number;
  areaId: number;
  serviceName: string;
  areaName: string;
  category: CategoryId;
  priceKobo: number;
  slotDate: string;
  slotWindow: string;
  address: string;
  landmark: string | null;
  notes: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: BookingStatus;
  technicianId: string | null;
  technicianName?: string | null;
  technicianPayoutKobo: number | null;
  payoutPaidAt: string | null;
  customerUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingEvent {
  id: number;
  bookingId: string;
  status: string;
  note: string | null;
  actor: string | null;
  createdAt: string;
}

/** The signed-in account with everything the server needs to decide what it may do next. */
export interface AccountUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: Role | null;
  active: boolean;
  skills: CategoryId[];
  sessionVersion: number;
  emailVerified: boolean;
  hasPassword: boolean;
  googleLinked: boolean;
  adminPasswordSet: boolean;
  hasCustomerProfile: boolean;
  hasTechnicianProfile: boolean;
  applicationStatus: ApplicationStatus | null;
  reviewNote: string | null;
}

/** An admin or an approved technician, as the staff pages use them. */
export interface StaffUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  skills: CategoryId[];
  active: boolean;
  areaIds?: number[];
  applicationStatus?: ApplicationStatus | null;
}

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  contactMethod: "phone" | "whatsapp" | "email";
  projectType: string;
  trades: string[];
  location: string;
  sizeNote: string | null;
  startWindow: string | null;
  description: string;
  status: EnquiryStatus;
  internalNote: string | null;
  createdAt: string;
}

export interface DayAvailability {
  date: string;
  windows: { id: string; label: string; available: boolean }[];
}

export type FieldErrors = Record<string, string>;

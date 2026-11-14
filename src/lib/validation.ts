import { z } from "zod";
import { CATEGORIES, SLOT_WINDOWS } from "@/config/booking";
import { normalizePhone } from "./phone";
import type { FieldErrors } from "@/types";

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} needs at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : undefined));

const phone = z
  .string({ error: "Phone number is required" })
  .trim()
  .min(1, "Phone number is required")
  .transform((v, ctx) => {
    const n = normalizePhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "Enter a Nigerian mobile number, like 0803 123 4567" });
      return z.NEVER;
    }
    return n;
  });

const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(120)
  .email("Enter a valid email address");

export const bookingSchema = z.object({
  serviceSlug: text("Service", 1, 80),
  areaId: z.coerce.number({ error: "Choose your area" }).int().positive("Choose your area"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  window: z.enum(SLOT_WINDOWS.map((w) => w.id) as [string, ...string[]], { error: "Choose a time window" }),
  address: text("Address", 6, 200),
  landmark: optionalText(120),
  notes: optionalText(500),
  /** Honeypot: real people never fill this in. */
  company: z.string().max(0).optional(),
});
// The customer's name, phone and email are never sent by the browser: the server takes them from the account.
export type BookingInput = z.infer<typeof bookingSchema>;

export const lookupSchema = z.object({
  ref: text("Booking reference", 4, 20).transform((v) => v.toUpperCase()),
  phone,
});

export const ENQUIRY_PROJECT_TYPES = [
  { id: "new_build", label: "New building" },
  { id: "renovation", label: "Renovation" },
  { id: "extension", label: "Extension" },
  { id: "other", label: "Something else" },
] as const;

export const ENQUIRY_TRADES = [
  { id: "electrical", label: "Electrical" },
  { id: "plumbing", label: "Plumbing" },
  { id: "ac", label: "Air conditioning" },
] as const;

export const ENQUIRY_START_WINDOWS = [
  { id: "within_1_month", label: "Within a month" },
  { id: "1_3_months", label: "In 1 to 3 months" },
  { id: "3_plus_months", label: "In more than 3 months" },
  { id: "not_sure", label: "Not sure yet" },
] as const;

export const enquirySchema = z.object({
  name: text("Your name", 2, 80),
  phone,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address"),
  contactMethod: z.enum(["phone", "whatsapp", "email"], { error: "Choose how we should reach you" }),
  projectType: z.enum(ENQUIRY_PROJECT_TYPES.map((p) => p.id) as [string, ...string[]], {
    error: "Choose the type of project",
  }),
  trades: z
    .array(z.enum(ENQUIRY_TRADES.map((t) => t.id) as [string, ...string[]]))
    .min(1, "Choose at least one trade"),
  location: text("Project location", 3, 160),
  sizeNote: optionalText(160),
  startWindow: z
    .enum(ENQUIRY_START_WINDOWS.map((s) => s.id) as [string, ...string[]])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: text("Project details", 20, 2000),
  company: z.string().max(0).optional(),
}).superRefine((v, ctx) => {
  if (v.contactMethod === "email" && !v.email) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "Add your email so we can reach you by email" });
  }
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(200),
});

export const serviceSchema = z.object({
  name: text("Name", 3, 100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]], { error: "Choose a category" }),
  summary: text("Summary", 3, 160),
  description: text("Description", 3, 1500),
  includes: z.string().max(1500).transform((v) => v.split("\n").map((l) => l.trim()).filter(Boolean)),
  priceNaira: z.coerce.number({ error: "Enter a price" }).min(500, "Price looks too low").max(5_000_000),
  durationMinutes: z.coerce.number({ error: "Enter a duration" }).int().min(15).max(960),
  sort: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(false),
});

export const technicianSchema = z.object({
  skills: z.array(z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]])).min(1, "Choose at least one skill"),
  areaIds: z.array(z.coerce.number().int().positive()).min(1, "Choose at least one area"),
  active: z.coerce.boolean().default(false),
});

// ---- Accounts ---------------------------------------------------------------------------------

export const PASSWORD_MIN = 10;

/** bcrypt only reads the first 72 bytes, so longer passwords would silently be cut. Refuse them instead. */
const newPassword = z
  .string({ error: "Password is required" })
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`)
  .refine((v) => new TextEncoder().encode(v).length <= 72, "Use 72 bytes or fewer (about 72 characters)");

export const registerSchema = z
  .object({ email, password: newPassword })
  .refine((v) => v.password.toLowerCase() !== v.email, { path: ["password"], message: "Choose a password that is not your email" });

export const resetPasswordSchema = z.object({ password: newPassword });
export const emailOnlySchema = z.object({ email });

export const roleSchema = z.object({
  // Admin is deliberately not an option here. It can only be granted through the server-side script.
  role: z.enum(["customer", "technician"], { error: "Choose how you will use BookAPro" }),
});

export const customerProfileSchema = z.object({
  name: text("Full name", 2, 80),
  phone,
});

export const technicianApplicationSchema = z.object({
  name: text("Full name", 2, 80),
  phone,
  yearsExperience: z.coerce
    .number({ error: "Enter your years of experience" })
    .int("Enter a whole number")
    .min(0, "Enter your years of experience")
    .max(60, "Enter a number between 0 and 60"),
  bio: text("About your work", 40, 800),
  qualifications: optionalText(600),
  skills: z.array(z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]])).min(1, "Choose at least one skill"),
  areaIds: z.array(z.coerce.number().int().positive()).min(1, "Choose at least one area you can cover"),
});

export const reviewSchema = z
  .object({
    decision: z.enum(["approved", "rejected"]),
    note: z.string().trim().max(1000, "Keep the note under 1000 characters").optional(),
  })
  .refine((v) => v.decision === "approved" || (v.note && v.note.length >= 10), {
    path: ["note"],
    message: "Tell the applicant why, in at least 10 characters",
  });

export const ADMIN_PASSWORD_MIN = 12;

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { BookingStatus } from "@/config/booking";
import { requireRole } from "@/lib/auth";
import { assignTechnician, changeStatus, setPayout } from "@/lib/bookings";
import { db } from "@/lib/db";
import { updateEnquiry } from "@/lib/enquiries";
import { notifyApplicationApproved, notifyApplicationRejected, notifyAssigned, notifyCancelled, notifyCompleted } from "@/lib/notify";
import { reviewApplication } from "@/lib/technician-applications";
import { updateTechnician } from "@/lib/users";
import { reviewSchema, serviceSchema, technicianSchema, zodFieldErrors } from "@/lib/validation";
import type { EnquiryStatus, FieldErrors } from "@/types";

export interface FormState {
  errors?: FieldErrors;
  message?: string;
}

const id = (fd: FormData, key = "id") => String(fd.get(key) ?? "");

function back(path: string, key: "notice" | "error", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

// ---- Bookings ---------------------------------------------------------------------------------

export async function assignAction(fd: FormData) {
  const user = await requireRole("admin");
  const bookingId = id(fd, "bookingId");
  const path = `/admin/bookings/${bookingId}`;
  const res = await assignTechnician(bookingId, id(fd, "technicianId"), `admin: ${user.name}`);
  if (!res.ok) back(path, "error", res.message);
  if (res.technician) await notifyAssigned(res.booking, res.technician);
  revalidatePath("/admin", "layout");
  back(path, "notice", "assigned");
}

const STATUS_NOTICE: Partial<Record<BookingStatus, string>> = {
  paid: "unassigned",
  in_progress: "started",
  completed: "completed",
  cancelled: "cancelled",
};

export async function statusAction(fd: FormData) {
  const user = await requireRole("admin");
  const bookingId = id(fd, "bookingId");
  const to = id(fd, "to") as BookingStatus;
  const path = `/admin/bookings/${bookingId}`;
  const res = await changeStatus(bookingId, to, `admin: ${user.name}`);
  if (!res.ok) back(path, "error", res.message);
  if (to === "completed") await notifyCompleted(res.booking);
  if (to === "cancelled") await notifyCancelled(res.booking);
  revalidatePath("/admin", "layout");
  back(path, "notice", STATUS_NOTICE[to] ?? "saved");
}

export async function payoutAction(fd: FormData) {
  await requireRole("admin");
  const bookingId = id(fd, "bookingId");
  const raw = String(fd.get("amountNaira") ?? "").trim();
  const naira = raw === "" ? null : Number(raw);
  if (naira !== null && (!Number.isFinite(naira) || naira < 0 || naira > 5_000_000)) {
    back(`/admin/bookings/${bookingId}`, "error", "Enter the payout as a number of naira, like 9000.");
  }
  await setPayout(bookingId, naira === null ? null : Math.round(naira * 100), fd.get("paid") === "on");
  back(`/admin/bookings/${bookingId}`, "notice", "payout");
}

// ---- Enquiries --------------------------------------------------------------------------------

export async function enquiryAction(fd: FormData) {
  await requireRole("admin");
  const enquiryId = id(fd);
  const status = z.enum(["new", "contacted", "closed"]).parse(id(fd, "status")) as EnquiryStatus;
  const note = String(fd.get("internalNote") ?? "").trim().slice(0, 2000);
  await updateEnquiry(enquiryId, status, note || null);
  revalidatePath("/admin", "layout");
  back(`/admin/enquiries/${enquiryId}`, "notice", "enquiry");
}

// ---- Services ---------------------------------------------------------------------------------

export async function saveServiceAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireRole("admin");
  const parsed = serviceSchema.safeParse({
    name: fd.get("name"),
    slug: fd.get("slug"),
    category: fd.get("category"),
    summary: fd.get("summary"),
    description: fd.get("description"),
    includes: String(fd.get("includes") ?? ""),
    priceNaira: fd.get("priceNaira"),
    durationMinutes: fd.get("durationMinutes"),
    sort: fd.get("sort") || 0,
    active: fd.get("active") === "on",
  });
  if (!parsed.success) return { errors: zodFieldErrors(parsed.error) };
  const d = parsed.data;
  const serviceId = id(fd);
  const q = db();
  try {
    if (serviceId) {
      await q`
        update services set name = ${d.name}, slug = ${d.slug}, category = ${d.category}, summary = ${d.summary},
          description = ${d.description}, includes = ${d.includes}, price_kobo = ${Math.round(d.priceNaira * 100)},
          duration_minutes = ${d.durationMinutes}, sort = ${d.sort}, active = ${d.active}
        where id = ${Number(serviceId)}
      `;
    } else {
      await q`
        insert into services (slug, name, category, summary, description, includes, price_kobo, duration_minutes, sort, active)
        values (${d.slug}, ${d.name}, ${d.category}, ${d.summary}, ${d.description}, ${d.includes},
          ${Math.round(d.priceNaira * 100)}, ${d.durationMinutes}, ${d.sort}, ${d.active})
      `;
    }
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return { errors: { slug: "Another service already uses this web address" } };
    throw err;
  }
  revalidatePath("/", "layout");
  redirect("/admin/services?notice=saved");
}

// ---- Areas ------------------------------------------------------------------------------------

export async function addAreaAction(fd: FormData) {
  await requireRole("admin");
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) back("/admin/areas", "error", "Enter an area name between 2 and 60 characters.");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [{ max }] = await db()<{ max: number }[]>`select coalesce(max(sort), 0)::int as max from areas`;
  const rows = await db()`insert into areas (slug, name, sort) values (${slug}, ${name}, ${max + 1}) on conflict (slug) do nothing returning id`;
  if (rows.length === 0) back("/admin/areas", "error", `"${name}" is already in the list.`);
  revalidatePath("/", "layout");
  back("/admin/areas", "notice", "saved");
}

export async function toggleAreaAction(fd: FormData) {
  await requireRole("admin");
  await db()`update areas set active = not active where id = ${Number(id(fd))}`;
  revalidatePath("/", "layout");
  back("/admin/areas", "notice", "saved");
}

// ---- Technicians ------------------------------------------------------------------------------

export async function saveTechnicianAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireRole("admin");
  const technicianId = id(fd);
  const parsed = technicianSchema.safeParse({
    skills: fd.getAll("skills"),
    areaIds: fd.getAll("areaIds"),
    active: fd.get("active") === "on",
  });
  if (!parsed.success) return { errors: zodFieldErrors(parsed.error) };
  const ok = await updateTechnician(technicianId, { ...parsed.data, skills: parsed.data.skills as never });
  if (!ok) return { message: "That technician no longer exists." };
  revalidatePath("/admin", "layout");
  redirect("/admin/technicians?notice=saved");
}

// ---- Technician applications --------------------------------------------------------------------

export async function reviewApplicationAction(fd: FormData) {
  const admin = await requireRole("admin");
  const userId = id(fd, "userId");
  const path = `/admin/applications/${userId}`;
  const parsed = reviewSchema.safeParse({ decision: fd.get("decision"), note: String(fd.get("note") ?? "") || undefined });
  if (!parsed.success) back(path, "error", Object.values(zodFieldErrors(parsed.error))[0] ?? "Check the form and try again.");
  const { decision, note } = parsed.data;
  const result = await reviewApplication(userId, admin.id, decision, note);
  if (!result.ok) back(path, "error", result.message);
  if (decision === "approved") await notifyApplicationApproved(result);
  else await notifyApplicationRejected(result, note!);
  revalidatePath("/admin", "layout");
  back(path, "notice", decision);
}

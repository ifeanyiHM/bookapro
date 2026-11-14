"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { changeStatus } from "@/lib/bookings";
import { notifyCompleted } from "@/lib/notify";

export async function techStatusAction(fd: FormData) {
  const user = await requireRole("technician");
  const bookingId = String(fd.get("bookingId") ?? "");
  const to = String(fd.get("to") ?? "");
  if (to !== "in_progress" && to !== "completed") redirect("/technician");
  const res = await changeStatus(bookingId, to, `technician: ${user.name}`, { technicianId: user.id });
  if (!res.ok) redirect(`/technician?error=${encodeURIComponent(res.message)}`);
  if (to === "completed") await notifyCompleted(res.booking);
  revalidatePath("/technician");
  redirect(`/technician?notice=${to === "completed" ? "completed" : "started"}`);
}

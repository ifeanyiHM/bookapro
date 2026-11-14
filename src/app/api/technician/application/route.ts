import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { notifyApplicationSubmitted } from "@/lib/notify";
import { isSameOrigin } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { submitApplication, type UploadedDoc } from "@/lib/technician-applications";
import { checkUpload, MAX_REQUEST_BYTES } from "@/lib/uploads";
import { technicianApplicationSchema, zodFieldErrors } from "@/lib/validation";
import type { FieldErrors } from "@/types";

export const dynamic = "force-dynamic";

const fail = (status: number, message: string, errors?: FieldErrors) =>
  NextResponse.json({ ok: false, message, errors }, { status });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "Request not allowed.");

  // Identity and role are checked before the (large) body is read.
  const user = await getCurrentUser();
  if (!user) return fail(401, "Please sign in again.");
  if (!user.emailVerified || user.role !== "technician") return fail(403, "Only technician accounts can apply.");
  if (user.applicationStatus === "approved") return fail(409, "Your application is already approved.");
  if (!(await rateLimit(`tech-apply:${user.id}`, 10, 60 * 60_000))) return fail(429, "Too many attempts. Try again later.");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (!length || length > MAX_REQUEST_BYTES) return fail(413, "The files are too large. Keep each under 3 MB.");

  const fd = await request.formData().catch(() => null);
  if (!fd) return fail(400, "We could not read the form. Please try again.");

  const parsed = technicianApplicationSchema.safeParse({
    name: fd.get("name"),
    phone: fd.get("phone"),
    yearsExperience: fd.get("yearsExperience"),
    bio: fd.get("bio"),
    qualifications: fd.get("qualifications") || undefined,
    skills: fd.getAll("skills"),
    areaIds: fd.getAll("areaIds"),
  });
  const errors: FieldErrors = parsed.success ? {} : zodFieldErrors(parsed.error);

  const docs: UploadedDoc[] = [];
  for (const [field, kind] of [["idDocument", "id"], ["credentialDocument", "credential"]] as const) {
    const file = fd.get(field);
    if (file instanceof File && file.size > 0) {
      const checked = await checkUpload(file);
      if (!checked.ok) errors[field] = checked.message;
      else docs.push({ kind, filename: checked.filename, mime: checked.mime, data: checked.data });
    }
  }
  if (!parsed.success || Object.keys(errors).length) return fail(400, "Please fix the highlighted fields.", errors);

  const result = await submitApplication(user.id, parsed.data, docs);
  if (!result.ok) {
    return fail(400, result.message, result.field ? { [result.field]: result.message } : undefined);
  }
  await notifyApplicationSubmitted({ userId: user.id, name: result.name, email: result.email });
  return NextResponse.json({ ok: true, redirectUrl: "/onboarding/technician/status" });
}

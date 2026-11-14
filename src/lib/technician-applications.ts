import { db } from "./db";
import type { ApplicationStatus } from "@/types";
import type { CategoryId } from "@/config/booking";

export interface UploadedDoc {
  kind: "id" | "credential";
  filename: string;
  mime: string;
  data: Buffer;
}

export interface ApplicationInput {
  name: string;
  phone: string;
  yearsExperience: number;
  bio: string;
  qualifications?: string;
  skills: string[];
  areaIds: number[];
}

export type SubmitResult = { ok: true; name: string; email: string } | { ok: false; field?: string; message: string };

/**
 * Saves a technician's professional profile and documents and puts the application into review.
 * Allowed while pending (to fix a mistake) and after a rejection (to try again), never once approved.
 * New files replace the old file of the same kind; both kinds must exist when it is done.
 */
export async function submitApplication(userId: string, input: ApplicationInput, docs: UploadedDoc[]): Promise<SubmitResult> {
  return db().begin(async (tx) => {
    const [u] = await tx<{ role: string | null; verified: boolean; email: string }[]>`
      select role, (email_verified_at is not null) as verified, email from users where id = ${userId} for update
    `;
    if (!u?.verified || u.role !== "technician") return { ok: false as const, message: "Choose the technician role first." };
    const [existing] = await tx<{ status: ApplicationStatus }[]>`select status from technician_applications where user_id = ${userId}`;
    if (existing?.status === "approved") return { ok: false as const, message: "Your application is already approved." };

    for (const d of docs) {
      await tx`delete from technician_documents where user_id = ${userId} and kind = ${d.kind}`;
      await tx`
        insert into technician_documents (user_id, kind, filename, mime, size_bytes, data)
        values (${userId}, ${d.kind}, ${d.filename}, ${d.mime}, ${d.data.length}, ${d.data})
      `;
    }
    const kinds = await tx<{ kind: string }[]>`select distinct kind from technician_documents where user_id = ${userId}`;
    if (!kinds.some((k) => k.kind === "id")) return { ok: false as const, field: "idDocument", message: "Upload a photo of a government-issued ID." };
    if (!kinds.some((k) => k.kind === "credential")) {
      return { ok: false as const, field: "credentialDocument", message: "Upload a certificate, trade card or reference letter." };
    }

    await tx`
      insert into technician_profiles (user_id, full_name, phone, years_experience, bio, qualifications)
      values (${userId}, ${input.name}, ${input.phone}, ${input.yearsExperience}, ${input.bio}, ${input.qualifications ?? ""})
      on conflict (user_id) do update set full_name = excluded.full_name, phone = excluded.phone,
        years_experience = excluded.years_experience, bio = excluded.bio, qualifications = excluded.qualifications, updated_at = now()
    `;
    // users.name and users.phone are a display copy of the profile; skills and areas drive eligibility once approved.
    await tx`update users set name = ${input.name}, phone = ${input.phone}, skills = ${input.skills} where id = ${userId}`;
    await tx`delete from technician_areas where user_id = ${userId}`;
    for (const areaId of input.areaIds) {
      await tx`insert into technician_areas (user_id, area_id) values (${userId}, ${areaId}) on conflict do nothing`;
    }
    await tx`
      insert into technician_applications (user_id, status) values (${userId}, 'pending')
      on conflict (user_id) do update set status = 'pending', submitted_at = now(), reviewed_at = null,
        reviewed_by = null, review_note = null, attempt = technician_applications.attempt + 1
    `;
    return { ok: true as const, name: input.name, email: u.email };
  });
}

export interface ApplicationRow {
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  submittedAt: string;
  attempt: number;
  skills: CategoryId[];
}

type Raw<T> = Omit<T, "submittedAt"> & { submittedAt: Date };

export async function listApplications(status?: ApplicationStatus): Promise<ApplicationRow[]> {
  const rows = await db()<Raw<ApplicationRow>[]>`
    select a.user_id, p.full_name as name, u.email, p.phone, a.status, a.submitted_at, a.attempt, u.skills
    from technician_applications a
    join technician_profiles p on p.user_id = a.user_id
    join users u on u.id = a.user_id
    ${status ? db()`where a.status = ${status}` : db()``}
    order by (a.status = 'pending') desc, a.submitted_at desc
  `;
  return rows.map((r) => ({ ...r, submittedAt: r.submittedAt.toISOString() }));
}

export async function countPendingApplications(): Promise<number> {
  const [row] = await db()<{ count: number }[]>`select count(*)::int as count from technician_applications where status = 'pending'`;
  return row.count;
}

export interface ApplicationDetail extends ApplicationRow {
  yearsExperience: number | null;
  bio: string;
  qualifications: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  reviewerName: string | null;
  active: boolean;
  areas: { id: number; name: string }[];
  documents: { id: string; kind: "id" | "credential"; filename: string; mime: string; sizeBytes: number }[];
}

export async function getApplicationDetail(userId: string): Promise<ApplicationDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const q = db();
  const [row] = await q<(Raw<ApplicationRow> & { yearsExperience: number | null; bio: string; qualifications: string; reviewedAt: Date | null; reviewNote: string | null; reviewerName: string | null; active: boolean })[]>`
    select a.user_id, p.full_name as name, u.email, p.phone, a.status, a.submitted_at, a.attempt, u.skills,
      p.years_experience, p.bio, p.qualifications, a.reviewed_at, a.review_note, r.name as reviewer_name, u.active
    from technician_applications a
    join technician_profiles p on p.user_id = a.user_id
    join users u on u.id = a.user_id
    left join users r on r.id = a.reviewed_by
    where a.user_id = ${userId}
  `;
  if (!row) return null;
  const areas = await q<{ id: number; name: string }[]>`
    select ar.id, ar.name from technician_areas ta join areas ar on ar.id = ta.area_id where ta.user_id = ${userId} order by ar.sort
  `;
  const documents = await q<ApplicationDetail["documents"]>`
    select id, kind, filename, mime, size_bytes from technician_documents where user_id = ${userId} order by kind, created_at
  `;
  return { ...row, submittedAt: row.submittedAt.toISOString(), reviewedAt: row.reviewedAt?.toISOString() ?? null, areas, documents };
}

export async function getDocument(userId: string, id: string): Promise<{ filename: string; mime: string; data: Buffer } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const [row] = await db()<{ filename: string; mime: string; data: Buffer }[]>`
    select filename, mime, data from technician_documents where id = ${id} and user_id = ${userId}
  `;
  return row ?? null;
}

/** The applicant's own view: their saved details, so the form can be filled in again after a rejection. */
export async function getOwnApplication(userId: string) {
  const q = db();
  const [profile] = await q<{ name: string; phone: string; yearsExperience: number | null; bio: string; qualifications: string }[]>`
    select full_name as name, phone, years_experience, bio, qualifications from technician_profiles where user_id = ${userId}
  `;
  const [user] = await q<{ skills: CategoryId[] }[]>`select skills from users where id = ${userId}`;
  const areaIds = (await q<{ areaId: number }[]>`select area_id from technician_areas where user_id = ${userId}`).map((r) => r.areaId);
  const documents = await q<{ kind: "id" | "credential"; filename: string }[]>`
    select kind, filename from technician_documents where user_id = ${userId}
  `;
  return profile ? { ...profile, skills: user?.skills ?? [], areaIds, documents } : null;
}

export type ReviewResult =
  | { ok: true; name: string; email: string }
  | { ok: false; message: string };

export async function reviewApplication(
  userId: string,
  adminId: string,
  decision: "approved" | "rejected",
  note: string | undefined,
): Promise<ReviewResult> {
  return db().begin(async (tx) => {
    const [row] = await tx<{ status: ApplicationStatus; name: string; email: string }[]>`
      select a.status, p.full_name as name, u.email
      from technician_applications a join technician_profiles p on p.user_id = a.user_id join users u on u.id = a.user_id
      where a.user_id = ${userId} for update of a
    `;
    if (!row) return { ok: false as const, message: "Application not found." };
    if (row.status !== "pending") return { ok: false as const, message: "This application has already been reviewed." };
    await tx`
      update technician_applications set status = ${decision}, reviewed_at = now(), reviewed_by = ${adminId},
        review_note = ${note || null}
      where user_id = ${userId}
    `;
    return { ok: true as const, name: row.name, email: row.email };
  });
}

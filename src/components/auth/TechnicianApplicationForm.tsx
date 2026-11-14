"use client";

import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { CATEGORIES } from "@/config/booking";
import { cn } from "@/lib/cn";
import type { Area, FieldErrors } from "@/types";

interface Own {
  name: string;
  phone: string;
  yearsExperience: number | null;
  bio: string;
  qualifications: string;
  skills: string[];
  areaIds: number[];
  documents: { kind: "id" | "credential"; filename: string }[];
}

const check =
  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border border-line-strong bg-surface px-3.5 py-2 font-medium " +
  "has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand xl1:text-base xl3:text-lg";

const fileClass = cn(
  inputClass,
  "h-auto py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-brand-tint file:px-3 file:py-1.5 file:font-semibold file:text-brand-dark xl1:py-3",
);

const LABELS: Record<string, string> = {
  name: "Full name", phone: "Phone number", yearsExperience: "Years of experience", skills: "Skills", areaIds: "Areas",
  bio: "About your work", qualifications: "Qualifications", idDocument: "ID document", credentialDocument: "Supporting document",
};

export function TechnicianApplicationForm({ areas, own }: { areas: Area[]; own: Own | null }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const hasId = own?.documents.find((d) => d.kind === "id");
  const hasCredential = own?.documents.find((d) => d.kind === "credential");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/technician/application", { method: "POST", body: new FormData(e.currentTarget) });
      const json = (await res.json().catch(() => null)) as { ok: boolean; redirectUrl?: string; message?: string; errors?: FieldErrors } | null;
      if (res.ok && json?.ok && json.redirectUrl) {
        window.location.assign(json.redirectUrl);
        return;
      }
      setErrors(json?.errors ?? {});
      setFormError(json?.errors && Object.keys(json.errors).length ? "" : json?.message ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  const keys = Object.keys(LABELS).filter((k) => errors[k]);

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2 xl1:gap-6 xl3:gap-7">
      {(keys.length > 0 || formError) && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-md border border-danger/40 bg-danger-tint p-4 text-danger sm:col-span-2 xl1:text-lg">
          <p className="flex items-center gap-2 font-semibold">
            <WarningCircle aria-hidden="true" size={20} weight="fill" />
            {formError || "Please fix these before submitting:"}
          </p>
          {keys.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {keys.map((k) => (
                <li key={k}><a href={`#${k}`} className="underline underline-offset-2">{LABELS[k]}: {errors[k]}</a></li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Field id="name" label="Full name" error={errors.name}>
        {(a) => <input {...a} name="name" autoComplete="name" required defaultValue={own?.name} className={inputClass} />}
      </Field>
      <Field id="phone" label="Phone number" error={errors.phone}>
        {(a) => <input {...a} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" required defaultValue={own?.phone} className={inputClass} />}
      </Field>
      <Field id="yearsExperience" label="Years of experience" error={errors.yearsExperience}>
        {(a) => <input {...a} name="yearsExperience" type="number" inputMode="numeric" min={0} max={60} required defaultValue={own?.yearsExperience ?? ""} className={inputClass} />}
      </Field>

      <fieldset className="sm:col-span-2" id="skills">
        <legend className="mb-2 text-sm font-semibold xl1:text-base xl3:text-lg">What work do you do?</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <label key={c.id} className={check}>
              <input type="checkbox" name="skills" value={c.id} defaultChecked={own?.skills.includes(c.id)} className="size-4 accent-brand" />
              {c.label}
            </label>
          ))}
        </div>
        {errors.skills && <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">{errors.skills}</p>}
      </fieldset>

      <fieldset className="sm:col-span-2" id="areaIds">
        <legend className="mb-2 text-sm font-semibold xl1:text-base xl3:text-lg">Areas you can cover</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl1:grid-cols-4">
          {areas.map((a) => (
            <label key={a.id} className={check}>
              <input type="checkbox" name="areaIds" value={a.id} defaultChecked={own?.areaIds.includes(a.id)} className="size-4 accent-brand" />
              {a.name}
            </label>
          ))}
        </div>
        {errors.areaIds && <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">{errors.areaIds}</p>}
      </fieldset>

      <Field id="bio" label="About your work" hint="The jobs you have done, the tools you use, how you work. At least 40 characters." error={errors.bio} className="sm:col-span-2">
        {(a) => <textarea {...a} name="bio" rows={5} required defaultValue={own?.bio} className={textareaClass} />}
      </Field>
      <Field id="qualifications" label="Qualifications or training" optional error={errors.qualifications} className="sm:col-span-2">
        {(a) => <textarea {...a} name="qualifications" rows={3} defaultValue={own?.qualifications} className={textareaClass} />}
      </Field>

      <Field
        id="idDocument"
        label="Government-issued ID"
        hint={hasId ? `Already uploaded: ${hasId.filename}. Choose a file only to replace it.` : "A clear photo or scan of your NIN slip, driver's licence, voter's card or passport. PDF, JPG or PNG, up to 3 MB."}
        error={errors.idDocument}
      >
        {(a) => <input {...a} name="idDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className={fileClass} />}
      </Field>
      <Field
        id="credentialDocument"
        label="Certificate, trade card or reference letter"
        hint={hasCredential ? `Already uploaded: ${hasCredential.filename}. Choose a file only to replace it.` : "Proof of your training or work history. PDF, JPG or PNG, up to 3 MB."}
        error={errors.credentialDocument}
      >
        {(a) => <input {...a} name="credentialDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className={fileClass} />}
      </Field>

      <p className="text-sm text-muted sm:col-span-2 xl1:text-base">
        Only our review team can see your documents. We use them to check who you are and what you can do, and for nothing else.
      </p>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
          {submitting ? (<><SpinnerGap aria-hidden="true" className="animate-spin" /> Submitting…</>) : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}

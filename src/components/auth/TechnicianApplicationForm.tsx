"use client";

import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { CATEGORIES } from "@/config/booking";
import { cn } from "@/lib/cn";
import type { Area, FieldErrors } from "@/types";
import {
  CheckCircle,
  Files,
  MapPin,
  SpinnerGap,
  UserCircle,
  WarningCircle,
  Wrench,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

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
  "group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm font-medium text-ink transition-all duration-200 hover:border-brand/40 hover:bg-brand-tint/30 has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand";

const fileClass = cn(
  inputClass,
  "h-auto rounded-xl border-dashed py-3 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-tint file:px-3 file:py-2 file:text-xs file:font-bold file:text-brand-dark file:transition-colors hover:file:bg-brand/15 xl1:py-3.5",
);

const LABELS: Record<string, string> = {
  name: "Full name",
  phone: "Phone number",
  yearsExperience: "Years of experience",
  skills: "Skills",
  areaIds: "Areas",
  bio: "About your work",
  qualifications: "Qualifications",
  idDocument: "ID document",
  credentialDocument: "Supporting document",
};

function SectionHeading({
  icon: Icon,
  number,
  title,
  description,
}: {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
        <Icon size={21} weight="duotone" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
          Section {number}
        </p>
        <h3 className="mt-0.5 text-base font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>
    </div>
  );
}

export function TechnicianApplicationForm({
  areas,
  own,
}: {
  areas: Area[];
  own: Own | null;
}) {
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
    setErrors({});

    try {
      const res = await fetch("/api/technician/application", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });

      const json = (await res.json().catch(() => null)) as {
        ok: boolean;
        redirectUrl?: string;
        message?: string;
        errors?: FieldErrors;
      } | null;

      if (res.ok && json?.ok && json.redirectUrl) {
        window.location.assign(json.redirectUrl);
        return;
      }

      setErrors(json?.errors ?? {});
      setFormError(
        json?.errors && Object.keys(json.errors).length
          ? ""
          : (json?.message ?? "Something went wrong. Please try again."),
      );
    } catch {
      setFormError(
        "We could not reach the server. Check your connection and try again.",
      );
    }

    setSubmitting(false);
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  const keys = Object.keys(LABELS).filter((k) => errors[k]);

  return (
    <form onSubmit={submit} noValidate className="space-y-7 xl1:space-y-9">
      {(keys.length > 0 || formError) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger-tint p-4 text-danger outline-none sm:p-5"
        >
          <p className="flex items-center gap-2 font-semibold">
            <WarningCircle size={21} weight="fill" aria-hidden="true" />
            {formError || "Please review the following fields:"}
          </p>

          {keys.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {keys.map((k) => (
                <li key={k}>
                  <a
                    href={`#${k}`}
                    className="underline underline-offset-2 hover:no-underline"
                  >
                    {LABELS[k]}: {errors[k]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Personal details */}
      <section>
        <SectionHeading
          icon={UserCircle}
          number="01"
          title="Personal details"
          description="Let us know who you are and how to reach you."
        />

        <div className="grid gap-5 sm:grid-cols-2 xl1:gap-6">
          <Field id="name" label="Full name" error={errors.name}>
            {(a) => (
              <input
                {...a}
                name="name"
                autoComplete="name"
                required
                defaultValue={own?.name}
                placeholder="Your full name"
                className={inputClass}
              />
            )}
          </Field>

          <Field id="phone" label="Phone number" error={errors.phone}>
            {(a) => (
              <input
                {...a}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0803 123 4567"
                required
                defaultValue={own?.phone}
                className={inputClass}
              />
            )}
          </Field>

          <Field
            id="yearsExperience"
            label="Years of experience"
            hint="Enter 0 if you are just starting out."
            error={errors.yearsExperience}
            className="sm:col-span-2"
          >
            {(a) => (
              <input
                {...a}
                name="yearsExperience"
                type="number"
                inputMode="numeric"
                min={0}
                max={60}
                required
                defaultValue={own?.yearsExperience ?? ""}
                placeholder="e.g. 5"
                className={inputClass}
              />
            )}
          </Field>
        </div>
      </section>

      <div className="border-t border-dashed border-line-strong" />

      {/* Skills */}
      <section>
        <SectionHeading
          icon={Wrench}
          number="02"
          title="Your skills and expertise"
          description="Select the types of work you are qualified and available to do."
        />

        <fieldset id="skills">
          <legend className="mb-3 text-sm font-semibold text-ink">
            What work do you do?
          </legend>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <label key={c.id} className={check}>
                <input
                  type="checkbox"
                  name="skills"
                  value={c.id}
                  defaultChecked={own?.skills.includes(c.id)}
                  className="size-4 shrink-0 accent-brand"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          {errors.skills && (
            <p className="mt-2 text-sm font-medium text-danger">
              {errors.skills}
            </p>
          )}
        </fieldset>
      </section>

      <div className="border-t border-dashed border-line-strong" />

      {/* Areas */}
      <section>
        <SectionHeading
          icon={MapPin}
          number="03"
          title="Your service areas"
          description="Choose the locations where you can reliably take on jobs."
        />

        <fieldset id="areaIds">
          <legend className="mb-3 text-sm font-semibold text-ink">
            Areas you can cover
          </legend>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <label key={a.id} className={check}>
                <input
                  type="checkbox"
                  name="areaIds"
                  value={a.id}
                  defaultChecked={own?.areaIds.includes(a.id)}
                  className="size-4 shrink-0 accent-brand"
                />
                <span>{a.name}</span>
              </label>
            ))}
          </div>

          {errors.areaIds && (
            <p className="mt-2 text-sm font-medium text-danger">
              {errors.areaIds}
            </p>
          )}
        </fieldset>
      </section>

      <div className="border-t border-dashed border-line-strong" />

      {/* Work history */}
      <section>
        <SectionHeading
          icon={Files}
          number="04"
          title="Your work experience"
          description="Help us understand your experience, working style and training."
        />

        <div className="space-y-5">
          <Field
            id="bio"
            label="About your work"
            hint="Describe the jobs you have done, tools you use and how you approach your work. At least 40 characters."
            error={errors.bio}
          >
            {(a) => (
              <textarea
                {...a}
                name="bio"
                rows={5}
                required
                defaultValue={own?.bio}
                placeholder="Tell us about your experience and the work you specialise in..."
                className={textareaClass}
              />
            )}
          </Field>

          <Field
            id="qualifications"
            label="Qualifications or training"
            hint="Include relevant certificates, apprenticeships or professional training."
            optional
            error={errors.qualifications}
          >
            {(a) => (
              <textarea
                {...a}
                name="qualifications"
                rows={3}
                defaultValue={own?.qualifications}
                placeholder="Add any relevant training or qualifications..."
                className={textareaClass}
              />
            )}
          </Field>
        </div>
      </section>

      <div className="border-t border-dashed border-line-strong" />

      {/* Documents */}
      <section>
        <SectionHeading
          icon={Files}
          number="05"
          title="Verification documents"
          description="Upload clear documents so our team can verify your identity and professional background."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <Field
            id="idDocument"
            label="Government-issued ID"
            hint={
              hasId
                ? `Already uploaded: ${hasId.filename}. Choose a file only to replace it.`
                : "NIN slip, driver's licence, voter's card or passport. PDF, JPG or PNG, up to 3 MB."
            }
            error={errors.idDocument}
          >
            {(a) => (
              <input
                {...a}
                name="idDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className={fileClass}
              />
            )}
          </Field>

          <Field
            id="credentialDocument"
            label="Supporting document"
            hint={
              hasCredential
                ? `Already uploaded: ${hasCredential.filename}. Choose a file only to replace it.`
                : "Certificate, trade card or reference letter. PDF, JPG or PNG, up to 3 MB."
            }
            error={errors.credentialDocument}
          >
            {(a) => (
              <input
                {...a}
                name="credentialDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className={fileClass}
              />
            )}
          </Field>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/25 bg-success-tint/30 p-4">
          <CheckCircle
            size={21}
            weight="fill"
            className="mt-0.5 shrink-0 text-success"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            Your documents are only visible to our review team. They are used to
            verify your identity and professional qualifications.
          </p>
        </div>
      </section>

      {/* Submit */}
      <div className="border-t border-line pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-bold text-ink">Ready to submit?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Check your details before sending your application for review.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full shadow-sm transition-all duration-200 hover:shadow-md sm:w-auto"
          >
            {submitting ? (
              <>
                <SpinnerGap aria-hidden="true" className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit for review"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { type } from "@/lib/scale";
import {
  ENQUIRY_PROJECT_TYPES,
  ENQUIRY_START_WINDOWS,
  ENQUIRY_TRADES,
} from "@/lib/validation";
import type { FieldErrors } from "@/types";
import { CheckCircle, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Select } from "../ui/Select";

const CONTACT = [
  { id: "phone", label: "Phone call" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
] as const;

const choice =
  "group flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm font-medium text-ink transition-all duration-200 " +
  "hover:border-brand/50 hover:bg-brand-tint/40 " +
  "has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:checked]:text-brand " +
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand " +
  "xl1:text-base";

export function EnquiryForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState({ startWindow: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ name: string; contact: string } | null>(
    null,
  );
  const alertRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      contactMethod: fd.get("contactMethod") ?? "",
      projectType: fd.get("projectType") ?? "",
      trades: fd.getAll("trades"),
      location: fd.get("location"),
      sizeNote: fd.get("sizeNote"),
      startWindow: fd.get("startWindow"),
      description: fd.get("description"),
      company: fd.get("company"),
    };
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as {
        ok: boolean;
        errors?: FieldErrors;
        message?: string;
      } | null;
      if (res.ok && json?.ok) {
        setDone({
          name: String(payload.name),
          contact: String(payload.contactMethod),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setErrors(json?.errors ?? {});
      setFormError(
        json?.errors
          ? ""
          : (json?.message ?? "Something went wrong. Please try again."),
      );
    } catch {
      setFormError(
        "We could not reach the server. Check your connection and try again.",
      );
    }
    setSubmitting(false);
    requestAnimationFrame(() => alertRef.current?.focus());
  }

  if (done) {
    return (
      <div
        role="status"
        className="rounded-xl border border-success/30 bg-success-tint p-6 sm:p-8 xl1:p-10"
      >
        <p className="flex items-center gap-2 font-display text-2xl font-bold text-success xl1:text-3xl">
          <CheckCircle aria-hidden="true" weight="fill" /> We have your enquiry
        </p>
        <p className={`${type.body} mt-3 max-w-xl`}>
          Thank you, {done.name}. Our team will contact you by{" "}
          {CONTACT.find((c) => c.id === done.contact)?.label.toLowerCase() ??
            done.contact}
          .
        </p>
        <p className={`${type.body} mt-4`}>
          Meanwhile, you can{" "}
          <Link
            href="/services"
            className="font-semibold text-brand underline underline-offset-4"
          >
            see standard services and prices
          </Link>
          .
        </p>
      </div>
    );
  }

  const keys = Object.keys(errors);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10 xl1:space-y-12">
      {(keys.length > 0 || formError) && (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger-tint p-4 text-danger sm:p-5"
        >
          <p className="flex items-center gap-2 font-semibold">
            <WarningCircle aria-hidden="true" size={20} weight="fill" />
            {formError || "Please check the highlighted fields."}
          </p>
          {keys.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {keys.map((k) => (
                <li key={k}>{errors[k]}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <fieldset className="space-y-5">
        <legend className={`${type.h3} mb-5`}>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-brand">
            Step 01
          </span>
          About you
        </legend>

        <Field id="name" label="Full name" error={errors.name}>
          {(a) => (
            <input
              {...a}
              name="name"
              className={inputClass}
              autoComplete="name"
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
              className={inputClass}
              placeholder="0803 123 4567"
            />
          )}
        </Field>
        <Field
          id="email"
          label="Email"
          optional
          error={errors.email}
          className="sm:col-span-2"
        >
          {(a) => (
            <input
              {...a}
              name="email"
              type="email"
              autoComplete="email"
              className={inputClass}
            />
          )}
        </Field>
        <div className="sm:col-span-2">
          <p id="contact-label" className={`${type.label} mb-1.5`}>
            How should we reach you?
          </p>
          <div
            role="radiogroup"
            aria-labelledby="contact-label"
            className="grid gap-2 sm:grid-cols-3"
          >
            {CONTACT.map((c) => (
              <label key={c.id} className={choice}>
                <input
                  type="radio"
                  name="contactMethod"
                  value={c.id}
                  className="size-4 accent-brand"
                />{" "}
                {c.label}
              </label>
            ))}
          </div>
          {errors.contactMethod && (
            <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">
              {errors.contactMethod}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-6 border-t border-line pt-8">
        <legend className={`${type.h3} mb-5`}>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-brand">
            Step 02
          </span>
          About the project
        </legend>

        <div>
          <p id="type-label" className={`${type.label} mb-1.5`}>
            What kind of project is it?
          </p>
          <div
            role="radiogroup"
            aria-labelledby="type-label"
            className="grid gap-2 sm:grid-cols-2"
          >
            {ENQUIRY_PROJECT_TYPES.map((p) => (
              <label key={p.id} className={choice}>
                <input
                  type="radio"
                  name="projectType"
                  value={p.id}
                  className="size-4 accent-brand"
                />{" "}
                {p.label}
              </label>
            ))}
          </div>
          {errors.projectType && (
            <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">
              {errors.projectType}
            </p>
          )}
        </div>
        <div>
          <p id="trades-label" className={`${type.label} mb-1.5`}>
            Which trades do you need?
          </p>
          <div
            role="group"
            aria-labelledby="trades-label"
            className="grid gap-2 sm:grid-cols-2 xl1:grid-cols-3"
          >
            {ENQUIRY_TRADES.map((t) => (
              <label key={t.id} className={choice}>
                <input
                  type="checkbox"
                  name="trades"
                  value={t.id}
                  className="size-4 accent-brand"
                />{" "}
                {t.label}
              </label>
            ))}
          </div>
          {errors.trades && (
            <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">
              {errors.trades}
            </p>
          )}
        </div>
        <Field
          id="location"
          label="Where is the project?"
          hint="Area and city, for example Lekki, Lagos."
          error={errors.location}
        >
          {(a) => <input {...a} name="location" className={inputClass} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2 xl1:gap-6">
          <Field
            id="sizeNote"
            label="Size of the project"
            optional
            hint="Rooms, floors or square metres."
            error={errors.sizeNote}
          >
            {(a) => <input {...a} name="sizeNote" className={inputClass} />}
          </Field>
          <Field
            id="startWindow"
            label="When would you like to start?"
            optional
            error={errors.startWindow}
          >
            {(a) => (
              <Select
                id={a.id}
                name="startWindow"
                value={values.startWindow}
                onChange={(value) => {
                  setValues((prev) => ({ ...prev, startWindow: value }));
                  setErrors((prev) => {
                    const { startWindow: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Not sure yet"
                options={ENQUIRY_START_WINDOWS.filter(
                  (s) => s.id !== "not_sure",
                ).map((s) => ({
                  label: s.label,
                  value: s.id,
                }))}
              />
            )}
          </Field>
        </div>
        <Field
          id="description"
          label="Tell us about the project"
          hint="What needs doing, the stage the building is at, and anything we should know."
          error={errors.description}
        >
          {(a) => (
            <textarea
              {...a}
              name="description"
              rows={6}
              className={cn(textareaClass)}
            />
          )}
        </Field>
        <div
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="company">Leave this field empty</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>

      <div className="border-t border-line pt-7">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:min-w-56"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <SpinnerGap aria-hidden="true" className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send project enquiry"
          )}
        </Button>

        <p className="mt-3 text-sm leading-6 text-muted">
          Our team will review your details and contact you using your preferred
          method.
        </p>
      </div>
    </form>
  );
}

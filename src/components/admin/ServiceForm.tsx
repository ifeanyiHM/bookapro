"use client";

import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useActionState } from "react";
import { saveServiceAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { CATEGORIES } from "@/config/booking";
import type { Service } from "@/types";

export function ServiceForm({ service }: { service?: Service }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveServiceAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2 xl1:gap-6 xl3:gap-7">
      {service && <input type="hidden" name="id" value={service.id} />}
      {Object.keys(e).length > 0 && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger-tint p-4 text-danger sm:col-span-2 xl1:text-lg">
          <WarningCircle aria-hidden="true" size={20} weight="fill" /> Please fix the highlighted fields.
        </p>
      )}
      <Field id="name" label="Name" error={e.name} className="sm:col-span-2">
        {(a) => <input {...a} name="name" className={inputClass} defaultValue={service?.name} />}
      </Field>
      <Field id="slug" label="Web address" hint="Lowercase letters, numbers and hyphens. Used in the page link." error={e.slug}>
        {(a) => <input {...a} name="slug" className={inputClass} defaultValue={service?.slug} />}
      </Field>
      <Field id="category" label="Category" error={e.category}>
        {(a) => (
          <select {...a} name="category" className={inputClass} defaultValue={service?.category ?? ""}>
            <option value="" disabled>Choose a category</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        )}
      </Field>
      <Field id="summary" label="One-line summary" error={e.summary} className="sm:col-span-2">
        {(a) => <input {...a} name="summary" className={inputClass} defaultValue={service?.summary} />}
      </Field>
      <Field id="description" label="Description" error={e.description} className="sm:col-span-2">
        {(a) => <textarea {...a} name="description" rows={4} className={textareaClass} defaultValue={service?.description} />}
      </Field>
      <Field id="includes" label="What is included" hint="One item per line." error={e.includes} className="sm:col-span-2">
        {(a) => <textarea {...a} name="includes" rows={4} className={textareaClass} defaultValue={service?.includes.join("\n")} />}
      </Field>
      <Field id="priceNaira" label="Price (₦)" error={e.priceNaira}>
        {(a) => <input {...a} name="priceNaira" inputMode="decimal" className={inputClass} defaultValue={service ? service.priceKobo / 100 : ""} />}
      </Field>
      <Field id="durationMinutes" label="Typical duration (minutes)" error={e.durationMinutes}>
        {(a) => <input {...a} name="durationMinutes" inputMode="numeric" className={inputClass} defaultValue={service?.durationMinutes ?? 60} />}
      </Field>
      <Field id="sort" label="Order in lists" hint="Smaller numbers show first." error={e.sort}>
        {(a) => <input {...a} name="sort" inputMode="numeric" className={inputClass} defaultValue={service?.sort ?? 0} />}
      </Field>
      <label className="flex min-h-12 items-center gap-2.5 self-end font-medium xl1:text-lg">
        <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="size-4 accent-brand" />
        Show on the website and allow booking
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
          {pending ? (<><SpinnerGap aria-hidden="true" className="animate-spin" /> Saving…</>) : service ? "Save changes" : "Add service"}
        </Button>
      </div>
    </form>
  );
}

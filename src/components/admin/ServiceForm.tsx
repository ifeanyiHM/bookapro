"use client";

import { saveServiceAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { CATEGORIES } from "@/config/booking";
import type { Service } from "@/types";
import {
  CheckCircle,
  ClipboardText,
  Eye,
  ListChecks,
  SlidersHorizontal,
  SpinnerGap,
  WarningCircle,
} from "@phosphor-icons/react";
import { useActionState } from "react";

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType | string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
          {typeof Icon === "string" ? (
            <span className="text-base font-bold leading-none">{Icon}</span>
          ) : (
            <Icon size={21} weight="duotone" />
          )}
        </span>

        <div>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl1:gap-6">{children}</div>
    </section>
  );
}

export function ServiceForm({ service }: { service?: Service }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveServiceAction,
    {},
  );

  const e = state.errors ?? {};
  const hasErrors = Object.keys(e).length > 0;

  return (
    <form action={action} className="space-y-8">
      {service && <input type="hidden" name="id" value={service.id} />}

      {hasErrors && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-tint p-4 text-danger"
        >
          <WarningCircle
            aria-hidden="true"
            size={21}
            weight="fill"
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-bold">
              There are some issues with your form
            </p>
            <p className="mt-1 text-sm">
              Please review the highlighted fields and try again.
            </p>
          </div>
        </div>
      )}

      {/* Basic information */}
      <FormSection
        icon={ClipboardText}
        title="Basic information"
        description="Give your service a clear name and explain what customers can expect."
      >
        <Field
          id="name"
          label="Service name"
          error={e.name}
          className="sm:col-span-2"
        >
          {(a) => (
            <input
              {...a}
              name="name"
              className={inputClass}
              defaultValue={service?.name}
              placeholder="e.g. Air conditioner installation"
            />
          )}
        </Field>

        <Field
          id="slug"
          label="Web address"
          hint="Lowercase letters, numbers and hyphens."
          error={e.slug}
        >
          {(a) => (
            <input
              {...a}
              name="slug"
              className={inputClass}
              defaultValue={service?.slug}
              placeholder="air-conditioner-installation"
            />
          )}
        </Field>

        <Field id="category" label="Category" error={e.category}>
          {(a) => (
            <select
              {...a}
              name="category"
              className={inputClass}
              defaultValue={service?.category ?? ""}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id="summary"
          label="One-line summary"
          hint="A short introduction shown in service listings."
          error={e.summary}
          className="sm:col-span-2"
        >
          {(a) => (
            <input
              {...a}
              name="summary"
              className={inputClass}
              defaultValue={service?.summary}
              placeholder="A short description of this service"
            />
          )}
        </Field>

        <Field
          id="description"
          label="Full description"
          hint="Explain the service and what customers should know."
          error={e.description}
          className="sm:col-span-2"
        >
          {(a) => (
            <textarea
              {...a}
              name="description"
              rows={5}
              className={textareaClass}
              defaultValue={service?.description}
              placeholder="Describe the work involved, who the service is for and any important details..."
            />
          )}
        </Field>
      </FormSection>

      <div className="border-t border-line" />

      {/* What's included */}
      <FormSection
        icon={ListChecks}
        title="What's included"
        description="List the tasks or deliverables included in this service. Enter one item per line."
      >
        <Field
          id="includes"
          label="Included items"
          error={e.includes}
          className="sm:col-span-2"
        >
          {(a) => (
            <textarea
              {...a}
              name="includes"
              rows={5}
              className={textareaClass}
              defaultValue={service?.includes.join("\n")}
              placeholder={
                "Inspection and assessment\nLabour and installation\nTesting and final checks"
              }
            />
          )}
        </Field>
      </FormSection>

      <div className="border-t border-line" />

      {/* Pricing and duration */}
      <FormSection
        icon="₦"
        title="Pricing and duration"
        description="Set the displayed price and estimated time required to complete the service."
      >
        <Field id="priceNaira" label="Price (₦)" error={e.priceNaira}>
          {(a) => (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted">
                ₦
              </span>
              <input
                {...a}
                name="priceNaira"
                inputMode="decimal"
                className={`${inputClass} pl-8`}
                defaultValue={service ? service.priceKobo / 100 : ""}
                placeholder="0.00"
              />
            </div>
          )}
        </Field>

        <Field
          id="durationMinutes"
          label="Typical duration"
          hint="Estimated time in minutes."
          error={e.durationMinutes}
        >
          {(a) => (
            <div className="relative">
              <input
                {...a}
                name="durationMinutes"
                inputMode="numeric"
                className={`${inputClass} pr-16`}
                defaultValue={service?.durationMinutes ?? 60}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-muted">
                minutes
              </span>
            </div>
          )}
        </Field>
      </FormSection>

      <div className="border-t border-line" />

      {/* Display settings */}
      <FormSection
        icon={SlidersHorizontal}
        title="Display settings"
        description="Control where this service appears in your catalogue."
      >
        <Field
          id="sort"
          label="Display order"
          hint="Smaller numbers appear first."
          error={e.sort}
        >
          {(a) => (
            <input
              {...a}
              name="sort"
              inputMode="numeric"
              className={inputClass}
              defaultValue={service?.sort ?? 0}
            />
          )}
        </Field>

        <div className="flex items-center sm:pt-7">
          <label className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 p-4 transition-colors hover:border-brand/40">
            <input
              type="checkbox"
              name="active"
              defaultChecked={service?.active ?? true}
              className="mt-0.5 size-4 shrink-0 accent-brand"
            />

            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Eye size={16} weight="duotone" className="text-brand" />
                Show on website
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                Allow customers to see and book this service.
              </span>
            </span>
          </label>
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted">
          {service
            ? "Your changes will be applied when you save."
            : "Review your details before adding this service."}
        </p>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex min-w-40 items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <SpinnerGap
                aria-hidden="true"
                className="animate-spin"
                size={19}
              />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle size={18} weight="bold" />
              {service ? "Save changes" : "Add service"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

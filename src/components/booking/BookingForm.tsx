"use client";

import { Button } from "@/components/ui/Button";
import { Field, inputClass, textareaClass } from "@/components/ui/Field";
import { Ticket } from "@/components/ui/Ticket";
import { CATEGORIES } from "@/config/booking";
import { formatDayLong, formatNaira, windowLabel } from "@/lib/format";
import { type } from "@/lib/scale";
import type { Area, DayAvailability, FieldErrors, Service } from "@/types";
import { Info, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Select } from "../ui/Select";
import { SlotPicker } from "./SlotPicker";

interface Values {
  serviceSlug: string;
  areaId: string;
  date: string;
  window: string;
  address: string;
  landmark: string;
  notes: string;
  company: string;
}

const LABELS: Record<string, string> = {
  serviceSlug: "Service",
  areaId: "Area",
  window: "Arrival window",
  date: "Date",
  address: "Address",
  landmark: "Landmark",
  notes: "Notes",
};

const ORDER = [
  "serviceSlug",
  "areaId",
  "date",
  "window",
  "address",
  "landmark",
  "notes",
];

/** What the server says about the signed-in person. The server re-checks all of it when a booking is made. */
export interface BookingAccount {
  state: "guest" | "incomplete" | "ready" | "other";
  name?: string;
  phone?: string;
  email?: string;
}

export interface BookingInitial {
  serviceSlug?: string;
  areaId?: number;
  date?: string;
  window?: string;
  address?: string;
  landmark?: string;
  notes?: string;
}

function AccountNote({ account }: { account: BookingAccount }) {
  const box =
    "rounded-md border border-line-strong bg-surface-2 p-4 text-sm text-ink-soft sm:col-span-2 xl1:p-5 xl1:text-base";
  if (account.state === "ready") {
    return (
      <p className={box}>
        Booking as <strong className="text-ink">{account.name}</strong>,{" "}
        {account.phone}, {account.email}.{" "}
        <Link
          href="/onboarding/customer"
          className="font-semibold text-brand underline underline-offset-4"
        >
          Change my details
        </Link>
      </p>
    );
  }
  if (account.state === "other") {
    return (
      <p className={box}>
        You are signed in with a technician or admin account, which cannot make
        bookings. Sign out and use a customer account to book.
      </p>
    );
  }
  return (
    <p className={box}>
      {account.state === "guest"
        ? "To pay, you will create an account or sign in next, confirm your email and add your name and phone number. Your booking details are saved while you do that."
        : "Before you can pay, finish setting up your account. We will take you there and bring you back to this booking."}
    </p>
  );
}

export function BookingForm({
  services,
  areas,
  initialServiceSlug,
  initial,
  account,
}: {
  services: Service[];
  areas: Area[];
  initialServiceSlug?: string;
  initial?: BookingInitial;
  account: BookingAccount;
}) {
  const startSlug = initial?.serviceSlug ?? initialServiceSlug;
  const [values, setValues] = useState<Values>({
    serviceSlug: services.some((s) => s.slug === startSlug) ? startSlug! : "",
    areaId:
      initial?.areaId && areas.some((a) => a.id === initial.areaId)
        ? String(initial.areaId)
        : "",
    date: initial?.date ?? "",
    window: initial?.window ?? "",
    address: initial?.address ?? "",
    landmark: initial?.landmark ?? "",
    notes: initial?.notes ?? "",
    company: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [slotStatus, setSlotStatus] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle");
  const [reloadKey, setReloadKey] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  const service = services.find((s) => s.slug === values.serviceSlug);
  const area = areas.find((a) => String(a.id) === values.areaId);

  const set =
    (key: keyof Values) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
    };

  useEffect(() => {
    if (!values.serviceSlug || !values.areaId) {
      setDays(null);
      setSlotStatus("idle");
      return;
    }
    const controller = new AbortController();
    setSlotStatus("loading");
    fetch(
      `/api/slots?areaId=${encodeURIComponent(values.areaId)}&service=${encodeURIComponent(values.serviceSlug)}`,
      {
        signal: controller.signal,
        cache: "no-store",
      },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { days: DayAvailability[] };
        setDays(json.days);
        setSlotStatus("ready");
        setValues((v) => {
          const ok = json.days
            .find((d) => d.date === v.date)
            ?.windows.find((w) => w.id === v.window)?.available;
          return ok ? v : { ...v, date: "", window: "" };
        });
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setSlotStatus("error");
      });
    return () => controller.abort();
  }, [values.serviceSlug, values.areaId, reloadKey]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setSubmitting(true);
      setFormError("");
      type Reply =
        | { ok: true; redirectUrl: string }
        | {
            ok: false;
            code?: string;
            redirectUrl?: string;
            errors?: FieldErrors;
            message?: string;
          }
        | null;
      const send = async (url: string) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            areaId: Number(values.areaId) || values.areaId,
          }),
        });
        return { res, json: (await res.json().catch(() => null)) as Reply };
      };
      try {
        // Ready customers book and pay. Everyone else saves the booking and goes to sign up or finish their profile.
        let { res, json } = await send(
          account.state === "ready" ? "/api/bookings" : "/api/booking-drafts",
        );
        if (
          json &&
          !json.ok &&
          (json.code === "auth_required" || json.code === "onboarding_required")
        ) {
          // The session changed since this page loaded: keep the booking and send them to the right step.
          const saved = await send("/api/booking-drafts");
          res = saved.res;
          json = saved.json;
        }
        if (res.ok && json?.ok) {
          window.location.assign(json.redirectUrl);
          return; // keep the button in its busy state while the browser navigates away
        }
        const fieldErrors = json && !json.ok ? json.errors : undefined;
        setErrors(fieldErrors ?? {});
        setFormError(
          fieldErrors && Object.keys(fieldErrors).length
            ? ""
            : (json && !json.ok && json.message) ||
                "Something went wrong. Please try again.",
        );
        if (fieldErrors?.window || fieldErrors?.date)
          setReloadKey((k) => k + 1);
        setSubmitting(false);
        requestAnimationFrame(() => summaryRef.current?.focus());
      } catch {
        setFormError(
          "We could not reach the server. Check your connection and try again.",
        );
        setSubmitting(false);
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    },
    [submitting, values, account.state],
  );

  const errorKeys = ORDER.filter((k) => errors[k]);
  const groups = CATEGORIES.map((c) => ({
    ...c,
    items: services.filter((s) => s.category === c.id),
  })).filter((g) => g.items.length);

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid items-start gap-8 lg:grid-cols-[1fr_24rem] xl1:grid-cols-[1fr_28rem] xl1:gap-10 xl2:gap-12 xl3:grid-cols-[1fr_32rem] xl3:gap-16 xl4:grid-cols-[1fr_36rem] xl4:gap-20"
    >
      <div className="min-w-0 space-y-10 rounded-xl border border-line bg-white p-5 sm:p-7 xl1:space-y-12 xl1:p-9">
        {(errorKeys.length > 0 || formError) && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="rounded-md border border-danger/40 bg-danger-tint p-4 text-danger xl1:p-5 xl1:text-lg"
          >
            <p className="flex items-center gap-2 font-semibold">
              <WarningCircle aria-hidden="true" size={20} weight="fill" />
              {formError ||
                `Please fix ${errorKeys.length === 1 ? "this" : "these"} before continuing:`}
            </p>
            {errorKeys.length > 0 && (
              <ul className="mt-2 list-inside list-disc">
                {errorKeys.map((k) => (
                  <li key={k}>
                    <a
                      href={`#${k === "date" || k === "window" ? "slot-heading" : k}`}
                      className="underline underline-offset-2"
                    >
                      {LABELS[k] ?? k}: {errors[k]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="flex items-start gap-2 text-sm text-ink-soft xl1:text-base">
          <Info
            aria-hidden="true"
            size={20}
            className="mt-0.5 shrink-0 text-brand"
          />
          <span>
            Large or new-build job?{" "}
            <Link
              href="/contact-team"
              className="font-semibold text-brand underline underline-offset-4"
            >
              Contact our team.
            </Link>
          </span>
        </p>

        <fieldset className="space-y-5 border-b border-line pb-8 xl1:space-y-6 xl1:pb-10">
          <legend className={`${type.h3} mb-4`}>
            1. What do you need, and where?
          </legend>
          <Field id="serviceSlug" label="Service" error={errors.serviceSlug}>
            {(a) => (
              <Select
                id={a.id}
                name={a.name}
                value={values.serviceSlug}
                placeholder="Choose a service"
                invalid={Boolean(errors.serviceSlug)}
                options={groups.map((group) => ({
                  label: group.label,
                  options: group.items.map((service) => ({
                    label: `${service.name} · ${formatNaira(service.priceKobo)}`,
                    value: service.slug,
                  })),
                }))}
                onChange={(value) => {
                  setValues((prev) => ({ ...prev, serviceSlug: value }));

                  setErrors((prev) => {
                    const { serviceSlug: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
              />
            )}
          </Field>
          <Field id="areaId" label="Area in Lagos" error={errors.areaId}>
            {(a) => (
              <Select
                id={a.id}
                name={a.name}
                value={values.areaId}
                onChange={(value) => {
                  setValues((prev) => ({ ...prev, areaId: value }));
                  setErrors((prev) => {
                    const { areaId: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Choose your area"
                invalid={Boolean(errors.areaId)}
                options={areas.map((ar) => ({
                  label: ar.name,
                  value: String(ar.id),
                }))}
              />
            )}
          </Field>
        </fieldset>

        <fieldset className="border-b border-line pb-8 xl1:pb-10">
          <legend id="slot-heading" tabIndex={-1} className={`${type.h3} mb-4`}>
            2. Pick a date and arrival window
          </legend>
          <SlotPicker
            days={days}
            status={slotStatus}
            date={values.date}
            window={values.window}
            onChange={(n) => {
              setValues((v) => ({ ...v, ...n }));
              setErrors((prev) => {
                const { date: _d, window: _w, ...rest } = prev;
                return rest;
              });
            }}
            onRetry={() => setReloadKey((k) => k + 1)}
            error={errors.window ?? errors.date}
          />
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2 xl1:gap-6 xl3:gap-7">
          <legend className={`${type.h3} mb-4`}>3. Where is the job?</legend>
          <AccountNote account={account} />
          <Field
            id="address"
            label="Address where the work is"
            error={errors.address}
            className="sm:col-span-2"
          >
            {(a) => (
              <input
                {...a}
                className={inputClass}
                autoComplete="street-address"
                value={values.address}
                onChange={set("address")}
              />
            )}
          </Field>
          <Field
            id="landmark"
            label="Landmark or gate instructions"
            optional
            error={errors.landmark}
            className="sm:col-span-2"
          >
            {(a) => (
              <input
                {...a}
                className={inputClass}
                value={values.landmark}
                onChange={set("landmark")}
              />
            )}
          </Field>
          <Field
            id="notes"
            label="Anything the technician should know"
            optional
            error={errors.notes}
            className="sm:col-span-2"
          >
            {(a) => (
              <textarea
                {...a}
                className={textareaClass}
                rows={3}
                value={values.notes}
                onChange={set("notes")}
              />
            )}
          </Field>
          <div
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="company">Leave this field empty</label>
            <input
              id="company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={values.company}
              onChange={set("company")}
            />
          </div>
        </fieldset>
      </div>

      <aside
        className="self-start lg:sticky lg:top-24"
        aria-label="Booking summary"
      >
        <Ticket
          reference="IC-••••••"
          title={service?.name ?? "No service chosen yet"}
          rows={[
            {
              label: "Area",
              value: area?.name ?? (
                <span className="text-muted">Not chosen</span>
              ),
            },
            {
              label: "Date",
              value: values.date ? (
                formatDayLong(values.date)
              ) : (
                <span className="text-muted">Not chosen</span>
              ),
            },
            {
              label: "Arrival window",
              value: values.window ? (
                windowLabel(values.window)
              ) : (
                <span className="text-muted">Not chosen</span>
              ),
            },
          ]}
          total={{
            label: "To pay",
            value: service ? formatNaira(service.priceKobo) : "₦0",
          }}
        >
          <p className="mt-3 text-sm text-muted xl1:text-base">
            Your reference is created when you book.
          </p>
        </Ticket>

        <div className="mt-5">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || account.state === "other"}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <SpinnerGap aria-hidden="true" className="animate-spin" />
                {account.state === "ready"
                  ? "Taking you to payment…"
                  : "Saving your booking…"}
              </>
            ) : account.state === "ready" ? (
              service ? (
                `Pay ${formatNaira(service.priceKobo)} with Paystack`
              ) : (
                "Continue to payment"
              )
            ) : account.state === "other" ? (
              "Use a customer account to book"
            ) : (
              "Continue"
            )}
          </Button>

          <p className="mt-3 text-sm text-muted xl1:text-base">
            {account.state === "ready"
              ? "You pay on Paystack's secure page. We only see whether the payment worked."
              : "You will not be charged yet. Payment comes after your account is ready."}
          </p>

          <p className="mt-3 text-sm text-ink-soft xl1:text-base">
            Large or new-build job?{" "}
            <Link
              href="/contact-team"
              className="font-semibold text-brand underline underline-offset-4"
            >
              Contact our team.
            </Link>
          </p>
        </div>
      </aside>
    </form>
  );
}

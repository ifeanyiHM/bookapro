"use client";

import { lookupAction, type LookupState } from "@/app/(site)/booking/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { ArrowRight, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useActionState } from "react";

export function LookupForm({ initialRef }: { initialRef?: string }) {
  const [state, action, pending] = useActionState<LookupState, FormData>(
    lookupAction,
    { ref: initialRef },
  );

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-tint p-4 text-danger"
        >
          <WarningCircle
            aria-hidden="true"
            size={22}
            weight="fill"
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="font-semibold">We couldn't find that booking</p>
            <p className="mt-1 text-sm leading-relaxed">{state.error}</p>
          </div>
        </div>
      )}

      <Field
        id="ref"
        label="Booking reference"
        hint="Find this in your booking confirmation email."
      >
        {(a) => (
          <input
            {...a}
            name="ref"
            className={inputClass}
            defaultValue={state.ref}
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="e.g. IC-7K4M2Q"
            required
          />
        )}
      </Field>

      <Field
        id="phone"
        label="Phone number"
        hint="Use the number you provided when booking."
      >
        {(a) => (
          <input
            {...a}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            defaultValue={state.phone}
            placeholder="0803 123 4567"
            required
          />
        )}
      </Field>

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="w-full"
        >
          {pending ? (
            <>
              <SpinnerGap aria-hidden="true" className="size-5 animate-spin" />
              Finding your booking…
            </>
          ) : (
            <>
              View my booking
              <ArrowRight aria-hidden="true" className="size-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

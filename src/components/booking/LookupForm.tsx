"use client";

import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useActionState } from "react";
import { lookupAction, type LookupState } from "@/app/(site)/booking/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

export function LookupForm({ initialRef }: { initialRef?: string }) {
  const [state, action, pending] = useActionState<LookupState, FormData>(lookupAction, { ref: initialRef });
  return (
    <form action={action} className="space-y-5 xl1:space-y-6">
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger-tint p-4 text-danger xl1:text-lg">
          <WarningCircle aria-hidden="true" size={22} weight="fill" className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      )}
      <Field id="ref" label="Booking reference" hint="From your confirmation email, like IC-7K4M2Q.">
        {(a) => <input {...a} name="ref" className={inputClass} defaultValue={state.ref} autoCapitalize="characters" autoComplete="off" required />}
      </Field>
      <Field id="phone" label="Phone number you booked with">
        {(a) => <input {...a} name="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} defaultValue={state.phone} placeholder="0803 123 4567" required />}
      </Field>
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
        {pending ? (
          <>
            <SpinnerGap aria-hidden="true" className="animate-spin" /> Looking…
          </>
        ) : (
          "View my booking"
        )}
      </Button>
    </form>
  );
}

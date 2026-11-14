"use client";

import { SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useActionState } from "react";
import { saveTechnicianAction, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/config/booking";
import type { Area, StaffUser } from "@/types";

const check =
  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border border-line-strong bg-surface px-3.5 py-2 font-medium " +
  "has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand xl1:text-base xl3:text-lg";

export function TechnicianForm({ technician, areas }: { technician: StaffUser; areas: Area[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTechnicianAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2 xl1:gap-6 xl3:gap-7">
      <input type="hidden" name="id" value={technician.id} />
      {(Object.keys(e).length > 0 || state.message) && (
        <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger-tint p-4 text-danger sm:col-span-2 xl1:text-lg">
          <WarningCircle aria-hidden="true" size={20} weight="fill" /> {state.message ?? "Please fix the highlighted fields."}
        </p>
      )}
      <dl className="grid gap-1 sm:col-span-2 sm:grid-cols-3 xl1:text-lg">
        <div><dt className="text-muted">Name</dt><dd className="font-semibold">{technician.name}</dd></div>
        <div><dt className="text-muted">Phone</dt><dd className="font-semibold">{technician.phone}</dd></div>
        <div><dt className="text-muted">Email</dt><dd className="break-all font-semibold">{technician.email}</dd></div>
      </dl>

      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold xl1:text-base xl3:text-lg">Skills</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <label key={c.id} className={check}>
              <input type="checkbox" name="skills" value={c.id} defaultChecked={technician.skills.includes(c.id)} className="size-4 accent-brand" />
              {c.label}
            </label>
          ))}
        </div>
        {e.skills && <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">{e.skills}</p>}
      </fieldset>

      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold xl1:text-base xl3:text-lg">Areas covered</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl1:grid-cols-4">
          {areas.map((a) => (
            <label key={a.id} className={check}>
              <input type="checkbox" name="areaIds" value={a.id} defaultChecked={technician.areaIds?.includes(a.id)} className="size-4 accent-brand" />
              {a.name}
            </label>
          ))}
        </div>
        {e.areaIds && <p className="mt-1.5 text-sm font-medium text-danger xl1:text-base">{e.areaIds}</p>}
      </fieldset>

      <label className="flex min-h-12 items-center gap-2.5 font-medium sm:col-span-2 xl1:text-lg">
        <input type="checkbox" name="active" defaultChecked={technician.active} className="size-4 accent-brand" />
        Active (can sign in and receive jobs)
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
          {pending ? (<><SpinnerGap aria-hidden="true" className="animate-spin" /> Saving…</>) : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

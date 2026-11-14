"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/format";
import type { DayAvailability } from "@/types";

interface Props {
  days: DayAvailability[] | null;
  status: "idle" | "loading" | "error" | "ready";
  date: string;
  window: string;
  onChange: (next: { date: string; window: string }) => void;
  onRetry: () => void;
  error?: string;
}

const choice =
  "block cursor-pointer rounded-md border border-line-strong bg-surface text-center transition-colors " +
  "peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white " +
  "peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand " +
  "peer-disabled:cursor-not-allowed peer-disabled:border-line peer-disabled:bg-surface-2 peer-disabled:text-muted";

export function SlotPicker({ days, status, date, window: windowId, onChange, onRetry, error }: Props) {
  const selectedDay = days?.find((d) => d.date === date);
  const anyOpen = days?.some((d) => d.windows.some((w) => w.available)) ?? false;

  return (
    <div aria-live="polite">
      {status === "idle" && (
        <p className="rounded-md border border-dashed border-line-strong p-4 text-muted xl1:p-5 xl1:text-lg">
          Choose a service and an area to see the times we have available.
        </p>
      )}
      {status === "loading" && <p className="p-4 text-muted xl1:text-lg">Checking availability…</p>}
      {status === "error" && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-danger/40 bg-danger-tint p-4 text-danger xl1:text-lg">
          <WarningCircle aria-hidden="true" size={22} weight="fill" />
          <span>We could not load times.</span>
          <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-4">
            Try again
          </button>
        </div>
      )}
      {status === "ready" && days && !anyOpen && (
        <p className="rounded-md border border-line-strong bg-surface-2 p-4 xl1:p-5 xl1:text-lg">
          There are no free times in the next {days.length} days for this service in this area. Try another area.
        </p>
      )}
      {status === "ready" && days && anyOpen && (
        <div className="space-y-6 xl1:space-y-8">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold xl1:text-base xl3:text-lg">Date</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7 xl1:gap-2.5 xl3:gap-3">
              {days.map((d) => {
                const open = d.windows.some((w) => w.available);
                const [weekday, ...rest] = formatDay(d.date).split(" ");
                const id = `day-${d.date}`;
                return (
                  <div key={d.date}>
                    <input
                      id={id}
                      type="radio"
                      name="slot-date"
                      className="peer sr-only"
                      checked={date === d.date}
                      disabled={!open}
                      onChange={() => {
                        const stillOk = d.windows.find((w) => w.id === windowId)?.available;
                        onChange({ date: d.date, window: stillOk ? windowId : "" });
                      }}
                    />
                    <label htmlFor={id} className={cn(choice, "px-1 py-2.5 xl1:py-3 xl3:py-4")}>
                      <span className="block text-xs font-medium xl1:text-sm">{weekday}</span>
                      <span className="block text-base font-semibold xl1:text-lg xl3:text-xl">{rest.join(" ")}</span>
                      {!open && <span className="block text-xs xl1:text-sm">Full</span>}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {selectedDay && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold xl1:text-base xl3:text-lg">Arrival window</legend>
              <div className="grid gap-2 sm:grid-cols-3 xl1:gap-2.5 xl3:gap-3">
                {selectedDay.windows.map((w) => {
                  const id = `win-${w.id}`;
                  return (
                    <div key={w.id}>
                      <input
                        id={id}
                        type="radio"
                        name="slot-window"
                        className="peer sr-only"
                        checked={windowId === w.id}
                        disabled={!w.available}
                        onChange={() => onChange({ date, window: w.id })}
                      />
                      <label htmlFor={id} className={cn(choice, "px-3 py-3 text-[0.95rem] font-medium xl1:py-3.5 xl1:text-base xl3:py-4 xl3:text-lg")}>
                        {w.label}
                        {!w.available && <span className="block text-xs xl1:text-sm">Not available</span>}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm font-medium text-danger xl1:text-base">{error}</p>}
    </div>
  );
}

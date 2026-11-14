import { SLOT_WINDOWS } from "@/config/booking";

export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

/** "2025-10-28" -> "Tue 28 Oct". Works on the date string, so it never shifts with the server's time zone. */
export function formatDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatDayLong(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function windowLabel(id: string): string {
  return SLOT_WINDOWS.find((w) => w.id === id)?.label ?? id;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

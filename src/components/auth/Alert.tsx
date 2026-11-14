import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

export function Alert({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-danger/40 bg-danger-tint text-danger",
    success: "border-success/40 bg-success-tint text-success",
    info: "border-line-strong bg-surface-2 text-ink-soft",
  }[tone];
  const Icon = tone === "error" ? WarningCircle : CheckCircle;
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-2 rounded-md border p-3.5 xl1:p-4 xl1:text-lg", styles)}>
      {tone !== "info" && <Icon aria-hidden="true" size={22} weight="fill" className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </p>
  );
}

import { cn } from "@/lib/cn";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function Alert({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-danger/30 bg-danger-tint text-danger",
    success: "border-2 border-success bg-success text-success",
    info: "border-line bg-surface-2 text-ink-soft",
  }[tone];

  const Icon = tone === "error" ? WarningCircle : CheckCircle;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm leading-6 xl1:text-base",
        styles,
      )}
    >
      {tone !== "info" && (
        <Icon
          aria-hidden="true"
          size={21}
          weight="fill"
          className="mt-0.5 shrink-0"
        />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

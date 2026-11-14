import { cn } from "@/lib/cn";

export const inputClass = cn(
  "block w-full rounded-md border border-line-strong bg-surface px-3.5 h-12 text-base text-ink outline-none transition",
  "placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
  "disabled:bg-surface-2 disabled:text-muted",
  "xl1:h-13 xl1:px-4 xl1:text-[1.05rem] xl2:h-14 xl3:px-5 xl3:text-lg xl4:h-15",
);

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (a11y: {
    name: string | undefined;
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}

/** Label, hint and error around any control. The render prop hands the control the right id and aria attributes. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold xl1:mb-2 xl1:text-base xl3:text-lg"
      >
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-muted">(optional)</span>
        )}
      </label>
      {hint && (
        <p
          id={hintId}
          className="-mt-0.5 mb-2 text-sm text-muted xl1:text-base"
        >
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        name: undefined,
      })}
      {error && (
        <p
          id={errId}
          className="mt-1.5 text-sm font-medium text-danger xl1:text-base"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export const textareaClass = cn(
  inputClass,
  "h-auto min-h-28 py-3 xl1:py-3.5 xl1:min-h-32",
);

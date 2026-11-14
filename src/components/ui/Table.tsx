import { cn } from "@/lib/cn";

/**
 * Responsive table. From md up it is a normal table. Below md each row becomes a stacked block and every cell
 * shows its column name (from `label`), so nothing scrolls sideways on a phone.
 */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-line bg-surface", className)}>
      <table
        className={cn(
          "w-full text-left text-sm xl1:text-base xl3:text-[1.05rem]",
          "max-md:block max-md:[&_tbody]:block max-md:[&_thead]:sr-only max-md:[&_tr]:block",
          "max-md:[&_tbody_tr]:border-b max-md:[&_tbody_tr]:border-line max-md:[&_tbody_tr]:p-4 max-md:[&_tbody_tr:last-child]:border-b-0",
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line bg-surface-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft xl1:px-5 xl1:py-4 xl1:text-sm xl2:px-6 xl3:px-7 xl3:py-5",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  label,
  children,
  className,
}: {
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      data-label={label}
      className={cn(
        "px-4 py-3 align-top md:border-b md:border-line xl1:px-5 xl1:py-4 xl2:px-6 xl3:px-7 xl3:py-5",
        "max-md:flex max-md:items-start max-md:justify-between max-md:gap-4 max-md:px-0 max-md:py-1.5",
        "max-md:before:shrink-0 max-md:before:font-semibold max-md:before:text-muted max-md:before:content-[attr(data-label)]",
        className,
      )}
    >
      <span className="max-md:text-right">{children}</span>
    </td>
  );
}

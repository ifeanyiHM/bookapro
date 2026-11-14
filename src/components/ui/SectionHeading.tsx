import { cn } from "@/lib/cn";
import { type } from "@/lib/scale";

export function SectionHeading({
  title,
  description,
  id,
  className,
  children,
}: {
  title: string;
  description?: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t-2 border-ink pt-5 xl1:mb-12 xl1:pt-6 xl2:mb-14 xl3:pt-7 xl4:mb-16 xl4:pt-8",
        className,
      )}
    >
      <div className="max-w-2xl xl1:max-w-3xl xl4:max-w-4xl">
        <h2 id={id} className={type.h2}>
          {title}
        </h2>
        {description && <p className={cn(type.body, "mt-2 text-muted xl3:mt-3")}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

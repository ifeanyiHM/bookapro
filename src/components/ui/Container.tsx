import { cn } from "@/lib/cn";

/** Page width. Width and side padding both keep growing at every large-desktop breakpoint, so wide screens stay balanced. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10",
        "xl:max-w-296 xl1:max-w-328 xl1:px-12 xl2:max-w-352 xl2:px-14 xl3:max-w-368 xl3:px-16 xl4:max-w-400 xl4:px-20",
        className,
      )}
    >
      {children}
    </div>
  );
}

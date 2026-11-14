import { GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { googleEnabled } from "@/lib/google";
import { type } from "@/lib/scale";

export { Alert } from "./Alert";

/** The framed box every sign-in, sign-up and onboarding page sits in. `wide` is for the longer technician form. */
export function AuthCard({
  title,
  lead,
  wide,
  children,
  footer,
}: {
  title: string;
  lead?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={cn("w-full", wide ? "max-w-3xl xl1:max-w-4xl xl3:max-w-5xl" : "max-w-md xl1:max-w-lg xl3:max-w-xl")}>
      <h1 className={`${type.h1} mb-2`}>{title}</h1>
      {lead && <p className={`${type.body} mb-7 text-muted xl1:mb-9`}>{lead}</p>}
      <div className="rounded-md border border-line bg-surface p-6 xl1:p-8 xl3:p-10">{children}</div>
      {footer && <div className={`${type.small} mt-6 text-ink-soft`}>{footer}</div>}
    </div>
  );
}

/** Shown only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured. */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  if (!googleEnabled()) return null;
  return (
    <>
      <a
        href="/api/auth/google"
        className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-md border border-ink/30 bg-surface font-semibold text-ink transition-colors hover:border-ink xl1:h-14 xl1:text-[1.05rem] xl3:h-16 xl3:text-xl"
      >
        <GoogleLogo aria-hidden="true" weight="bold" className="size-5 xl3:size-6" />
        {label}
      </a>
      <div className="my-6 flex items-center gap-3 text-sm text-muted xl1:text-base" aria-hidden="true">
        <span className="h-px flex-1 bg-line-strong" />
        or
        <span className="h-px flex-1 bg-line-strong" />
      </div>
    </>
  );
}

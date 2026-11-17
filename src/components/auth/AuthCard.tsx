import { cn } from "@/lib/cn";
import { googleEnabled } from "@/lib/google";
import { type } from "@/lib/scale";
import {
  ArrowUpRight,
  CheckCircle,
  LockKey,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";

export { Alert } from "./Alert";

/**
 * Shared layout for sign-in, registration and onboarding pages.
 * Keeps the form itself as the main focus.
 */
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
    <div
      className={cn(
        "w-full",
        wide ? "max-w-5xl xl1:max-w-6xl" : "max-w-5xl xl1:max-w-6xl",
      )}
    >
      <div className="grid overflow-hidden rounded-2xl border border-line bg-surface shadow-sm lg:grid-cols-[0.85fr_1.15fr]">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-8 text-white lg:flex xl1:p-10 xl3:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-white/[0.07]"
          />

          <div className="relative z-10">
            <div className="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <ShieldCheck size={27} weight="duotone" />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              BookAPro
            </p>

            <h2 className="mt-4 max-w-sm text-3xl font-bold leading-tight tracking-tight xl1:text-4xl">
              Your home services, handled with confidence.
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/75 xl1:text-base">
              Book trusted professionals for electrical, plumbing, AC and
              cleaning services, all in one place.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-4">
            <div className="flex items-center gap-3 text-sm text-white/85">
              <CheckCircle size={20} weight="fill" />
              Straightforward online booking
            </div>
            <div className="flex items-center gap-3 text-sm text-white/85">
              <CheckCircle size={20} weight="fill" />
              Clear pricing before you pay
            </div>
            <div className="flex items-center gap-3 text-sm text-white/85">
              <CheckCircle size={20} weight="fill" />
              Secure account access
            </div>
          </div>

          <p className="relative z-10 mt-12 text-xs text-white/55">
            Reliable help for the work your home needs.
          </p>
        </div>

        {/* Form panel */}
        <div className="min-w-0 p-5 sm:p-8 lg:p-9 xl1:p-11 xl3:p-14">
          <div className="mb-7 lg:mb-9">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand">
              <LockKey size={15} weight="bold" />
              Secure account access
            </div>

            <h1 className={`${type.h1} tracking-tight`}>{title}</h1>

            {lead && (
              <p className={`${type.body} mt-3 max-w-lg text-muted`}>{lead}</p>
            )}
          </div>

          <div className="min-w-0">{children}</div>

          {footer && (
            <div className="mt-8 border-t border-line pt-6">
              <div className={`${type.small} text-ink-soft`}>{footer}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
        <ShieldCheck size={16} weight="fill" className="text-brand" />
        Your account details are handled securely.
      </div>
    </div>
  );
}

/** Google sign-in button */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4.1 1.9-6.8 1.9-5.3 0-9.8-3.6-11.4-8.4H5.7v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.7a20 20 0 0 0 0 17.6l6.9-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6 29.5 4 24 4A20 20 0 0 0 5.7 15.2l6.9 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
      />
    </svg>
  );
}

export function GoogleButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  if (!googleEnabled()) return null;

  return (
    <>
      <a
        href="/api/auth/google"
        className="
          group relative flex h-12 w-full items-center justify-center
          gap-3 rounded-lg border border-line-strong bg-surface
          text-center text-sm font-semibold text-ink
          shadow-sm transition-all duration-200
          hover:border-brand/40 hover:bg-surface-2 hover:shadow-md
          active:scale-[0.99]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-brand focus-visible:ring-offset-2
          xl1:h-13 xl1:text-base
        "
      >
        <GoogleLogo className="size-5 shrink-0" />
        <span>{label}</span>

        <ArrowUpRight
          size={16}
          className="
            absolute right-4 text-muted opacity-0
            transition-opacity duration-200
            group-hover:opacity-100
          "
        />
      </a>

      <div
        className="my-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted xl1:my-7"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-line" />
        <span>Or use your email</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

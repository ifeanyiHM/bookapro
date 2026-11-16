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
    <div
      className={cn(
        "w-full",
        wide
          ? "max-w-3xl xl1:max-w-4xl xl3:max-w-5xl"
          : "max-w-md xl1:max-w-lg xl3:max-w-xl",
      )}
    >
      <h1 className={`${type.h1} mb-2`}>{title}</h1>
      {lead && (
        <p className={`${type.body} mb-7 text-muted xl1:mb-9`}>{lead}</p>
      )}
      <div className="rounded-md border border-line bg-surface p-6 xl1:p-8 xl3:p-10">
        {children}
      </div>
      {footer && (
        <div className={`${type.small} mt-6 text-ink-soft`}>{footer}</div>
      )}
    </div>
  );
}

/** Shown only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured. */

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
          group flex h-12 w-full items-center justify-center gap-3
          rounded-lg border border-[#E8E8E8] bg-white
          text-sm font-semibold text-[#080808]
          shadow-sm transition-all duration-200
          hover:border-[#D0D0D0] hover:bg-[#F8F8F8]
          active:scale-[0.99]
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-[#2060F8]
          focus-visible:ring-offset-2
          xl1:h-14 xl1:text-base
          xl3:h-16 xl3:text-lg
        "
      >
        <GoogleLogo className="size-4.5 shrink-0 xl3:size-5" />
        <span>{label}</span>
      </a>

      <div
        className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.12em] text-[#A0A0A0] xl1:my-7 xl1:text-sm"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-[#E8E8E8]" />
        <span>Or continue with email</span>
        <span className="h-px flex-1 bg-[#E8E8E8]" />
      </div>
    </>
  );
}

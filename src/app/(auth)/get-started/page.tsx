import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { getServiceBySlug } from "@/lib/catalog";
import { loadDraft } from "@/lib/drafts";
import { formatDayLong, windowLabel } from "@/lib/format";
import { landingPath } from "@/lib/sign-in";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Get started" };

const STEPS = [
  ["Confirm your email", "We send a link to the address you register with."],
  ["Say how you will use BookAPro", "As a customer who books jobs, or as a technician who takes them."],
  ["Finish your profile", "A name and phone number for customers. Work details and ID for technicians."],
];

export default async function GetStartedPage() {
  const user = await getCurrentUser();
  if (user) redirect(await landingPath(user));
  const draft = await loadDraft(null);
  const service = draft ? await getServiceBySlug(draft.serviceSlug) : null;

  return (
    <AuthCard
      title="Get started"
      lead={
        draft && service ? (
          <>
            Your booking is saved: <strong className="text-ink">{service.name}</strong>, {formatDayLong(draft.date)}, {windowLabel(draft.window)}.
            Create an account to pay for it.
          </>
        ) : (
          "Create an account to book a service or to apply as a technician."
        )
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand underline underline-offset-4">Sign in</Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" />
      <ButtonLink href="/register" size="lg" className="w-full">Sign up with email</ButtonLink>
      <ol className="mt-8 space-y-3 border-t border-dashed border-line-strong pt-6 xl1:space-y-4">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="flex gap-3">
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-tint text-sm font-bold text-brand-dark xl1:size-8">{i + 1}</span>
            <span className="text-sm xl1:text-base">
              <span className="block font-semibold">{title}</span>
              <span className="text-ink-soft">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </AuthCard>
  );
}

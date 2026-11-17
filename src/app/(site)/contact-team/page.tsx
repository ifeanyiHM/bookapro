import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  HardHat,
  HouseLine,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { Container } from "@/components/ui/Container";
import { space, type } from "@/lib/scale";

export const metadata: Metadata = {
  title: "Large or new-build job",
  description:
    "Tell our team about a new building, renovation or larger installation and we will contact you.",
  alternates: { canonical: "/contact-team" },
};

const projectTypes = [
  {
    icon: HouseLine,
    title: "New-build installations",
    description: "Electrical and plumbing work for new properties.",
  },
  {
    icon: HardHat,
    title: "Renovations",
    description: "Upgrades, replacements and major property improvements.",
  },
  {
    icon: Wrench,
    title: "Larger installations",
    description: "Complex AC, electrical and plumbing projects.",
  },
];

const assurances = [
  "Tell us about your project",
  "Our team reviews your enquiry",
  "We contact you to discuss next steps",
];

export default function ContactTeamPage() {
  return (
    <main className={`${space.sectionTight} overflow-hidden`}>
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] xl1:gap-20 xl3:gap-28">
          {/* Introduction */}
          <section className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3.5 py-2 text-sm font-semibold text-brand">
              <ClipboardText size={17} weight="bold" />
              Project enquiries
            </span>

            <h1 className={`${type.h1} mt-6 max-w-xl`}>
              Bigger project?{" "}
              <span className="text-brand">Let&apos;s talk about it.</span>
            </h1>

            <p className={`${type.lead} mt-5 max-w-xl text-muted`}>
              From new-build installations to major renovations, tell us what
              you have in mind. Our team will review your requirements and get
              in touch to discuss your project.
            </p>

            {/* Project types */}
            <div className="mt-10 space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Projects we handle
              </p>

              <div className="space-y-3">
                {projectTypes.map((project) => {
                  const Icon = project.icon;

                  return (
                    <div
                      key={project.title}
                      className="flex gap-4 rounded-xl border border-line bg-surface-2 p-4 transition-colors hover:border-brand/30"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                        <Icon size={23} weight="duotone" />
                      </span>

                      <div className="min-w-0">
                        <h2 className="font-semibold text-ink">
                          {project.title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What happens next */}
            <div className="mt-10 border-t border-line pt-7">
              <p className="text-sm font-semibold text-ink">
                What happens next?
              </p>

              <div className="mt-4 space-y-3">
                {assurances.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle
                      size={19}
                      weight="fill"
                      className="shrink-0 text-brand"
                    />
                    <span className="text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Online booking alternative */}
            <div className="mt-9 rounded-xl border border-line p-4 sm:p-5">
              <p className="font-semibold text-ink">
                Just need a standard home service?
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Services like AC servicing or fan installation can be booked
                directly online.
              </p>

              <Link
                href="/services"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:gap-3"
              >
                Browse available services
                <ArrowRight size={17} weight="bold" />
              </Link>
            </div>
          </section>

          {/* Enquiry form */}
          <section aria-label="Project enquiry form" className="min-w-0">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Tell us about your project
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Let&apos;s get the details.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Share a few details below so our team can understand what you
                need.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6 xl1:p-8">
              <EnquiryForm />
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-muted">
              Submitting an enquiry does not commit you to a booking.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}

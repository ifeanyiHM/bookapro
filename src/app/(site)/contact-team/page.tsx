import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { Container } from "@/components/ui/Container";
import { space, type } from "@/lib/scale";

export const metadata: Metadata = {
  title: "Large or new-build job",
  description: "Tell our team about a new building, renovation or larger installation and we will contact you.",
};

export default function ContactTeamPage() {
  return (
    <Container className={`${space.sectionTight} grid gap-10 lg:grid-cols-[1fr_1.5fr] xl1:gap-20 xl3:gap-28`}>
      <div>
        <h1 className={type.h1}>Building or renovating? Talk to our team.</h1>
        <p className={`${type.lead} mt-4 xl3:mt-6`}>
          New-build wiring, full plumbing installations and larger AC projects are not priced online. Tell us what you
          need and our team will contact you.
        </p>
        <p className={`${type.body} mt-6 text-muted`}>
          Looking for a standard job like servicing an AC or fitting a fan?{" "}
          <Link href="/services" className="font-semibold text-brand underline decoration-2 underline-offset-4">
            Book it online instead
          </Link>
          .
        </p>
      </div>
      <EnquiryForm />
    </Container>
  );
}

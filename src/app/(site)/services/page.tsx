import type { Metadata } from "next";
import Link from "next/link";
import { ServiceRows } from "@/components/booking/ServiceRows";
import { Container } from "@/components/ui/Container";
import { listServices } from "@/lib/catalog";
import { space, type } from "@/lib/scale";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Services and prices",
  description: "Fixed prices for AC, electrical, plumbing and cleaning jobs in Lagos.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await listServices();
  return (
    <Container className={space.sectionTight}>
      <h1 className={type.h1}>Services and prices</h1>
      <p className={`${type.lead} mt-3 max-w-2xl xl3:mt-5`}>
        Each service has one fixed price. Large or new-build jobs are not priced here:{" "}
        <Link href="/contact-team" className="font-semibold text-brand underline decoration-2 underline-offset-4">
          contact our team
        </Link>
        .
      </p>
      <div className="mt-10 xl1:mt-14 xl3:mt-16">
        <ServiceRows services={services} />
      </div>
    </Container>
  );
}

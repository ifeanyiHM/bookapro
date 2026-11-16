import type { Metadata } from "next";
import { BookingForm, type BookingAccount } from "@/components/booking/BookingForm";
import { Container } from "@/components/ui/Container";
import { canBook } from "@/lib/access";
import { getCustomerProfile } from "@/lib/accounts";
import { getCurrentUser } from "@/lib/auth";
import { listAreas, listServices } from "@/lib/catalog";
import { loadDraft } from "@/lib/drafts";
import { space, type } from "@/lib/scale";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book a service",
  description: "Choose a service, your area and an arrival window, then pay securely with Paystack.",
  alternates: { canonical: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const [services, areas, user] = await Promise.all([listServices(), listAreas(), getCurrentUser()]);

  let account: BookingAccount = { state: "guest" };
  if (user) {
    if (user.role === "admin" || user.role === "technician") account = { state: "other" };
    else if (canBook(user)) {
      const profile = await getCustomerProfile(user.id);
      account = profile ? { state: "ready", name: profile.name, phone: profile.phone, email: user.email } : { state: "incomplete" };
    } else account = { state: "incomplete" };
  }
  // A saved booking comes back after sign-up, unless the person arrived from a different service's page.
  const draft = await loadDraft(user?.id ?? null);
  const initial = draft && (!service || service === draft.serviceSlug) ? draft : undefined;
  return (
    <Container className={space.sectionTight}>
      <h1 className={type.h1}>Book a service</h1>
      <p className={`${type.lead} mb-10 mt-3 max-w-2xl xl1:mb-14 xl3:mt-5`}>
        Three short steps. You see the full price before you pay.
      </p>
      {services.length === 0 || areas.length === 0 ? (
        <p className={type.body}>Booking is not open yet. Please check back soon.</p>
      ) : (
        <BookingForm services={services} areas={areas} initialServiceSlug={service} initial={initial} account={account} />
      )}
    </Container>
  );
}

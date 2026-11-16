import type { Metadata } from "next";
import { LookupForm } from "@/components/booking/LookupForm";
import { Container } from "@/components/ui/Container";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { space, type } from "@/lib/scale";

export const metadata: Metadata = { title: "Check a booking", alternates: { canonical: "/booking" } };

export default async function BookingLookupPage() {
  // Signed-in customers see all their bookings in their account.
  const user = await getCurrentUser();
  if (user?.role === "customer") redirect("/account");
  return (
    <Container className={`${space.sectionTight} max-w-2xl xl1:max-w-3xl xl3:max-w-4xl`}>
      <h1 className={type.h1}>Check a booking</h1>
      <p className={`${type.lead} mb-8 mt-3 xl1:mb-10`}>
        Enter the reference from your confirmation email and the phone number you booked with.
      </p>
      <LookupForm />
    </Container>
  );
}

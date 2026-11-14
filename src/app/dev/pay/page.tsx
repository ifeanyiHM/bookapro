import { notFound, redirect } from "next/navigation";
import { grantBookingAccess } from "@/lib/auth";
import { confirmPayment, getBookingById, getBookingRefForPayment } from "@/lib/bookings";
import { notifyPaid } from "@/lib/notify";
import { isDemoPayments } from "@/lib/paystack";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Demo payment", robots: { index: false } };

async function simulate(formData: FormData) {
  "use server";
  if (!isDemoPayments()) notFound();
  const reference = String(formData.get("reference") ?? "");
  const [p] = await db()<{ amountKobo: number }[]>`select amount_kobo from payments where reference = ${reference}`;
  const ref = await getBookingRefForPayment(reference);
  if (!p || !ref) notFound();
  const result = await confirmPayment(reference, { amountKobo: p.amountKobo, raw: { demo: true } });
  if (result.state === "confirmed" && result.bookingId) {
    const b = await getBookingById(result.bookingId);
    if (b) await notifyPaid(b);
  }
  await grantBookingAccess(ref);
  redirect(`/booking/${ref}?payment=paid`);
}

/** Stands in for Paystack's checkout page. It exists only while PAYSTACK_SECRET_KEY is blank and NODE_ENV is not production. */
export default async function DemoPayPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  if (!isDemoPayments()) notFound();
  const { reference = "" } = await searchParams;
  const [p] = await db()<{ amountKobo: number }[]>`select amount_kobo from payments where reference = ${reference}`;
  if (!p) notFound();
  return (
    <main className="py-16">
      <Container className="max-w-xl">
        <p className="mb-3 inline-block rounded-sm bg-amber-tint px-2 py-1 text-sm font-semibold text-warning">Demo payment page</p>
        <h1 className="text-3xl font-bold">Pretend to pay {formatNaira(p.amountKobo)}</h1>
        <p className="mt-3 text-muted">
          Paystack is not configured, so no real payment is taken. Add PAYSTACK_SECRET_KEY to your environment to use real checkout.
        </p>
        <form action={simulate} className="mt-8">
          <input type="hidden" name="reference" value={reference} />
          <Button type="submit">Simulate a successful payment</Button>
        </form>
      </Container>
    </main>
  );
}

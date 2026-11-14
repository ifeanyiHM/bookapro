import { NextResponse } from "next/server";
import { createEnquiry } from "@/lib/enquiries";
import { notifyEnquiry } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { enquirySchema, zodFieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`enquiry:${await clientIp()}`, 5, 30 * 60_000)) {
    return NextResponse.json({ ok: false, message: "Too many enquiries from this connection. Please try again later." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: zodFieldErrors(parsed.error) }, { status: 400 });
  }
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const enquiry = await createEnquiry(parsed.data);
  await notifyEnquiry(enquiry);
  return NextResponse.json({ ok: true });
}

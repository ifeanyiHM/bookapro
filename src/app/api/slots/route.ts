import { NextResponse } from "next/server";
import { CATEGORIES, type CategoryId } from "@/config/booking";
import { getAvailability } from "@/lib/availability";
import { getAreaById, getServiceBySlug } from "@/lib/catalog";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!rateLimit(`slots:${await clientIp()}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const areaId = Number(searchParams.get("areaId"));
  const slug = searchParams.get("service") ?? "";
  if (!Number.isInteger(areaId) || areaId <= 0 || !slug) {
    return NextResponse.json({ error: "Missing area or service." }, { status: 400 });
  }
  const [service, area] = await Promise.all([getServiceBySlug(slug), getAreaById(areaId)]);
  if (!service?.active || !area?.active) {
    return NextResponse.json({ error: "Unknown service or area." }, { status: 404 });
  }
  const category = service.category as CategoryId;
  if (!CATEGORIES.some((c) => c.id === category)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 404 });
  }
  const days = await getAvailability(areaId, category);
  return NextResponse.json({ days }, { headers: { "Cache-Control": "no-store" } });
}

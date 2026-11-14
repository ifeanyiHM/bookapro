import { requireRole } from "@/lib/auth";
import { getDocument } from "@/lib/technician-applications";

export const dynamic = "force-dynamic";

/** Admin-only download of a document a technician submitted. Never served inline as a page, never cached. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  await requireRole("admin");
  const { id, docId } = await params;
  const doc = await getDocument(id, docId);
  if (!doc) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.filename)}`,
      "Content-Length": String(doc.data.length),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cache-Control": "private, no-store",
    },
  });
}

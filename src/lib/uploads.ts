/**
 * Checks a technician's uploaded document. The type is decided from the file's own first bytes, never from the
 * name or the type the browser claims, and only PDF, JPEG and PNG are accepted.
 */
export const MAX_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_REQUEST_BYTES = 8 * 1024 * 1024;

export type Detected = { mime: "application/pdf" | "image/jpeg" | "image/png"; ext: "pdf" | "jpg" | "png" };

export function detectType(buf: Buffer): Detected | null {
  if (buf.length >= 5 && buf.subarray(0, 5).toString("latin1") === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", ext: "png" };
  }
  return null;
}

/** A safe display name: no path, no control characters, bounded length, extension matches the real type. */
export function safeFilename(original: string, ext: string): string {
  const base = original.split(/[\\/]/).pop() ?? "";
  const stem = base.replace(/\.[^.]*$/, "").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60);
  return `${stem || "document"}.${ext}`;
}

export type FileCheck =
  | { ok: true; filename: string; mime: string; data: Buffer }
  | { ok: false; message: string };

export async function checkUpload(file: File): Promise<FileCheck> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, message: "This file is larger than 3 MB. Upload a smaller photo or scan." };
  const data = Buffer.from(await file.arrayBuffer());
  if (data.length > MAX_FILE_BYTES) return { ok: false, message: "This file is larger than 3 MB. Upload a smaller photo or scan." };
  const type = detectType(data);
  if (!type) return { ok: false, message: "Upload a PDF, JPG or PNG file." };
  return { ok: true, filename: safeFilename(file.name, type.ext), mime: type.mime, data };
}

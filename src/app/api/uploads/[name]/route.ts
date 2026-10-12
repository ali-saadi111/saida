import { promises as fs } from "fs";
import { currentAdmin } from "@/lib/auth";
import { publicEvents } from "@/lib/events";
import { uploadPath, uploadType } from "@/lib/uploads";

/** Images attached to public events are public. Anything else (e.g. PDFs) is for the team only. */
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = uploadPath(name);
  if (!file) return new Response("Not found", { status: 404 });
  const isImage = !name.endsWith(".pdf");
  const isPublic = isImage && (await publicEvents()).some((e) => e.attachment === name);
  if (!isPublic && !(await currentAdmin())) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(file);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": uploadType(name),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": isPublic ? "public, max-age=3600" : "private, no-store",
        ...(isImage ? {} : { "Content-Disposition": "attachment" }),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

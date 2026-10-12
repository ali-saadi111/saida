import { venueById } from "@/lib/config";
import { eventBySlug } from "@/lib/events";
import { siteUrl } from "@/lib/config";
import { beirutIso } from "@/lib/time";

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await eventBySlug(decodeURIComponent(slug));
  if (!e) return new Response("Not found", { status: 404 });
  const venue = e.venueId === "other" ? e.venueOther ?? "" : venueById(e.venueId)?.name.en ?? "";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MCCD Saida 2027//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@saida2027`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(beirutIso(e.date, e.start))}`,
    `DTEND:${icsDate(beirutIso(e.date, e.end))}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.summary)}`,
    `LOCATION:${esc(`${venue}, Saida, Lebanon`)}`,
    `URL:${siteUrl()}/en/events/${encodeURIComponent(e.slug)}`,
    e.status === "cancelled" ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="saida-2027-event.ics"`,
    },
  });
}

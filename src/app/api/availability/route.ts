import { NextResponse, type NextRequest } from "next/server";
import { busyRanges } from "@/lib/booking";
import { read } from "@/lib/db";
import { VENUES } from "@/lib/config";

export const dynamic = "force-dynamic";

/** Busy time ranges for a date and venue. Exposes no event or organizer details. */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const venue = req.nextUrl.searchParams.get("venue") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !VENUES.some((v) => v.id === venue)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  const db = await read();
  return NextResponse.json(busyRanges(db.events, date, venue), { headers: { "Cache-Control": "no-store" } });
}

import { NextResponse, type NextRequest } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { read } from "@/lib/db";

function csv(rows: (string | number | boolean | undefined)[][]) {
  return (
    "﻿" +
    rows
      .map((r) =>
        r
          .map((c) => {
            let s = c == null ? "" : String(c);
            // Neutralise spreadsheet formula injection.
            if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
            return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      )
      .join("\r\n")
  );
}

export async function GET(req: NextRequest) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = await read();
  const type = req.nextUrl.searchParams.get("type");
  let body: string;
  if (type === "messages") {
    body = csv([
      ["created", "topic", "name", "email", "organization", "message"],
      ...db.messages.map((m) => [m.createdAt, m.topic, m.name, m.email, m.organization, m.message]),
    ]);
  } else {
    body = csv([
      ["ref", "status", "date", "start", "end", "venue", "venue_other", "title", "category", "audience", "language", "organizer", "organization", "email", "phone", "expected_attendance", "accessibility", "cost", "ticket_url", "website", "consent_publish", "consent_contact", "created", "updated", "example"],
      ...[...db.events]
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
        .map((e) => [e.ref, e.status, e.date, e.start, e.end, e.venueId, e.venueOther, e.title, e.category, e.audience, e.language, e.organizerName, e.organization, e.contactEmail, e.contactPhone, e.expectedAttendance, e.accessibility, e.cost, e.ticketUrl, e.website, e.consentPublish, e.consentContact, e.createdAt, e.updatedAt, !!e.sample]),
    ]);
  }
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="saida-2027-${type === "messages" ? "messages" : "reservations"}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

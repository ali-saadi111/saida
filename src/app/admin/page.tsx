import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteSamples, setEventStatus } from "@/app/admin/actions";
import { currentAdmin } from "@/lib/auth";
import { bookingRule, PROGRAMME_START, venueById } from "@/lib/config";
import { read } from "@/lib/db";
import { todayBeirut } from "@/lib/events";
import { formatMonth } from "@/lib/i18n";
import { btn } from "@/lib/ui";

export const dynamic = "force-dynamic";

function shift(ym: string, d: number) {
  const [y, m] = ym.split("-").map(Number);
  const x = new Date(Date.UTC(y, m - 1 + d, 1));
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ month?: string; show?: string }> }) {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const sp = await searchParams;
  const db = await read();
  const today = todayBeirut();
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : (today < PROGRAMME_START ? PROGRAMME_START : today).slice(0, 7);
  const show = sp.show === "all" || sp.show === "cancelled" ? sp.show : "upcoming";

  const events = [...db.events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const confirmed = events.filter((e) => e.status === "confirmed");
  const listed = events.filter((e) =>
    show === "cancelled" ? e.status === "cancelled" : show === "all" ? true : e.status === "confirmed" && e.date >= today,
  );
  const samples = db.events.filter((e) => e.sample).length + db.news.filter((n) => n.sample).length;

  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => {
    const d = i - lead + 1;
    return d >= 1 && d <= days ? `${month}-${String(d).padStart(2, "0")}` : null;
  });
  const venue = (id: string, other?: string) => (id === "other" ? other || "Other" : venueById(id)?.name.en);

  return (
    <AdminShell user={user} active="/admin">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Reservations</h1>
          <p className="mt-1 text-muted">
            {confirmed.length} confirmed, {events.length - confirmed.length} cancelled. Booking rule: <strong>{bookingRule()}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/admin/export?type=events" className={btn.secondary}>Export reservations (CSV)</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/admin/export?type=messages" className={btn.secondary}>Export messages (CSV)</a>
        </div>
      </div>

      {samples > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-field)] bg-accent-soft px-5 py-4">
          <p>{samples} example listings are loaded for the preview. Remove them before launch.</p>
          <form action={deleteSamples}>
            <button className="rounded-full bg-ink px-4 py-2 text-sm text-bg">Remove examples</button>
          </form>
        </div>
      )}

      {/* Availability calendar: empty days are free */}
      <section className="mt-10" aria-labelledby="cal">
        <div className="flex items-center justify-between">
          <h2 id="cal" className="text-xl font-semibold">Booked and available dates, {formatMonth(month, "en")}</h2>
          <div className="flex gap-2 text-sm">
            <Link className="rounded-full border border-line px-3.5 py-1.5" href={`/admin?month=${shift(month, -1)}&show=${show}`}>Previous</Link>
            <Link className="rounded-full border border-line px-3.5 py-1.5" href={`/admin?month=${shift(month, 1)}&show=${show}`}>Next</Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-7 overflow-hidden rounded-[var(--radius-panel)] border border-line">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-raised py-2 text-center text-sm text-muted">{d}</div>
            ))}
            {cells.map((date, i) => {
              const list = date ? confirmed.filter((e) => e.date === date) : [];
              return (
                <div key={i} className={`min-h-24 border-t border-line p-2 text-sm [&:not(:nth-child(7n+1))]:border-s ${!date ? "bg-bg" : list.length ? "bg-surface" : "bg-ok-soft/50"}`}>
                  {date && <span className="tabular-nums text-muted">{Number(date.slice(8))}</span>}
                  {list.map((e) => (
                    <Link key={e.id} href={`/admin/events/${e.id}`} className="mt-1 block truncate rounded-md bg-accent-soft px-1.5 py-0.5 text-xs hover:bg-accent hover:text-accent-ink">
                      {e.start} {venue(e.venueId, e.venueOther)}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="list">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="list" className="text-xl font-semibold">All reservations</h2>
          <div className="inline-flex rounded-full border border-line p-1 text-sm">
            {(["upcoming", "all", "cancelled"] as const).map((s) => (
              <Link key={s} href={`/admin?month=${month}&show=${s}`} aria-current={show === s ? "page" : undefined} className="rounded-full px-3.5 py-1.5 capitalize aria-[current=page]:bg-ink aria-[current=page]:text-bg">
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-panel)] border border-line bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-raised text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Venue</th>
                <th className="px-4 py-3 font-medium">Organizer contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listed.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">{e.date}<br /><span className="text-muted">{e.start} - {e.end}</span></td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${e.id}`} className="font-medium text-accent hover:underline">{e.title}</Link>
                    <div className="text-muted">{e.ref}{e.sample ? " (example)" : ""}</div>
                  </td>
                  <td className="px-4 py-3">{venue(e.venueId, e.venueOther)}</td>
                  <td className="px-4 py-3">
                    {e.organizerName}{e.organization ? `, ${e.organization}` : ""}
                    <div className="text-muted">{e.contactEmail}<br />{e.contactPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${e.status === "confirmed" ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={setEventStatus}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="status" value={e.status === "confirmed" ? "cancelled" : "confirmed"} />
                      <button className="rounded-full border border-line px-3 py-1 hover:border-ink/40">{e.status === "confirmed" ? "Cancel" : "Reinstate"}</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!listed.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No reservations here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { EventEditForm } from "@/components/admin/EventEditForm";
import { deleteEvent } from "@/app/admin/actions";
import { currentAdmin } from "@/lib/auth";
import { read } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const { id } = await params;
  const e = (await read()).events.find((x) => x.id === id);
  if (!e) notFound();
  return (
    <AdminShell user={user} active="/admin">
      <Link href="/admin" className="text-sm text-accent hover:underline">Back to reservations</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{e.title}</h1>
          <p className="mt-1 text-muted">
            {e.ref}. Submitted {new Date(e.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Beirut" })}.
            {e.expectedAttendance ? ` Expected attendance: ${e.expectedAttendance}.` : ""}
            {!e.consentContact ? " Organizer did not consent to be contacted." : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {e.status === "confirmed" && (
            <Link href={`/en/events/${e.slug}`} className="rounded-full border border-line px-4 py-2 text-sm">Public page</Link>
          )}
          {e.attachment && (
            <a href={`/api/uploads/${e.attachment}`} className="rounded-full border border-line px-4 py-2 text-sm">Attached file</a>
          )}
        </div>
      </div>
      <EventEditForm event={e} />
      <form action={deleteEvent} className="mt-12 border-t border-line pt-8">
        <input type="hidden" name="id" value={e.id} />
        <p className="text-sm text-muted">Deleting removes the reservation permanently. To keep a record, cancel it instead.</p>
        <button className="mt-3 rounded-full border border-danger px-4 py-2 text-sm text-danger hover:bg-danger-soft">Delete reservation</button>
      </form>
    </AdminShell>
  );
}

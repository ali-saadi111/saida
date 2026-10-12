"use client";

import { useActionState } from "react";
import { saveEvent, type EventEditState } from "@/app/admin/actions";
import { AUDIENCES, CATEGORIES, LANGUAGES, VENUES } from "@/lib/config";
import { en } from "@/lib/dictionaries/en";
import type { EventRecord } from "@/lib/types";
import { btn } from "@/lib/ui";



export function EventEditForm({ event: e }: { event: EventRecord }) {
  const [state, action, pending] = useActionState<EventEditState, FormData>(saveEvent, {});
  const err = (k: string) => {
    const code = state.errors?.[k as keyof NonNullable<EventEditState["errors"]>];
    return code ? <p className="text-sm font-medium text-danger">{en.submit.errors[code]}</p> : null;
  };
  const text = (name: string, label: string, value?: string | number, type = "text") => (
    <label className="grid content-start gap-1.5 text-sm font-medium">
      {label}
      <input name={name} type={type} defaultValue={value ?? ""} className="field" aria-invalid={!!state.errors?.[name as never] || undefined} />
      {err(name)}
    </label>
  );
  const select = (name: string, label: string, value: string, options: { id: string; name: { en: string } }[]) => (
    <label className="grid content-start gap-1.5 text-sm font-medium">
      {label}
      <select name={name} defaultValue={value} className="field">
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name.en}</option>
        ))}
      </select>
      {err(name)}
    </label>
  );
  const area = (name: string, label: string, value?: string, rows = 3) => (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <textarea name={name} rows={rows} defaultValue={value ?? ""} className="field" />
      {err(name)}
    </label>
  );

  return (
    <form action={action} className="mt-8 grid gap-8" key={state.nonce}>
      <input type="hidden" name="id" value={e.id} />
      {state.saved && <p role="status" className="rounded-[var(--radius-field)] bg-ok-soft px-4 py-3 text-ok">Saved. The public page is updated.</p>}
      {state.errors && <p role="alert" className="rounded-[var(--radius-field)] bg-danger-soft px-4 py-3 text-danger">{state.errors.start === "conflict" ? "That time clashes with another confirmed booking." : "Please check the highlighted fields."}</p>}

      <div className="grid gap-5 rounded-[var(--radius-panel)] border border-line bg-surface p-6 md:grid-cols-4">
        {text("date", "Date", e.date, "date")}
        {text("start", "Start (HH:MM)", e.start)}
        {text("end", "End (HH:MM)", e.end)}
        <label className="grid content-start gap-1.5 text-sm font-medium">
          Status
          <select name="status" defaultValue={e.status} className="field">
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        {select("venueId", "Venue", e.venueId, VENUES)}
        <div className="md:col-span-3">{text("venueOther", "Other venue name and address", e.venueOther)}</div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {text("title", "Title", e.title)}
        {text("summary", "Short description", e.summary)}
        <div className="md:col-span-2">{area("description", "Full description", e.description, 6)}</div>
        <div className="grid gap-5 md:col-span-2 md:grid-cols-3">
          {select("category", "Type", e.category, CATEGORIES)}
          {select("audience", "Audience", e.audience, AUDIENCES)}
          {select("language", "Language", e.language, LANGUAGES)}
        </div>
        {text("organizerName", "Organizer name", e.organizerName)}
        {text("organization", "Organization", e.organization)}
        {text("contactEmail", "Email (private)", e.contactEmail, "email")}
        {text("contactPhone", "Phone (private)", e.contactPhone, "tel")}
        {text("cost", "Entry price (empty = free)", e.cost)}
        {text("expectedAttendance", "Expected attendance", e.expectedAttendance)}
        {text("ticketUrl", "Ticket link", e.ticketUrl, "url")}
        {text("website", "Website", e.website, "url")}
        <div className="md:col-span-2">{area("accessibility", "Accessibility", e.accessibility)}</div>
        <label className="flex items-center gap-3 text-sm md:col-span-2">
          <input type="checkbox" name="consentPublish" defaultChecked={e.consentPublish} className="h-5 w-5 accent-[var(--accent)]" />
          Show on the public website (organizer consent to publish)
        </label>
        <input type="hidden" name="consentContact" value={e.consentContact ? "on" : ""} />
      </div>
      <div>
        <button disabled={pending} className={btn.primary}>{pending ? "Saving" : "Save changes"}</button>
      </div>
    </form>
  );
}

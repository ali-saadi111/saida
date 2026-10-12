"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { WarningCircle, LockSimple } from "@phosphor-icons/react";
import { submitEvent, type SubmitState } from "@/app/[locale]/submit/actions";
import { AUDIENCES, CATEGORIES, DAY_CLOSES, DAY_OPENS, LANGUAGES, PROGRAMME_END, PROGRAMME_START, SLOT_STEP_MIN, VENUES, type BookingRule } from "@/lib/config";
import { overlaps, toMinutes } from "@/lib/booking";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import type { EventInput } from "@/lib/validate";
import { btn } from "@/lib/ui";

type Busy = { rule: BookingRule; wholeDay: boolean; ranges: { start: string; end: string }[] };

const times = (() => {
  const out: string[] = [];
  for (let m = toMinutes(DAY_OPENS); m <= toMinutes(DAY_CLOSES); m += SLOT_STEP_MIN) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
})();

function Field({
  id, label, error, help, optional, t, children,
}: { id: string; label: string; error?: string; help?: string; optional?: boolean; t: Dictionary; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-2">
      <label htmlFor={id} className="font-medium">
        {label}
        {optional && <span className="ms-2 text-sm font-normal text-muted">({t.common.optional})</span>}
      </label>
      {children}
      {help && <p id={`${id}-help`} className="text-sm text-muted">{help}</p>}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitForm({ locale, t, rule }: { locale: Locale; t: Dictionary; rule: BookingRule }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitEvent, {});
  const v: Partial<EventInput> = state.values ?? {};
  const err = (k: keyof EventInput | "file") => (state.errors?.[k] ? t.submit.errors[state.errors[k]!] : undefined);
  const errorRef = useRef<HTMLDivElement>(null);

  const [date, setDate] = useState(v.date ?? "");
  const [venueId, setVenueId] = useState(v.venueId ?? "");
  const [start, setStart] = useState(v.start ?? "");
  const [end, setEnd] = useState(v.end ?? "");
  const [busy, setBusy] = useState<Busy | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (state.errors && Object.keys(state.errors).length) errorRef.current?.focus();
    // Refresh availability after a conflict so the new booking shows up.
    if (state.errors?.start === "conflict") setRefresh((n) => n + 1);
  }, [state.nonce, state.errors]);

  useEffect(() => {
    if (!date || !venueId) {
      setBusy(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setLoadError(false);
    fetch(`/api/availability?date=${date}&venue=${venueId}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((b: Busy) => setBusy(b))
      .catch((e) => {
        if (e?.name !== "AbortError") setLoadError(true);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [date, venueId, refresh]);

  const ranges = useMemo(() => (venueId === "other" && rule !== "day" ? [] : busy?.ranges ?? []), [busy, venueId, rule]);
  const dayTaken = !!busy?.wholeDay && !(venueId === "other" && rule !== "day");
  const startBlocked = (s: string) => ranges.some((r) => toMinutes(s) >= toMinutes(r.start) && toMinutes(s) < toMinutes(r.end));
  const endBlocked = (e: string) => !start || toMinutes(e) <= toMinutes(start) || ranges.some((r) => overlaps(start, e, r.start, r.end));
  const selectionClashes = !!start && !!end && ranges.some((r) => overlaps(start, end, r.start, r.end));

  const span = toMinutes(DAY_CLOSES) - toMinutes(DAY_OPENS);
  const pct = (hhmm: string) => ((toMinutes(hhmm) - toMinutes(DAY_OPENS)) / span) * 100;
  const ruleText = rule === "day" ? t.submit.ruleDay : rule === "venue-day" ? t.submit.ruleVenueDay : t.submit.ruleSlot;
  const errorCount = Object.keys(state.errors ?? {}).length;

  const describedBy = (id: string, help?: boolean) =>
    [help ? `${id}-help` : "", state.errors?.[id as keyof EventInput] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  const input = (id: keyof EventInput, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, help?: boolean) => (
    <input
      id={id}
      name={id}
      defaultValue={String(v[id] ?? "")}
      aria-invalid={!!state.errors?.[id] || undefined}
      aria-describedby={describedBy(id, help)}
      className="field"
      {...extra}
    />
  );

  const section = "grid gap-6 border-t border-line pt-10 md:grid-cols-[14rem_1fr] md:gap-10";
  const sectionTitle = "text-lg font-semibold";

  return (
    <form action={action} key={state.nonce} noValidate className="space-y-10">
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {errorCount > 0 && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="flex items-start gap-3 rounded-[var(--radius-field)] bg-danger-soft px-5 py-4 text-danger">
          <WarningCircle size={22} weight="fill" className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="font-medium">{state.errors?.start === "conflict" ? t.submit.errors.conflict : t.submit.errorsTitle}</p>
        </div>
      )}

      {/* Date and venue with live availability */}
      <fieldset className={section}>
        <legend className="contents">
          <span className={sectionTitle}>{t.submit.sectionWhen}</span>
        </legend>
        <div className="grid gap-6">
          <p className="text-muted">{ruleText}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="date" label={t.submit.date} error={err("date")} t={t}>
              <input
                id="date" name="date" type="date" required min={PROGRAMME_START} max={PROGRAMME_END}
                value={date} onChange={(e) => setDate(e.target.value)}
                aria-invalid={!!state.errors?.date || undefined} aria-describedby={describedBy("date")} className="field"
              />
            </Field>
            <Field id="venueId" label={t.submit.venue} error={err("venueId")} help={t.submit.venueHelp} t={t}>
              <select
                id="venueId" name="venueId" required value={venueId} onChange={(e) => setVenueId(e.target.value)}
                aria-invalid={!!state.errors?.venueId || undefined} aria-describedby={describedBy("venueId", true)} className="field"
              >
                <option value="" disabled>{" "}</option>
                {VENUES.map((x) => (
                  <option key={x.id} value={x.id}>{x.name[locale]}</option>
                ))}
              </select>
            </Field>
          </div>

          {venueId === "other" && (
            <Field id="venueOther" label={t.submit.venueOther} error={err("venueOther")} t={t}>
              {input("venueOther", { required: true, maxLength: 200 })}
            </Field>
          )}

          {/* Availability strip */}
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-5" aria-live="polite">
            <p className="text-sm font-medium">{t.submit.availability}</p>
            {!date || !venueId ? (
              <p className="mt-2 text-sm text-muted">{t.submit.availabilityPick}</p>
            ) : loading ? (
              <div className="mt-3 h-9 animate-pulse rounded-full bg-raised motion-reduce:animate-none" aria-label={t.submit.availabilityLoading} />
            ) : loadError ? (
              <p className="mt-2 text-sm text-muted">{t.submit.availabilityError}</p>
            ) : dayTaken ? (
              <p className="mt-2 font-medium text-danger">{t.submit.availabilityDayTaken}</p>
            ) : (
              <>
                <div className="relative mt-3 h-9 overflow-hidden rounded-full bg-ok-soft" dir="ltr">
                  {ranges.map((r) => (
                    <div
                      key={r.start}
                      className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,var(--danger)_0_6px,transparent_6px_12px)] opacity-60"
                      style={{ left: `${pct(r.start)}%`, width: `${pct(r.end) - pct(r.start)}%` }}
                      title={`${t.submit.availabilityBooked} ${r.start} - ${r.end}`}
                    />
                  ))}
                  {start && end && toMinutes(end) > toMinutes(start) && (
                    <div
                      className={`absolute inset-y-1 rounded-full border-2 ${selectionClashes ? "border-danger" : "border-accent bg-accent/25"}`}
                      style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
                    />
                  )}
                </div>
                <div className="mt-1.5 flex justify-between text-xs tabular-nums text-muted" dir="ltr">
                  <span>{DAY_OPENS}</span><span>13:00</span><span>18:00</span><span>{DAY_CLOSES}</span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {venueId === "other"
                    ? t.submit.otherVenueNote
                    : ranges.length === 0
                      ? t.submit.availabilityFree
                      : <>{t.submit.availabilityBooked}: <span dir="ltr" className="tabular-nums">{ranges.map((r) => `${r.start} - ${r.end}`).join(", ")}</span></>}
                </p>
              </>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="start" label={t.submit.start} error={err("start")} t={t}>
              <select
                id="start" name="start" required value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (end && toMinutes(end) <= toMinutes(e.target.value)) setEnd("");
                }}
                aria-invalid={!!state.errors?.start || undefined} aria-describedby={describedBy("start")} className="field tabular-nums" dir="ltr"
              >
                <option value="" disabled>--:--</option>
                {times.slice(0, -1).map((x) => (
                  <option key={x} value={x} disabled={dayTaken || startBlocked(x)}>{x}</option>
                ))}
              </select>
            </Field>
            <Field id="end" label={t.submit.end} error={err("end")} t={t}>
              <select
                id="end" name="end" required value={end} onChange={(e) => setEnd(e.target.value)}
                aria-invalid={!!state.errors?.end || undefined} aria-describedby={describedBy("end")} className="field tabular-nums" dir="ltr"
              >
                <option value="" disabled>--:--</option>
                {times.slice(1).map((x) => (
                  <option key={x} value={x} disabled={dayTaken || endBlocked(x)}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          {selectionClashes && <p className="text-sm font-medium text-danger">{t.submit.slotTaken}</p>}
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="contents"><span className={sectionTitle}>{t.submit.sectionEvent}</span></legend>
        <div className="grid gap-6">
          <Field id="title" label={t.submit.eventTitle} error={err("title")} t={t}>
            {input("title", { required: true, maxLength: 120 })}
          </Field>
          <Field id="summary" label={t.submit.summary} error={err("summary")} help={t.submit.summaryHelp} t={t}>
            {input("summary", { required: true, maxLength: 200 }, true)}
          </Field>
          <Field id="description" label={t.submit.description} error={err("description")} t={t}>
            <textarea
              id="description" name="description" required rows={6} maxLength={4000} defaultValue={v.description ?? ""}
              aria-invalid={!!state.errors?.description || undefined} aria-describedby={describedBy("description")} className="field"
            />
          </Field>
          <div className="grid gap-6 sm:grid-cols-3">
            {([
              ["category", t.submit.category, CATEGORIES],
              ["audience", t.submit.audience, AUDIENCES],
              ["language", t.submit.language, LANGUAGES],
            ] as const).map(([id, label, options]) => (
              <Field key={id} id={id} label={label} error={err(id)} t={t}>
                <select id={id} name={id} required defaultValue={String(v[id] ?? "")} aria-invalid={!!state.errors?.[id] || undefined} aria-describedby={describedBy(id)} className="field">
                  <option value="" disabled>{" "}</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>{o.name[locale]}</option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="contents"><span className={sectionTitle}>{t.submit.sectionOrganizer}</span></legend>
        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="organizerName" label={t.submit.organizerName} error={err("organizerName")} t={t}>
              {input("organizerName", { required: true, autoComplete: "name", maxLength: 120 })}
            </Field>
            <Field id="organization" label={t.submit.organization} error={err("organization")} optional t={t}>
              {input("organization", { autoComplete: "organization", maxLength: 120 })}
            </Field>
            <Field id="contactEmail" label={t.submit.email} error={err("contactEmail")} t={t}>
              {input("contactEmail", { type: "email", required: true, autoComplete: "email", dir: "ltr" })}
            </Field>
            <Field id="contactPhone" label={t.submit.phone} error={err("contactPhone")} t={t}>
              {input("contactPhone", { type: "tel", required: true, autoComplete: "tel", dir: "ltr" })}
            </Field>
          </div>
          <p className="flex items-start gap-2 text-sm text-muted">
            <LockSimple size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {t.submit.privateNote}
          </p>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="contents"><span className={sectionTitle}>{t.submit.sectionExtra}</span></legend>
        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="expectedAttendance" label={t.submit.attendance} error={err("expectedAttendance")} optional t={t}>
              {input("expectedAttendance", { inputMode: "numeric", pattern: "[0-9]*", dir: "ltr" })}
            </Field>
            <Field id="cost" label={t.submit.cost} error={err("cost")} help={t.submit.costHelp} optional t={t}>
              {input("cost", { maxLength: 60 }, true)}
            </Field>
          </div>
          <Field id="accessibility" label={t.submit.accessibility} error={err("accessibility")} help={t.submit.accessibilityHelp} optional t={t}>
            <textarea id="accessibility" name="accessibility" rows={3} maxLength={600} defaultValue={v.accessibility ?? ""} aria-describedby={describedBy("accessibility", true)} className="field" />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="ticketUrl" label={t.submit.ticketUrl} error={err("ticketUrl")} optional t={t}>
              {input("ticketUrl", { type: "url", inputMode: "url", dir: "ltr", placeholder: "https://" })}
            </Field>
            <Field id="website" label={t.submit.website} error={err("website")} optional t={t}>
              {input("website", { type: "url", inputMode: "url", dir: "ltr", placeholder: "https://" })}
            </Field>
          </div>
          <Field id="file" label={t.submit.file} error={err("file")} help={t.submit.fileHelp} optional t={t}>
            <input
              id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
              aria-describedby={describedBy("file", true)}
              className="field file:me-4 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-1.5 file:text-ink"
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="contents"><span className={sectionTitle}>{t.submit.sectionConsent}</span></legend>
        <div className="grid gap-5">
          {(["consentPublish", "consentContact"] as const).map((id) => (
            <div key={id}>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox" name={id} defaultChecked={!!v[id]} aria-invalid={!!state.errors?.[id] || undefined}
                  aria-describedby={state.errors?.[id] ? `${id}-error` : undefined}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--accent)]"
                />
                <span>{id === "consentPublish" ? t.submit.consentPublish : t.submit.consentContact}</span>
              </label>
              {err(id) && (
                <p id={`${id}-error`} className="ms-8 mt-1 text-sm font-medium text-danger">{err(id)}</p>
              )}
            </div>
          ))}
          <Link href={`/${locale}/privacy`} className={`${btn.quiet} text-sm`}>{t.submit.privacyLink}</Link>
        </div>
      </fieldset>

      <div className="border-t border-line pt-8 md:ps-[16.5rem]">
        <button type="submit" disabled={pending || dayTaken || selectionClashes} className={btn.primary}>
          {pending ? t.submit.sending : t.submit.send}
        </button>
      </div>
    </form>
  );
}

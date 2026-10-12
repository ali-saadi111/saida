"use client";

import { useActionState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { sendContact, type ContactState } from "@/app/[locale]/contact/actions";
import { CONTACT_TOPICS } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { btn } from "@/lib/ui";

export function ContactForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  if (state.ok) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[var(--radius-panel)] bg-ok-soft p-6 text-ink">
        <CheckCircle size={26} weight="fill" className="shrink-0 text-ok" aria-hidden="true" />
        <p className="text-lg">{t.contact.sent}</p>
      </div>
    );
  }
  const v = state.values ?? {};
  const msg = (k: keyof NonNullable<ContactState["errors"]>) => {
    const e = state.errors?.[k];
    return e ? t.submit.errors[e] : undefined;
  };
  const err = (k: keyof NonNullable<ContactState["errors"]>) =>
    msg(k) && (
      <p id={`c-${k}-error`} className="flex items-center gap-1.5 text-sm font-medium text-danger">
        <WarningCircle size={18} weight="fill" aria-hidden="true" /> {msg(k)}
      </p>
    );
  const a11y = (k: keyof NonNullable<ContactState["errors"]>) => ({
    "aria-invalid": !!state.errors?.[k] || undefined,
    "aria-describedby": state.errors?.[k] ? `c-${k}-error` : undefined,
  });

  return (
    <form action={action} key={state.nonce} noValidate className="grid gap-6">
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="c-topic" className="font-medium">{t.contact.topic}</label>
        <select id="c-topic" name="topic" defaultValue={v.topic ?? "event"} className="field" {...a11y("topic")}>
          {CONTACT_TOPICS.map((c) => (
            <option key={c.id} value={c.id}>{c.name[locale]}</option>
          ))}
        </select>
        {err("topic")}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <label htmlFor="c-name" className="font-medium">{t.contact.name}</label>
          <input id="c-name" name="name" autoComplete="name" defaultValue={v.name} className="field" {...a11y("name")} />
          {err("name")}
        </div>
        <div className="grid content-start gap-2">
          <label htmlFor="c-email" className="font-medium">{t.contact.email}</label>
          <input id="c-email" name="email" type="email" autoComplete="email" dir="ltr" defaultValue={v.email} className="field" {...a11y("email")} />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="c-org" className="font-medium">
          {t.contact.organization} <span className="text-sm font-normal text-muted">({t.common.optional})</span>
        </label>
        <input id="c-org" name="organization" autoComplete="organization" defaultValue={v.organization} className="field" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="c-message" className="font-medium">{t.contact.message}</label>
        <textarea id="c-message" name="message" rows={6} maxLength={4000} defaultValue={v.message} className="field" {...a11y("message")} />
        {err("message")}
      </div>
      <p className="text-sm text-muted">{t.contact.privacy}</p>
      <div>
        <button type="submit" disabled={pending} className={btn.primary}>{pending ? t.contact.sending : t.contact.send}</button>
      </div>
    </form>
  );
}

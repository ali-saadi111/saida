"use client";

import { useActionState } from "react";
import { saveNews, type NewsEditState } from "@/app/admin/actions";
import { NEWS_KINDS } from "@/lib/config";
import type { NewsPost } from "@/lib/types";
import { btn } from "@/lib/ui";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Beirut", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function NewsEditForm({ post }: { post?: NewsPost }) {
  const [state, action, pending] = useActionState<NewsEditState, FormData>(saveNews, {});
  const bad = (k: string) => !!state.errors?.[k];
  const field = (name: string, label: string, value: string | undefined, opts: { rtl?: boolean; rows?: number } = {}) => (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {opts.rows ? (
        <textarea name={name} rows={opts.rows} defaultValue={value} dir={opts.rtl ? "rtl" : "ltr"} lang={opts.rtl ? "ar" : "en"} className="field" aria-invalid={bad(name) || undefined} />
      ) : (
        <input name={name} defaultValue={value} dir={opts.rtl ? "rtl" : "ltr"} lang={opts.rtl ? "ar" : "en"} className="field" aria-invalid={bad(name) || undefined} />
      )}
      {bad(name) && <span className="text-danger">Required.</span>}
    </label>
  );
  return (
    <form action={action} key={state.nonce} className="mt-8 grid gap-8">
      {post && <input type="hidden" name="id" value={post.id} />}
      {state.errors && <p role="alert" className="rounded-[var(--radius-field)] bg-danger-soft px-4 py-3 text-danger">Both languages are required for every field.</p>}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Type
          <select name="kind" defaultValue={post?.kind ?? "announcement"} className="field">
            {NEWS_KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.name.en}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Publish at (Beirut time). A future time schedules the post.
          <input type="datetime-local" name="publishAt" defaultValue={toLocalInput(post?.publishAt ?? new Date().toISOString())} className="field" aria-invalid={bad("publishAt") || undefined} />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {field("titleEn", "Title (English)", post?.title.en)}
        {field("titleAr", "العنوان (عربي)", post?.title.ar, { rtl: true })}
        {field("excerptEn", "Excerpt (English)", post?.excerpt.en, { rows: 2 })}
        {field("excerptAr", "الملخص (عربي)", post?.excerpt.ar, { rtl: true, rows: 2 })}
        {field("bodyEn", "Body (English). Blank line between paragraphs.", post?.body.en, { rows: 10 })}
        {field("bodyAr", "النص (عربي). سطر فارغ بين الفقرات.", post?.body.ar, { rtl: true, rows: 10 })}
      </div>
      <div>
        <button disabled={pending} className={btn.primary}>{pending ? "Saving" : "Save post"}</button>
      </div>
    </form>
  );
}

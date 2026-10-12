"use server";

import { CONTACT_TOPICS } from "@/lib/config";
import { newId, transact } from "@/lib/db";
import { sendMail, teamInbox } from "@/lib/mail";
import type { ContactTopicId } from "@/lib/types";
import { isEmail } from "@/lib/validate";

export interface ContactState {
  ok?: boolean;
  errors?: Partial<Record<"name" | "email" | "message" | "topic", "required" | "email" | "tooLong">>;
  values?: Record<string, string>;
  nonce?: number;
}

export async function sendContact(_: ContactState, fd: FormData): Promise<ContactState> {
  const v = Object.fromEntries(["topic", "name", "email", "organization", "message"].map((k) => [k, String(fd.get(k) ?? "").trim()]));
  if (String(fd.get("company_website") ?? "")) return { ok: true };
  const errors: ContactState["errors"] = {};
  if (!CONTACT_TOPICS.some((c) => c.id === v.topic)) errors.topic = "required";
  if (!v.name) errors.name = "required";
  if (!v.email) errors.email = "required";
  else if (!isEmail(v.email)) errors.email = "email";
  if (!v.message) errors.message = "required";
  else if (v.message.length > 4000) errors.message = "tooLong";
  if (Object.keys(errors).length) return { errors, values: v, nonce: Date.now() };

  await transact((db) => {
    db.messages.push({
      id: newId(),
      topic: v.topic as ContactTopicId,
      name: v.name,
      email: v.email,
      organization: v.organization || undefined,
      message: v.message,
      createdAt: new Date().toISOString(),
    });
  });
  const team = teamInbox();
  if (team) {
    await sendMail({ to: team, replyTo: v.email, subject: `Website message (${v.topic}) from ${v.name}`, text: `${v.name}${v.organization ? `, ${v.organization}` : ""}\n${v.email}\n\n${v.message}` });
  }
  return { ok: true };
}

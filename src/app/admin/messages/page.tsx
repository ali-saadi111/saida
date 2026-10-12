import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { currentAdmin } from "@/lib/auth";
import { CONTACT_TOPICS } from "@/lib/config";
import { read } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Messages() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const messages = [...(await read()).messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <AdminShell user={user} active="/admin/messages">
      <h1 className="text-3xl font-semibold">Messages</h1>
      <ul className="mt-8 space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="rounded-[var(--radius-panel)] border border-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                {m.name}{m.organization ? `, ${m.organization}` : ""} <a className="ms-2 text-accent hover:underline" href={`mailto:${m.email}`}>{m.email}</a>
              </p>
              <p className="text-sm text-muted">
                {CONTACT_TOPICS.find((t) => t.id === m.topic)?.name.en}, {new Date(m.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Beirut" })}
              </p>
            </div>
            <p className="mt-3 whitespace-pre-line">{m.message}</p>
          </li>
        ))}
        {!messages.length && <li className="text-muted">No messages yet.</li>}
      </ul>
    </AdminShell>
  );
}

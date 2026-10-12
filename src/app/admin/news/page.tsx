import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { currentAdmin } from "@/lib/auth";
import { read } from "@/lib/db";
import { btn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminNews() {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const news = [...(await read()).news].sort((a, b) => b.publishAt.localeCompare(a.publishAt));
  const now = Date.now();
  return (
    <AdminShell user={user} active="/admin/news">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">News</h1>
        <Link href="/admin/news/new" className={btn.primary}>New post</Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-[var(--radius-panel)] border border-line bg-surface">
        {news.map((n) => {
          const scheduled = Date.parse(n.publishAt) > now;
          return (
            <li key={n.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/news/${n.id}`} className="font-medium text-accent hover:underline">{n.title.en}</Link>
                <p className="text-sm text-muted" dir="rtl">{n.title.ar}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${scheduled ? "bg-accent-soft" : "bg-ok-soft text-ok"}`}>
                {scheduled ? "Scheduled" : "Published"} {new Date(n.publishAt).toLocaleString("en-GB", { timeZone: "Asia/Beirut", dateStyle: "medium", timeStyle: "short" })}
              </span>
              <span className="text-sm text-muted">{n.author}{n.sample ? " (example)" : ""}</span>
            </li>
          );
        })}
        {!news.length && <li className="px-5 py-10 text-center text-muted">No posts yet.</li>}
      </ul>
    </AdminShell>
  );
}

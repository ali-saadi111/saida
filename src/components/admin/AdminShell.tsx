import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { Mark } from "@/components/Mark";
import { container } from "@/lib/ui";

const TABS = [
  { href: "/admin", label: "Reservations" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminShell({ user, active, children }: { user: string; active: string; children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className={`${container} flex min-h-16 flex-wrap items-center gap-x-6 gap-y-2 py-3`}>
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Mark className="h-7 w-7 text-accent" /> Saida 2027 admin
          </Link>
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active === t.href ? "page" : undefined}
                className="rounded-full px-3.5 py-2 text-sm text-muted hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-ink"
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-4 text-sm">
            <Link href="/en" className="text-muted hover:text-ink">View site</Link>
            <span className="text-muted">{user}</span>
            <form action={logout}>
              <button className="rounded-full border border-line px-3.5 py-1.5 hover:border-ink/40">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className={`${container} py-10`}>{children}</main>
    </>
  );
}

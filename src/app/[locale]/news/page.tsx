import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { NEWS_KINDS } from "@/lib/config";
import { formatIso, getDictionary, pick } from "@/lib/i18n";
import { publishedNews } from "@/lib/news";
import type { Locale } from "@/lib/types";
import { container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.news.title, description: t.news.lead };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const posts = await publishedNews();
  return (
    <>
      <PageHeader title={t.news.title} lead={t.news.lead} />
      <div className={container}>
        {posts.length ? (
          <ol className="border-t border-line">
            {posts.map((n) => (
              <li key={n.id} className="border-b border-line">
                <Link href={`/${locale}/news/${n.slug}`} className="group grid gap-2 py-8 md:grid-cols-[12rem_1fr] md:gap-10">
                  <div className="text-sm text-muted">
                    <time dateTime={n.publishAt}>{formatIso(n.publishAt, locale)}</time>
                    <p className="mt-1 text-accent">{pick(NEWS_KINDS.find((k) => k.id === n.kind)!.name, locale)}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-medium leading-snug text-balance group-hover:text-accent">{pick(n.title, locale)}</h2>
                    <p className="mt-2 max-w-[65ch] text-muted">{pick(n.excerpt, locale)}</p>
                    {n.sample && <span className="mt-3 inline-block rounded-full bg-raised px-2.5 py-0.5 text-xs text-muted">{t.common.sample}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-[var(--radius-panel)] border border-dashed border-line p-12 text-center text-muted">{t.news.empty}</p>
        )}
      </div>
    </>
  );
}

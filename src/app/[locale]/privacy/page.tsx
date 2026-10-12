import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { container } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDictionary(locale).privacy.title };
}

export default async function Privacy({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.privacy.title} />
      <div className={`${container} max-w-3xl space-y-10`}>
        {t.privacy.sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}

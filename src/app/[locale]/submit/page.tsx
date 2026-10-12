import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { SubmitForm } from "@/components/SubmitForm";
import { bookingRule } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.submit.title, description: t.submit.lead };
}

export default async function SubmitPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <div className="relative">
        <PageHeader title={t.submit.title} lead={t.submit.lead} />
      </div>
      <div className={`${container} mb-12`}>
        <div className="relative aspect-[21/6] min-h-40 overflow-hidden rounded-[var(--radius-panel)]">
          <Image src="/images/old-city-street.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
        </div>
      </div>
      <div className={container}>
        <SubmitForm locale={locale} t={t} rule={bookingRule()} />
      </div>
    </>
  );
}

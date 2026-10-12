import type { Metadata } from "next";
import Image from "next/image";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { contactEmail } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { container } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.contact.title, description: t.contact.lead };
}

export default async function Contact({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const email = contactEmail();
  return (
    <>
      <PageHeader title={t.contact.title} lead={t.contact.lead} />
      <div className={`${container} grid gap-12 lg:grid-cols-[1.2fr_1fr]`}>
        <ContactForm locale={locale} t={t} />
        <aside className="space-y-6">
          <div className="rounded-[var(--radius-panel)] bg-surface p-6 shadow-soft">
            <p className="flex items-center gap-2 text-sm text-muted">
              <EnvelopeSimple size={18} aria-hidden="true" /> {t.contact.emailLabel}
            </p>
            {email ? (
              <a href={`mailto:${email}`} className="mt-2 block text-lg font-medium text-accent underline-offset-4 hover:underline" dir="ltr">{email}</a>
            ) : (
              <p className="mt-2 text-muted">{t.contact.emailPending}</p>
            )}
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[var(--radius-panel)] lg:block">
            <Image src="/images/old-city-square.jpg" alt="" fill sizes="40vw" className="object-cover" />
          </div>
        </aside>
      </div>
    </>
  );
}

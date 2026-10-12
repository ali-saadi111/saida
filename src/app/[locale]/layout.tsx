import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { dir, getDictionary, isLocale } from "@/lib/i18n";
import { siteUrl } from "@/lib/config";
import { container } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.siteName, template: `%s | ${t.meta.siteName}` },
    description: t.meta.description,
    alternates: { languages: { ar: "/ar", en: "/en" } },
    openGraph: {
      siteName: t.meta.siteName,
      locale: locale === "ar" ? "ar_LB" : "en_GB",
      type: "website",
      images: [{ url: "/images/sea-castle-harbour.jpg", width: 1920, height: 1079 }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0a161d" },
  ],
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const showPreview = process.env.SHOW_PREVIEW_NOTICE !== "false";

  return (
    <html lang={locale} dir={dir(locale)}>
      <body className="min-h-[100dvh] antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-accent-ink">
          {t.nav.skip}
        </a>
        {showPreview && (
          <div className="bg-accent-soft text-ink">
            <p className={`${container} py-2 text-center text-sm`}>{t.common.sampleNotice}</p>
          </div>
        )}
        <Header locale={locale} t={t} />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}

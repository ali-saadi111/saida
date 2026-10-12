import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { container } from "@/lib/ui";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);
  return { title: t.about.title, description: t.about.lead };
}

const SOURCES = [
  { label: "MCCD: 2027 Mediterranean Capitals of Culture", href: "https://medculturecapital.com/2027-med-capitals-of-culture" },
  { label: "Union for the Mediterranean: Cordoba and Saida endorsed as 2027 capitals", href: "https://ufmsecretariat.org/ufm-foreign-ministers-endorse-cordoba-and-saida-as-2027-mediterranean-capitals-of-culture-and-dialogue-at-10th-regional-forum/" },
  { label: "Union for the Mediterranean: Mediterranean Capitals of Culture and Dialogue", href: "https://ufmsecretariat.org/mediterranean-capitals-of-culture-and-dialogue/" },
];

/** Openly licensed photographs used on this site. */
const CREDITS = [
  { file: "sea-castle-harbour.jpg", title: "Sidon Sea Castle, Mediterranean Sea", author: "Vyacheslav Argenberg", license: "CC BY 4.0", href: "https://commons.wikimedia.org/w/index.php?curid=92766884" },
  { file: "sea-castle.jpg", title: "Sidon Sea Castle", author: "rabiem22", license: "CC BY 2.0", href: "https://www.flickr.com/photos/28490141@N03/7235374856" },
  { file: "khan-al-franj-arch.jpg", title: "Khan al-Franj in Sidon", author: "heatheronhertravels", license: "CC BY 2.0", href: "https://www.flickr.com/photos/22446827@N02/3666959399" },
  { file: "khan-al-franj-courtyard.jpg", title: "Sidon, Khan al-Franj, Hof", author: "liakada-web", license: "CC BY 2.0", href: "https://www.flickr.com/photos/154650255@N03/24807474498" },
  { file: "khan-al-franj-hall.jpg", title: "Sidon, Khan al-Franj, Gewölbehalle", author: "liakada-web", license: "CC BY 2.0", href: "https://www.flickr.com/photos/154650255@N03/26904030489" },
  { file: "old-city-street.jpg", title: "old town Sidon Lebanon", author: "Raini4", license: "Public Domain Mark 1.0", href: "https://www.flickr.com/photos/53106173@N05/6578222533" },
  { file: "old-city-square.jpg", title: "The Souk at Sidon, Lebanon", author: "heatheronhertravels", license: "CC BY 2.0", href: "https://www.flickr.com/photos/22446827@N02/3665217229" },
  { file: "old-city-play.jpg", title: "street football in Sidon", author: "Raini4", license: "Public Domain Mark 1.0", href: "https://www.flickr.com/photos/53106173@N05/6578149401" },
];

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const blocks = [
    { title: t.about.initiativeTitle, body: t.about.initiativeBody },
    { title: t.about.designationTitle, body: t.about.designationBody },
    { title: t.about.cordobaTitle, body: t.about.cordobaBody },
  ];
  return (
    <>
      <PageHeader title={t.about.title} lead={t.about.lead} />

      <section className={`${container} grid gap-10 py-8 lg:grid-cols-[1.2fr_1fr] lg:items-center`}>
        <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-panel)]">
          <Image src="/images/sea-castle.jpg" alt={t.about.castleAlt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.about.themeTitle}</h2>
          <p className="mt-5 max-w-[55ch] text-lg leading-relaxed text-muted">{t.about.themeBody}</p>
        </div>
      </section>

      <section className={`${container} reveal py-16`}>
        <div className="grid gap-12 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr]">
          {blocks.map((b, i) => (
            <div key={b.title} className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
              <h2 className="text-xl font-semibold">{b.title}</h2>
              <p className="mt-3 max-w-[60ch] leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${container} reveal py-16`} aria-labelledby="partners">
        <h2 id="partners" className="text-3xl font-semibold tracking-tight">{t.about.partnersTitle}</h2>
        <p className="mt-3 max-w-[60ch] text-muted">{t.about.partnersNote}</p>
        <dl className="mt-10 grid gap-6 md:grid-cols-3">
          {t.partners.map((p) => (
            <div key={p.role} className="rounded-[var(--radius-panel)] bg-surface p-6 shadow-soft">
              <dt className="text-sm text-accent">{p.role}</dt>
              <dd className="mt-2">
                <p className="text-lg font-medium leading-snug">{p.name}</p>
                <p className="mt-2 text-muted">{p.body}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${container} grid gap-12 py-16 md:grid-cols-2`}>
        <div>
          <h2 className="text-xl font-semibold">{t.about.sources}</h2>
          <ul className="mt-4 space-y-3" dir="ltr">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-4 hover:underline">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div id="credits">
          <h2 className="text-xl font-semibold">{t.about.credits}</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted" dir="ltr">
            {CREDITS.map((c) => (
              <li key={c.file}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ink hover:underline">&ldquo;{c.title}&rdquo;</a> by {c.author}, {c.license}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

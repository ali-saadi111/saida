"use client";

import { useState } from "react";
import { FacebookLogo, LinkSimple, ShareNetwork, WhatsappLogo, XLogo } from "@phosphor-icons/react";
import type { Dictionary } from "@/lib/i18n";

export function ShareBar({ url, title, t }: { url: string; title: string; t: Dictionary }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, label: t.share.whatsapp, Icon: WhatsappLogo },
    { href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, label: t.share.facebook, Icon: FacebookLogo },
    { href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`, label: t.share.x, Icon: XLogo },
  ];
  const item = "flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink/40 hover:text-accent";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button type="button" className={item} aria-label={t.share.native} onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
          <ShareNetwork size={20} />
        </button>
      )}
      {links.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={item}>
          <Icon size={20} />
        </a>
      ))}
      <button
        type="button"
        className={`${item} w-auto gap-2 px-4 text-sm`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        <LinkSimple size={18} aria-hidden="true" />
        <span aria-live="polite">{copied ? t.event.copied : t.event.copyLink}</span>
      </button>
    </div>
  );
}

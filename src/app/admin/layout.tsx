import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = { title: "Admin | MCCD Saida 2027", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-[100dvh] antialiased">{children}</body>
    </html>
  );
}

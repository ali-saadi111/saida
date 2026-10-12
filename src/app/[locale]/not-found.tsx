import Link from "next/link";
import { btn, container } from "@/lib/ui";

// Locale is not available to not-found; show both languages.
export default function NotFound() {
  return (
    <div className={`${container} grid gap-12 py-24 md:grid-cols-2`}>
      <div lang="en" dir="ltr">
        <h1 className="text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted">The page you are looking for does not exist or has moved.</p>
        <Link href="/en" className={`${btn.primary} mt-6`}>Go to the home page</Link>
      </div>
      <div lang="ar" dir="rtl">
        <h2 className="text-4xl font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-3 text-muted">الصفحة التي تبحثون عنها غير موجودة أو نُقلت.</p>
        <Link href="/ar" className={`${btn.primary} mt-6`}>العودة إلى الرئيسية</Link>
      </div>
    </div>
  );
}

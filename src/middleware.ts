import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["ar", "en"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const accept = req.headers.get("accept-language") ?? "";
  const preferred = accept.split(",").map((p) => p.trim().slice(0, 2).toLowerCase());
  const locale = preferred.find((p) => LOCALES.includes(p)) ?? "ar";
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|admin|_next|images|favicon.ico|robots.txt|sitemap.xml|icon|.*\\..*).*)"],
};

import "server-only";
import { read } from "./db";

export async function publishedNews() {
  const db = await read();
  const now = Date.now();
  return db.news
    .filter((n) => Date.parse(n.publishAt) <= now)
    .sort((a, b) => b.publishAt.localeCompare(a.publishAt));
}

export async function newsBySlug(slug: string) {
  return (await publishedNews()).find((n) => n.slug === slug);
}

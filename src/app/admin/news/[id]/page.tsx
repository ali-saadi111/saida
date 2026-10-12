import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewsEditForm } from "@/components/admin/NewsEditForm";
import { deleteNews } from "@/app/admin/actions";
import { currentAdmin } from "@/lib/auth";
import { read } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditNews({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  const { id } = await params;
  const post = id === "new" ? undefined : (await read()).news.find((n) => n.id === id);
  if (id !== "new" && !post) notFound();
  return (
    <AdminShell user={user} active="/admin/news">
      <Link href="/admin/news" className="text-sm text-accent hover:underline">Back to news</Link>
      <h1 className="mt-4 text-3xl font-semibold">{post ? "Edit post" : "New post"}</h1>
      <NewsEditForm post={post} />
      {post && (
        <form action={deleteNews} className="mt-12 border-t border-line pt-8">
          <input type="hidden" name="id" value={post.id} />
          <button className="rounded-full border border-danger px-4 py-2 text-sm text-danger hover:bg-danger-soft">Delete post</button>
        </form>
      )}
    </AdminShell>
  );
}

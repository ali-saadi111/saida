import { redirect } from "next/navigation";
import { adminConfigured, currentAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Mark } from "@/components/Mark";

export const dynamic = "force-dynamic";

export default async function Login() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-sm content-center px-4">
      <Mark className="h-10 w-10 text-accent" />
      <h1 className="mt-4 text-2xl font-semibold">MCCD Saida 2027 team</h1>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="mt-4 text-muted">Admin access is not configured. Set ADMIN_USERS on the server.</p>
      )}
    </main>
  );
}

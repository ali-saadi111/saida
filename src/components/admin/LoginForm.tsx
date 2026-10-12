"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { btn } from "@/lib/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mt-8 grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="user" className="font-medium">Username</label>
        <input id="user" name="user" autoComplete="username" required className="field" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error && <p role="alert" className="text-sm font-medium text-danger">That username and password do not match.</p>}
      <button disabled={pending} className={btn.primary}>{pending ? "Signing in" : "Sign in"}</button>
    </form>
  );
}

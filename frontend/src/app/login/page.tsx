"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PublicFrame } from "@/components/public-shell";
import { useSession } from "@/components/session-provider";
import { Button, Panel, TextField } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 8) {
      setError("Enter a valid email and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signIn({ email, password });
      router.push("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicFrame>
      <div className="mx-auto max-w-md px-6 py-16">
        <Panel>
          <h1 className="font-headline-lg text-headline-lg text-primary">Sign in</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Accounts are stored on this device until the backend provides authentication.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <TextField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <TextField label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error ? <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p> : null}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in" : "Sign in"}</Button>
          </form>
          <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
            No account yet? <Link className="text-secondary hover:underline" href="/signup">Create one</Link>
          </p>
        </Panel>
      </div>
    </PublicFrame>
  );
}

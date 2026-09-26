"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PublicFrame } from "@/components/public-shell";
import { useSession } from "@/components/session-provider";
import { Button, Panel, TextField } from "@/components/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signUp({ name, email, password });
      router.push("/onboarding");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicFrame>
      <div className="mx-auto max-w-md px-6 py-16">
        <Panel>
          <h1 className="font-headline-lg text-headline-lg text-primary">Create an account</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">This session stays on this device. The API does not have a sign-up endpoint yet.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <TextField label="Name" name="name" value={name} onChange={(event) => setName(event.target.value)} required />
            <TextField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <TextField label="Password" name="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <TextField label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
            {error ? <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p> : null}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating account" : "Create account"}</Button>
          </form>
          <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
            Already registered? <Link className="text-secondary hover:underline" href="/login">Sign in</Link>
          </p>
        </Panel>
      </div>
    </PublicFrame>
  );
}

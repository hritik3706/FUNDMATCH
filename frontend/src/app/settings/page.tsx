"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { PageHeader } from "@/components/ui";
import { notificationPreferences, saveNotificationPreferences, type NotificationPreferences } from "@/services/accountService";

type Editor = "name" | "email" | "password" | null;

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, updateAccount, changePassword } = useSession();
  const [editor, setEditor] = useState<Editor>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    schemeUpdates: true,
    deadlineReminders: true,
    applicationUpdates: true,
  });

  useEffect(() => {
    setPrefs(notificationPreferences());
  }, []);

  function openEditor(next: Editor) {
    setError("");
    setMessage("");
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setCurrentPassword("");
    setNextPassword("");
    setEditor(next);
  }

  function togglePref(key: keyof NotificationPreferences) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(saveNotificationPreferences(next));
  }

  async function saveAccount(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editor === "name") await updateAccount({ name });
      if (editor === "email") {
        if (!email.includes("@")) throw new Error("Enter a valid email.");
        await updateAccount({ email });
      }
      setEditor(null);
      setMessage("Account updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The account could not be updated.");
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await changePassword({ currentPassword, nextPassword });
      setEditor(null);
      setMessage("Password updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The password could not be changed.");
    }
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Settings" title="Settings" />
      <div className="mx-auto max-w-xl space-y-4">
        {message ? <p className="font-body-sm text-body-sm text-secondary">{message}</p> : null}
        {error ? <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p> : null}

        <Section title="Account">
          {editor === "name" ? (
            <EditorRow label="Name" onSubmit={saveAccount} onCancel={() => setEditor(null)}>
              <Field name="name" value={name} onChange={setName} autoComplete="name" />
            </EditorRow>
          ) : (
            <Row label="Name" value={user?.name ?? "Not provided"} action="Edit" onAction={() => openEditor("name")} />
          )}
          {editor === "email" ? (
            <EditorRow label="Email" onSubmit={saveAccount} onCancel={() => setEditor(null)}>
              <Field name="email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            </EditorRow>
          ) : (
            <Row label="Email" value={user?.email ?? "Not provided"} action="Edit" onAction={() => openEditor("email")} />
          )}
          <Row label="Password" value="••••••••" action="Change" onAction={() => openEditor("password")} />
        </Section>

        <Section title="Startup">
          <LinkRow href="/startup" label="Startup profile" />
          <LinkRow href="/onboarding/classification" label="Classification" />
        </Section>

        <Section title="Notifications">
          <ToggleRow label="Scheme updates" on={prefs.schemeUpdates} onToggle={() => togglePref("schemeUpdates")} />
          <ToggleRow label="Deadline reminders" on={prefs.deadlineReminders} onToggle={() => togglePref("deadlineReminders")} />
          <ToggleRow label="Application updates" on={prefs.applicationUpdates} onToggle={() => togglePref("applicationUpdates")} />
        </Section>

        <Section title="Preferences">
          <Row label="Language" value="English" />
        </Section>

        <Section title="Security">
          {editor === "password" ? (
            <form className="space-y-2 px-4 py-3" onSubmit={savePassword}>
              <Field name="currentPassword" type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" placeholder="Current password" />
              <Field name="nextPassword" type="password" value={nextPassword} onChange={setNextPassword} autoComplete="new-password" placeholder="New password" />
              <div className="flex justify-end gap-3">
                <button type="button" className="font-label-lg text-label-lg text-on-surface-variant" onClick={() => setEditor(null)}>Cancel</button>
                <button type="submit" className="font-label-lg text-label-lg text-secondary">Save</button>
              </div>
            </form>
          ) : (
            <Row label="Change password" action="Change" onAction={() => openEditor("password")} />
          )}
          <Row
            label="Sign out"
            action="Sign out"
            onAction={() => {
              signOut();
              router.push("/login");
            }}
          />
        </Section>

        <Section title="Privacy">
          <Row label="Account data" value="On this device" />
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-surface-container-lowest">
      <h2 className="border-b border-[#e2e8f0] px-4 py-2 font-label-lg text-label-lg text-primary">{title}</h2>
      <div className="divide-y divide-[#e2e8f0]">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  action,
  onAction,
}: {
  label: string;
  value?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="font-body-md text-body-md text-on-surface">{label}</span>
      <span className="flex items-center gap-3">
        {value ? <span className="max-w-[14rem] truncate text-right font-body-sm text-body-sm text-on-surface-variant">{value}</span> : null}
        {action ? (
          <button type="button" className="font-label-lg text-label-lg text-secondary" onClick={onAction}>
            {action}
          </button>
        ) : null}
      </span>
    </div>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 px-4 py-2.5 font-body-md text-body-md text-on-surface hover:bg-surface-container-low">
      {label}
      <span className="text-on-surface-variant">→</span>
    </Link>
  );
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="font-body-md text-body-md text-on-surface">{label}</span>
      <button type="button" aria-pressed={on} className={`font-label-md text-label-md ${on ? "text-secondary" : "text-on-surface-variant"}`} onClick={onToggle}>
        {on ? "ON" : "OFF"}
      </button>
    </div>
  );
}

function EditorRow({
  label,
  children,
  onSubmit,
  onCancel,
}: {
  label: string;
  children: ReactNode;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form className="flex items-center justify-between gap-3 px-4 py-2" onSubmit={onSubmit}>
      <span className="font-body-md text-body-md text-on-surface">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        {children}
        <button type="submit" className="font-label-lg text-label-lg text-secondary">Save</button>
        <button type="button" className="font-label-lg text-label-lg text-on-surface-variant" onClick={onCancel}>Cancel</button>
      </span>
    </form>
  );
}

function Field({
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-40 rounded border border-outline-variant bg-surface-container-lowest px-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-secondary"
    />
  );
}

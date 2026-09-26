"use client";

import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { PageHeader, Panel } from "@/components/ui";

export default function SettingsPage() {
  const { user } = useSession();
  return (
    <AppShell>
      <PageHeader eyebrow="Settings" title="Account settings" description="Only settings this client can actually keep are shown. There is no backend settings API." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-headline-sm text-headline-sm text-primary">Account</h2>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Name: {user?.name ?? "Not provided"}</p>
          <p className="font-body-md text-body-md text-on-surface-variant">Email: {user?.email ?? "Not provided"}</p>
        </Panel>
        <Panel>
          <h2 className="font-headline-sm text-headline-sm text-primary">Language</h2>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">English is the only language this interface ships.</p>
        </Panel>
        <Panel>
          <h2 className="font-headline-sm text-headline-sm text-primary">Notifications</h2>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Session notices stay in the notifications list on this device.</p>
        </Panel>
        <Panel>
          <h2 className="font-headline-sm text-headline-sm text-primary">Privacy and security</h2>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Passwords are hashed in local storage and are not sent to the API. Do not use this as production authentication.</p>
        </Panel>
      </div>
    </AppShell>
  );
}

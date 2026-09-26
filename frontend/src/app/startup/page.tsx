"use client";

import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, Panel, StateMessage } from "@/components/ui";
import { useSession } from "@/components/session-provider";
import { notProvided } from "@/lib/format";

export default function StartupPage() {
  const { profile, story, ready } = useSession();
  const fields = profile
    ? [profile.name, profile.sector, profile.stage, profile.location, profile.founderExperience, profile.gstStatus, profile.incorporationDate].filter(Boolean).length
    : 0;
  const completion = profile ? Math.round((fields / 7) * 100) : 0;

  return (
    <AppShell>
      <PageHeader eyebrow="Startup" title="Startup profile" description="Editing creates a new API profile record. Fields the service does not return stay not provided." />
      {!ready ? <StateMessage title="Loading profile" body="Reading the saved session." /> : null}
      {ready && profile ? (
        <Panel className="mb-6">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Profile completion</p>
          <p className="font-headline-lg text-headline-lg text-primary">{completion}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full bg-secondary" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Future plans: {notProvided(story.futureIntent)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Documents: Not provided</p>
        </Panel>
      ) : null}
      {ready ? (
        <Panel>
          <ProfileForm initial={profile} submitLabel="Update profile" />
        </Panel>
      ) : null}
    </AppShell>
  );
}

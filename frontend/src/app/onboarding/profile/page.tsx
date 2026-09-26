"use client";

import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, Panel } from "@/components/ui";
import { useSession } from "@/components/session-provider";
import { notProvided } from "@/lib/format";

export default function ProfileReviewPage() {
  const { story, profile } = useSession();
  return (
    <AppShell>
      <PageHeader eyebrow="Profile review" title="Confirm the extracted profile" description="Fields the API has not stored are marked not provided. Edit anything before saving." />
      <Panel className="mb-6">
        <h2 className="font-headline-sm text-headline-sm text-primary">Story on file</h2>
        <p className="mt-2 whitespace-pre-wrap font-body-md text-body-md text-on-surface-variant">{notProvided(story.text)}</p>
      </Panel>
      <Panel>
        <ProfileForm initial={profile} submitLabel="Save profile" />
      </Panel>
    </AppShell>
  );
}

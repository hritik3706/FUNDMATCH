"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, Panel, StateMessage } from "@/components/ui";
import { useSession } from "@/components/session-provider";
import { notProvided } from "@/lib/format";
import { readJson } from "@/lib/storage";

export default function StartupPage() {
  const { profile, story, ready } = useSession();
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    const saved = readJson<{ name: string }[]>("ps41.documents", []);
    setDocuments(saved.map((item) => item.name).filter(Boolean));
  }, [ready, profile?.id]);
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
          <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Product: {notProvided(story.subSector)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Purpose: {notProvided(story.fundingPurpose)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Technology: {notProvided(story.technology)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">GST: {notProvided(story.gstLabel ?? profile.gstStatus)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Udyam: {notProvided(story.udyamLabel)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Revenue: {notProvided(story.revenueLabel)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Future plans: {notProvided(story.futureIntent)}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Documents: {documents.length ? documents.join(", ") : "Not provided"}</p>
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

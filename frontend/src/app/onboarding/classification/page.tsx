"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import { notProvided } from "@/lib/format";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e2e8f0] py-3 last:border-b-0">
      <dt className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{label}</dt>
      <dd className="text-right font-body-md text-body-md text-primary">{value}</dd>
    </div>
  );
}

export default function ClassificationPage() {
  const { profile, story } = useSession();
  return (
    <AppShell>
      <PageHeader eyebrow="Classification" title="Current state and future intent" description="Current state is the profile stored by the API. Future intent is only what you wrote. Nothing else is inferred." />
      {!profile ? (
        <StateMessage title="Profile not saved" body="Save a startup profile before classification can be shown." action={<Link href="/onboarding/profile"><Button>Review profile</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Current state</p>
            <dl className="mt-2">
              <Row label="Startup" value={profile.name} />
              <Row label="Primary sector" value={profile.sector} />
              <Row label="Sub-sector" value="Not provided" />
              <Row label="Stage" value={profile.stage} />
              <Row label="Funding need" value={String(profile.fundingNeeded)} />
              <Row label="Geography" value={profile.location} />
              <Row label="Founder experience" value={profile.founderExperience} />
              <Row label="DPIIT" value={profile.dpiitRegistration ? "Yes" : "Not provided"} />
            </dl>
          </Panel>
          <Panel>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-tertiary-container">Future intent</p>
            <dl className="mt-2">
              <Row label="Stated intent" value={notProvided(story.futureIntent)} />
              <Row label="Target sector" value="Not provided" />
              <Row label="Target stage" value="Not provided" />
              <Row label="Technology" value="Not provided" />
            </dl>
            <Link href="/dashboard" className="mt-6 inline-flex"><Button>Open dashboard</Button></Link>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}

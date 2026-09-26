"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import { formatInr, storedToInr } from "@/lib/extractStory";
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
  const { profile, story, ready } = useSession();
  return (
    <AppShell>
      <PageHeader eyebrow="Profile" title="Your startup profile" description="These are the fields saved from your story. Open the dashboard to score them against the catalogue." />
      {!ready ? null : !profile ? (
        <StateMessage title="Profile not saved" body="Save a startup profile before this page can be shown." action={<Link href="/onboarding/profile"><Button>Review profile</Button></Link>} />
      ) : (
        <Panel>
          <dl>
            <Row label="Startup" value={profile.name} />
            <Row label="Product" value={notProvided(story.subSector)} />
            <Row label="Website" value={notProvided(profile.websiteUrl)} />
            <Row label="Sector" value={profile.sector} />
            <Row label="Technology" value={notProvided(story.technology)} />
            <Row label="Stage" value={profile.stage} />
            <Row label="Funding need" value={formatInr(story.fundingInr || storedToInr(profile.fundingNeeded))} />
            <Row label="Purpose" value={notProvided(story.fundingPurpose)} />
            <Row label="Location" value={[story.city, profile.location].filter(Boolean).join(", ")} />
            <Row label="Entity" value={notProvided(story.entityType)} />
            <Row label="GST" value={notProvided(story.gstLabel ?? profile.gstStatus)} />
            <Row label="DPIIT" value={story.dpiitLabel ?? (profile.dpiitRegistration ? "Recognised" : "Not recognised")} />
            <Row label="Udyam" value={notProvided(story.udyamLabel)} />
            <Row label="Revenue" value={notProvided(story.revenueLabel)} />
            <Row label="Founder experience" value={profile.founderExperience} />
            <Row label="Previous funding" value={profile.previousFunding ? formatInr(storedToInr(profile.previousFunding)) : "Not provided"} />
          </dl>
          <Link href="/dashboard" className="mt-6 inline-flex"><Button>Open dashboard</Button></Link>
        </Panel>
      )}
    </AppShell>
  );
}

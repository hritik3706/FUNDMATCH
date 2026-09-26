"use client";

import { useMemo, useState } from "react";
import { AdvisorComposer, AdvisorMessage, AdvisorTyping, AdvisorWelcome, useAdvisorChat } from "@/components/advisor-chat";
import { PublicHeader } from "@/components/public-shell";
import { Icon } from "@/components/ui";
import type { AdvisorDraft } from "@/services/advisorService";

export default function AdvisorPage() {
  const { bubbles, profile, busy, status, submit, hydrated } = useAdvisorChat();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
        <section className="flex min-h-[70vh] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm lg:h-[calc(100vh-7.5rem)]">
          <header className="border-b border-outline-variant px-5 py-4">
            <p className="font-label-md text-label-md uppercase tracking-wider text-secondary">FundMatch AI</p>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Startup Funding Advisor</h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Describe the startup in your own words. The advisor fills the profile, then the catalogue scores real schemes.
            </p>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {hydrated && bubbles.length === 0 ? <AdvisorWelcome onPick={(text) => void submit(text)} /> : null}
            {bubbles.map((bubble) => (
              <AdvisorMessage key={bubble.id} bubble={bubble} onConfirm={(text) => void submit(text)} />
            ))}
            {busy ? <AdvisorTyping status={status} /> : null}
          </div>
          <AdvisorComposer id="advisor-message" />
        </section>
        <ProfilePanel profile={profile} open={profileOpen} busy={busy} onToggle={() => setProfileOpen((value) => !value)} />
      </div>
    </div>
  );
}

function completeness(profile: AdvisorDraft): number {
  const checks = [
    profile.sector,
    profile.stage,
    profile.location,
    profile.fundingNeeded,
    profile.dpiitRegistration !== null || profile.gstStatus,
    profile.fundingPurpose,
    profile.technology,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function summary(profile: AdvisorDraft): string {
  if (!profile.sector) return "Describe the startup and I will fill this profile.";
  const place = [profile.city, profile.location].filter(Boolean).join(", ");
  return `${profile.stage ?? "A"} ${profile.sector} startup${place ? ` in ${place}` : ""}${profile.fundingNeeded ? `, seeking Rs ${profile.fundingNeeded} lakh` : ""}.`;
}

function ProfilePanel({
  profile,
  open,
  busy,
  onToggle,
}: {
  profile: AdvisorDraft;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const rows = useMemo(
    () => [
      ["Sector", profile.sector],
      ["Technology", profile.technology],
      ["Location", [profile.city, profile.location].filter(Boolean).join(", ") || null],
      ["Stage", profile.stage],
      ["Purpose", profile.fundingPurpose],
      ["Funding need", profile.fundingNeeded ? `Rs ${profile.fundingNeeded} lakh` : null],
      ["Team", profile.founderCount ? `${profile.founderCount} founders` : null],
      ["GST", profile.gstApplicable === false ? "Not required" : profile.gstStatus],
      ["DPIIT", profile.dpiitRegistration === null ? null : profile.dpiitRegistration ? "Recognised" : "Not recognised"],
      ["Udyam", profile.udyamRegistered === null ? null : profile.udyamRegistered ? "Registered" : "Not registered"],
      ["Incorporation", profile.incorporationStatus || profile.incorporationDate],
    ],
    [profile],
  );

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <button type="button" onClick={onToggle} className="mb-2 flex w-full items-center justify-between rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 font-label-lg text-label-lg text-primary lg:hidden">
        Startup profile
        <Icon name={open ? "expand_less" : "expand_more"} />
      </button>
      <div className={`${open ? "block" : "hidden"} rounded-xl border border-outline-variant bg-surface-container-lowest p-4 lg:block`}>
        <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Startup profile</p>
        <p className="mt-1 font-headline-sm text-lg font-bold text-primary">{completeness(profile)}% complete</p>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{summary(profile)}</p>
        <ul className="mt-3 space-y-2">
          {rows.map(([label, value]) => (
            <li key={String(label)} className="flex items-center justify-between gap-3 border-b border-outline-variant/60 py-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
              <span className={value ? "font-label-md text-label-md text-primary" : "font-label-md text-label-md text-outline"}>
                {busy && !value ? "Checking" : value ?? "Missing"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

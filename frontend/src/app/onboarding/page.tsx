"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { PageHeader, Panel } from "@/components/ui";
import { useSession } from "@/components/session-provider";

const steps = [
  { href: "/onboarding/story", label: "01 Story" },
  { href: "/onboarding/profile", label: "02 Profile" },
  { href: "/onboarding/classification", label: "03 Classification" },
];

export default function OnboardingPage() {
  const { profile } = useSession();
  return (
    <AppShell>
      <PageHeader eyebrow="Onboarding" title="Startup details" description="Confirm the fields the API can store. Empty optional fields stay unset." />
      <ol className="mb-6 flex flex-wrap gap-2">
        {steps.map((step) => (
          <li key={step.href}>
            <Link href={step.href} className="rounded-full bg-surface-container-low px-3 py-1 font-label-md text-label-md text-primary">{step.label}</Link>
          </li>
        ))}
      </ol>
      <Panel>
        <ProfileForm initial={profile} submitLabel="Save and classify" />
      </Panel>
    </AppShell>
  );
}

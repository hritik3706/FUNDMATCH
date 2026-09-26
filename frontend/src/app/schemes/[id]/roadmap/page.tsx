"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import type { ActionPlan } from "@/lib/types";
import { getActionPlan } from "@/services/matchService";

export default function RoadmapPage() {
  const params = useParams<{ id: string }>();
  const { profile } = useSession();
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    getActionPlan(profile.id, params.id)
      .then((result) => setPlan(result.actionPlan))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, params.id]);

  return (
    <AppShell>
      <PageHeader eyebrow="Roadmap" title="Application execution roadmap" description="Steps, documents, and deadlines are whatever the action-plan service returns." />
      {!profile ? <StateMessage title="Profile required" body="Save a profile before requesting a roadmap." action={<Link href="/onboarding"><Button>Open onboarding</Button></Link>} /> : null}
      {loading ? <StateMessage title="Preparing roadmap" body="Waiting for the action-plan service." /> : null}
      {error ? <StateMessage title="Roadmap unavailable" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {plan ? (
        <div className="space-y-4">
          <p className="font-body-md text-body-md text-on-surface-variant">{plan.schemeName}. Estimated time: {plan.totalEstimatedTime}. {plan.fallbackReason ?? ""}</p>
          <ol className="space-y-4">
            {plan.steps.map((step) => (
              <li key={step.stepNumber}>
                <Panel>
                  <p className="font-label-caps text-label-caps uppercase text-secondary">Step {step.stepNumber} · {step.priority}</p>
                  <h2 className="mt-1 font-headline-sm text-headline-sm text-primary">{step.title}</h2>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{step.description}</p>
                  <p className="mt-2 font-data-mono text-xs text-on-surface">Deadline: {step.deadline || "Not provided"} · {step.estimatedTime}</p>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Documents: {step.requiredDocuments.join(", ") || "Not provided"}</p>
                </Panel>
              </li>
            ))}
          </ol>
          <Panel>
            <h2 className="font-headline-sm text-headline-sm text-primary">Success criteria</h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{plan.successCriteria || "Not provided"}</p>
          </Panel>
        </div>
      ) : null}
    </AppShell>
  );
}

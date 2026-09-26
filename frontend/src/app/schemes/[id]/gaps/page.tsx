"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import type { SchemeMatch } from "@/lib/types";
import { getMatch } from "@/services/matchService";

export default function GapsPage() {
  const params = useParams<{ id: string }>();
  const { profile } = useSession();
  const [match, setMatch] = useState<SchemeMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    getMatch(profile.id, params.id)
      .then((result) => setMatch(result.match))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, params.id]);

  return (
    <AppShell>
      <PageHeader eyebrow="Gaps" title="Statutory gap analysis" description="Satisfied and missing items are taken from the stored match. Unknown items are not invented." />
      {!profile ? <StateMessage title="Profile required" body="Save a profile and run a match before reviewing gaps." action={<Link href="/dashboard"><Button>Go to dashboard</Button></Link>} /> : null}
      {loading ? <StateMessage title="Loading gaps" body="Reading the stored match." /> : null}
      {error ? <StateMessage title="Gaps unavailable" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {match ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel>
            <h2 className="font-headline-sm text-headline-sm text-primary">Already satisfied</h2>
            <ul className="mt-3 space-y-3">
              {match.matchedCriteria.map((item) => (
                <li key={item.name} className="rounded border border-status-success-border bg-status-success-bg p-3">
                  <p className="font-label-lg text-primary">{item.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.explanation}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="font-headline-sm text-headline-sm text-primary">Missing</h2>
            <ul className="mt-3 space-y-3">
              {match.missingRequirements.map((item) => (
                <li key={item.name} className="rounded border border-status-warning-border bg-status-warning-bg p-3">
                  <p className="font-label-lg text-primary">{item.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Action: {item.howToFix}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Impact: {item.impact}. Time: {item.estimatedTime ?? "Not provided"}.</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      ) : null}
    </AppShell>
  );
}

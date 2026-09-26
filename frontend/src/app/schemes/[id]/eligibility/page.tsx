"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage, StatusBadge } from "@/components/ui";
import { downloadEvaluationPdf } from "@/lib/evaluationPdf";
import { displayStatus } from "@/lib/format";
import type { SchemeMatch } from "@/lib/types";
import { analyzeProfile, getMatch } from "@/services/matchService";

export default function EligibilityPage() {
  const params = useParams<{ id: string }>();
  const { profile } = useSession();
  const [match, setMatch] = useState<SchemeMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      try {
        const existing = await getMatch(profile.id, params.id);
        setMatch(existing.match);
      } catch {
        const analyzed = await analyzeProfile(profile.id);
        const found = analyzed.matches.find((item) => item.schemeId === params.id) ?? null;
        setMatch(found);
        if (!found) setError("This scheme was not included in the match result.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Eligibility could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, params.id]);

  const status = displayStatus(match?.eligibilityStatus ?? null);

  return (
    <AppShell>
      <PageHeader eyebrow="Eligibility" title="Detailed eligibility" description="The status is the one returned by the match service. Uncertain results are not shown as eligible." />
      {!profile ? <StateMessage title="Profile required" body="Save a startup profile before requesting eligibility." action={<Link href="/onboarding"><Button>Open onboarding</Button></Link>} /> : null}
      {loading ? <StateMessage title="Checking eligibility" body="Waiting for the match service." /> : null}
      {error ? <StateMessage title="Eligibility unavailable" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {match ? (
        <div className="space-y-6">
          <Panel>
            <StatusBadge status={status} />
            <p className="mt-4 font-body-md text-body-md text-on-surface">{match.overallReasoning}</p>
            <p className="mt-2 font-data-mono text-data-mono text-on-surface-variant">Score {match.compatibilityScore}</p>
          </Panel>
          <Panel>
            <h2 className="font-headline-sm text-headline-sm text-primary">Requirements satisfied</h2>
            <ul className="mt-3 space-y-2">
              {match.matchedCriteria.length === 0 ? <li className="text-on-surface-variant">Not provided</li> : match.matchedCriteria.map((item) => (
                <li key={item.name}><span className="font-label-lg text-primary">{item.name}.</span> <span className="text-on-surface-variant">{item.explanation}</span></li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="font-headline-sm text-headline-sm text-primary">Requirements missing</h2>
            <ul className="mt-3 space-y-2">
              {match.missingRequirements.length === 0 ? <li className="text-on-surface-variant">None returned.</li> : match.missingRequirements.map((item) => (
                <li key={item.name}><span className="font-label-lg text-primary">{item.name}.</span> <span className="text-on-surface-variant">{item.howToFix}</span></li>
              ))}
            </ul>
          </Panel>
          {profile ? <Button variant="secondary" onClick={() => downloadEvaluationPdf(profile, [match])}>Download PDF</Button> : null}
        </div>
      ) : null}
    </AppShell>
  );
}

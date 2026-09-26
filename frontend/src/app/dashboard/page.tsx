"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage, StatusBadge } from "@/components/ui";
import { displayStatus, inr } from "@/lib/format";
import type { SchemeMatch } from "@/lib/types";
import { analyzeProfile } from "@/services/matchService";

export default function DashboardPage() {
  const { profile } = useSession();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    analyzeProfile(profile.id)
      .then((result) => {
        setMatches(result.matches);
        setNotice(result.fallbackReason ?? "");
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // profile id is the dependency that matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const strong = matches.filter((match) => match.eligibilityStatus === "FULLY_ELIGIBLE").length;

  return (
    <AppShell>
      <PageHeader eyebrow="Dashboard" title={profile ? profile.name : "Founder dashboard"} description="Counts below come from the match API for the saved profile." />
      {!profile ? (
        <StateMessage title="No profile yet" body="Complete onboarding so the dashboard can request matches." action={<Link href="/onboarding/story"><Button>Start onboarding</Button></Link>} />
      ) : null}
      {error ? <StateMessage title="Matches unavailable" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {loading ? <StateMessage title="Checking schemes" body="The API is scoring your profile against the catalogue." /> : null}
      {profile && !loading && !error ? (
        <>
          {notice ? <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">{notice}</p> : null}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Panel><p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Relevant schemes</p><p className="mt-2 font-headline-lg text-headline-lg text-primary">{matches.length}</p></Panel>
            <Panel><p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Fully eligible</p><p className="mt-2 font-headline-lg text-headline-lg text-primary">{strong}</p></Panel>
            <Panel><p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Funding sought</p><p className="mt-2 font-headline-lg text-headline-lg text-primary">{inr(profile.fundingNeeded)}</p></Panel>
          </div>
          {matches.length === 0 ? (
            <StateMessage title="No matches returned" body="The API did not return schemes for this profile." />
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Panel key={match.schemeId} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-primary">{match.schemeName}</h2>
                    <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{match.overallReasoning}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={displayStatus(match.eligibilityStatus)} />
                    <span className="font-data-mono text-data-mono text-primary">{match.compatibilityScore}</span>
                    <Link href={`/schemes/${match.schemeId}`} className="font-label-lg text-label-lg text-secondary hover:underline">Open</Link>
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </>
      ) : null}
    </AppShell>
  );
}

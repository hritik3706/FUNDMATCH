"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DashboardSchemeCard } from "@/components/dashboard-scheme-card";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import { downloadEvaluationPdf } from "@/lib/evaluationPdf";
import { inr } from "@/lib/format";
import type { SchemeMatch, SchemeSummary } from "@/lib/types";
import { savedSchemeIds, toggleSaved } from "@/services/accountService";
import { analyzeProfile } from "@/services/matchService";
import { listSchemes } from "@/services/schemeService";

export default function DashboardPage() {
  const { profile } = useSession();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    setSavedIds(savedSchemeIds());
    analyzeProfile(profile.id)
      .then(async (result) => {
        setMatches(result.matches);
        setNotice(result.fallbackReason ?? "");
        try {
          const catalogue = await listSchemes();
          setSchemes(catalogue.schemes);
        } catch {
          setSchemes([]);
        }
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
            <div className="space-y-3">
              {matches.map((match) => (
                <DashboardSchemeCard
                  key={match.schemeId}
                  match={match}
                  scheme={schemes.find((scheme) => scheme.id === match.schemeId)}
                  saved={savedIds.includes(match.schemeId)}
                  onToggleSave={(schemeId) => setSavedIds(toggleSaved(schemeId))}
                />
              ))}
            </div>
          )}
          {matches.length > 0 ? (
            <div className="mt-6">
              <Button variant="secondary" onClick={() => downloadEvaluationPdf(profile, matches)}>Download PDF</Button>
            </div>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}

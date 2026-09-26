"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage, StatusBadge } from "@/components/ui";
import { displayStatus, fundingRange, notProvided } from "@/lib/format";
import type { Scheme, SchemeMatch } from "@/lib/types";
import { savedSchemeIds, toggleSaved, trackApplication } from "@/services/accountService";
import { getMatch } from "@/services/matchService";
import { getScheme } from "@/services/schemeService";

export default function SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile } = useSession();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [match, setMatch] = useState<SchemeMatch | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tracked, setTracked] = useState("");

  function load() {
    setLoading(true);
    setError("");
    getScheme(params.id)
      .then(async (result) => {
        setScheme(result.scheme);
        setSaved(savedSchemeIds().includes(result.scheme.id));
        if (!profile) return;
        try {
          const detail = await getMatch(profile.id, result.scheme.id);
          setMatch(detail.match);
        } catch {
          setMatch(null);
        }
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, profile?.id]);

  return (
    <AppShell>
      {loading ? <StateMessage title="Loading scheme" body="Fetching the catalogue record." /> : null}
      {error ? <StateMessage title="Scheme unavailable" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {scheme ? (
        <>
          <PageHeader
            eyebrow={scheme.schemeType ?? "Scheme"}
            title={scheme.name}
            description={scheme.description}
            actions={
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setSaved(toggleSaved(scheme.id).includes(scheme.id))}>{saved ? "Unsave" : "Save"}</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    trackApplication({ schemeId: scheme.id, schemeName: scheme.name, sourceUrl: scheme.sourceUrl });
                    setTracked("Added to application tracking.");
                  }}
                >
                  Track application
                </Button>
                {scheme.sourceUrl ? (
                  <a className="inline-flex items-center rounded bg-primary px-4 py-2.5 font-label-lg text-label-lg text-on-primary" href={scheme.sourceUrl} target="_blank" rel="noreferrer">
                    Apply on official portal
                  </a>
                ) : (
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Official link not provided</span>
                )}
              </div>
            }
          />
          {tracked ? <p className="mb-4 font-body-sm text-body-sm text-secondary">{tracked}</p> : null}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Overview</h2>
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{scheme.description}</p>
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Funding</h2>
                <p className="mt-2 font-data-mono text-data-mono text-primary">{fundingRange(scheme.fundingMin, scheme.fundingMax)}</p>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Dates: Not provided</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Application process: Not provided</p>
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Eligibility criteria</h2>
                <ul className="mt-3 space-y-3">
                  {scheme.eligibilityCriteria.length === 0 ? <li>Not provided</li> : scheme.eligibilityCriteria.map((item) => (
                    <li key={item.id} className="rounded border border-[#e2e8f0] p-3">
                      <p className="font-label-lg text-label-lg text-primary">{item.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
            <Panel>
              <h2 className="font-headline-sm text-headline-sm text-primary">Why it matches</h2>
              {match ? (
                <>
                  <div className="mt-3"><StatusBadge status={displayStatus(match.eligibilityStatus)} /></div>
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{match.overallReasoning}</p>
                </>
              ) : (
                <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{profile ? "No stored match for this profile yet. Run the dashboard analysis first." : "Save a profile to request a match."}</p>
              )}
              <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">Sectors: {notProvided(scheme.eligibleSectors.join(", "))}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link className="text-secondary hover:underline" href={`/schemes/${scheme.id}/eligibility`}>Eligibility analysis</Link>
                <Link className="text-secondary hover:underline" href={`/schemes/${scheme.id}/gaps`}>Gap analysis</Link>
                <Link className="text-secondary hover:underline" href={`/schemes/${scheme.id}/roadmap`}>Application roadmap</Link>
              </div>
            </Panel>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}

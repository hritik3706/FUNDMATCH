"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { MatchScore } from "@/components/match-score";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, StateMessage, StatusBadge } from "@/components/ui";
import { displayStatus, fundingRange, notProvided } from "@/lib/format";
import type { Scheme, SchemeMatch } from "@/lib/types";
import { savedSchemeIds, toggleSaved, trackApplication } from "@/services/accountService";
import { getMatch, matchContext } from "@/services/matchService";
import { getScheme } from "@/services/schemeService";

const requirementIcon: Record<RequirementState, string> = {
  satisfied: "check",
  missing: "warning",
  unknown: "help",
  not_satisfied: "close",
};

export default function SchemeDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile, story } = useSession();
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
          const detail = await getMatch(profile.id, result.scheme.id, matchContext(story));
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
  }, [params.id, profile?.id, story.text, story.futureIntent]);

  const funding = fundingLabel(scheme?.fundingMin, scheme?.fundingMax);
  const checks = match?.requirementChecks ?? [];
  const satisfied = checks.filter((item) => item.state === "satisfied").length;
  const missing = match?.missingRequirements ?? [];
  const documents = scheme?.eligibilityCriteria.filter((item) => /document|certificate|registration|proof/i.test(item.name)) ?? [];

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
                    Official source
                  </a>
                ) : null}
              </div>
            }
          />
          {tracked ? <p className="mb-4 font-body-sm text-body-sm text-secondary">{tracked}</p> : null}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Overview</h2>
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{scheme.description || "Not available from source"}</p>
              </Panel>
              {match ? (
                <Panel>
                  <h2 className="font-headline-md text-headline-md text-primary">Why this matches you</h2>
                  <div className="mt-3"><MatchScore score={match.compatibilityScore} /></div>
                  <ul className="mt-3 space-y-2">
                    {(match.factorNotes?.length ? match.factorNotes : [match.overallReasoning]).map((note) => (
                      <li key={note} className="font-body-sm text-body-sm text-on-surface">{note}</li>
                    ))}
                  </ul>
                  {profile ? <p className="mt-3 font-body-sm text-body-sm text-on-surface">Your startup&apos;s <strong className="font-semibold">{profile.sector}</strong> sector is compared with this scheme&apos;s published sectors.</p> : null}
                  {funding ? <p className="mt-2 font-body-sm text-body-sm text-on-surface">The scheme provides <strong className="font-semibold">{funding}</strong>.</p> : null}
                  {checks.length > 0 ? <p className="mt-2 font-body-sm text-body-sm text-on-surface">You currently satisfy <strong className="font-semibold">{satisfied} of {checks.length}</strong> documented eligibility requirements.</p> : null}
                  {missing[0] ? <p className="mt-2 font-body-sm text-body-sm text-on-surface"><strong className="font-semibold">{missing[0].name}</strong> is the remaining requirement.</p> : null}
                </Panel>
              ) : null}
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Funding</h2>
                <p className="mt-2 font-data-mono text-data-mono text-primary">{fundingRange(scheme.fundingMin, scheme.fundingMax)}</p>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Dates: Not provided</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Application process: Not provided</p>
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Eligibility</h2>
                <ul className="mt-3 space-y-3">
                  {scheme.eligibilityCriteria.length === 0 ? <li className="font-body-sm text-body-sm text-on-surface-variant">Not available from source</li> : scheme.eligibilityCriteria.map((item) => (
                    <li key={item.id} className="rounded border border-[#e2e8f0] p-3">
                      <p className="font-label-lg text-label-lg text-primary">{item.required ? <strong className="font-semibold">{item.name}</strong> : item.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{item.description || "Not available from source"}</p>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Your eligibility</h2>
                {checks.length === 0 ? <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Insufficient information. The source did not publish conditions that can be checked against this profile.</p> : (
                  <ul className="mt-3 space-y-2">
                    {checks.map((item) => (
                      <li key={item.name} className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface">
                        <Icon name={requirementIcon[item.state]} className="mt-0.5 text-base text-secondary" />
                        <span><strong className="font-semibold">{item.name}</strong>. {item.detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Required documents</h2>
                {documents.length === 0 ? <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Not available from source</p> : (
                  <ul className="mt-3 list-disc space-y-1 pl-5 font-body-sm text-body-sm text-on-surface">
                    {documents.map((item) => <li key={item.id}>{item.name}</li>)}
                  </ul>
                )}
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Application process</h2>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">Not available from source</p>
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Missing requirements</h2>
                {missing.length === 0 ? <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">None identified from the published conditions.</p> : (
                  <ul className="mt-3 space-y-2">
                    {missing.map((item) => (
                      <li key={item.name} className="font-body-sm text-body-sm text-on-surface"><strong className="font-semibold">{item.name}</strong>. {item.howToFix}</li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel>
                <h2 className="font-headline-md text-headline-md text-primary">Next action</h2>
                <p className="mt-2 font-body-md text-body-md text-on-surface">{match?.nextSteps[0] ?? "Review the official source before applying."}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link className="text-secondary hover:underline" href={`/schemes/${scheme.id}/eligibility`}>Eligibility analysis</Link>
                  <Link className="text-secondary hover:underline" href={`/schemes/${scheme.id}/gaps`}>Gap analysis</Link>
                  <Link className="text-secondary hover:underline" href={`/schemes/${scheme.id}/roadmap`}>Application roadmap</Link>
                </div>
              </Panel>
            </div>
            <div className="space-y-6">
              <Panel>
                <h2 className="font-headline-sm text-headline-sm text-primary">Match and eligibility</h2>
                {match ? (
                  <>
                    <div className="mt-3"><MatchScore score={match.compatibilityScore} /></div>
                    <div className="mt-3"><StatusBadge status={displayStatus(match.eligibilityStatus)} /></div>
                    <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">The match score and the eligibility status are calculated separately.</p>
                  </>
                ) : (
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">{profile ? "A match score is not available for this profile yet." : "Save a profile to request a match."}</p>
                )}
              </Panel>
              <Panel>
                <h2 className="font-headline-sm text-headline-sm text-primary">Authority and scope</h2>
                <p className="mt-3 font-body-sm text-body-sm text-on-surface">Ministry / department: {notProvided(scheme.ministry || scheme.department || scheme.schemeType)}</p>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface">Geographic scope: {notProvided(scheme.eligibleLocations.join(", "))}</p>
                <p className="mt-2 font-body-sm text-body-sm text-on-surface">Important dates: {scheme.applicationDeadline ? <strong className="font-semibold">{scheme.applicationDeadline}</strong> : "Not available from source"}</p>
              </Panel>
              <Panel>
                <h2 className="font-headline-sm text-headline-sm text-primary">Official source</h2>
                {scheme.sourceUrl ? (
                  <a className="mt-3 inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary" href={scheme.sourceUrl} target="_blank" rel="noreferrer">
                    Official source
                    <Icon name="open_in_new" className="text-sm" />
                  </a>
                ) : (
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Not available from source</p>
                )}
              </Panel>
            </div>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}

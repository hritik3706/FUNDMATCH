"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DashboardSchemeCard } from "@/components/dashboard-scheme-card";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import { useRelevantMatches } from "@/hooks/use-relevant-matches";
import { formatInr, storedToInr } from "@/lib/extractStory";
import { downloadEvaluationPdf } from "@/lib/evaluationPdf";
import type { SchemeSummary } from "@/lib/types";
import { savedSchemeIds, toggleSaved } from "@/services/accountService";
import { listSchemes } from "@/services/schemeService";

const PAGE_SIZE = 8;

export default function DashboardPage() {
  const { profile, story, matches, result, loading, error, reload } = useRelevantMatches();
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setSavedIds(savedSchemeIds());
    if (!profile?.id) return;
    listSchemes()
      .then((catalogue) => setSchemes(catalogue.schemes))
      .catch(() => setSchemes([]));
  }, [profile?.id]);

  useEffect(() => {
    setPage(0);
  }, [matches.length, result?.informationStatus]);

  const total = result?.totalRelevant ?? matches.length;
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const visible = matches.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const strong = matches.filter((match) => match.eligibilityStatus === "FULLY_ELIGIBLE").length;
  const countLabel = `${total} relevant scheme${total === 1 ? "" : "s"} found`;

  return (
    <AppShell>
      <PageHeader eyebrow="Dashboard" title={profile ? profile.name : "Founder dashboard"} description="Relevant schemes are scored from your profile, story, and website. The count is the full result, not a fixed list." />
      {!profile ? (
        <StateMessage title="No profile yet" body="Complete onboarding so the dashboard can request matches." action={<Link href="/onboarding/story"><Button>Start onboarding</Button></Link>} />
      ) : null}
      {error ? <StateMessage title="Matches unavailable" body={error} action={<Button onClick={reload}>Retry</Button>} /> : null}
      {loading ? <StateMessage title="Checking schemes" body="Scoring your profile against the catalogue." /> : null}
      {profile && !loading && !error && result?.informationStatus === "incomplete" ? (
        <StateMessage
          title="More information needed"
          body={`We need your ${result.missingFields?.join(" and ") || "startup stage and state"} to determine which schemes may apply.`}
          action={<Link href="/onboarding/profile"><Button>Add more information</Button></Link>}
        />
      ) : null}
      {profile && !loading && !error && result?.informationStatus !== "incomplete" ? (
        <>
          {result?.websiteNotice ? <p className="mb-4 rounded border border-outline-variant bg-surface-container-low px-4 py-3 font-body-sm text-body-sm text-on-surface">{result.websiteNotice}</p> : null}
          {result?.informationStatus === "conflict" ? (
            <div className="mb-4 rounded border border-status-warning-border bg-status-warning-bg px-4 py-3">
              <p className="font-label-lg text-label-lg text-[#92400e]">Information conflict</p>
              <ul className="mt-2 space-y-1">
                {(result.conflicts ?? []).map((conflict) => (
                  <li key={`${conflict.otherSource}-${conflict.otherValue}`} className="font-body-sm text-body-sm text-on-surface">
                    Your form lists <strong className="font-semibold">{conflict.structuredValue}</strong> and the {conflict.otherSource} suggests <strong className="font-semibold">{conflict.otherValue}</strong>. Confirm which one is correct.
                  </li>
                ))}
              </ul>
              <Link href="/onboarding/profile" className="mt-2 inline-flex font-label-md text-label-md text-secondary">Review startup profile</Link>
            </div>
          ) : null}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Panel><p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Relevant schemes</p><p className="mt-2 font-headline-lg text-headline-lg text-primary">{total}</p><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{countLabel}</p></Panel>
            <Panel><p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Fully eligible</p><p className="mt-2 font-headline-lg text-headline-lg text-primary">{strong}</p></Panel>
            <Panel><p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Funding sought</p><p className="mt-2 font-headline-lg text-headline-lg text-primary">{formatInr(story.fundingInr || storedToInr(profile.fundingNeeded))}</p></Panel>
          </div>
          {matches.length === 0 ? (
            <StateMessage
              title="No relevant schemes found"
              body="Based on the information currently provided, we couldn't identify a government scheme that matches your startup's current profile."
              action={
                <div className="flex flex-wrap gap-2">
                  <Link href="/startup"><Button>Review startup profile</Button></Link>
                  <Link href="/onboarding/story"><Button variant="secondary">Add more information</Button></Link>
                  <Link href="/schemes"><Button variant="secondary">Explore all schemes</Button></Link>
                </div>
              }
            />
          ) : (
            <>
              <p className="mb-3 font-label-lg text-label-lg text-primary">{countLabel}</p>
              <div className="space-y-3">
                {visible.map((match, index) => (
                  <DashboardSchemeCard
                    key={match.schemeId}
                    match={match}
                    scheme={schemes.find((scheme) => scheme.id === match.schemeId)}
                    saved={savedIds.includes(match.schemeId)}
                    lead={page === 0 && index === 0 && match.relevance === "now"}
                    onToggleSave={(schemeId) => setSavedIds(toggleSaved(schemeId))}
                  />
                ))}
              </div>
              {pageCount > 1 ? (
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Page {page + 1} of {pageCount}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                    <Button variant="secondary" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
                  </div>
                </div>
              ) : null}
            </>
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

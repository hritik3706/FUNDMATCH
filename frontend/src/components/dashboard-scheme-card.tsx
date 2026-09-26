"use client";

import Link from "next/link";
import { displayStatus, fundingLabel, relevanceLabel } from "@/lib/format";
import type { SchemeMatch, SchemeSummary } from "@/lib/types";
import { Icon, StatusBadge } from "@/components/ui";
import { MatchScore } from "@/components/match-score";

export function DashboardSchemeCard({
  match,
  scheme,
  saved,
  lead,
  onToggleSave,
}: {
  match: SchemeMatch;
  scheme?: SchemeSummary;
  saved: boolean;
  lead?: boolean;
  onToggleSave: (schemeId: string) => void;
}) {
  const ministry = scheme?.ministry?.trim() || scheme?.department?.trim() || scheme?.schemeType?.trim() || "";
  const funding = fundingLabel(scheme?.fundingMin, scheme?.fundingMax);
  const deadline = scheme?.applicationDeadline?.trim() || "";
  const missing = match.missingRequirements[0];
  const why = match.factorNotes?.[0] || match.matchedCriteria[0]?.explanation || "";
  const bucket = relevanceLabel(match.relevance);

  return (
    <article className="rounded-xl border border-[#e2e8f0] bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-headline-sm text-headline-sm text-primary">{match.schemeName}</h2>
          {ministry ? <p className="mt-0.5 font-label-md text-label-md text-on-surface-variant">{ministry}</p> : null}
        </div>
        <StatusBadge status={displayStatus(match.eligibilityStatus)} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <MatchScore score={match.compatibilityScore} />
        {bucket ? <p className="font-label-md text-xs text-on-surface-variant">{bucket}</p> : null}
      </div>
      {lead ? <p className="mt-1 font-label-md text-xs text-secondary">Strongest match to your current profile</p> : null}
      {scheme?.description ? <p className="mt-2 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{scheme.description}</p> : null}
      {funding ? <p className="mt-2 font-body-sm text-body-sm text-on-surface">Benefit: <strong className="font-semibold">{funding}</strong></p> : null}
      {why ? <p className="mt-1 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{why}</p> : null}
      {missing ? <p className="mt-1 font-body-sm text-body-sm text-on-surface">Key gap: <strong className="font-semibold">{missing.name}</strong></p> : null}
      {deadline ? <p className="mt-1 font-body-sm text-body-sm text-on-surface">Deadline: <strong className="font-semibold">{deadline}</strong></p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link href={`/schemes/${match.schemeId}`} className="inline-flex items-center rounded bg-primary px-3 py-1.5 font-label-md text-xs text-on-primary">
          View full details
        </Link>
        <Link href={`/schemes/${match.schemeId}/eligibility`} className="inline-flex items-center rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-md text-xs text-primary">
          Check eligibility
        </Link>
        <button type="button" className="inline-flex items-center rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-md text-xs text-primary" onClick={() => onToggleSave(match.schemeId)}>
          {saved ? "Saved" : "Save"}
        </button>
        {scheme?.sourceUrl ? (
          <a className="ml-auto inline-flex items-center gap-1 font-label-md text-xs text-secondary" href={scheme.sourceUrl} target="_blank" rel="noreferrer">
            Official Government Source
            <Icon name="open_in_new" className="text-sm" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

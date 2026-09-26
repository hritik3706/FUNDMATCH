"use client";

import Link from "next/link";
import { displayStatus, fundingLabel } from "@/lib/format";
import type { SchemeMatch, SchemeSummary } from "@/lib/types";
import { Icon, StatusBadge } from "@/components/ui";

export function DashboardSchemeCard({
  match,
  scheme,
  saved,
  onToggleSave,
}: {
  match: SchemeMatch;
  scheme?: SchemeSummary;
  saved: boolean;
  onToggleSave: (schemeId: string) => void;
}) {
  const ministry = scheme?.ministry?.trim() || scheme?.department?.trim() || "";
  const typeLabel = scheme?.schemeType?.trim() || "";
  const benefit = scheme?.benefit?.trim() || "";
  const funding = fundingLabel(scheme?.fundingMin, scheme?.fundingMax);
  const deadline = scheme?.applicationDeadline?.trim() || "";
  const subtitle = ministry || typeLabel;
  const facts = [benefit || (ministry ? typeLabel : ""), funding, deadline].filter(Boolean);
  const requirements = [
    ...match.matchedCriteria.slice(0, 2).map((item) => ({ met: true, label: item.name })),
    ...match.missingRequirements.slice(0, 2).map((item) => ({ met: false, label: item.name })),
  ].slice(0, 3);

  return (
    <article className="rounded-xl border border-[#e2e8f0] bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-headline-sm text-headline-sm text-primary">{match.schemeName}</h2>
          {subtitle ? <p className="mt-0.5 font-label-md text-label-md text-on-surface-variant">{subtitle}</p> : null}
        </div>
        <StatusBadge status={displayStatus(match.eligibilityStatus)} />
      </div>
      {scheme?.description ? <p className="mt-2 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{scheme.description}</p> : null}
      {facts.length > 0 ? (
        <p className="mt-2 font-data-mono text-xs text-primary">{facts.join(" · ")}</p>
      ) : null}
      {requirements.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {requirements.map((item) => (
            <li key={`${item.met}-${item.label}`} className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface">
              <Icon name={item.met ? "check" : "warning"} className={`text-sm ${item.met ? "text-status-success" : "text-status-warning"}`} />
              <span className="truncate">{item.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {match.overallReasoning ? <p className="mt-2 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{match.overallReasoning}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link href={`/schemes/${match.schemeId}`} className="inline-flex items-center rounded bg-primary px-3 py-1.5 font-label-md text-xs text-on-primary">
          View details
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

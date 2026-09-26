import Link from "next/link";
import { fundingRange } from "@/lib/format";
import type { SchemeSummary } from "@/lib/types";
import { Icon } from "@/components/ui";

export function SchemeCard({ scheme, match }: { scheme: SchemeSummary; match?: SchemeMatch }) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[#e2e8f0] bg-surface-container-lowest p-6 shadow-sm transition hover:border-[#cbd5e1] hover:shadow-tier2">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 font-label-md text-xs text-primary">
            <Icon name="verified" className="text-xs text-secondary" />
            {scheme.schemeType ?? "Not provided"}
          </span>
        </div>
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary">{scheme.name}</h2>
        {match ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <MatchScore score={match.compatibilityScore} />
            <StatusBadge status={displayStatus(match.eligibilityStatus)} />
            {relevanceLabel(match.relevance) ? <span className="font-label-md text-xs text-on-surface-variant">{relevanceLabel(match.relevance)}</span> : null}
          </div>
        ) : null}
        <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{scheme.description}</p>
        <dl className="mt-6 space-y-2 rounded-lg bg-surface-container-low p-4 font-data-mono text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">Funding range</dt>
            <dd className="font-bold text-primary">
              {fundingRange(scheme.fundingMin, scheme.fundingMax)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">Stages</dt>
            <dd className="text-right text-primary">{scheme.eligibleStages.join(", ") || "Not provided"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-on-surface-variant">Locations</dt>
            <dd className="text-right text-primary">{scheme.eligibleLocations.join(", ") || "Not provided"}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-6 flex items-center justify-between">
        {scheme.sourceUrl ? (
          <a className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary" href={scheme.sourceUrl} target="_blank" rel="noreferrer">
            Official source
            <Icon name="open_in_new" className="text-sm" />
          </a>
        ) : (
          <span className="font-label-md text-label-md text-on-surface-variant">Official link not provided</span>
        )}
        <Link href={`/schemes/${scheme.id}`} className="rounded bg-surface-container px-3 py-1.5 font-label-md text-xs text-primary hover:bg-surface-container-high">
          Inspect rules
        </Link>
      </div>
    </article>
  );
}

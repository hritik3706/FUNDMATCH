import { ComponentScores, Relevance, SchemeMatch } from "../../types/matching.types";

export type ScoredScheme = {
  match: SchemeMatch;
  components: ComponentScores;
  futureFit: number;
};

const RELEVANCE_ORDER: Record<Relevance, number> = {
  now: 0,
  potential: 1,
  future: 2,
};

function bucketFor(row: ScoredScheme, threshold: number): Relevance | null {
  if (row.components.locationMatch <= 0) {
    return null;
  }
  if (row.match.eligibilityStatus === "NOT_ELIGIBLE") {
    return null;
  }

  const aboveThreshold = row.match.compatibilityScore >= threshold;
  const sectorAligned = row.components.sectorMatch > 0;
  const futureAligned = row.futureFit >= 0.65;

  if (!sectorAligned) {
    return futureAligned ? "future" : null;
  }
  if (!aboveThreshold) {
    return futureAligned ? "future" : null;
  }
  if (row.match.eligibilityStatus === "FULLY_ELIGIBLE") {
    return "now";
  }
  return "potential";
}

export function selectRelevant(rows: ScoredScheme[], threshold: number): SchemeMatch[] {
  const selected = rows.flatMap((row) => {
    const relevance = bucketFor(row, threshold);
    if (!relevance) {
      return [];
    }
    return [{ ...row.match, relevance }];
  });

  return selected.sort((left, right) => {
    const bucket = RELEVANCE_ORDER[left.relevance ?? "potential"] - RELEVANCE_ORDER[right.relevance ?? "potential"];
    if (bucket !== 0) {
      return bucket;
    }
    return right.compatibilityScore - left.compatibilityScore;
  });
}

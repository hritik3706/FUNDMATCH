import { Profile } from "../types/profile.types";
import { Scheme } from "../types/scheme.types";
import { MatchedCriterion, SchemeMatch } from "../types/matching.types";
import { toScoreBreakdown } from "./scoring/breakdown";
import { determineEligibility } from "./scoring/eligibility";
import { componentScores, formulaScore } from "./scoring/formula";
import { detectGaps } from "./scoring/gaps";

const FALLBACK_REASON = "Claude API temporarily unavailable. Using formula-based matching.";

function metCriteria(profile: Profile, scheme: Scheme): MatchedCriterion[] {
  const components = componentScores(profile, scheme);
  const met: MatchedCriterion[] = [];
  if (components.sectorMatch > 0) {
    met.push({
      name: "Sector Match",
      status: "met",
      explanation: `${profile.sector} fits the eligible sectors`,
    });
  }
  if (components.stageMatch > 0) {
    met.push({
      name: "Stage Match",
      status: "met",
      explanation: `${profile.stage} is an eligible or adjacent stage`,
    });
  }
  if (components.locationMatch > 0) {
    met.push({
      name: "Location Match",
      status: "met",
      explanation: `${profile.location} is covered`,
    });
  }
  if (components.fundingRangeMatch === 1) {
    met.push({
      name: "Funding Range",
      status: "met",
      explanation: `₹${profile.fundingNeeded}L is inside ₹${scheme.fundingMin}L-₹${scheme.fundingMax}L`,
    });
  }
  return met;
}

export function buildFallbackMatch(profile: Profile, scheme: Scheme): SchemeMatch {
  const gaps = detectGaps(profile, scheme.eligibilityCriteria);
  const components = componentScores(profile, scheme);
  const compatibilityScore = formulaScore(components);
  return {
    profileId: profile.id,
    schemeId: scheme.id,
    schemeName: scheme.name,
    compatibilityScore,
    eligibilityStatus: determineEligibility(compatibilityScore, gaps),
    matchedCriteria: metCriteria(profile, scheme),
    missingRequirements: gaps,
    overallReasoning: gaps.length
      ? `Formula match for ${scheme.name}. Missing ${gaps.map((gap) => gap.name).join(", ")}.`
      : `Formula match for ${scheme.name}. No detected mandatory gaps.`,
    nextSteps: gaps.length ? gaps.map((gap) => gap.howToFix) : [`Apply to ${scheme.name}`],
    scoreBreakdown: toScoreBreakdown(components),
    fallbackMode: true,
    fallbackReason: FALLBACK_REASON,
    accuracyNote: "Full eligibility analysis unavailable. Please try again in a few minutes.",
  };
}

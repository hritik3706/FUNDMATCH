import { Profile } from "../types/profile.types";
import { Scheme } from "../types/scheme.types";
import { MatchedCriterion, RequirementCheck, SchemeMatch, SCORING_VERSION } from "../types/matching.types";
import { toScoreBreakdown } from "./scoring/breakdown";
import { determineEligibility } from "./scoring/eligibility";
import { componentScores, formulaScore } from "./scoring/formula";
import { detectGaps } from "./scoring/gaps";
import { ideaScore } from "./scoring/idea";
import { assessRequirements } from "./scoring/requirements";

const FALLBACK_REASON = "Claude API temporarily unavailable. Using formula-based matching.";

export { FALLBACK_REASON };

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
      explanation: `Rs ${profile.fundingNeeded}L is inside Rs ${scheme.fundingMin}L-Rs ${scheme.fundingMax}L`,
    });
  }
  return met;
}

function factorNotes(profile: Profile, scheme: Scheme, checks: RequirementCheck[]): string[] {
  const components = componentScores(profile, scheme);
  const notes: string[] = [];
  if (components.sectorMatch === 1) {
    notes.push(`${profile.sector} sector aligns with this scheme`);
  } else if (components.sectorMatch > 0) {
    notes.push(`${profile.sector} is adjacent to this scheme's sectors`);
  }
  if (components.stageMatch === 1) {
    notes.push(`${profile.stage} stage is listed for this scheme`);
  } else if (components.stageMatch > 0) {
    notes.push(`${profile.stage} is close to a listed stage`);
  }
  if (components.locationMatch > 0) {
    notes.push(`${profile.location} is inside the published geographic scope`);
  }
  if (components.fundingRangeMatch === 1) {
    notes.push(`Funding need is inside ${scheme.fundingMin} to ${scheme.fundingMax}`);
  }
  const confirmed = checks.filter((check) => check.state === "satisfied").length;
  if (checks.length > 0) {
    notes.push(`${confirmed} of ${checks.length} documented requirements can be confirmed`);
  } else {
    notes.push("Eligibility conditions were not available from the source");
  }
  return notes;
}

export function buildFallbackMatch(
  profile: Profile,
  scheme: Scheme,
  ideaText?: string,
  reason?: string,
): SchemeMatch {
  const gaps = detectGaps(profile, scheme.eligibilityCriteria);
  const checks = assessRequirements(profile, scheme.eligibilityCriteria);
  const components = componentScores(profile, scheme);
  const siteIdea = ideaText?.trim() ? ideaScore(ideaText, scheme) : undefined;
  const compatibilityScore = formulaScore(components, siteIdea);
  const ideaSentence =
    siteIdea === undefined
      ? ""
      : ` The startup website describes an idea that is a ${Math.round(siteIdea * 100)}% fit for this scheme.`;
  return {
    profileId: profile.id,
    schemeId: scheme.id,
    schemeName: scheme.name,
    compatibilityScore,
    eligibilityStatus: determineEligibility(checks),
    matchedCriteria: metCriteria(profile, scheme),
    missingRequirements: gaps,
    overallReasoning: `${
      gaps.length
        ? `Formula match for ${scheme.name}. Missing ${gaps.map((gap) => gap.name).join(", ")}.`
        : `Formula match for ${scheme.name}. No detected mandatory gaps.`
    }${ideaSentence}`,
    nextSteps: gaps.length ? gaps.map((gap) => gap.howToFix) : [`Apply to ${scheme.name}`],
    scoreBreakdown: toScoreBreakdown(components, siteIdea),
    websiteIdea: ideaText?.trim() ? ideaText.trim().slice(0, 500) : undefined,
    requirementChecks: checks,
    factorNotes: factorNotes(profile, scheme, checks),
    scoringVersion: SCORING_VERSION,
    fallbackMode: Boolean(reason),
    ...(reason ? { fallbackReason: reason, accuracyNote: "Full eligibility analysis unavailable. Please try again in a few minutes." } : {}),
  };
}

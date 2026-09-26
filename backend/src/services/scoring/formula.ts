import { Profile } from "../../types/profile.types";
import { Scheme } from "../../types/scheme.types";
import { ComponentScores } from "../../types/matching.types";
import { completenessScore, detectGaps } from "./gaps";
import { fundingScore } from "./funding";
import { locationScore } from "./location";
import { sectorScore } from "./sector";
import { stageScore } from "./stage";

export function componentScores(profile: Profile, scheme: Scheme): ComponentScores {
  const gaps = detectGaps(profile, scheme.eligibilityCriteria);
  return {
    sectorMatch: sectorScore(profile.sector, scheme.eligibleSectors),
    stageMatch: stageScore(profile.stage, scheme.eligibleStages),
    locationMatch: locationScore(profile.location, scheme.eligibleLocations),
    fundingRangeMatch: fundingScore(profile.fundingNeeded, scheme.fundingMin, scheme.fundingMax),
    eligibilityCompleteness: completenessScore(scheme.eligibilityCriteria, gaps),
  };
}

export function formulaScore(components: ComponentScores, ideaMatch?: number): number {
  const base =
    components.sectorMatch * 0.25 +
    components.stageMatch * 0.25 +
    components.locationMatch * 0.15 +
    components.fundingRangeMatch * 0.2 +
    components.eligibilityCompleteness * 0.15;
  const blended = ideaMatch === undefined ? base : base * 0.8 + ideaMatch * 0.2;
  return Math.round(Math.max(0, Math.min(1, blended)) * 100);
}

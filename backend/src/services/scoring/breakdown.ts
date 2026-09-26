import { ComponentScores, ScoreBreakdown } from "../../types/matching.types";

export function toScoreBreakdown(components: ComponentScores, ideaMatch?: number): ScoreBreakdown {
  const scale = ideaMatch === undefined ? 1 : 0.8;
  return {
    sectorMatch: Math.round(components.sectorMatch * 25 * scale),
    stageMatch: Math.round(components.stageMatch * 25 * scale),
    locationMatch: Math.round(components.locationMatch * 15 * scale),
    fundingRangeMatch: Math.round(components.fundingRangeMatch * 20 * scale),
    eligibilityCompleteness: Math.round(components.eligibilityCompleteness * 15 * scale),
    ...(ideaMatch === undefined ? {} : { ideaMatch: Math.round(ideaMatch * 20) }),
  };
}

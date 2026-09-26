import { ComponentScores, ScoreBreakdown } from "../../types/matching.types";

export function toScoreBreakdown(components: ComponentScores): ScoreBreakdown {
  return {
    sectorMatch: Math.round(components.sectorMatch * 25),
    stageMatch: Math.round(components.stageMatch * 25),
    locationMatch: Math.round(components.locationMatch * 15),
    fundingRangeMatch: Math.round(components.fundingRangeMatch * 20),
    eligibilityCompleteness: Math.round(components.eligibilityCompleteness * 15),
  };
}

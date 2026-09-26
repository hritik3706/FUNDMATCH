import { EligibilityImpact } from "./scheme.types";

export type EligibilityStatus =
  | "FULLY_ELIGIBLE"
  | "PARTIALLY_ELIGIBLE"
  | "UNLIKELY_ELIGIBLE"
  | "NOT_ELIGIBLE";

export type MatchedCriterion = {
  name: string;
  status: "met";
  explanation: string;
};

export type Gap = {
  name: string;
  status: "missing";
  impact: EligibilityImpact;
  howToFix: string;
  estimatedTime?: string;
  type?: string;
};

export type ScoreBreakdown = {
  sectorMatch: number;
  stageMatch: number;
  locationMatch: number;
  fundingRangeMatch: number;
  eligibilityCompleteness: number;
  ideaMatch?: number;
};

export type ComponentScores = {
  sectorMatch: number;
  stageMatch: number;
  locationMatch: number;
  fundingRangeMatch: number;
  eligibilityCompleteness: number;
};

export type SchemeMatch = {
  profileId: string;
  schemeId: string;
  schemeName: string;
  compatibilityScore: number;
  eligibilityStatus: EligibilityStatus;
  matchedCriteria: MatchedCriterion[];
  missingRequirements: Gap[];
  overallReasoning: string;
  nextSteps: string[];
  scoreBreakdown: ScoreBreakdown;
  websiteIdea?: string;
  fallbackMode?: boolean;
  fallbackReason?: string;
  accuracyNote?: string;
};

export type ActionStep = {
  stepNumber: number;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedTime: string;
  requiredDocuments: string[];
  nextStepDependency?: boolean;
  deadline: string;
  contactDetails?: string;
};

export type ActionTimelineItem = {
  day: number;
  activities: string[];
  expected: string;
};

export type ActionPlan = {
  profileId: string;
  schemeId: string;
  schemeName: string;
  steps: ActionStep[];
  totalEstimatedTime: string;
  timeline: ActionTimelineItem[];
  successCriteria: string;
  fallbackMode?: boolean;
  fallbackReason?: string;
};

export class ClaudeUnavailableError extends Error {
  constructor(message = "Claude API temporarily unavailable") {
    super(message);
    this.name = "ClaudeUnavailableError";
  }
}

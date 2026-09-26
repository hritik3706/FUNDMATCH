export type EligibilityImpact = "high" | "medium" | "low";

export type EligibilityCriterion = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  impact: EligibilityImpact;
};

export type SchemeSummary = {
  id: string;
  name: string;
  description: string;
  eligibleSectors: string[];
  eligibleStages: string[];
  eligibleLocations: string[];
  fundingMin: number;
  fundingMax: number;
  sourceUrl: string | null;
  schemeType: string | null;
};

export type Scheme = SchemeSummary & {
  eligibilityCriteria: EligibilityCriterion[];
};

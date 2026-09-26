export const SECTORS = [
  "EdTech",
  "FinTech",
  "HealthTech",
  "ClimaTech",
  "AI/ML",
  "AgriTech",
  "DeepTech",
  "Biotech",
  "Other",
] as const;

export const STAGES = ["Pre-seed", "Seed", "Series A", "Series B"] as const;

export const FOUNDER_EXPERIENCE = ["First-time", "Serial", "Angel", "VC-backed"] as const;

export const GST_STATUSES = ["Registered", "Pending", "No"] as const;

export const PROFILE_LOCATIONS = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Bengaluru",
  "Mumbai",
  "New Delhi",
] as const;

export type Sector = (typeof SECTORS)[number];
export type Stage = (typeof STAGES)[number];
export type FounderExperience = (typeof FOUNDER_EXPERIENCE)[number];
export type GstStatus = (typeof GST_STATUSES)[number];
export type ProfileLocation = (typeof PROFILE_LOCATIONS)[number];

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CreateProfileInput = {
  name: string;
  sector: Sector;
  stage: Stage;
  location: ProfileLocation;
  fundingNeeded: number;
  founderExperience: FounderExperience;
  incorporationDate?: string;
  gstStatus?: GstStatus;
  dpiitRegistration?: boolean;
  previousFunding?: number;
  websiteUrl?: string;
};

export type Profile = {
  id: string;
  name: string;
  sector: Sector;
  stage: Stage;
  location: ProfileLocation;
  fundingNeeded: number;
  founderExperience: FounderExperience;
  incorporationDate: string | null;
  gstStatus: GstStatus | null;
  dpiitRegistration: boolean;
  previousFunding: number;
  websiteUrl?: string | null;
  createdAt: string;
};

export type StartupStory = {
  text: string;
  futureIntent: string;
};

export type EligibilityCriterion = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  impact: "high" | "medium" | "low";
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
  ministry?: string | null;
  department?: string | null;
  benefit?: string | null;
  applicationDeadline?: string | null;
};

export type Scheme = SchemeSummary & {
  eligibilityCriteria: EligibilityCriterion[];
};

export type BackendEligibilityStatus =
  | "FULLY_ELIGIBLE"
  | "PARTIALLY_ELIGIBLE"
  | "UNLIKELY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "INSUFFICIENT_INFORMATION";

export type RequirementState = "satisfied" | "missing" | "unknown" | "not_satisfied";

export type MatchRelevance = "now" | "potential" | "future";

export type DisplayEligibility =
  | "ELIGIBLE"
  | "POTENTIALLY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "INSUFFICIENT_INFORMATION";

export type SchemeMatch = {
  profileId: string;
  schemeId: string;
  schemeName: string;
  compatibilityScore: number;
  eligibilityStatus: BackendEligibilityStatus;
  matchedCriteria: { name: string; status: "met"; explanation: string }[];
  missingRequirements: {
    name: string;
    status: "missing";
    impact: "high" | "medium" | "low";
    howToFix: string;
    estimatedTime?: string;
  }[];
  overallReasoning: string;
  nextSteps: string[];
  scoreBreakdown: {
    sectorMatch: number;
    stageMatch: number;
    locationMatch: number;
    fundingRangeMatch: number;
    eligibilityCompleteness: number;
  };
  requirementChecks?: {
    name: string;
    required: boolean;
    state: RequirementState;
    detail: string;
  }[];
  factorNotes?: string[];
  relevance?: MatchRelevance;
  fallbackMode?: boolean;
  fallbackReason?: string;
};

export type ActionPlan = {
  profileId: string;
  schemeId: string;
  schemeName: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
    estimatedTime: string;
    requiredDocuments: string[];
    deadline: string;
  }[];
  totalEstimatedTime: string;
  timeline: { day: number; activities: string[]; expected: string }[];
  successCriteria: string;
  fallbackMode?: boolean;
  fallbackReason?: string;
};

export type ApplicationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "DOCUMENTS_REQUIRED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type TrackedApplication = {
  id: string;
  schemeId: string;
  schemeName: string;
  status: ApplicationStatus;
  updatedAt: string;
  sourceUrl: string | null;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  category: "profile" | "scheme" | "application";
  createdAt: string;
  read: boolean;
  href?: string;
};

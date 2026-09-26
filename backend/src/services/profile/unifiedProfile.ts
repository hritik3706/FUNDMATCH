import { Profile } from "../../types/profile.types";
import { inferSector } from "../scoring/idea";
import { isSectorConflict } from "../scoring/sector";
import { SiteIdea } from "../website/readStartupSite";

export type FieldConflict = {
  field: string;
  structuredValue: string;
  otherSource: "website" | "story";
  otherValue: string;
};

export type StartupMatchingProfile = {
  startupName: string;
  sector: string;
  stage: string;
  location: { state: string };
  dpiitRecognized: boolean;
  incorporationStatus: string;
  fundingRequirement: number;
  currentFunding: number;
  technologies: string[];
  currentActivities: string[];
  futurePlans: string[];
  websiteSummary?: string;
  conflicts: FieldConflict[];
  missingFields: string[];
  sources: {
    form: boolean;
    story: boolean;
    website: boolean;
  };
};

const TECHNOLOGY_TERMS = [
  "artificial intelligence",
  "machine learning",
  "blockchain",
  "iot",
  "robotics",
  "saas",
  "mobile",
  "cloud",
];

function technologiesIn(text: string): string[] {
  const haystack = text.toLowerCase();
  return TECHNOLOGY_TERMS.filter((term) => haystack.includes(term));
}

function conflictFor(
  field: string,
  structuredValue: string,
  source: FieldConflict["otherSource"],
  text: string | undefined,
): FieldConflict | null {
  if (!text?.trim()) {
    return null;
  }
  const inferred = inferSector(text);
  if (!inferred || !isSectorConflict(structuredValue, inferred)) {
    return null;
  }
  return {
    field,
    structuredValue,
    otherSource: source,
    otherValue: inferred,
  };
}

export function buildUnifiedProfile(
  profile: Profile,
  story: string | undefined,
  futureIntent: string | undefined,
  website: SiteIdea | null,
): StartupMatchingProfile {
  const missingFields: string[] = [];
  if (!profile.sector) missingFields.push("sector");
  if (!profile.stage) missingFields.push("stage");
  if (!profile.location) missingFields.push("state");

  const conflicts = [
    conflictFor("sector", profile.sector, "website", website?.text),
    conflictFor("sector", profile.sector, "story", story),
  ].filter((item): item is FieldConflict => item !== null);

  const websiteText = website?.text ?? "";
  return {
    startupName: profile.name,
    sector: profile.sector,
    stage: profile.stage,
    location: { state: profile.location },
    dpiitRecognized: profile.dpiitRegistration,
    incorporationStatus: profile.incorporationDate ? "Incorporated" : "Not provided",
    fundingRequirement: profile.fundingNeeded,
    currentFunding: profile.previousFunding,
    technologies: technologiesIn([websiteText, story ?? ""].filter(Boolean).join(" ")),
    currentActivities: story?.trim() ? [story.trim().slice(0, 500)] : [],
    futurePlans: futureIntent?.trim() ? [futureIntent.trim().slice(0, 500)] : [],
    websiteSummary: websiteText ? websiteText.slice(0, 500) : undefined,
    conflicts,
    missingFields,
    sources: {
      form: true,
      story: Boolean(story?.trim()),
      website: Boolean(websiteText),
    },
  };
}

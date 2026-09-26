import {
  FOUNDER_EXPERIENCE,
  GST_STATUSES,
  PROFILE_LOCATIONS,
  SECTORS,
  STAGES,
  type FounderExperience,
  type GstStatus,
  type ProfileLocation,
  type Sector,
  type Stage,
} from "../../types/shared.types";
import { CreateProfileInput } from "../../types/profile.types";

export type AdvisorDraft = {
  name: string | null;
  sector: Sector | null;
  stage: Stage | null;
  location: ProfileLocation | null;
  fundingNeeded: number | null;
  founderExperience: FounderExperience | null;
  incorporationDate: string | null;
  gstStatus: GstStatus | null;
  dpiitRegistration: boolean | null;
  previousFunding: number | null;
  websiteUrl: string | null;
  founderCount: number | null;
  problem: string | null;
  city: string | null;
  technology: string | null;
  fundingPurpose: string | null;
  fundingSource: string | null;
  entityType: string | null;
  subSector: string | null;
  businessModel: string | null;
  incorporationStatus: string | null;
  udyamRegistered: boolean | null;
  hasRevenue: boolean | null;
  gstApplicable: boolean | null;
};

export type DraftUpdates = Partial<AdvisorDraft>;

export const emptyDraft = (): AdvisorDraft => ({
  name: null,
  sector: null,
  stage: null,
  location: null,
  fundingNeeded: null,
  founderExperience: null,
  incorporationDate: null,
  gstStatus: null,
  dpiitRegistration: null,
  previousFunding: null,
  websiteUrl: null,
  founderCount: null,
  problem: null,
  city: null,
  technology: null,
  fundingPurpose: null,
  fundingSource: null,
  entityType: null,
  subSector: null,
  businessModel: null,
  incorporationStatus: null,
  udyamRegistered: null,
  hasRevenue: null,
  gstApplicable: null,
});

const CITY_TO_LOCATION: Record<string, ProfileLocation> = {
  kanpur: "Uttar Pradesh",
  lucknow: "Uttar Pradesh",
  noida: "Uttar Pradesh",
  ghaziabad: "Uttar Pradesh",
  varanasi: "Uttar Pradesh",
  agra: "Uttar Pradesh",
  prayagraj: "Uttar Pradesh",
  meerut: "Uttar Pradesh",
  pune: "Maharashtra",
  nagpur: "Maharashtra",
  nashik: "Maharashtra",
  hyderabad: "Telangana",
  chennai: "Tamil Nadu",
  coimbatore: "Tamil Nadu",
  kolkata: "West Bengal",
  ahmedabad: "Gujarat",
  surat: "Gujarat",
  jaipur: "Rajasthan",
  indore: "Madhya Pradesh",
  bhopal: "Madhya Pradesh",
  kochi: "Kerala",
  thiruvananthapuram: "Kerala",
  chandigarh: "Chandigarh",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  mumbai: "Mumbai",
  delhi: "Delhi",
  "new delhi": "New Delhi",
};

const SECTOR_RULES: Array<[RegExp, Sector]> = [
  [/agri|farmer|farming|kisan|cold[\s-]?chain/, "AgriTech"],
  [/fintech|payment|lending|neobank|insurtech/, "FinTech"],
  [/health|medic|hospital|diagnostic/, "HealthTech"],
  [/climate|clean energy|solar|carbon/, "ClimaTech"],
  [/biotech|life science/, "Biotech"],
  [/deep[\s-]?tech|semiconductor|robotics/, "DeepTech"],
  [/edtech|education technology|learning app/, "EdTech"],
  [/\bai\b|artificial intelligence|machine learning/, "AI/ML"],
];

export function requiredMissing(draft: AdvisorDraft): Array<"sector" | "location" | "stage" | "fundingNeeded"> {
  const missing: Array<"sector" | "location" | "stage" | "fundingNeeded"> = [];
  if (!draft.sector) missing.push("sector");
  if (!draft.location) missing.push("location");
  if (!draft.stage) missing.push("stage");
  if (!draft.fundingNeeded) missing.push("fundingNeeded");
  return missing;
}

export function questionFor(field: "sector" | "location" | "stage" | "fundingNeeded" | "dpiit"): string {
  switch (field) {
    case "sector":
      return "What kind of startup is this? AgriTech, FinTech, HealthTech, or AI/ML is enough.";
    case "location":
      return "Which state is the startup based in?";
    case "stage":
      return "How far along are you: still at prototype, or already with early customers?";
    case "fundingNeeded":
      return "How much funding are you looking for? An amount in lakhs is enough, for example 25 lakh.";
    default:
      return "One thing that changes several schemes: do you already have DPIIT recognition?";
  }
}

export function materialKey(draft: AdvisorDraft): string {
  return JSON.stringify({
    sector: draft.sector,
    stage: draft.stage,
    location: draft.location,
    fundingNeeded: draft.fundingNeeded,
    dpiitRegistration: draft.dpiitRegistration,
    gstStatus: draft.gstStatus,
    previousFunding: draft.previousFunding,
    incorporationDate: draft.incorporationDate,
    fundingPurpose: draft.fundingPurpose,
    technology: draft.technology,
  });
}

export type ProfileInsight = {
  statedIntent: string | null;
  targetSector: string | null;
  targetStage: string | null;
  technology: string | null;
  subSector: string | null;
  entityType: string | null;
  city: string | null;
  gstLabel: string | null;
  dpiitLabel: string | null;
  udyamLabel: string | null;
  incorporationLabel: string | null;
  fundingPurpose: string | null;
  revenueLabel: string | null;
  completeness: number;
  summary: string;
};

export function profileInsight(draft: AdvisorDraft): ProfileInsight {
  const statedIntent = draft.fundingPurpose ?? draft.problem;
  const gstLabel = labelGst(draft);
  const dpiitLabel = draft.dpiitRegistration === null ? null : draft.dpiitRegistration ? "Recognised" : "Not recognised";
  const udyamLabel = draft.udyamRegistered === null ? null : draft.udyamRegistered ? "Registered" : "Not registered";
  const incorporationLabel = draft.incorporationStatus ?? (draft.incorporationDate ? "Incorporated" : null);
  const revenueLabel = draft.hasRevenue === null ? null : draft.hasRevenue ? "Has revenue" : "Pre-revenue";
  const completeness = completenessScore(draft);
  const place = [draft.city, draft.location].filter(Boolean).join(", ");
  const summary = draft.sector
    ? `This is a ${draft.stage ?? "startup"} ${draft.sector} startup${place ? ` in ${place}` : ""}${draft.fundingNeeded ? `, seeking Rs ${draft.fundingNeeded} lakh` : ""}${statedIntent ? ` for ${statedIntent.toLowerCase()}` : ""}.`
    : "Tell me what you are building, where you are based, and how much funding you need.";
  return {
    statedIntent,
    targetSector: draft.sector,
    targetStage: draft.stage,
    technology: draft.technology,
    subSector: draft.subSector,
    entityType: draft.entityType,
    city: draft.city,
    gstLabel,
    dpiitLabel,
    udyamLabel,
    incorporationLabel,
    fundingPurpose: draft.fundingPurpose,
    revenueLabel,
    completeness,
    summary,
  };
}

export function confirmationMessage(draft: AdvisorDraft): string {
  const insight = profileInsight(draft);
  return [
    "Here is what I understood. This is not a government approval.",
    `Startup: ${draft.name ?? `${draft.sector ?? "Untitled"} startup`}`,
    `Sector: ${insight.targetSector ?? "not stated"}`,
    `Technology: ${insight.technology ?? "not stated"}`,
    `Location: ${[draft.city, draft.location].filter(Boolean).join(", ") || "not stated"}`,
    `Stage: ${insight.targetStage ?? "not stated"}`,
    `Funding sought: ${draft.fundingNeeded ? `Rs ${draft.fundingNeeded} lakh` : "not stated"}`,
    `Purpose: ${insight.statedIntent ?? "not stated"}`,
    `GST: ${insight.gstLabel ?? "not stated"}`,
    `DPIIT: ${insight.dpiitLabel ?? "not stated"}`,
    "Choose Confirm and analyze, or tell me what to correct.",
  ].join("\n");
}

export function isConfirmation(text: string): boolean {
  return /^(yes|yeah|yep|confirm|analyse|analyze|go ahead|looks good|that is right|that's right|correct)\b/i.test(text.trim());
}

export function toCreateProfile(draft: AdvisorDraft): CreateProfileInput {
  if (!draft.sector || !draft.stage || !draft.location || !draft.fundingNeeded) {
    throw new Error("Profile is not ready to match");
  }
  return {
    name: (draft.name ?? `${draft.sector} startup`).slice(0, 255),
    sector: draft.sector,
    stage: draft.stage,
    location: draft.location,
    fundingNeeded: draft.fundingNeeded,
    founderExperience: draft.founderExperience ?? "First-time",
    ...(draft.incorporationDate ? { incorporationDate: draft.incorporationDate } : {}),
    ...(draft.gstStatus ? { gstStatus: draft.gstStatus } : {}),
    dpiitRegistration: draft.dpiitRegistration ?? false,
    previousFunding: draft.previousFunding ?? 0,
    ...(draft.websiteUrl ? { websiteUrl: draft.websiteUrl } : {}),
  };
}

export function mergeDraft(draft: AdvisorDraft, updates: Partial<Record<keyof AdvisorDraft, unknown>>): AdvisorDraft {
  const next = { ...draft };
  const name = cleanText(updates.name);
  if (name) next.name = name.slice(0, 255);
  const sector = normalizeSector(updates.sector);
  if (sector) next.sector = sector;
  const stage = normalizeStage(updates.stage);
  if (stage) next.stage = stage;
  const location = normalizeLocation(updates.location);
  if (location) next.location = location;
  const fundingNeeded = normalizeLakhs(updates.fundingNeeded);
  if (fundingNeeded) next.fundingNeeded = fundingNeeded;
  const previousFunding = normalizeLakhs(updates.previousFunding, true);
  if (previousFunding !== null && updates.previousFunding !== undefined && updates.previousFunding !== null) {
    next.previousFunding = previousFunding;
  }
  const experience = normalizeExperience(updates.founderExperience);
  if (experience) next.founderExperience = experience;
  const gst = normalizeGst(updates.gstStatus);
  if (gst) next.gstStatus = gst;
  if (typeof updates.dpiitRegistration === "boolean") next.dpiitRegistration = updates.dpiitRegistration;
  const incorporated = normalizeDate(updates.incorporationDate);
  if (incorporated) next.incorporationDate = incorporated;
  const website = cleanText(updates.websiteUrl);
  if (website && /^https?:\/\/\S+$/i.test(website)) next.websiteUrl = website.slice(0, 500);
  const founders = normalizeCount(updates.founderCount);
  if (founders) next.founderCount = founders;
  const problem = cleanText(updates.problem);
  if (problem) next.problem = problem.slice(0, 280);
  assignText(next, "city", updates.city, 80);
  assignText(next, "technology", updates.technology, 80);
  assignText(next, "fundingPurpose", updates.fundingPurpose, 160);
  assignText(next, "entityType", updates.entityType, 80);
  assignText(next, "subSector", updates.subSector, 80);
  assignText(next, "businessModel", updates.businessModel, 40);
  assignText(next, "incorporationStatus", updates.incorporationStatus, 40);
  if (typeof updates.udyamRegistered === "boolean") next.udyamRegistered = updates.udyamRegistered;
  if (typeof updates.hasRevenue === "boolean") next.hasRevenue = updates.hasRevenue;
  if (typeof updates.gstApplicable === "boolean") next.gstApplicable = updates.gstApplicable;
  return next;
}

export function extractFromText(text: string): DraftUpdates {
  const lower = text.toLowerCase();
  const updates: DraftUpdates = {};

  for (const [pattern, sector] of SECTOR_RULES) {
    if (pattern.test(lower)) {
      updates.sector = sector;
      break;
    }
  }

  updates.location = locationFromText(lower);
  updates.stage = stageFromText(lower);

  const sought = amountAfter(lower, /(?:looking for|seeking|need|raise|raising|funding of|want(?:ed)?)\D{0,24}(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l)\b/);
  const invested = amountAfter(lower, /(?:invested|bootstrapped|put in|self[- ]funded|ourselves)\D{0,24}(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l)\b/);
  const loose = amountAfter(lower, /(?:₹|rs\.?)\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac)\b/);
  if (sought) updates.fundingNeeded = sought;
  else if (loose && /funding|raise|seeking|looking/.test(lower)) updates.fundingNeeded = loose;
  if (invested !== null) updates.previousFunding = invested;

  const founders = lower.match(/(\d+)\s+founders?/);
  if (founders) updates.founderCount = Number(founders[1]);

  if (/dpiit/.test(lower)) {
    updates.dpiitRegistration = !/\b(not yet|no|without|haven't|havent|do not|don't|dont)\b/.test(lower);
  }
  if (/gst/.test(lower)) {
    if (/not required|not applicable|exempt/.test(lower)) {
      updates.gstStatus = "No";
      updates.gstApplicable = false;
    } else if (/pending/.test(lower)) updates.gstStatus = "Pending";
    else if (/\bno\b|not registered|without|haven't|havent/.test(lower)) updates.gstStatus = "No";
    else updates.gstStatus = "Registered";
  }
  if (/\b[0-9]{2}[a-z]{5}[0-9]{4}[a-z][a-z0-9]z[a-z0-9]\b/i.test(text)) {
    updates.gstStatus = "Registered";
  }

  if (/udyam|msme registration/.test(lower)) {
    updates.udyamRegistered = !/\b(no|not|without|haven't|havent)\b/.test(lower);
  }
  if (/no revenue|haven't made|havent made|pre-revenue|not making revenue|no sales yet/.test(lower)) updates.hasRevenue = false;
  else if (/we have revenue|monthly revenue|annual revenue|paying customers/.test(lower)) updates.hasRevenue = true;

  if (/private limited|pvt\.? ltd/.test(lower)) updates.entityType = "Private Limited Company";
  else if (/\bllp\b/.test(lower)) updates.entityType = "LLP";
  else if (/proprietorship/.test(lower)) updates.entityType = "Sole Proprietorship";
  else if (/partnership/.test(lower)) updates.entityType = "Partnership";

  if (/not incorporated|yet to incorporate|not registered as a company/.test(lower)) updates.incorporationStatus = "Not incorporated";
  else if (/incorporated|private limited|pvt\.? ltd|\bllp\b/.test(lower)) updates.incorporationStatus = "Incorporated";
  if (/incorporated last year/.test(lower)) updates.incorporationDate = `${new Date().getFullYear() - 1}-01-01`;

  const purposes: string[] = [];
  if (/pilot/.test(lower)) purposes.push("Pilot");
  if (/hiring|hire /.test(lower)) purposes.push("Hiring");
  if (/product development|build the product|building the product/.test(lower)) purposes.push("Product development");
  if (/expand|expansion/.test(lower)) purposes.push("Expansion");
  if (/equipment|machinery/.test(lower)) purposes.push("Equipment");
  if (/marketing/.test(lower)) purposes.push("Marketing");
  if (/working capital/.test(lower)) purposes.push("Working capital");
  if (purposes.length) updates.fundingPurpose = purposes.join(", ");

  const technologies: string[] = [];
  if (/\bai\b|artificial intelligence|machine learning/.test(lower)) technologies.push("AI");
  if (/\biot\b|internet of things/.test(lower)) technologies.push("IoT");
  if (/blockchain/.test(lower)) technologies.push("Blockchain");
  if (/drone/.test(lower)) technologies.push("Drones");
  if (technologies.length) updates.technology = technologies.join(", ");
  if (/farmer/.test(lower)) updates.subSector = "Small farmers";
  if (/\bb2b\b/.test(lower)) updates.businessModel = "B2B";
  else if (/\bb2c\b/.test(lower)) updates.businessModel = "B2C";
  else if (/\bb2g\b/.test(lower)) updates.businessModel = "B2G";

  for (const city of Object.keys(CITY_TO_LOCATION)) {
    if (lower.includes(city)) {
      updates.city = city.replace(/\b\w/g, (letter) => letter.toUpperCase());
      break;
    }
  }

  const year = lower.match(/(?:incorporated|founded|started)\s+(?:in\s+)?(20\d{2})/);
  if (year) updates.incorporationDate = `${year[1]}-01-01`;
  const url = text.match(/https?:\/\/\S+/i);
  if (url) updates.websiteUrl = url[0].replace(/[),.]+$/, "");

  if (/serial founder|second startup|my previous startup/.test(lower)) updates.founderExperience = "Serial";
  else if (/first[- ]time/.test(lower)) updates.founderExperience = "First-time";

  const named = text.match(/\b(?:called|named)\s+([A-Z][\w&.\- ]{1,40})/);
  if (named) updates.name = named[1].trim();

  return updates;
}

export function readShortDpiitAnswer(text: string): boolean | null {
  const lower = text.trim().toLowerCase();
  if (/^(yes|yeah|yep|we do|we have|recognised|recognized)\b/.test(lower)) return true;
  if (/^(no|nope|not yet|not really|we don't|we dont|haven't|havent)\b/.test(lower)) return false;
  return null;
}

function assignText(draft: AdvisorDraft, key: "city" | "technology" | "fundingPurpose" | "entityType" | "subSector" | "businessModel" | "incorporationStatus" | "fundingSource", value: unknown, max: number): void {
  const text = cleanText(value);
  if (text) draft[key] = text.slice(0, max);
}

function labelGst(draft: AdvisorDraft): string | null {
  if (draft.gstApplicable === false) return "Not required";
  if (draft.gstStatus === "Registered") return "Registered";
  if (draft.gstStatus === "Pending") return "Pending";
  if (draft.gstStatus === "No") return "Not registered";
  return null;
}

function completenessScore(draft: AdvisorDraft): number {
  const checks: Array<[boolean, number]> = [
    [Boolean(draft.sector), 15],
    [Boolean(draft.stage), 15],
    [Boolean(draft.location), 10],
    [Boolean(draft.fundingNeeded), 15],
    [draft.dpiitRegistration !== null || draft.gstStatus !== null, 15],
    [Boolean(draft.incorporationStatus || draft.incorporationDate || draft.entityType), 10],
    [Boolean(draft.fundingPurpose || draft.problem), 10],
    [Boolean(draft.technology), 5],
    [Boolean(draft.founderCount), 5],
  ];
  return checks.reduce((total, [present, weight]) => total + (present ? weight : 0), 0);
}

function locationFromText(lower: string): ProfileLocation | null {
  const byLength = [...PROFILE_LOCATIONS].sort((left, right) => right.length - left.length);
  for (const location of byLength) {
    if (lower.includes(location.toLowerCase())) return location;
  }
  for (const [city, location] of Object.entries(CITY_TO_LOCATION)) {
    if (lower.includes(city)) return location;
  }
  return null;
}

function stageFromText(lower: string): Stage | null {
  if (/series b/.test(lower)) return "Series B";
  if (/series a/.test(lower)) return "Series A";
  if (/pre-seed|preseed|prototype|mvp|idea stage|building the product|minimum viable/.test(lower)) return "Pre-seed";
  if (/seed round|\bseed\b|early customers|paying customers|pilot/.test(lower)) return "Seed";
  return null;
}

function amountAfter(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const unit = match[2];
  const lakhs = unit === "crore" || unit === "cr" ? value * 100 : value;
  return Math.max(1, Math.round(lakhs));
}

function normalizeSector(value: unknown): Sector | null {
  if (typeof value !== "string") return null;
  const exact = SECTORS.find((sector) => sector.toLowerCase() === value.trim().toLowerCase());
  if (exact) return exact;
  return extractFromText(value).sector ?? null;
}

function normalizeStage(value: unknown): Stage | null {
  if (typeof value !== "string") return null;
  const exact = STAGES.find((stage) => stage.toLowerCase() === value.trim().toLowerCase());
  if (exact) return exact;
  return stageFromText(value.toLowerCase());
}

function normalizeLocation(value: unknown): ProfileLocation | null {
  if (typeof value !== "string") return null;
  return locationFromText(value.toLowerCase());
}

function normalizeExperience(value: unknown): FounderExperience | null {
  if (typeof value !== "string") return null;
  return FOUNDER_EXPERIENCE.find((item) => item.toLowerCase() === value.trim().toLowerCase()) ?? null;
}

function normalizeGst(value: unknown): GstStatus | null {
  if (typeof value !== "string") return null;
  return GST_STATUSES.find((item) => item.toLowerCase() === value.trim().toLowerCase()) ?? null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function normalizeLakhs(value: unknown, allowZero = false): number | null {
  if (typeof value === "string") {
    const parsed = amountAfter(value.toLowerCase(), /(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l)\b/);
    if (parsed) return parsed;
    const numeric = Number(value.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(numeric)) return null;
    return normalizeLakhs(numeric, allowZero);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const lakhs = value >= 10000 ? Math.round(value / 100000) : Math.round(value);
  if (lakhs < 0) return null;
  if (lakhs === 0) return allowZero ? 0 : null;
  return lakhs;
}

function normalizeCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const count = Math.round(value);
  if (count < 1 || count > 50) return null;
  return count;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length ? text : null;
}

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
  });
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
    if (/pending/.test(lower)) updates.gstStatus = "Pending";
    else if (/\bno\b|not registered|without/.test(lower)) updates.gstStatus = "No";
    else updates.gstStatus = "Registered";
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

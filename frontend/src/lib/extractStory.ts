import type { GstStatus, ProfileLocation, Sector, Stage } from "@/lib/types";
import { PROFILE_LOCATIONS, SECTORS, STAGES } from "@/lib/types";

export type StoryExtract = {
  name: string;
  sector: Sector | "";
  stage: Stage | "";
  location: ProfileLocation | "";
  fundingInr: number;
  previousFundingInr: number;
  gstStatus?: GstStatus;
  product: string;
  technology: string;
  purpose: string;
};

const CITIES: Record<string, ProfileLocation> = {
  kanpur: "Uttar Pradesh",
  lucknow: "Uttar Pradesh",
  noida: "Uttar Pradesh",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  mumbai: "Mumbai",
  delhi: "Delhi",
  pune: "Maharashtra",
  hyderabad: "Telangana",
  chennai: "Tamil Nadu",
};

export function extractStory(text: string): StoryExtract {
  const lower = text.toLowerCase();
  const sector = readSector(lower);
  const product = readProduct(lower);
  const fundingInr = readMoney(lower, /(?:fund|funding|raise|raising|looking for|want(?:ed)?|need)\D{0,24}(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(crore|cr|lakh|lac|l)?/);
  const previousFundingInr = readMoney(lower, /(?:invested|bootstrapped|put in|ourselves)\D{0,24}(?:₹|rs\.?|inr)?\s*(\d[\d,]*)\s*(crore|cr|lakh|lac|l)?/);
  return {
    name: product ? `${product} startup` : "",
    sector,
    stage: readStage(lower),
    location: readLocation(lower),
    fundingInr,
    previousFundingInr,
    gstStatus: /gst/.test(lower) ? (/pending/.test(lower) ? "Pending" : /\bno\b|not registered/.test(lower) ? "No" : "Registered") : undefined,
    product,
    technology: /\bai\b|artificial intelligence|machine learning/.test(lower) ? "AI" : "",
    purpose: readPurpose(lower),
  };
}

export function storedToInr(value: number | null | undefined): number {
  if (!value) return 0;
  if (value >= 100000) return value;
  return value * 100000;
}

export function inrToLakhs(value: number): number {
  if (!value) return 0;
  if (value >= 100000) return Math.max(1, Math.round(value / 100000));
  return Math.max(1, Math.round(value));
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function readSector(lower: string): Sector | "" {
  if (/food|beverage|drink|fmcg|restaurant/.test(lower)) return "Other";
  if (/agri|farmer|farming/.test(lower)) return "AgriTech";
  if (/fintech|payment|lending/.test(lower)) return "FinTech";
  if (/health|medic/.test(lower)) return "HealthTech";
  if (/climate|clean energy|solar/.test(lower)) return "ClimaTech";
  if (/biotech/.test(lower)) return "Biotech";
  if (/edtech|education/.test(lower)) return "EdTech";
  if (/deep[\s-]?tech|robot/.test(lower)) return "DeepTech";
  if (/\bai\b|machine learning|artificial intelligence/.test(lower)) return "AI/ML";
  const exact = SECTORS.find((sector) => lower.includes(sector.toLowerCase()));
  return exact ?? "";
}

function readProduct(lower: string): string {
  if (/food and beverages|food & beverages|food and beverage/.test(lower)) return "Food and beverages";
  if (/beverage/.test(lower)) return "Beverages";
  if (/food/.test(lower)) return "Food";
  return "";
}

function readStage(lower: string): Stage | "" {
  if (/series b/.test(lower)) return "Series B";
  if (/series a/.test(lower)) return "Series A";
  if (/prototype|mvp|idea|building|pre-seed|starting/.test(lower)) return "Pre-seed";
  if (/\bseed\b|early customers|pilot/.test(lower)) return "Seed";
  const exact = STAGES.find((stage) => lower.includes(stage.toLowerCase()));
  return exact ?? "";
}

function readLocation(lower: string): ProfileLocation | "" {
  const states = [...PROFILE_LOCATIONS].sort((left, right) => right.length - left.length);
  for (const state of states) {
    if (lower.includes(state.toLowerCase())) return state;
  }
  for (const [city, state] of Object.entries(CITIES)) {
    if (lower.includes(city)) return state;
  }
  return "";
}

function readPurpose(lower: string): string {
  const parts: string[] = [];
  if (/pilot/.test(lower)) parts.push("Pilot");
  if (/hiring|hire /.test(lower)) parts.push("Hiring");
  if (/\bproduct\b/.test(lower)) parts.push("Product");
  if (/expand/.test(lower)) parts.push("Expansion");
  return parts.join(", ");
}

function readMoney(lower: string, pattern: RegExp): number {
  const match = lower.match(pattern);
  if (!match) return 0;
  const amount = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const unit = match[2] ?? "";
  if (unit === "crore" || unit === "cr") return amount * 10000000;
  if (unit === "lakh" || unit === "lac" || unit === "l") return amount * 100000;
  return amount;
}

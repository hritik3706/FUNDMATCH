import { findSchemeById, listSchemes } from "../repositories/scheme.repository";
import { findStoredMatch, upsertMatch } from "../repositories/match.repository";
import { findProfileById } from "../repositories/profile.repository";
import { HttpError } from "../middleware/httpError";
import { ClaudeUnavailableError, Gap, SchemeMatch } from "../types/matching.types";
import { Scheme } from "../types/scheme.types";
import { Profile } from "../types/profile.types";
import { CACHE_TTL, cacheGet, cacheSet, matchCacheKey } from "./cache.service";
import { completeJson, parseModelJson } from "./claude.service";
import { buildFallbackMatch } from "./fallbackMatch";
import { buildMatchingPrompt } from "./prompts/matchingPrompt";
import { toScoreBreakdown } from "./scoring/breakdown";
import { determineEligibility } from "./scoring/eligibility";
import { componentScores, formulaScore } from "./scoring/formula";
import { detectGaps } from "./scoring/gaps";
import { ideaScore } from "./scoring/idea";
import { readStartupSite } from "./website/readStartupSite";

type ClaudeMatchJson = {
  compatibilityScore?: number;
  matchedCriteria?: SchemeMatch["matchedCriteria"];
  missingRequirements?: Gap[];
  overallReasoning?: string;
  nextSteps?: string[];
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(Math.max(0, Math.min(100, value)));
}

function blendWithIdea(baseScore: number, siteIdea: number | undefined): number {
  if (siteIdea === undefined) {
    return baseScore;
  }
  return clampScore(baseScore * 0.8 + siteIdea * 20);
}

async function matchWithClaude(profile: Profile, scheme: Scheme, ideaText?: string): Promise<SchemeMatch> {
  const raw = await completeJson(buildMatchingPrompt(profile, scheme, ideaText), 1800);
  const parsed = parseModelJson<ClaudeMatchJson>(raw);
  const gaps = (parsed.missingRequirements?.length
    ? parsed.missingRequirements
    : detectGaps(profile, scheme.eligibilityCriteria)
  ).map((gap) => ({
    name: gap.name,
    status: "missing" as const,
    impact: gap.impact ?? "medium",
    howToFix: gap.howToFix ?? `Complete ${gap.name}`,
    estimatedTime: gap.estimatedTime,
    type: gap.type,
  }));
  const components = componentScores(profile, scheme);
  const siteIdea = ideaText?.trim() ? ideaScore(ideaText, scheme) : undefined;
  const compatibilityScore = blendWithIdea(
    clampScore(parsed.compatibilityScore ?? formulaScore(components)),
    siteIdea,
  );
  const fallback = buildFallbackMatch(profile, scheme, ideaText);

  return {
    profileId: profile.id,
    schemeId: scheme.id,
    schemeName: scheme.name,
    compatibilityScore,
    eligibilityStatus: determineEligibility(compatibilityScore, gaps),
    matchedCriteria: parsed.matchedCriteria?.length ? parsed.matchedCriteria : fallback.matchedCriteria,
    missingRequirements: gaps,
    overallReasoning: parsed.overallReasoning ?? fallback.overallReasoning,
    nextSteps: parsed.nextSteps?.length ? parsed.nextSteps : fallback.nextSteps,
    scoreBreakdown: toScoreBreakdown(components, siteIdea),
    websiteIdea: ideaText?.trim() ? ideaText.trim().slice(0, 500) : undefined,
  };
}

async function matchOne(profile: Profile, scheme: Scheme, ideaText?: string): Promise<SchemeMatch> {
  const key = matchCacheKey(profile.id, scheme.id);
  const cached = cacheGet<SchemeMatch>(key);
  if (cached) {
    return cached;
  }

  const stored = await findStoredMatch(profile.id, scheme.id);
  if (stored) {
    cacheSet(key, stored, CACHE_TTL.matchMs);
    return stored;
  }

  let match: SchemeMatch;
  try {
    match = await matchWithClaude(profile, scheme, ideaText);
  } catch (error) {
    if (error instanceof ClaudeUnavailableError) {
      match = buildFallbackMatch(profile, scheme, ideaText);
    } else {
      match = buildFallbackMatch(profile, scheme, ideaText);
    }
  }

  cacheSet(key, match, CACHE_TTL.matchMs);
  await upsertMatch(match);
  return match;
}

export async function analyzeProfile(profileId: string): Promise<{
  matches: SchemeMatch[];
  processedSchemes: number;
  totalTime: number;
  fallbackMode: boolean;
}> {
  const started = Date.now();
  const profile = await findProfileById(profileId);
  if (!profile) {
    throw new HttpError(404, "Resource not found", undefined, `Profile with ID ${profileId} not found`);
  }

  const idea = profile.websiteUrl ? await readStartupSite(profile.websiteUrl) : null;
  const summaries = await listSchemes();
  const schemes = (
    await Promise.all(summaries.map((summary) => findSchemeById(summary.id)))
  ).filter((scheme): scheme is Scheme => scheme !== null);

  const matches = await Promise.all(schemes.map((scheme) => matchOne(profile, scheme, idea?.text)));
  matches.sort((left, right) => right.compatibilityScore - left.compatibilityScore);

  return {
    matches: matches.slice(0, 10),
    processedSchemes: schemes.length,
    totalTime: Math.round(((Date.now() - started) / 1000) * 10) / 10,
    fallbackMode: matches.some((match) => match.fallbackMode),
  };
}

export async function getMatchDetail(profileId: string, schemeId: string): Promise<SchemeMatch> {
  const profile = await findProfileById(profileId);
  if (!profile) {
    throw new HttpError(404, "Resource not found", undefined, `Profile with ID ${profileId} not found`);
  }
  const scheme = await findSchemeById(schemeId);
  if (!scheme) {
    throw new HttpError(404, "Resource not found", undefined, "Scheme not found");
  }
  const idea = profile.websiteUrl ? await readStartupSite(profile.websiteUrl) : null;
  return matchOne(profile, scheme, idea?.text);
}

import { env } from "../config/env";
import { findSchemeById, listSchemes } from "../repositories/scheme.repository";
import { findStoredMatch, upsertMatch } from "../repositories/match.repository";
import { findProfileById } from "../repositories/profile.repository";
import { HttpError } from "../middleware/httpError";
import { SchemeMatch, SCORING_VERSION } from "../types/matching.types";
import { Scheme } from "../types/scheme.types";
import { Profile } from "../types/profile.types";
import { CACHE_TTL, cacheGet, cacheSet, matchCacheKey } from "./cache.service";
import { buildFallbackMatch } from "./fallbackMatch";
import { buildUnifiedProfile, FieldConflict, StartupMatchingProfile } from "./profile/unifiedProfile";
import { componentScores } from "./scoring/formula";
import { ideaScore } from "./scoring/idea";
import { selectRelevant } from "./scoring/relevance";
import { readStartupWebsite, WebsiteStatus } from "./website/firecrawl";

export type MatchContext = {
  story?: string;
  futureIntent?: string;
};

export type AnalyzeResult = {
  matches: SchemeMatch[];
  processedSchemes: number;
  totalRelevant: number;
  matchThreshold: number;
  totalTime: number;
  websiteStatus: WebsiteStatus;
  websiteNotice?: string;
  conflicts: FieldConflict[];
  missingFields: string[];
  informationStatus: "ready" | "incomplete" | "conflict";
  unifiedProfile: StartupMatchingProfile;
  fallbackMode: boolean;
  fallbackReason?: string;
};

function contextHash(profile: Profile, context: MatchContext, websiteText: string): string {
  const text = [
    profile.sector,
    profile.stage,
    profile.location,
    String(profile.fundingNeeded),
    profile.gstStatus ?? "",
    String(profile.dpiitRegistration),
    profile.incorporationDate ?? "",
    profile.websiteUrl ?? "",
    context.story ?? "",
    context.futureIntent ?? "",
    websiteText,
    String(env.MATCH_THRESHOLD),
    String(SCORING_VERSION),
  ].join("\n");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16);
}

function ideaTextFor(context: MatchContext, websiteText: string): string | undefined {
  const text = [websiteText, context.story?.trim() ?? ""].filter(Boolean).join("\n");
  return text || undefined;
}

async function scoreScheme(
  profile: Profile,
  scheme: Scheme,
  context: MatchContext,
  websiteText: string,
  hash: string,
): Promise<SchemeMatch> {
  const key = matchCacheKey(profile.id, scheme.id, hash);
  const cached = cacheGet<SchemeMatch>(key);
  if (cached && cached.scoringVersion === SCORING_VERSION && cached.contextHash === hash) {
    return cached;
  }

  const stored = await findStoredMatch(profile.id, scheme.id);
  if (stored && stored.scoringVersion === SCORING_VERSION && stored.contextHash === hash) {
    cacheSet(key, stored, CACHE_TTL.matchMs);
    return stored;
  }

  const match = buildFallbackMatch(profile, scheme, ideaTextFor(context, websiteText));
  match.contextHash = hash;
  cacheSet(key, match, CACHE_TTL.matchMs);
  await upsertMatch(match);
  return match;
}

export async function analyzeProfile(profileId: string, context: MatchContext = {}): Promise<AnalyzeResult> {
  const started = Date.now();
  const profile = await findProfileById(profileId);
  if (!profile) {
    throw new HttpError(404, "Resource not found", undefined, `Profile with ID ${profileId} not found`);
  }

  const website = await readStartupWebsite(profile.websiteUrl);
  const websiteText = website.idea?.text ?? "";
  const unifiedProfile = buildUnifiedProfile(profile, context.story, context.futureIntent, website.idea);
  const hash = contextHash(profile, context, websiteText);

  if (unifiedProfile.missingFields.length > 0) {
    return {
      matches: [],
      processedSchemes: 0,
      totalRelevant: 0,
      matchThreshold: env.MATCH_THRESHOLD,
      totalTime: Math.round(((Date.now() - started) / 1000) * 10) / 10,
      websiteStatus: website.status,
      websiteNotice: website.notice,
      conflicts: unifiedProfile.conflicts,
      missingFields: unifiedProfile.missingFields,
      informationStatus: "incomplete",
      unifiedProfile,
      fallbackMode: false,
    };
  }

  const summaries = await listSchemes();
  const schemes = (
    await Promise.all(summaries.map((summary) => findSchemeById(summary.id)))
  ).filter((scheme): scheme is Scheme => scheme !== null);

  const scored = await Promise.all(
    schemes.map(async (scheme) => {
      const match = await scoreScheme(profile, scheme, context, websiteText, hash);
      const futureFit = context.futureIntent?.trim() ? ideaScore(context.futureIntent, scheme) : 0;
      return {
        match,
        components: componentScores(profile, scheme),
        futureFit,
      };
    }),
  );

  const matches = selectRelevant(scored, env.MATCH_THRESHOLD);
  await Promise.all(matches.map((match) => upsertMatch(match)));

  return {
    matches,
    processedSchemes: schemes.length,
    totalRelevant: matches.length,
    matchThreshold: env.MATCH_THRESHOLD,
    totalTime: Math.round(((Date.now() - started) / 1000) * 10) / 10,
    websiteStatus: website.status,
    websiteNotice: website.notice,
    conflicts: unifiedProfile.conflicts,
    missingFields: unifiedProfile.missingFields,
    informationStatus: unifiedProfile.conflicts.length > 0 ? "conflict" : "ready",
    unifiedProfile,
    fallbackMode: false,
  };
}

export async function getMatchDetail(
  profileId: string,
  schemeId: string,
  context: MatchContext = {},
): Promise<SchemeMatch> {
  const profile = await findProfileById(profileId);
  if (!profile) {
    throw new HttpError(404, "Resource not found", undefined, `Profile with ID ${profileId} not found`);
  }
  const scheme = await findSchemeById(schemeId);
  if (!scheme) {
    throw new HttpError(404, "Resource not found", undefined, "Scheme not found");
  }
  const website = await readStartupWebsite(profile.websiteUrl);
  const websiteText = website.idea?.text ?? "";
  const hash = contextHash(profile, context, websiteText);
  const match = await scoreScheme(profile, scheme, context, websiteText, hash);
  const futureFit = context.futureIntent?.trim() ? ideaScore(context.futureIntent, scheme) : 0;
  const [relevant] = selectRelevant(
    [{ match, components: componentScores(profile, scheme), futureFit }],
    env.MATCH_THRESHOLD,
  );
  return relevant ?? match;
}

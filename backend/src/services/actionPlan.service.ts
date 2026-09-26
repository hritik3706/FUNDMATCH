import { findStoredActionPlan, upsertActionPlan } from "../repositories/match.repository";
import { findProfileById } from "../repositories/profile.repository";
import { findSchemeById } from "../repositories/scheme.repository";
import { HttpError } from "../middleware/httpError";
import { ActionPlan, ActionStep, ClaudeUnavailableError } from "../types/matching.types";
import { CACHE_TTL, actionPlanCacheKey, cacheGet, cacheSet } from "./cache.service";
import { completeJson, parseModelJson } from "./claude.service";
import { buildFallbackActionPlan } from "./fallbackActionPlan";
import { buildActionPlanPrompt } from "./prompts/actionPlanPrompt";
import { detectGaps } from "./scoring/gaps";

type ClaudeActionJson = {
  actionPlan?: ActionStep[];
  steps?: ActionStep[];
  totalEstimatedTime?: string;
  timeline?: ActionPlan["timeline"];
  successCriteria?: string;
};

export async function generateActionPlan(profileId: string, schemeId: string): Promise<ActionPlan> {
  const key = actionPlanCacheKey(profileId, schemeId);
  const cached = cacheGet<ActionPlan>(key);
  if (cached) {
    return cached;
  }

  const stored = await findStoredActionPlan(profileId, schemeId);
  if (stored) {
    cacheSet(key, stored, CACHE_TTL.actionPlanMs);
    return stored;
  }

  const profile = await findProfileById(profileId);
  if (!profile) {
    throw new HttpError(404, "Resource not found", undefined, `Profile with ID ${profileId} not found`);
  }
  const scheme = await findSchemeById(schemeId);
  if (!scheme) {
    throw new HttpError(404, "Resource not found", undefined, "Scheme not found");
  }

  const gaps = detectGaps(profile, scheme.eligibilityCriteria).map((gap) => gap.name);
  let plan: ActionPlan;
  try {
    const raw = await completeJson(buildActionPlanPrompt(profile, scheme, gaps), 2200);
    const parsed = parseModelJson<ClaudeActionJson>(raw);
    const steps = parsed.actionPlan ?? parsed.steps ?? [];
    if (steps.length < 5) {
      plan = buildFallbackActionPlan(profile, scheme);
    } else {
      plan = {
        profileId,
        schemeId,
        schemeName: scheme.name,
        steps: steps.map((step, index) => ({
          stepNumber: step.stepNumber ?? index + 1,
          title: step.title,
          description: step.description,
          priority: step.priority ?? "medium",
          estimatedTime: step.estimatedTime ?? "1 day",
          requiredDocuments: step.requiredDocuments ?? [],
          nextStepDependency: step.nextStepDependency,
          deadline: step.deadline ?? "Before application",
          contactDetails: step.contactDetails,
        })),
        totalEstimatedTime: parsed.totalEstimatedTime ?? "4-5 days",
        timeline: parsed.timeline ?? [],
        successCriteria: parsed.successCriteria ?? "Eligibility criteria met and application submitted",
      };
    }
  } catch (error) {
    if (error instanceof ClaudeUnavailableError) {
      plan = buildFallbackActionPlan(profile, scheme);
    } else {
      plan = buildFallbackActionPlan(profile, scheme);
    }
  }

  cacheSet(key, plan, CACHE_TTL.actionPlanMs);
  await upsertActionPlan(plan);
  return plan;
}

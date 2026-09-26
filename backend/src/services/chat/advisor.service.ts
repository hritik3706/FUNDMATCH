import { randomUUID } from "crypto";
import { z } from "zod";
import { completeJson, parseModelJson } from "../claude.service";
import { createProfile } from "../profile.service";
import { analyzeProfile } from "../matching.service";
import { ClaudeUnavailableError, SchemeMatch } from "../../types/matching.types";
import { Profile } from "../../types/profile.types";
import {
  AdvisorDraft,
  DraftUpdates,
  emptyDraft,
  extractFromText,
  materialKey,
  mergeDraft,
  questionFor,
  readShortDpiitAnswer,
  requiredMissing,
  toCreateProfile,
} from "./advisorDraft";
import { buildExtractionPrompt, buildFollowUpPrompt } from "./advisorPrompt";

const PHASES = ["DISCOVERY", "PROFILE_BUILDING", "PROFILE_READY", "ANALYSIS", "RESULTS", "FOLLOW_UP"] as const;
type Phase = (typeof PHASES)[number];

type StoredMessage = { role: "user" | "advisor"; text: string };

type Conversation = {
  id: string;
  messages: StoredMessage[];
  draft: AdvisorDraft;
  phase: Phase;
  profileId: string | null;
  savedProfile: Profile | null;
  matches: SchemeMatch[] | null;
  analyzedKey: string | null;
  askedDpiit: boolean;
  updatedAt: number;
};

export type ChatAnalysis = {
  profileId: string;
  processedSchemes: number;
  strongMatch: boolean;
  matches: SchemeMatch[];
  fallbackMode: boolean;
  fallbackReason?: string;
};

export type ChatResult = {
  conversationId: string;
  message: string;
  phase: Phase;
  profile: AdvisorDraft;
  missingFields: string[];
  profileComplete: boolean;
  intent: "profile_building" | "analyze" | "results" | "follow_up";
  analysis: ChatAnalysis | null;
  savedProfile: Profile | null;
  advisorMode: "gemini" | "rules";
};

const conversations = new Map<string, Conversation>();
const rateBuckets = new Map<string, number[]>();

const updatesSchema = z.object({
  name: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  stage: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  fundingNeeded: z.number().nullable().optional(),
  previousFunding: z.number().nullable().optional(),
  founderExperience: z.string().nullable().optional(),
  dpiitRegistration: z.boolean().nullable().optional(),
  gstStatus: z.string().nullable().optional(),
  incorporationDate: z.string().nullable().optional(),
  founderCount: z.number().nullable().optional(),
  problem: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
});

const extractionSchema = z.object({
  message: z.string().max(600).optional(),
  profileUpdates: updatesSchema.optional(),
  intent: z.string().optional(),
});

const followSchema = z.object({
  message: z.string().min(1).max(700),
});

export function resetAdvisorMemory(): void {
  conversations.clear();
}

export function assertChatRate(key: string): void {
  const now = Date.now();
  const recent = (rateBuckets.get(key) ?? []).filter((stamp) => now - stamp < 10 * 60 * 1000);
  if (recent.length >= 24) {
    const error = new Error("Too many advisor messages. Wait a few minutes and try again.");
    error.name = "ChatRateLimit";
    throw error;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
}

export async function handleAdvisorTurn(conversationId: string | undefined, message: string): Promise<ChatResult> {
  const conversation = loadConversation(conversationId);
  conversation.messages.push({ role: "user", text: message });
  conversation.updatedAt = Date.now();

  const extracted = await readUpdates(conversation, message);
  if (extracted.geminiUpdates) conversation.draft = mergeDraft(conversation.draft, extracted.geminiUpdates);
  conversation.draft = mergeDraft(conversation.draft, fillGaps(conversation.draft, extracted.rules));
  const shortDpiit = conversation.askedDpiit ? readShortDpiitAnswer(message) : null;
  if (shortDpiit !== null && conversation.draft.dpiitRegistration === null) {
    conversation.draft.dpiitRegistration = shortDpiit;
  }

  const missing = requiredMissing(conversation.draft);
  if (missing.length) {
    conversation.phase = conversation.messages.length <= 2 ? "DISCOVERY" : "PROFILE_BUILDING";
    return finish(conversation, questionFor(missing[0]), "profile_building", extracted.mode, null);
  }

  if (conversation.draft.dpiitRegistration === null && !conversation.askedDpiit) {
    conversation.askedDpiit = true;
    conversation.phase = "PROFILE_READY";
    const geminiQuestion = usableQuestion(extracted.geminiMessage);
    const prompt = geminiQuestion && /dpiit/i.test(geminiQuestion) ? geminiQuestion : questionFor("dpiit");
    return finish(conversation, prompt, "profile_building", extracted.mode, null);
  }

  if (conversation.draft.dpiitRegistration === null) {
    conversation.draft.dpiitRegistration = false;
  }

  const key = materialKey(conversation.draft);
  if (conversation.matches && conversation.analyzedKey === key) {
    conversation.phase = "FOLLOW_UP";
    const answer = await answerFollowUp(conversation, message, extracted.mode);
    return finish(conversation, answer.message, "follow_up", answer.mode, analysisOf(conversation));
  }

  conversation.phase = "ANALYSIS";
  const analysis = await runAnalysis(conversation);
  conversation.phase = "RESULTS";
  const intro = analysis.strongMatch
    ? "I compared this profile with the FundMatch catalogue. The percentages come from the eligibility formula, not from a guess. A high score is not a government approval."
    : "I couldn't find a strong catalogue match from what you've told me. You can add a clearer sector, state, or funding amount and I will run it again.";
  return finish(conversation, intro, "results", extracted.mode, analysis);
}

async function readUpdates(
  conversation: Conversation,
  message: string,
): Promise<{ rules: DraftUpdates; geminiUpdates?: Partial<Record<keyof AdvisorDraft, unknown>>; mode: "gemini" | "rules"; geminiMessage?: string }> {
  const rules = extractFromText(message);
  try {
    const history = conversation.messages.slice(-6).map((item) => `${item.role}: ${item.text}`);
    const raw = await completeJson(buildExtractionPrompt(conversation.draft, history, message), 700);
    const parsed = extractionSchema.parse(parseModelJson(raw));
    return {
      rules,
      geminiUpdates: parsed.profileUpdates,
      mode: "gemini",
      geminiMessage: parsed.message,
    };
  } catch (error) {
    if (!(error instanceof ClaudeUnavailableError) && !(error instanceof z.ZodError) && !(error instanceof SyntaxError)) {
      console.error("Advisor extraction failed");
    }
    return { rules, mode: "rules" };
  }
}

function fillGaps(draft: AdvisorDraft, rules: DraftUpdates): DraftUpdates {
  const gaps: DraftUpdates = {};
  (Object.keys(rules) as Array<keyof AdvisorDraft>).forEach((key) => {
    const value = rules[key];
    if (value === null || value === undefined) return;
    if (draft[key] === null) {
      gaps[key] = value as never;
    }
  });
  return gaps;
}

async function answerFollowUp(
  conversation: Conversation,
  message: string,
  mode: "gemini" | "rules",
): Promise<{ message: string; mode: "gemini" | "rules" }> {
  const packed = (conversation.matches ?? []).slice(0, 4).map(packMatch);
  try {
    const raw = await completeJson(buildFollowUpPrompt(conversation.draft, packed, message), 500);
    const parsed = followSchema.parse(parseModelJson(raw));
    if (mentionsUnknownScheme(parsed.message, packed.map((item) => item.schemeName))) {
      return { message: rulesFollowUp(conversation, message), mode: "rules" };
    }
    return { message: parsed.message, mode: "gemini" };
  } catch {
    return { message: rulesFollowUp(conversation, message), mode: mode === "gemini" ? "rules" : mode };
  }
}

async function runAnalysis(conversation: Conversation): Promise<ChatAnalysis> {
  const created = await createProfile(toCreateProfile(conversation.draft));
  conversation.profileId = created.id;
  conversation.savedProfile = created;
  const result = await analyzeProfile(created.id);
  conversation.matches = result.matches;
  conversation.analyzedKey = materialKey(conversation.draft);
  const visible = result.matches.filter((match) => match.compatibilityScore >= 50).slice(0, 4);
  const shown = visible.length ? visible : result.matches.slice(0, 1);
  return {
    profileId: created.id,
    processedSchemes: result.processedSchemes,
    strongMatch: visible.length > 0,
    matches: shown,
    fallbackMode: result.fallbackMode,
    fallbackReason: result.fallbackReason,
  };
}

function analysisOf(conversation: Conversation): ChatAnalysis | null {
  if (!conversation.profileId || !conversation.matches) return null;
  const visible = conversation.matches.filter((match) => match.compatibilityScore >= 50).slice(0, 4);
  return {
    profileId: conversation.profileId,
    processedSchemes: conversation.matches.length,
    strongMatch: visible.length > 0,
    matches: visible.length ? visible : conversation.matches.slice(0, 1),
    fallbackMode: conversation.matches.some((match) => match.fallbackMode),
  };
}

function finish(
  conversation: Conversation,
  message: string,
  intent: ChatResult["intent"],
  mode: "gemini" | "rules",
  analysis: ChatAnalysis | null,
): ChatResult {
  const text = mode === "rules" && (intent === "results" || intent === "follow_up")
    ? `${message} The advisor model was unavailable, so this used the catalogue rules.`
    : message;
  conversation.messages.push({ role: "advisor", text });
  conversation.messages = conversation.messages.slice(-16);
  const missing = requiredMissing(conversation.draft);
  return {
    conversationId: conversation.id,
    message: text,
    phase: conversation.phase,
    profile: conversation.draft,
    missingFields: missing,
    profileComplete: missing.length === 0,
    intent,
    analysis,
    savedProfile: conversation.savedProfile,
    advisorMode: mode,
  };
}

function rulesFollowUp(conversation: Conversation, message: string): string {
  const top = conversation.matches?.[0];
  if (!top) {
    return "I don't have a catalogue result for this conversation yet. Tell me the sector, state, stage, and funding amount and I will run the match.";
  }
  const lower = message.toLowerCase();
  if (/missing|stop|eligible|gap|dpiit|document/.test(lower)) {
    const gaps = top.missingRequirements.map((gap) => gap.name);
    if (!gaps.length) return `${top.schemeName} has no mandatory gap in the stored criteria. That still is not an approval.`;
    return `${top.schemeName} is held back by: ${gaps.join(", ")}. Next step: ${top.missingRequirements[0]?.howToFix ?? "check the scheme page"}.`;
  }
  if (/why|score|percent|match/.test(lower)) {
    return top.overallReasoning;
  }
  if (/next|should i|first|document/.test(lower)) {
    return top.nextSteps[0] ?? `Open ${top.schemeName} and review the gaps listed on the scheme page.`;
  }
  const names = (conversation.matches ?? []).slice(0, 3).map((match) => `${match.schemeName} (${match.compatibilityScore}%)`);
  return `From the last catalogue run, the leading options are ${names.join(", ")}. Ask which requirement is missing, or change the funding amount and I will score it again.`;
}

function packMatch(match: SchemeMatch) {
  return {
    schemeName: match.schemeName,
    compatibilityScore: match.compatibilityScore,
    eligibilityStatus: match.eligibilityStatus,
    overallReasoning: match.overallReasoning,
    missing: match.missingRequirements.map((gap) => `${gap.name}: ${gap.howToFix}`),
    met: match.matchedCriteria.map((item) => item.name),
    nextStep: match.nextSteps[0] ?? "",
  };
}

function mentionsUnknownScheme(message: string, allowed: string[]): boolean {
  const lower = message.toLowerCase();
  if (!/scheme|yojana|programme|program/.test(lower)) return false;
  return !allowed.some((name) => lower.includes(name.toLowerCase()));
}

function usableQuestion(message: string | undefined): string | null {
  if (!message) return null;
  const text = message.trim();
  if (text.length < 12 || text.length > 280) return null;
  if (!text.includes("?")) return null;
  if (/guarantee|approved|you are eligible/i.test(text)) return null;
  return text;
}

function loadConversation(conversationId: string | undefined): Conversation {
  pruneConversations();
  if (conversationId) {
    const existing = conversations.get(conversationId);
    if (existing) return existing;
  }
  const created: Conversation = {
    id: randomUUID(),
    messages: [],
    draft: emptyDraft(),
    phase: "DISCOVERY",
    profileId: null,
    savedProfile: null,
    matches: null,
    analyzedKey: null,
    askedDpiit: false,
    updatedAt: Date.now(),
  };
  conversations.set(created.id, created);
  return created;
}

function pruneConversations(): void {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [id, conversation] of conversations) {
    if (conversation.updatedAt < cutoff) conversations.delete(id);
  }
}

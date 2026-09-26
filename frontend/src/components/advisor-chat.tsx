"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSession } from "@/components/session-provider";
import { Icon } from "@/components/ui";
import { displayStatus, statusLabel } from "@/lib/format";
import type { SchemeMatch } from "@/lib/types";
import { AdvisorDraft, sendAdvisorMessage } from "@/services/advisorService";

const STORAGE_KEY = "ps41.advisor.chat";

export const ADVISOR_GREETING =
  "Hi! I'm FundMatch AI 👋\nTell me about your startup, and I'll help you understand what funding opportunities and requirements may be relevant.";

const DEMO =
  "We are building an AI-based agricultural platform for small farmers. We are based in Uttar Pradesh. We are currently in the prototype stage. We have 3 founders and have invested around Rs 8 lakh ourselves. We are looking for around Rs 25 lakh of funding to build the product and start pilot deployments.";

export const ADVISOR_SUGGESTIONS = [
  { label: "Tell me about my startup", text: DEMO },
  { label: "Find funding for my startup", text: "Find funding for a HealthTech prototype in Karnataka. We need about Rs 20 lakh." },
  { label: "Check my eligibility", text: "Check my eligibility. We are a FinTech startup in Maharashtra with an MVP and we need Rs 15 lakh." },
  { label: "Which documents usually matter?", text: "Which registrations and documents usually matter before applying to a government scheme?" },
];

export type AdvisorBubble = {
  id: string;
  role: "user" | "advisor";
  text: string;
  matches?: SchemeMatch[];
  strongMatch?: boolean;
  confirm?: boolean;
};

const emptyDraft: AdvisorDraft = {
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
};

type StoredChat = {
  bubbles: AdvisorBubble[];
  conversationId: string | null;
  profile: AdvisorDraft;
  readyForMatch: boolean;
};

type AdvisorChatValue = {
  bubbles: AdvisorBubble[];
  draft: string;
  setDraft: (value: string) => void;
  profile: AdvisorDraft;
  busy: boolean;
  status: string;
  error: string;
  readyForMatch: boolean;
  hydrated: boolean;
  submit: (text: string) => Promise<void>;
};

const AdvisorChatContext = createContext<AdvisorChatValue | null>(null);

export function AdvisorChatProvider({ children }: { children: ReactNode }) {
  const { saveProfile, saveStory, story } = useSession();
  const [bubbles, setBubbles] = useState<AdvisorBubble[]>([]);
  const [draft, setDraft] = useState("");
  const [profile, setProfile] = useState<AdvisorDraft>(emptyDraft);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [readyForMatch, setReadyForMatch] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const sending = useRef(false);
  const storyRef = useRef(story);
  storyRef.current = story;

  useEffect(() => {
    const saved = readStoredChat();
    if (saved) {
      setBubbles(saved.bubbles);
      setConversationId(saved.conversationId);
      setProfile({ ...emptyDraft, ...saved.profile });
      setReadyForMatch(saved.readyForMatch);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredChat({ bubbles, conversationId, profile, readyForMatch });
  }, [bubbles, conversationId, hydrated, profile, readyForMatch]);

  const submit = useMemo(() => {
    return async (text: string) => {
      const message = text.trim();
      if (!message || sending.current) {
        if (!message) setError("Write a message first.");
        return;
      }
      sending.current = true;
      setError("");
      setDraft("");
      setBusy(true);
      const hasResults = bubbles.some((bubble) => bubble.matches && bubble.matches.length > 0);
      setStatus(hasResults ? "Looking at your results..." : readyForMatch ? "Checking relevant opportunities..." : "Understanding your startup...");
      setBubbles((current) => [...current, { id: crypto.randomUUID(), role: "user", text: message }]);
      const timer = window.setTimeout(() => setStatus((current) => (current ? "Analyzing eligibility..." : current)), 2500);
      const later = window.setTimeout(() => setStatus((current) => (current ? "Preparing your funding roadmap..." : current)), 7000);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 35000);
      try {
        const reply = await sendAdvisorMessage(conversationId, message, controller.signal);
        setConversationId(reply.conversationId);
        setProfile(reply.profile);
        setReadyForMatch(reply.profileComplete);
        if (reply.savedProfile) saveProfile(reply.savedProfile);
        if (reply.insight) {
          const currentStory = storyRef.current;
          saveStory({
            text: reply.profile.problem || currentStory.text,
            futureIntent: reply.insight.statedIntent || currentStory.futureIntent,
            targetSector: reply.insight.targetSector ?? undefined,
            targetStage: reply.insight.targetStage ?? undefined,
            technology: reply.insight.technology ?? undefined,
            subSector: reply.insight.subSector ?? undefined,
            entityType: reply.insight.entityType ?? undefined,
            city: reply.insight.city ?? undefined,
            gstLabel: reply.insight.gstLabel ?? undefined,
            dpiitLabel: reply.insight.dpiitLabel ?? undefined,
            udyamLabel: reply.insight.udyamLabel ?? undefined,
            incorporationLabel: reply.insight.incorporationLabel ?? undefined,
            fundingPurpose: reply.insight.fundingPurpose ?? undefined,
            revenueLabel: reply.insight.revenueLabel ?? undefined,
            completeness: reply.insight.completeness,
            summary: reply.insight.summary,
          });
        }
        setBubbles((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "advisor",
            text: reply.message,
            matches: reply.intent === "results" ? reply.analysis?.matches : undefined,
            strongMatch: reply.analysis?.strongMatch,
            confirm: reply.intent === "confirm",
          },
        ]);
      } catch (reason) {
        const aborted = reason instanceof DOMException && reason.name === "AbortError";
        const text = aborted
          ? "That request took too long. Try again in a moment."
          : reason instanceof Error
            ? reason.message
            : "The advisor could not reply.";
        setError(text);
        setBubbles((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "advisor",
            text: "I'm having trouble connecting to the AI service right now. You can try again, or continue with the available matching options.",
          },
        ]);
      } finally {
        window.clearTimeout(timer);
        window.clearTimeout(later);
        window.clearTimeout(timeout);
        sending.current = false;
        setBusy(false);
        setStatus("");
      }
    };
  }, [bubbles, conversationId, readyForMatch, saveProfile, saveStory]);

  const value = useMemo<AdvisorChatValue>(
    () => ({ bubbles, draft, setDraft, profile, busy, status, error, readyForMatch, hydrated, submit }),
    [bubbles, busy, draft, error, hydrated, profile, readyForMatch, status, submit],
  );

  return <AdvisorChatContext.Provider value={value}>{children}</AdvisorChatContext.Provider>;
}

export function useAdvisorChat() {
  const value = useContext(AdvisorChatContext);
  if (!value) throw new Error("useAdvisorChat must be used inside AdvisorChatProvider");
  return value;
}

export function AdvisorWelcome({ onPick, compact = false }: { onPick: (text: string) => void; compact?: boolean }) {
  const suggestions = compact ? ADVISOR_SUGGESTIONS.slice(0, 3) : ADVISOR_SUGGESTIONS;
  return (
    <div className="space-y-4">
      <p className="whitespace-pre-wrap font-body-md text-body-md text-on-surface">{ADVISOR_GREETING}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick(item.text)}
            className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-left font-label-md text-label-md text-primary transition hover:border-secondary"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdvisorMessage({ bubble, onConfirm }: { bubble: AdvisorBubble; onConfirm: (text: string) => void }) {
  const mine = bubble.role === "user";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div className={mine ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-on-primary" : "max-w-[92%] space-y-3"}>
        <p className={mine ? "whitespace-pre-wrap font-body-md text-body-md" : "whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-surface"}>
          {bubble.text}
        </p>
        {bubble.confirm ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onConfirm("Confirm and analyze")} className="rounded bg-primary px-3 py-2 font-label-lg text-label-lg text-on-primary">Confirm and analyze</button>
            <button type="button" onClick={() => onConfirm("I need to correct the profile")} className="rounded border border-outline-variant bg-surface px-3 py-2 font-label-lg text-label-lg text-primary">Edit profile</button>
          </div>
        ) : null}
        {bubble.matches ? <AdvisorResultList matches={bubble.matches} strong={bubble.strongMatch !== false} /> : null}
      </div>
    </div>
  );
}

export function AdvisorTyping({ status }: { status: string }) {
  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="rounded-2xl rounded-bl-sm border border-outline-variant bg-surface px-4 py-3">
        <span className="advisor-typing" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p className="mt-2 font-body-sm text-body-sm text-secondary">{status || "Understanding your startup..."}</p>
      </div>
    </div>
  );
}

export function AdvisorComposer({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const { draft, setDraft, busy, error, submit } = useAdvisorChat();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit(draft);
  }

  return (
    <form onSubmit={onSubmit} className="border-t border-outline-variant p-3">
      {error ? <p className="mb-2 font-body-sm text-body-sm text-error">{error}</p> : null}
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor={id}>Message FundMatch AI</label>
        <textarea
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit(draft);
            }
          }}
          rows={compact ? 1 : 2}
          maxLength={2000}
          placeholder="Tell FundMatch about your startup"
          className="min-h-[44px] flex-1 resize-none rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-secondary"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Send message"
          className="inline-flex h-11 items-center gap-2 rounded bg-primary px-4 font-label-lg text-label-lg text-on-primary disabled:opacity-60"
        >
          {compact ? <Icon name="send" className="text-base" /> : <>Send <Icon name="send" className="text-base" /></>}
        </button>
      </div>
    </form>
  );
}

function AdvisorResultList({ matches, strong }: { matches: SchemeMatch[]; strong: boolean }) {
  return (
    <div className="space-y-3">
      <p className="font-label-md text-label-md uppercase tracking-wider text-secondary">
        {strong ? `Catalogue results · ${matches.length} shown` : "No strong catalogue match"}
      </p>
      {matches.slice(0, 3).map((match) => (
        <article key={match.schemeId} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-headline-sm text-lg font-bold text-primary">{match.schemeName}</h2>
            <p className="font-data-mono text-data-mono text-secondary">{match.compatibilityScore}%</p>
          </div>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{statusLabel(displayStatus(match.eligibilityStatus))}</p>
          <p className="mt-3 font-body-sm text-body-sm text-on-surface">{match.overallReasoning}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link className="font-label-lg text-label-lg text-secondary" href={`/schemes/${match.schemeId}`}>View analysis</Link>
            <Link className="font-label-lg text-label-lg text-secondary" href={`/schemes/${match.schemeId}/gaps`}>Missing requirements</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function readStoredChat(): StoredChat | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    if (!parsed || !Array.isArray(parsed.bubbles)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredChat(value: StoredChat) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The conversation still lives in memory for this visit.
  }
}

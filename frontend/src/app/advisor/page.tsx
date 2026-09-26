"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { PublicHeader } from "@/components/public-shell";
import { useSession } from "@/components/session-provider";
import { Icon } from "@/components/ui";
import { displayStatus, statusLabel } from "@/lib/format";
import type { SchemeMatch } from "@/lib/types";
import { AdvisorDraft, AdvisorReply, sendAdvisorMessage } from "@/services/advisorService";

const DEMO =
  "We are building an AI-based agricultural platform for small farmers. We are based in Uttar Pradesh. We are currently in the prototype stage. We have 3 founders and have invested around Rs 8 lakh ourselves. We are looking for around Rs 25 lakh of funding to build the product and start pilot deployments.";

const SUGGESTIONS = [
  { label: "Tell me about my startup", text: DEMO },
  { label: "Find funding for my startup", text: "Find funding for a HealthTech prototype in Karnataka. We need about Rs 20 lakh." },
  { label: "Check my eligibility", text: "Check my eligibility. We are a FinTech startup in Maharashtra with an MVP and we need Rs 15 lakh." },
  { label: "Help me find government schemes", text: "Help me find government schemes for a first-time AgriTech founder in Uttar Pradesh." },
];

type Bubble = {
  id: string;
  role: "user" | "advisor";
  text: string;
  matches?: SchemeMatch[];
  strongMatch?: boolean;
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
};

export default function AdvisorPage() {
  const { saveProfile } = useSession();
  const [draft, setDraft] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [profile, setProfile] = useState<AdvisorDraft>(emptyDraft);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [readyForMatch, setReadyForMatch] = useState(false);

  const started = bubbles.length > 0;

  async function submit(text: string) {
    const message = text.trim();
    if (!message || busy) {
      if (!message) setError("Write a message first.");
      return;
    }
    setError("");
    setDraft("");
    setBusy(true);
    const hasResults = bubbles.some((bubble) => bubble.matches && bubble.matches.length > 0);
    setStatus(
      hasResults
        ? "Looking at your results..."
        : readyForMatch
          ? "Checking relevant opportunities..."
          : "Understanding your startup...",
    );
    const timer = window.setTimeout(() => {
      if (!hasResults && readyForMatch) setStatus("Analyzing eligibility...");
    }, 2500);
    const later = window.setTimeout(() => {
      if (!hasResults && readyForMatch) setStatus("Preparing your funding roadmap...");
    }, 7000);
    setBubbles((current) => [...current, { id: crypto.randomUUID(), role: "user", text: message }]);
    try {
      const reply = await sendAdvisorMessage(conversationId, message);
      applyReply(reply);
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : "The advisor could not reply.";
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
      setBusy(false);
      setStatus("");
    }
  }

  function applyReply(reply: AdvisorReply) {
    setConversationId(reply.conversationId);
    setProfile(reply.profile);
    setReadyForMatch(reply.profileComplete);
    if (reply.savedProfile) saveProfile(reply.savedProfile);
    setBubbles((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "advisor",
        text: reply.message,
        matches: reply.intent === "results" ? reply.analysis?.matches : undefined,
        strongMatch: reply.analysis?.strongMatch,
      },
    ]);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit(draft);
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
        <section className="flex min-h-[70vh] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm lg:h-[calc(100vh-7.5rem)]">
          <header className="border-b border-outline-variant px-5 py-4">
            <p className="font-label-md text-label-md uppercase tracking-wider text-secondary">FundMatch AI</p>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Startup Funding Advisor</h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Describe the startup in your own words. The advisor fills the profile, then the catalogue scores real schemes.
            </p>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {!started ? <Welcome onPick={(text) => void submit(text)} /> : null}
            {bubbles.map((bubble) => (
              <Message key={bubble.id} bubble={bubble} />
            ))}
            {busy ? (
              <p className="font-body-sm text-body-sm text-secondary">{status}</p>
            ) : null}
          </div>
          <form onSubmit={onSubmit} className="border-t border-outline-variant p-3">
            {error ? <p className="mb-2 font-body-sm text-body-sm text-error">{error}</p> : null}
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="advisor-message">Message the funding advisor</label>
              <textarea
                id="advisor-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit(draft);
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder="Tell FundMatch about your startup"
                className="min-h-[52px] flex-1 resize-none rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-secondary"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 items-center gap-2 rounded bg-primary px-4 font-label-lg text-label-lg text-on-primary disabled:opacity-60"
              >
                Send
                <Icon name="send" className="text-base" />
              </button>
            </div>
          </form>
        </section>
        <ProfilePanel profile={profile} open={profileOpen} busy={busy} onToggle={() => setProfileOpen((value) => !value)} />
      </div>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="font-body-md text-body-md text-on-surface">
        Tell FundMatch about your startup. I will pull out the sector, location, stage, and funding need, then compare that profile with the scheme catalogue.
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick(item.text)}
            className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 font-label-md text-label-md text-primary hover:border-secondary"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ bubble }: { bubble: Bubble }) {
  const mine = bubble.role === "user";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div className={mine ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-on-primary" : "max-w-[92%] space-y-3"}>
        <p className={mine ? "whitespace-pre-wrap font-body-md text-body-md" : "whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-surface"}>
          {bubble.text}
        </p>
        {bubble.matches ? <ResultList matches={bubble.matches} strong={bubble.strongMatch !== false} /> : null}
      </div>
    </div>
  );
}

function ResultList({ matches, strong }: { matches: SchemeMatch[]; strong: boolean }) {
  return (
    <div className="space-y-3">
      <p className="font-label-md text-label-md uppercase tracking-wider text-secondary">
        {strong ? `Catalogue results · ${matches.length} shown` : "No strong catalogue match"}
      </p>
      {matches.map((match) => (
        <article key={match.schemeId} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-headline-sm text-lg font-bold text-primary">{match.schemeName}</h2>
            <p className="font-data-mono text-data-mono text-secondary">{match.compatibilityScore}%</p>
          </div>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{statusLabel(displayStatus(match.eligibilityStatus))}</p>
          <p className="mt-3 font-body-sm text-body-sm text-on-surface">{match.overallReasoning}</p>
          <ul className="mt-3 space-y-1 font-body-sm text-body-sm">
            {match.matchedCriteria.slice(0, 3).map((item) => (
              <li key={item.name} className="text-on-surface">✓ {item.name}</li>
            ))}
            {match.missingRequirements.slice(0, 2).map((gap) => (
              <li key={gap.name} className="text-tertiary">⚠ {gap.name}: {gap.howToFix}</li>
            ))}
          </ul>
          {match.nextSteps[0] ? <p className="mt-3 font-body-sm text-body-sm text-on-surface"><strong>Next step. </strong>{match.nextSteps[0]}</p> : null}
          <div className="mt-3 flex flex-wrap gap-3">
            <Link className="font-label-lg text-label-lg text-secondary" href={`/schemes/${match.schemeId}`}>View analysis</Link>
            <Link className="font-label-lg text-label-lg text-secondary" href={`/schemes/${match.schemeId}/gaps`}>Missing requirements</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProfilePanel({
  profile,
  open,
  busy,
  onToggle,
}: {
  profile: AdvisorDraft;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const rows = useMemo(
    () => [
      ["Sector", profile.sector],
      ["Location", profile.location],
      ["Stage", profile.stage],
      ["Funding need", profile.fundingNeeded ? `Rs ${profile.fundingNeeded} lakh` : null],
      ["Team", profile.founderCount ? `${profile.founderCount} founders` : null],
      ["DPIIT", profile.dpiitRegistration === null ? null : profile.dpiitRegistration ? "Recognised" : "Not recognised"],
      ["Incorporation", profile.incorporationDate],
    ],
    [profile],
  );

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <button type="button" onClick={onToggle} className="mb-2 flex w-full items-center justify-between rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 font-label-lg text-label-lg text-primary lg:hidden">
        Startup profile
        <Icon name={open ? "expand_less" : "expand_more"} />
      </button>
      <div className={`${open ? "block" : "hidden"} rounded-xl border border-outline-variant bg-surface-container-lowest p-4 lg:block`}>
        <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Startup profile</p>
        <ul className="mt-3 space-y-2">
          {rows.map(([label, value]) => (
            <li key={String(label)} className="flex items-center justify-between gap-3 border-b border-outline-variant/60 py-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
              <span className={value ? "font-label-md text-label-md text-primary" : "font-label-md text-label-md text-outline"}>
                {busy && !value ? "Checking" : value ?? "Missing"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

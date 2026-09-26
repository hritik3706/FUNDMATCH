"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { AdvisorMessage, AdvisorTyping, AdvisorWelcome, useAdvisorChat } from "@/components/advisor-chat";
import { Icon } from "@/components/ui";

export function FloatingAdvisor() {
  const pathname = usePathname();
  const { bubbles, busy, status, submit, hydrated } = useAdvisorChat();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [hintDismissed, setHintDismissed] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onAdvisorPage = pathname === "/advisor";
  const showHint = !open && (!hintDismissed || bubbles.length > seen);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    setSeen(bubbles.length);
    setHintDismissed(true);
    inputRef.current?.focus();
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [open, bubbles.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (onAdvisorPage) return null;

  return (
    <div className="advisor-dock">
      {open ? (
        <section className="advisor-panel" role="dialog" aria-modal="false" aria-labelledby="fundmatch-ai-title">
          <header className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">
              <AssistantMark />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-status-success ring-2 ring-white" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="fundmatch-ai-title" className="font-headline-sm text-headline-sm font-bold text-primary">FundMatch AI</h2>
              <p className="font-label-md text-label-md text-on-surface-variant">{busy ? "Thinking" : "Online"}</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded text-primary hover:bg-surface-container"
              aria-label="Close FundMatch AI"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
            >
              <Icon name="close" />
            </button>
          </header>
          <div ref={threadRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {hydrated && bubbles.length === 0 ? <AdvisorWelcome compact onPick={(text) => void submit(text)} /> : null}
            {bubbles.map((bubble) => (
              <AdvisorMessage key={bubble.id} bubble={bubble} onConfirm={(text) => void submit(text)} />
            ))}
            {busy ? <AdvisorTyping status={status} /> : null}
          </div>
          <Composer inputRef={inputRef} />
        </section>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        className={`advisor-launcher group ${open ? "advisor-launcher-open" : ""}`}
        aria-label={open ? "Close FundMatch AI" : "Ask FundMatch AI"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <Icon name="close" className="text-[26px]" /> : <AssistantMark large />}
        {showHint ? <span className="advisor-hint" aria-hidden="true" /> : null}
        {open ? null : <span className="advisor-tooltip" role="tooltip">Ask FundMatch AI</span>}
      </button>
    </div>
  );
}

function Composer({ inputRef }: { inputRef: RefObject<HTMLTextAreaElement> }) {
  const { draft, setDraft, busy, error, submit } = useAdvisorChat();
  return (
    <form
      className="border-t border-outline-variant p-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(draft);
      }}
    >
      {error ? <p className="mb-2 font-body-sm text-body-sm text-error">{error}</p> : null}
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="fundmatch-ai-message">Message FundMatch AI</label>
        <textarea
          ref={inputRef}
          id="fundmatch-ai-message"
          value={draft}
          rows={1}
          maxLength={2000}
          placeholder="Tell FundMatch about your startup"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit(draft);
            }
          }}
          className="max-h-28 min-h-[44px] flex-1 resize-none rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-secondary"
        />
        <button type="submit" disabled={busy} aria-label="Send message" className="inline-flex h-11 w-11 items-center justify-center rounded bg-primary text-on-primary disabled:opacity-60">
          <Icon name="send" className="text-base" />
        </button>
      </div>
    </form>
  );
}

function AssistantMark({ large = false }: { large?: boolean }) {
  const size = large ? 28 : 18;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M7 8.5h10.5a3.5 3.5 0 0 1 3.5 3.5v4.2a3.5 3.5 0 0 1-3.5 3.5H12l-3.8 2.6v-2.6H7A3.5 3.5 0 0 1 3.5 16.2V12A3.5 3.5 0 0 1 7 8.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20.2 4.2l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="currentColor" />
    </svg>
  );
}

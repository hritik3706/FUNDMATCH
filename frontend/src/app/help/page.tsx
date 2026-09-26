"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel, TextField } from "@/components/ui";

const faqs = [
  { category: "Getting started", question: "How do I begin?", answer: "Write a startup story, confirm the profile fields, save them through the API, then open the dashboard to request matches." },
  { category: "Matching", question: "Where do scheme matches come from?", answer: "The dashboard calls POST /api/matches/analyze with your saved profile id. Scores and reasons are the service response." },
  { category: "Eligibility", question: "What does potentially eligible mean?", answer: "The API returned PARTIALLY_ELIGIBLE or UNLIKELY_ELIGIBLE. The screen does not present that as fully eligible." },
  { category: "Sources", question: "Where is the official link?", answer: "Apply on official portal appears only when the scheme record includes sourceUrl. Otherwise the page says the link was not provided." },
  { category: "Account", question: "Is sign-in connected to the API?", answer: "No. The Express API does not expose authentication, notifications, or saved-scheme routes yet. Those stay on this device." },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => faqs.filter((item) => `${item.category} ${item.question} ${item.answer}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  return (
    <AppShell>
      <PageHeader eyebrow="Help" title="How FundMatch works" description="Answers describe the behaviour of this frontend and the current API." />
      <div className="mb-6 max-w-xl">
        <TextField label="Search help" name="help" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      {visible.length === 0 ? <p className="font-body-md text-body-md text-on-surface-variant">No help topics match that search.</p> : null}
      <div className="space-y-4">
        {visible.map((item) => (
          <Panel key={item.question}>
            <p className="font-label-caps text-label-caps uppercase text-secondary">{item.category}</p>
            <h2 className="mt-1 font-headline-sm text-headline-sm text-primary">{item.question}</h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{item.answer}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}

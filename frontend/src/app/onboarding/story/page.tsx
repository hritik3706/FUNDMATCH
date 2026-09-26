"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/components/session-provider";
import { Button, PageHeader, Panel, TextAreaField } from "@/components/ui";

export default function StoryPage() {
  const router = useRouter();
  const { ready, story, saveStory } = useSession();
  const [text, setText] = useState(story.text);
  const [futureIntent, setFutureIntent] = useState(story.futureIntent);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!ready || hydrated) return;
    setText(story.text);
    setFutureIntent(story.futureIntent);
    setHydrated(true);
  }, [futureIntent, hydrated, ready, story.futureIntent, story.text]);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length < 40) {
      setError("Describe the startup in at least a short paragraph so the profile review has context.");
      return;
    }
    saveStory({ text: text.trim(), futureIntent: futureIntent.trim() });
    router.push("/onboarding/profile");
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Startup story"
        title="Describe your startup"
        description="This text stays with your session. The API does not extract fields from it yet, so the next screen will not invent missing details."
      />
      <Panel>
        <form className="space-y-4" onSubmit={onSubmit}>
          <TextAreaField
            label="Startup story"
            name="story"
            rows={11}
            value={text}
            placeholder="Describe your startup, what you're building, your current stage, funding needs, location, and what you want to achieve next."
            onChange={(event) => setText(event.target.value)}
            error={error}
          />
          <p className="font-data-mono text-xs text-on-surface-variant">{text.length} characters</p>
          <TextAreaField
            label="Future intent"
            name="futureIntent"
            rows={4}
            value={futureIntent}
            placeholder="Where you want the company to go next. Leave blank if not provided."
            onChange={(event) => setFutureIntent(event.target.value)}
          />
          <Button type="submit">Continue to profile review</Button>
        </form>
      </Panel>
    </AppShell>
  );
}

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
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || hydrated) return;
    setText(story.text);
    setHydrated(true);
  }, [hydrated, ready, story.text]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length < 20) {
      setError("Describe the startup in a sentence, including what you are building and how much funding you need.");
      return;
    }
    saveStory({ ...story, text: text.trim(), futureIntent: "" });
    router.push("/onboarding/profile");
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Startup story"
        title="Describe your startup"
        description="The next page fills the profile from this description. You can correct any field before saving."
      />
      <Panel>
        <form className="space-y-4" onSubmit={onSubmit}>
          <TextAreaField
            label="Startup story"
            name="story"
            rows={11}
            value={text}
            placeholder="Example: I am building a food and beverages startup and I want funds of 250000."
            onChange={(event) => setText(event.target.value)}
            error={error}
          />
          <p className="font-data-mono text-xs text-on-surface-variant">{text.length} characters</p>
          <Button type="submit">Continue to profile review</Button>
        </form>
      </Panel>
    </AppShell>
  );
}

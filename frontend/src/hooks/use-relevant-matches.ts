"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import type { SchemeMatch } from "@/lib/types";
import { analyzeProfile, matchContext, type AnalyzeResponse } from "@/services/matchService";

export function useRelevantMatches() {
  const { profile, story } = useSession();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!profile) return;
    setLoading(true);
    setError("");
    analyzeProfile(profile.id, matchContext(story))
      .then((response) => {
        setResult(response);
        setMatches(response.matches);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // story text and profile id decide when matching should run again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, story.text, story.futureIntent]);

  return { profile, story, matches, result, loading, error, reload: load };
}

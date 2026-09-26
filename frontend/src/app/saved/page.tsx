"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SchemeCard } from "@/components/scheme-card";
import { Button, PageHeader, StateMessage } from "@/components/ui";
import { useRelevantMatches } from "@/hooks/use-relevant-matches";
import type { SchemeSummary } from "@/lib/types";
import { savedSchemeIds } from "@/services/accountService";
import { listSchemes } from "@/services/schemeService";

export default function SavedPage() {
  const { matches } = useRelevantMatches();
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    const ids = new Set(savedSchemeIds());
    listSchemes()
      .then((result) => setSchemes(result.schemes.filter((scheme) => ids.has(scheme.id))))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell>
      <PageHeader eyebrow="Saved" title="Saved schemes" description="Saves are kept on this device. The API does not have a saved-schemes endpoint yet." />
      {loading ? <StateMessage title="Loading saved schemes" body="Checking the catalogue against your saved list." /> : null}
      {error ? <StateMessage title="Could not load saved schemes" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {!loading && !error && schemes.length === 0 ? <StateMessage title="Nothing saved" body="Open a scheme and choose Save to keep it here." /> : null}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {schemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} match={matches.find((item) => item.schemeId === scheme.id)} />)}
      </div>
    </AppShell>
  );
}

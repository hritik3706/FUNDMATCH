"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SchemeCard } from "@/components/scheme-card";
import { Button, PageHeader, StateMessage } from "@/components/ui";
import { useRelevantMatches } from "@/hooks/use-relevant-matches";
import type { SchemeSummary } from "@/lib/types";
import { listSchemes } from "@/services/schemeService";

export default function MinistriesPage() {
  const { matches } = useRelevantMatches();
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    listSchemes()
      .then((result) => setSchemes(result.schemes))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, SchemeSummary[]>();
    for (const scheme of schemes) {
      const key = scheme.schemeType?.trim() || "Not provided";
      map.set(key, [...(map.get(key) ?? []), scheme]);
    }
    return Array.from(map.entries());
  }, [schemes]);

  return (
    <AppShell>
      <PageHeader eyebrow="Catalogue" title="Ministry and department directory" description="Groups use the scheme type returned by the API. The catalogue does not currently send a separate ministry field." />
      {loading ? <StateMessage title="Loading groups" body="Fetching the catalogue." /> : null}
      {error ? <StateMessage title="Could not load groups" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {!loading && !error && groups.length === 0 ? <StateMessage title="Nothing to group" body="The catalogue is empty." /> : null}
      <div className="space-y-8">
        {groups.map(([name, items]) => (
          <section key={name}>
            <h2 className="mb-4 font-headline-md text-headline-md font-bold text-on-surface">{name}</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {items.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} match={matches.find((item) => item.schemeId === scheme.id)} />)}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}

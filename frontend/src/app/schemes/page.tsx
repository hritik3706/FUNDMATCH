"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SchemeCard } from "@/components/scheme-card";
import { Button, PageHeader, StateMessage, TextField } from "@/components/ui";
import { useRelevantMatches } from "@/hooks/use-relevant-matches";
import type { SchemeSummary } from "@/lib/types";
import { listSchemes } from "@/services/schemeService";

export default function SchemesPage() {
  const { matches } = useRelevantMatches();
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [stage, setStage] = useState("all");
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

  const sectors = useMemo(() => Array.from(new Set(schemes.flatMap((scheme) => scheme.eligibleSectors))).sort(), [schemes]);
  const stages = useMemo(() => Array.from(new Set(schemes.flatMap((scheme) => scheme.eligibleStages))).sort(), [schemes]);
  const visible = schemes.filter((scheme) => {
    const text = `${scheme.name} ${scheme.description}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesSector = sector === "all" || scheme.eligibleSectors.includes(sector);
    const matchesStage = stage === "all" || scheme.eligibleStages.includes(stage);
    return matchesQuery && matchesSector && matchesStage;
  });

  return (
    <AppShell>
      <PageHeader eyebrow="Directory" title="Find government schemes for your startup" description="Search and filters run on the catalogue returned by the API." />
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <TextField label="Search" name="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Scheme name" />
        <label className="flex flex-col gap-1.5 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
          Sector
          <select className="h-[42px] rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-md normal-case" value={sector} onChange={(event) => setSector(event.target.value)}>
            <option value="all">All sectors</option>
            {sectors.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
          Stage
          <select className="h-[42px] rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-md normal-case" value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="all">All stages</option>
            {stages.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      {loading ? <StateMessage title="Loading schemes" body="Reading the catalogue." /> : null}
      {error ? <StateMessage title="Could not load schemes" body={error} action={<Button onClick={load}>Retry</Button>} /> : null}
      {!loading && !error && visible.length === 0 ? <StateMessage title="No schemes match" body="Try a different search or clear the filters." /> : null}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {visible.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} match={matches.find((item) => item.schemeId === scheme.id)} />)}
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { SchemeCard } from "@/components/scheme-card";
import { Button, StateMessage } from "@/components/ui";
import type { SchemeSummary } from "@/lib/types";
import { listSchemes } from "@/services/schemeService";

export function SchemeSpotlight() {
  const [schemes, setSchemes] = useState<SchemeSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    listSchemes()
      .then((result) => setSchemes(result.schemes.slice(0, 3)))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <StateMessage title="Loading catalogue" body="Fetching schemes from the FundMatch API." />;
  if (error) return <StateMessage title="Catalogue unavailable" body={error} action={<Button onClick={load}>Retry</Button>} />;
  if (schemes.length === 0) return <StateMessage title="No schemes yet" body="The catalogue did not return any schemes." />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {schemes.map((scheme) => (
        <SchemeCard key={scheme.id} scheme={scheme} />
      ))}
    </div>
  );
}

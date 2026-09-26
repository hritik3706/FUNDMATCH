"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel, StateMessage } from "@/components/ui";
import type { ApplicationStatus, TrackedApplication } from "@/lib/types";
import { applications, updateApplicationStatus } from "@/services/accountService";

const statuses: ApplicationStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "DOCUMENTS_REQUIRED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

export default function ApplicationsPage() {
  const [items, setItems] = useState<TrackedApplication[]>([]);

  useEffect(() => {
    setItems(applications());
  }, []);

  return (
    <AppShell>
      <PageHeader eyebrow="Tracking" title="Application tracking" description="Tracking starts only when you choose Track application on a catalogue scheme. Status changes stay on this device." />
      {items.length === 0 ? <StateMessage title="No applications" body="There is nothing to track until you start one from a scheme page." /> : null}
      <div className="space-y-4">
        {items.map((item) => (
          <Panel key={item.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">{item.schemeName}</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Updated {new Date(item.updatedAt).toLocaleString()}</p>
              </div>
              <label className="font-label-md text-label-md uppercase text-on-surface-variant">
                Status
                <select
                  className="mt-1 block h-[42px] rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-md normal-case text-on-surface"
                  value={item.status}
                  onChange={(event) => setItems(updateApplicationStatus(item.id, event.target.value as ApplicationStatus))}
                >
                  {statuses.map((status) => <option key={status} value={status}>{status.split("_").join(" ")}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-4 font-label-lg text-label-lg text-secondary">
              <Link href={`/schemes/${item.schemeId}`}>Scheme</Link>
              <Link href={`/schemes/${item.schemeId}/roadmap`}>Roadmap</Link>
              {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer">Official portal</a> : <span className="text-on-surface-variant">Official link not provided</span>}
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}

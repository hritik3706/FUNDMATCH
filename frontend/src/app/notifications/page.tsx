"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, PageHeader, Panel, StateMessage } from "@/components/ui";
import type { AppNotification } from "@/lib/types";
import { markAllNotificationsRead, markNotificationRead, notifications } from "@/services/accountService";

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    setItems(notifications());
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Activity saved on this device."
        actions={<Button variant="secondary" onClick={() => setItems(markAllNotificationsRead())}>Mark all read</Button>}
      />
      {items.length === 0 ? <StateMessage title="You're all caught up." body="Scheme and application activity will show up here." /> : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Panel className={item.read ? "opacity-70" : ""}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label-caps text-label-caps uppercase text-secondary">{item.category}</p>
                  <h2 className="font-headline-sm text-headline-sm text-primary">{item.title}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.body}</p>
                  <p className="mt-1 font-data-mono text-xs text-on-surface-variant">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                {!item.read ? <Button variant="secondary" onClick={() => setItems(markNotificationRead(item.id))}>Mark read</Button> : null}
              </div>
              {item.href ? <Link className="mt-3 inline-block text-secondary hover:underline" href={item.href}>Open</Link> : null}
            </Panel>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

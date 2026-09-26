"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/lib/types";
import { loadNotifications, markNotificationRead } from "@/services/accountService";

type LoadState = "loading" | "ready" | "error";

export function NotificationBell() {
  const panelId = useId();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<LoadState>("loading");
  const [items, setItems] = useState<AppNotification[]>([]);

  function load(showLoading: boolean) {
    if (showLoading) setState("loading");
    try {
      setItems(loadNotifications());
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    load(true);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((item) => !item.read).length;
  const preview = items.slice(0, 5);

  function openItem(item: AppNotification) {
    if (!item.read) setItems(markNotificationRead(item.id));
    setOpen(false);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative text-on-surface-variant"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((current) => !current);
          load(false);
        }}
      >
        <Icon name="notifications" />
        {unread > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 font-label-md text-[10px] leading-none text-on-secondary">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute right-0 z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e2e8f0] bg-surface-container-lowest shadow-tier3"
        >
          <p className="border-b border-[#e2e8f0] px-4 py-2.5 font-label-lg text-label-lg text-primary">Notifications</p>
          {state === "loading" ? <p className="px-4 py-6 font-body-sm text-body-sm text-on-surface-variant">Loading notifications</p> : null}
          {state === "error" ? (
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <p className="font-body-sm text-body-sm text-error">Notifications could not be loaded.</p>
              <button type="button" className="font-label-lg text-label-lg text-secondary" onClick={() => load(true)}>
                Try again
              </button>
            </div>
          ) : null}
          {state === "ready" && preview.length === 0 ? (
            <p className="px-4 py-6 font-body-sm text-body-sm text-on-surface-variant">You&apos;re all caught up.</p>
          ) : null}
          {state === "ready" && preview.length > 0 ? (
            <ul>
              {preview.map((item) => (
                <li key={item.id} className="border-b border-[#e2e8f0] last:border-b-0">
                  {item.href ? (
                    <Link href={item.href} className="block px-4 py-3 hover:bg-surface-container-low" onClick={() => openItem(item)}>
                      <Notice item={item} />
                    </Link>
                  ) : (
                    <button type="button" className="block w-full px-4 py-3 text-left hover:bg-surface-container-low" onClick={() => openItem(item)}>
                      <Notice item={item} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/notifications" className="block border-t border-[#e2e8f0] px-4 py-2.5 font-label-lg text-label-lg text-secondary hover:bg-surface-container-low" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Notice({ item }: { item: AppNotification }) {
  return (
    <span className="flex gap-2">
      {!item.read ? <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" /> : <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />}
      <span className="min-w-0">
        <span className={`block font-label-lg text-label-lg text-primary ${item.read ? "font-medium" : "font-semibold"}`}>{item.title}</span>
        <span className="mt-0.5 block font-body-sm text-body-sm text-on-surface-variant">{item.body}</span>
        <span className="mt-1 block font-data-mono text-xs text-on-surface-variant">{timeAgo(item.createdAt)}</span>
      </span>
    </span>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/notification-bell";
import { Brand } from "@/components/public-shell";
import { Icon } from "@/components/ui";
import { useSession } from "@/components/session-provider";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/schemes", label: "Scheme discovery", icon: "search" },
  { href: "/schemes/ministries", label: "Ministries", icon: "account_balance" },
  { href: "/saved", label: "Saved schemes", icon: "bookmark" },
  { href: "/applications", label: "Applications", icon: "pending_actions" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/startup", label: "Startup profile", icon: "apartment" },
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/help", label: "Help", icon: "help" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();

  function onSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-surface md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-primary-container text-on-primary md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <div className="rounded bg-surface-container-lowest px-3 py-2">
            <Brand />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3 md:pb-6" aria-label="Application">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/schemes" && pathname.startsWith(link.href));
            const schemesActive = link.href === "/schemes" && pathname === "/schemes";
            const selected = link.href === "/schemes" ? schemesActive : active;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-3 rounded px-3 py-2.5 font-label-lg text-label-lg ${
                  selected ? "bg-inverse-surface text-on-primary" : "text-primary-fixed-dim hover:bg-inverse-surface/60"
                }`}
              >
                <Icon name={link.icon} className="text-[20px]" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="relative z-30 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-surface-container-lowest px-4 md:px-8">
          <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            {user ? user.name : "Guest session"}
          </p>
          <div className="flex items-center gap-3">
            <NotificationBell />
            {user ? (
              <button type="button" onClick={onSignOut} className="font-label-lg text-label-lg text-secondary">
                Sign out
              </button>
            ) : (
              <Link href="/login" className="font-label-lg text-label-lg text-secondary">
                Sign in
              </Link>
            )}
          </div>
        </header>
        <div className="mx-auto w-full max-w-canvas px-4 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}

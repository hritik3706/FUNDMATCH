"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/components/session-provider";
import { Icon } from "@/components/ui";

function brandHref(signedIn: boolean, ready: boolean, pathname: string) {
  if (signedIn) return "/dashboard";
  const onPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";
  if (!ready && !onPublicPage) return "/dashboard";
  return "/";
}

export function Brand() {
  const pathname = usePathname();
  const { ready, user } = useSession();
  return (
    <Link href={brandHref(Boolean(user), ready, pathname)} className="flex shrink-0 items-center" aria-label="FundMatch home">
      <img alt="FundMatch" className="h-11 w-auto max-w-[220px] object-contain object-left" src="/fundmatch-wordmark.png" />
    </Link>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 md:px-6">
        <div className="flex items-center gap-6">
          <Brand />
          <span className="hidden items-center rounded bg-surface-container-low px-2 py-0.5 font-label-md text-xs text-secondary md:inline-flex">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
            Gazette index
          </span>
        </div>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          <a className="font-body-md text-body-md text-on-surface hover:text-secondary" href="/#how-it-works">How it works</a>
          <Link className="font-body-md text-body-md text-on-surface hover:text-secondary" href="/advisor">Advisor</Link>
          <Link className="font-body-md text-body-md text-on-surface hover:text-secondary" href="/schemes">Schemes</Link>
          <Link className="font-body-md text-body-md text-on-surface hover:text-secondary" href="/schemes/ministries">Ministries</Link>
          <Link className="font-body-md text-body-md text-on-surface hover:text-secondary" href="/help">About</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Link className="whitespace-nowrap px-1 py-1 font-label-lg text-label-lg text-on-surface-variant hover:text-primary md:px-2" href="/login">Sign in</Link>
          <Link className="inline-flex items-center gap-1.5 whitespace-nowrap rounded bg-primary px-3 py-2 font-label-lg text-label-lg text-on-primary shadow-sm hover:bg-inverse-surface md:gap-2 md:px-4 md:py-2.5" href="/onboarding/story">
            Check eligibility
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest py-16 text-on-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <Brand />
            <p className="max-w-sm font-body-md text-body-md text-on-surface-variant">
              Statutory startup grant discovery, eligibility verification, and application roadmaps across Indian central and state programmes.
            </p>
          </div>
          <div>
            <h2 className="mb-4 font-label-lg text-label-lg font-bold text-primary">Explore</h2>
            <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li><Link className="hover:text-primary" href="/advisor">Funding advisor</Link></li>
              <li><Link className="hover:text-primary" href="/schemes">Scheme directory</Link></li>
              <li><Link className="hover:text-primary" href="/schemes/ministries">Grouped catalogue</Link></li>
              <li><Link className="hover:text-primary" href="/help">How matching works</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-label-lg text-label-lg font-bold text-primary">Account</h2>
            <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li><Link className="hover:text-primary" href="/signup">Create account</Link></li>
              <li><Link className="hover:text-primary" href="/login">Sign in</Link></li>
              <li><Link className="hover:text-primary" href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="rounded-t-xl bg-surface-container-low p-6 text-xs text-on-surface-variant">
          <p>
            <strong className="font-semibold text-primary">Institutional disclaimer:</strong> FundMatch is an independent statutory intelligence platform. It is not a government agency. Final approvals remain with the administering authority. Official links are shown only when the catalogue provides them.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

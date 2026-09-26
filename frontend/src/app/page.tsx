import Link from "next/link";
import { PublicFrame } from "@/components/public-shell";
import { Icon } from "@/components/ui";
import { SchemeSpotlight } from "@/components/scheme-spotlight";

const pillars = [
  { icon: "sync", title: "Official sources", body: "Recommendations stay tied to the catalogue the backend returns, including the official link when one is published.", foot: "Source links only when provided" },
  { icon: "receipt_long", title: "Evidence-backed criteria", body: "Eligibility explanations come from the match response, not from a score invented in the browser.", foot: "Backend match result" },
  { icon: "account_balance", title: "Grouped discovery", body: "Schemes are grouped by the catalogue field the API actually sends. Missing groups stay labelled as not provided.", foot: "No invented ministries" },
  { icon: "checklist_rtl", title: "Actionable guidance", body: "Roadmaps list the steps, documents, and deadlines returned by the action-plan service.", foot: "Data-driven roadmap" },
];

const steps = [
  { n: "01", title: "Tell us your startup story", body: "Describe the company, stage, location, and what you want next in plain language." },
  { n: "02", title: "Review the profile", body: "Confirm every field. Anything the backend has not stored is shown as not provided." },
  { n: "03", title: "Match against the catalogue", body: "The API scores the saved profile against the schemes it already holds." },
  { n: "04", title: "Roadmap", body: "Open a scheme to see eligibility, gaps, and the application steps the service returns." },
];

export default function LandingPage() {
  return (
    <PublicFrame>
      <section className="bg-surface pb-20 pt-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-surface-container-low px-3 py-1.5">
              <Icon name="verified" className="text-base text-secondary" />
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">Statutory grant and concession engine</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl-mobile font-bold tracking-tight text-primary md:text-headline-xl">
              Find the right government schemes for your startup.
            </h1>
            <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              Tell PS41 where your startup is today and where you want to go. Discover schemes from the catalogue, understand eligibility, identify missing requirements, and build a path to apply.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/onboarding/story" className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3.5 font-label-lg text-label-lg text-on-primary shadow-md hover:bg-inverse-surface">
                Analyze my startup
                <Icon name="arrow_forward" className="text-base" />
              </Link>
              <Link href="/schemes" className="inline-flex items-center gap-2 rounded bg-surface-container-lowest px-6 py-3.5 font-label-lg text-label-lg text-primary shadow-sm hover:bg-surface-container-low">
                <Icon name="history_edu" className="text-base text-secondary" />
                Explore the catalogue
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-xl bg-surface-container-lowest p-6 shadow-tier3">
              <div className="-mx-6 -mt-6 mb-4 flex items-center justify-between rounded-t-xl bg-surface-container-low p-4">
                <span className="font-data-mono text-data-mono text-on-surface-variant">Product journey</span>
                <span className="rounded bg-surface-container-highest px-2 py-0.5 font-data-mono text-xs text-primary">Profile to roadmap</span>
              </div>
              <ol className="space-y-3 font-data-mono text-xs">
                {["Startup story and intent", "Profile review", "Classification", "Scheme catalogue", "Eligibility and gaps", "Application roadmap"].map((label, index) => (
                  <li key={label} className="flex items-center justify-between rounded bg-surface p-3 shadow-sm">
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary-fixed font-bold text-secondary">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-bold text-primary">{label}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20" id="pillars">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-primary">Built around official government information.</h2>
            <p className="mt-3 font-body-lg text-body-lg text-on-surface-variant">Scheme facts on the working screens come from the backend catalogue. The page does not invent funding amounts, deadlines, or official URLs.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-low text-secondary">
                    <Icon name={pillar.icon} className="text-2xl" />
                  </div>
                  <h3 className="mb-2 font-headline-sm text-headline-sm font-bold text-primary">{pillar.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{pillar.body}</p>
                </div>
                <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl bg-surface-container-low p-4">
                  <span className="font-data-mono text-xs text-on-surface-variant">{pillar.foot}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-20" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Workflow</p>
          <h2 className="mt-1 font-headline-xl text-headline-xl font-bold tracking-tight text-primary">How PS41 prepares your startup</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.n} className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <div className="mb-3 font-headline-lg text-headline-lg font-bold text-secondary">{step.n}</div>
                <h3 className="mb-2 font-headline-sm text-headline-sm font-bold text-primary">{step.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20" id="schemes">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">Active catalogue</p>
              <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-primary">Scheme spotlight</h2>
            </div>
            <Link href="/schemes" className="inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary hover:underline">
              View the directory
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
          <SchemeSpotlight />
        </div>
      </section>

      <section className="bg-primary py-24 text-on-primary">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mx-auto max-w-3xl font-headline-xl text-headline-xl font-bold tracking-tight">Ready to discover what your startup may qualify for?</h2>
          <p className="mx-auto mt-4 max-w-2xl font-body-lg text-body-lg text-primary-fixed-dim">Start with your story, confirm the profile, and review only the schemes the catalogue returns.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/onboarding/story" className="inline-flex w-full items-center justify-center gap-2 rounded bg-surface-container-lowest px-8 py-4 font-label-lg text-label-lg text-primary sm:w-auto">
              Start your analysis
              <Icon name="arrow_forward" className="text-base" />
            </Link>
            <Link href="/schemes" className="inline-flex w-full items-center justify-center gap-2 rounded bg-inverse-surface px-8 py-4 font-label-lg text-label-lg text-surface sm:w-auto">
              <Icon name="search" className="text-base" />
              Browse the directory
            </Link>
          </div>
        </div>
      </section>
    </PublicFrame>
  );
}

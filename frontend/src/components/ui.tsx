import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { DisplayEligibility } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

const buttonStyles = {
  primary: "bg-primary text-on-primary hover:bg-inverse-surface shadow-sm",
  secondary: "bg-surface-container-lowest text-primary border border-outline-variant hover:bg-surface-container-low",
  accent: "bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim",
  ghost: "bg-transparent text-secondary hover:underline",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 font-label-lg text-label-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const id = props.id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{label}</span>
      <input
        id={id}
        className="h-[42px] rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface outline-none focus:border-secondary focus:ring-[3px] focus:ring-secondary/15"
        {...props}
      />
      {error ? <span className="font-body-sm text-body-sm text-error">{error}</span> : null}
      {hint && !error ? <span className="font-body-sm text-body-sm text-on-surface-variant">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const id = props.id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{label}</span>
      <textarea
        id={id}
        className="min-h-40 rounded border border-outline-variant bg-surface-container-lowest px-3 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-secondary focus:ring-[3px] focus:ring-secondary/15"
        {...props}
      />
      {error ? <span className="font-body-sm text-body-sm text-error">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = props.id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{label}</span>
      <select
        id={id}
        className="h-[42px] rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface outline-none focus:border-secondary"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

const badgeTone: Record<DisplayEligibility, string> = {
  ELIGIBLE: "bg-status-success-bg text-[#065f46] border-status-success-border",
  POTENTIALLY_ELIGIBLE: "bg-status-warning-bg text-[#92400e] border-status-warning-border",
  NOT_ELIGIBLE: "bg-status-error-bg text-[#991b1b] border-status-error-border",
  INSUFFICIENT_INFORMATION: "bg-surface-container-low text-on-surface-variant border-outline-variant",
};

export function StatusBadge({ status }: { status: DisplayEligibility }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-label-md text-label-md ${badgeTone[status]}`}>
      {statusLabel(status)}
    </span>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[#e2e8f0] bg-surface-container-lowest p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 font-label-caps text-label-caps uppercase tracking-widest text-secondary">{eyebrow}</p>
        ) : null}
        <h1 className="font-headline-xl text-headline-lg text-on-surface md:text-headline-xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl font-body-md text-body-md text-on-surface-variant">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function StateMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col items-start gap-3">
      <h2 className="font-headline-sm text-headline-sm text-primary">{title}</h2>
      <p className="font-body-md text-body-md text-on-surface-variant">{body}</p>
      {action}
    </Panel>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 font-label-lg text-label-lg text-secondary hover:underline">
      {children}
    </Link>
  );
}

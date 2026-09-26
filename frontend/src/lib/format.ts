import type { BackendEligibilityStatus, DisplayEligibility } from "@/lib/types";

export function inr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function displayStatus(status: BackendEligibilityStatus | null): DisplayEligibility {
  if (!status) return "INSUFFICIENT_INFORMATION";
  if (status === "FULLY_ELIGIBLE") return "ELIGIBLE";
  if (status === "NOT_ELIGIBLE") return "NOT_ELIGIBLE";
  return "POTENTIALLY_ELIGIBLE";
}

export function statusLabel(status: DisplayEligibility) {
  switch (status) {
    case "ELIGIBLE":
      return "Eligible";
    case "POTENTIALLY_ELIGIBLE":
      return "Potentially eligible";
    case "NOT_ELIGIBLE":
      return "Not eligible";
    default:
      return "Insufficient information";
  }
}

export function fundingLabel(min?: number | null, max?: number | null) {
  if (max == null || max <= 0) return null;
  if (min == null || min <= 0 || min === max) return `Up to ${inr(max)}`;
  return `${inr(min)} – ${inr(max)}`;
}

export function timeAgo(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(delta)) return "";
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function notProvided(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value);
}

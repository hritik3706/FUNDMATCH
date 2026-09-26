import type { BackendEligibilityStatus, DisplayEligibility } from "@/lib/types";

function lakhLabel(lakhs: number) {
  if (lakhs >= 100) {
    const crore = lakhs / 100;
    const text = Number.isInteger(crore) ? String(crore) : crore.toFixed(2).replace(/\.?0+$/, "");
    return `Rs ${text} crore`;
  }
  return `Rs ${lakhs} lakh`;
}

export function fundingRange(min: number, max: number) {
  if (!min && !max) return "Amount not stated";
  if (!min) return `Up to ${lakhLabel(max)}`;
  if (min === max) return lakhLabel(min);
  return `${lakhLabel(min)} – ${lakhLabel(max)}`;
}

export function displayStatus(status: BackendEligibilityStatus | null): DisplayEligibility {
  if (!status || status === "INSUFFICIENT_INFORMATION") return "INSUFFICIENT_INFORMATION";
  if (status === "FULLY_ELIGIBLE") return "ELIGIBLE";
  if (status === "NOT_ELIGIBLE") return "NOT_ELIGIBLE";
  return "POTENTIALLY_ELIGIBLE";
}

export function relevanceLabel(relevance: "now" | "potential" | "future" | undefined) {
  if (relevance === "now") return "Relevant now";
  if (relevance === "potential") return "Potentially relevant";
  if (relevance === "future") return "Future opportunity";
  return "";
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
  if ((min == null || min <= 0) && (max == null || max <= 0)) return null;
  return fundingRange(min ?? 0, max ?? 0);
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

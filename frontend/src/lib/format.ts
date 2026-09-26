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

export function notProvided(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value);
}

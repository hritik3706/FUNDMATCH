export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function friendlyMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const record = body as { message?: unknown; error?: unknown; details?: Record<string, string> };
  if (record.details && typeof record.details === "object") {
    const first = Object.values(record.details).find((value) => typeof value === "string");
    if (first) return first;
  }
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  if (typeof record.error === "string" && record.error !== "Validation failed") return record.error;
  return fallback;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("We could not reach the FundMatch API. Check that the backend is running, then try again.", 0);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(friendlyMessage(body, "The request could not be completed."), response.status);
  }
  return body as T;
}

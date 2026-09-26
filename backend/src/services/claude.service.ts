import { ClaudeUnavailableError } from "../types/matching.types";

type ClaudeMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
};

function stripJsonFence(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

export function parseModelJson<T>(raw: string): T {
  try {
    return JSON.parse(stripJsonFence(raw)) as T;
  } catch {
    throw new ClaudeUnavailableError("Claude returned malformed JSON");
  }
}

export async function completeJson(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new ClaudeUnavailableError("CLAUDE_API_KEY is not set");
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    throw new ClaudeUnavailableError("Claude API request failed");
  }

  if (!response.ok) {
    throw new ClaudeUnavailableError(`Claude API returned ${response.status}`);
  }

  let body: ClaudeMessageResponse;
  try {
    body = (await response.json()) as ClaudeMessageResponse;
  } catch {
    throw new ClaudeUnavailableError("Claude API returned a non-JSON body");
  }

  const text = body.content?.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new ClaudeUnavailableError("Claude API returned an empty response");
  }
  return text;
}

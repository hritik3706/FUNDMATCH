import { env } from "../config/env";
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

async function completeWithGemini(prompt: string, maxTokens: number): Promise<string> {
  const model = env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(25000),
      },
    );
  } catch {
    throw new ClaudeUnavailableError("Gemini API request failed");
  }

  if (!response.ok) {
    throw new ClaudeUnavailableError(`Gemini API returned ${response.status}`);
  }

  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = body.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
  if (!text) {
    throw new ClaudeUnavailableError("Gemini API returned an empty response");
  }
  return text;
}

export async function completeJson(prompt: string, maxTokens: number): Promise<string> {
  if (env.GEMINI_API_KEY) {
    return completeWithGemini(prompt, maxTokens);
  }

  const apiKey = env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new ClaudeUnavailableError("GEMINI_API_KEY is not set");
  }

  const model = env.CLAUDE_MODEL || "claude-sonnet-4-6";
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

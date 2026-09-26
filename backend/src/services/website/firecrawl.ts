import { env } from "../../config/env";
import { CACHE_TTL, cacheGet, cacheSet } from "../cache.service";
import { readStartupSite, SiteIdea } from "./readStartupSite";

export type WebsiteStatus = "skipped" | "extracted" | "unavailable";

export type WebsiteRead = {
  status: WebsiteStatus;
  notice?: string;
  idea: SiteIdea | null;
};

const FAILURE_NOTICE =
  "We couldn't analyze the website right now. You can continue using the information from your startup profile.";

const FAILURE_TTL_MS = 5 * 60 * 1000;

async function scrapeWithFirecrawl(url: string): Promise<SiteIdea | null> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as {
      success?: boolean;
      data?: {
        markdown?: string;
        metadata?: { title?: string; description?: string; sourceURL?: string };
      };
    };
    const markdown = (body.data?.markdown ?? "").replace(/\s+/g, " ").trim();
    const title = body.data?.metadata?.title?.trim() ?? "";
    const description = body.data?.metadata?.description?.trim() ?? "";
    const text = [title, description, markdown.slice(0, 3500)].filter(Boolean).join("\n").slice(0, 4500);
    if (!text.trim()) {
      return null;
    }
    return {
      url: body.data?.metadata?.sourceURL || url,
      title,
      text,
      source: "firecrawl",
    };
  } catch (error) {
    console.error("Firecrawl request failed", error);
    return null;
  }
}

export async function readStartupWebsite(rawUrl: string | null | undefined): Promise<WebsiteRead> {
  const url = rawUrl?.trim();
  if (!url) {
    return { status: "skipped", idea: null };
  }

  const cacheKey = `website:v1:${url}`;
  const cached = cacheGet<WebsiteRead>(cacheKey);
  if (cached) {
    return cached;
  }

  let result: WebsiteRead;
  if (env.FIRECRAWL_API_KEY) {
    const scraped = await scrapeWithFirecrawl(url);
    if (scraped) {
      result = { status: "extracted", idea: scraped };
    } else {
      const page = await readStartupSite(url);
      result = page
        ? { status: "extracted", idea: { ...page, source: page.source ?? "page" } }
        : { status: "unavailable", notice: FAILURE_NOTICE, idea: null };
    }
  } else {
    const page = await readStartupSite(url);
    result = page
      ? { status: "extracted", idea: page }
      : { status: "unavailable", notice: FAILURE_NOTICE, idea: null };
  }

  cacheSet(cacheKey, result, result.status === "unavailable" ? FAILURE_TTL_MS : CACHE_TTL.matchMs);
  return result;
}

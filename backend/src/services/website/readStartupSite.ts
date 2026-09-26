import { lookup } from "dns/promises";
import { isIP } from "net";
import { CACHE_TTL, cacheGet, cacheSet } from "../cache.service";

export type SiteIdea = {
  url: string;
  title: string;
  text: string;
  source?: "firecrawl" | "page";
};

const MAX_BYTES = 500_000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip: string): boolean {
  const value = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (value === "::1" || value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd")) {
    return true;
  }
  const parts = value.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid website URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https websites can be read");
  }
  if (url.username || url.password) {
    throw new Error("Website URL must not include a username or password");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("That website address cannot be read");
  }
  if (isIP(host)) {
    if (isPrivateIp(host)) {
      throw new Error("That website address cannot be read");
    }
    return url;
  }
  const resolved = await lookup(host);
  if (isPrivateIp(resolved.address)) {
    throw new Error("That website address cannot be read");
  }
  return url;
}

function textFromHtml(html: string): { title: string; description: string; body: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ??
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    "";
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const body = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return {
    title: title.replace(/\s+/g, " ").trim(),
    description: description.replace(/\s+/g, " ").trim(),
    body: body.slice(0, 4000),
  };
}

async function readPublicPage(raw: string, redirectsLeft: number): Promise<SiteIdea> {
  const url = await assertPublicHttpUrl(raw);
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "FundMatchBot/1.0",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location || redirectsLeft <= 0) {
      throw new Error("Website redirected too many times");
    }
    return readPublicPage(new URL(location, url).toString(), redirectsLeft - 1);
  }

  if (!response.ok) {
    throw new Error(`Website returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !/text\/html|text\/plain|application\/xhtml/i.test(contentType)) {
    throw new Error("Website did not return a page of text");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const html = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, MAX_BYTES));
  const extracted = textFromHtml(html);
  const text = [extracted.title, extracted.description, extracted.body].filter(Boolean).join("\n").slice(0, 4500);
  if (!text.trim()) {
    throw new Error("Website had no readable text");
  }
  return { url: url.toString(), title: extracted.title, text };
}

export async function readStartupSite(rawUrl: string): Promise<SiteIdea | null> {
  const cacheKey = `site:${rawUrl}`;
  const cached = cacheGet<SiteIdea>(cacheKey);
  if (cached) {
    return cached;
  }
  try {
    const idea = await readPublicPage(rawUrl, MAX_REDIRECTS);
    cacheSet(cacheKey, idea, CACHE_TTL.matchMs);
    return idea;
  } catch (error) {
    console.error("Could not read startup website", error);
    return null;
  }
}

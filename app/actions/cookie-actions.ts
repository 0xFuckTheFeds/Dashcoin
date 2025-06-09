"use server";

import { getFromCache, setInCache, CACHE_KEYS } from "@/lib/redis";

const BASE_URL = "https://api.staging.cookie.fun";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CookieMetrics {
  mindshare: number | null;
  mentions: number | null;
  smartEngagements: number | null;
}

const cookieCache = new Map<string, { data: CookieMetrics; timestamp: number }>();

export const tokenSlugMap: Record<string, string> = {
  KLED: "kled",
  DUPE: "dupe",
  PCULE: "pcule",
  GOONC: "goonc",
  FITCOIN: "fitcoin",
  STARTUP: "startup",
  YAPPER: "yapper",
  // Add the rest of the top 100 here
};

async function fetchFromCookie(endpoint: string, body: any): Promise<any> {
  const key = process.env.COOKIE_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`Cookie API error: ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("Cookie API fetch error", err);
    return null;
  }
}

async function fetchMindshare(slug: string): Promise<number | null> {
  const data = await fetchFromCookie("/v3/project/mindshare-graph", {
    projectSlug: slug,
    granulation: "_24Hours",
  });

  if (!data || !data.graph || data.graph.length === 0) return null;
  const last = data.graph[data.graph.length - 1];
  return typeof last.value === "number" ? last.value : null;
}

async function fetchMetric(slug: string, metricType: string): Promise<number | null> {
  const data = await fetchFromCookie("/v3/metrics", {
    projectSlug: slug,
    metricType,
  });
  if (!data || !data.value) return null;
  return typeof data.value === "number" ? data.value : null;
}

export async function fetchCookieMetrics(slug: string): Promise<CookieMetrics> {
  const cacheKey = `${CACHE_KEYS.COOKIE_METRICS_PREFIX}${slug}`;
  const mem = cookieCache.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) return mem.data;

  const kvData = await getFromCache<CookieMetrics>(cacheKey);
  if (kvData) {
    cookieCache.set(cacheKey, { data: kvData, timestamp: Date.now() });
    return kvData;
  }

  const [mindshare, mentions, smartEngagements] = await Promise.all([
    fetchMindshare(slug),
    fetchMetric(slug, "Mentions"),
    fetchMetric(slug, "SmartEngagements"),
  ]);

  const result: CookieMetrics = {
    mindshare: mindshare ?? null,
    mentions: mentions ?? null,
    smartEngagements: smartEngagements ?? null,
  };

  cookieCache.set(cacheKey, { data: result, timestamp: Date.now() });
  await setInCache(cacheKey, result, CACHE_TTL);

  return result;
}

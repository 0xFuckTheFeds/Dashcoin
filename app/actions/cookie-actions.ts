"use server";

import { cache } from "react";
import { getFromCache, setInCache, CACHE_KEYS, COOKIE_CACHE_DURATION } from "@/lib/redis";
import { tokenSlugMap } from "@/lib/cookie";

interface CookieMetrics {
  mindshare: number | null;
  mentions: number | null;
  smartEngagements: number | null;
}

const API_BASE = "https://api.staging.cookie.fun";
const API_KEY = process.env.COOKIE_API_KEY || "";

const inMemory = new Map<string, { data: CookieMetrics; timestamp: number }>();
const KV_PREFIX = CACHE_KEYS.COOKIE_METRICS_PREFIX;
const TTL = COOKIE_CACHE_DURATION;

async function callCookie(endpoint: string, body: Record<string, any>): Promise<any> {
  if (!API_KEY) {
    console.error("COOKIE_API_KEY not set");
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`Cookie.fun API error: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("Cookie.fun fetch error", err);
    return null;
  }
}

async function fetchMindshare(slug: string): Promise<number | null> {
  const now = Date.now();
  const from = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now).toISOString();
  const json = await callCookie("/v3/project/mindshare-graph", {
    projectSlug: slug,
    granulation: "_24Hours",
    from,
    to,
  });
  const points = json?.data || json?.points || [];
  const latest = points[points.length - 1];
  return latest && typeof latest.value === "number"
    ? Math.round(latest.value * 10) / 10
    : null;
}

async function fetchMetric(slug: string, metricType: "Mentions" | "SmartEngagements"): Promise<number | null> {
  const now = Date.now();
  const from = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now).toISOString();
  const json = await callCookie("/v3/metrics", {
    projectSlug: slug,
    metricType,
    from,
    to,
  });
  const val = json?.value ?? json?.data?.[0]?.value;
  if (val === undefined || val === null) return null;
  return typeof val === "number" ? val : Number(val);
}

export const fetchCookieMetrics = cache(async (slug: string): Promise<CookieMetrics | null> => {
  if (!slug) return null;
  const cacheKey = `${KV_PREFIX}${slug}`;
  const mem = inMemory.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < TTL) return mem.data;
  const kvData = await getFromCache<CookieMetrics>(cacheKey);
  if (kvData) {
    inMemory.set(cacheKey, { data: kvData, timestamp: Date.now() });
    return kvData;
  }
  const [mindshare, mentions, smartEngagements] = await Promise.all([
    fetchMindshare(slug),
    fetchMetric(slug, "Mentions"),
    fetchMetric(slug, "SmartEngagements"),
  ]);
  const result = { mindshare, mentions, smartEngagements };
  inMemory.set(cacheKey, { data: result, timestamp: Date.now() });
  await setInCache(cacheKey, result, TTL);
  return result;
});

export function getSlugForSymbol(symbol: string): string | undefined {
  return tokenSlugMap[symbol.toUpperCase()];
}

export type { CookieMetrics };

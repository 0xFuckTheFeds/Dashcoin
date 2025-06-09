"use server";

import { getFromCache, setInCache, CACHE_KEYS } from "@/lib/redis";
import { getTokenSlug } from "@/data/token-slug-map";

export interface CookieMetrics {
  mindshare: number;
  mindshareChange?: number;
  mentions: number;
  smartEngagements: number;
}

const COOKIE_API_KEY = process.env.COOKIE_API_KEY;
const COOKIE_BASE_URL = "https://api.staging.cookie.fun";
const COOKIE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function postCookie(path: string, body: any) {
  if (!COOKIE_API_KEY) {
    console.error("COOKIE_API_KEY not set");
    return null;
  }

  try {
    const res = await fetch(`${COOKIE_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": COOKIE_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`Cookie.fun request failed: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Cookie.fun request error", err);
    return null;
  }
}

export async function fetchCookieMetrics(project: string): Promise<CookieMetrics | null> {
  if (!project) return null;

  const key = `${CACHE_KEYS.COOKIE_METRICS_PREFIX}${project.toUpperCase()}`;
  const cached = await getFromCache<CookieMetrics>(key);
  if (cached) return cached;

  const [mindshareData, metricsData] = await Promise.all([
    postCookie("/v3/project/mindshare-graph", { project }),
    postCookie("/v3/metrics", { project }),
  ]);

  if (!mindshareData || !metricsData) return null;

  const points = mindshareData?.points || mindshareData?.data?.points || [];
  const latest = points.length > 0 ? points[points.length - 1].value || 0 : 0;
  const prev = points.length > 1 ? points[points.length - 2].value || 0 : 0;
  const change = prev ? ((latest - prev) / prev) * 100 : 0;

  const mentions = metricsData?.mentions24h ?? metricsData?.mentions ?? 0;
  const smartEngagements = metricsData?.smartEngagements24h ?? metricsData?.smartEngagements ?? 0;

  const result: CookieMetrics = {
    mindshare: latest,
    mindshareChange: change,
    mentions,
    smartEngagements,
  };

  await setInCache(key, result, COOKIE_CACHE_DURATION);
  return result;
}

export async function batchFetchCookieMetrics(projects: string[]): Promise<Map<string, CookieMetrics | null>> {
  const result = new Map<string, CookieMetrics | null>();
  for (const proj of projects) {
    const data = await fetchCookieMetrics(proj);
    result.set(proj, data);
  }
  return result;
}

export async function fetchProjectSlug(symbol: string, address?: string): Promise<string | null> {
  const direct = getTokenSlug(symbol);
  if (direct) return direct;
  if (!address) return null;
  const key = `${CACHE_KEYS.COOKIE_SLUG_PREFIX}${address.toLowerCase()}`;
  const cached = await getFromCache<string>(key);
  if (cached) return cached;

  const data = await postCookie("/v3/project/search", { contractAddress: address });
  const slug = data?.slug || data?.project?.slug || data?.data?.slug;
  if (slug) {
    await setInCache(key, slug, COOKIE_CACHE_DURATION);
    return slug as string;
  }
  return null;
}

export interface TokenIdentifier {
  symbol: string;
  token?: string;
}

export async function batchFetchCookieMetricsForTokens(tokens: TokenIdentifier[]): Promise<Map<string, CookieMetrics | null>> {
  const result = new Map<string, CookieMetrics | null>();
  for (const t of tokens) {
    const slug = await fetchProjectSlug(t.symbol, t.token);
    if (!slug) continue;
    const data = await fetchCookieMetrics(slug);
    result.set(t.symbol.toUpperCase(), data);
  }
  return result;
}

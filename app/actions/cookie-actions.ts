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

function get24hAgoISO() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

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

  const [mindshareData, mentionsData, smartEngagementsData] = await Promise.all([
    postCookie("/v3/project/mindshare-graph", {
      projectSlug: project,
      granulation: "_24Hours",
      startDate: get24hAgoISO(),
      endDate: new Date().toISOString(),
    }),
    postCookie("/v3/metrics", {
      projectSlug: project,
      metricType: "Mentions",
      granulation: "_24Hours",
      startDate: get24hAgoISO(),
      endDate: new Date().toISOString(),
    }),
    postCookie("/v3/metrics", {
      projectSlug: project,
      metricType: "SmartEngagements",
      granulation: "_24Hours",
      startDate: get24hAgoISO(),
      endDate: new Date().toISOString(),
    }),
  ]);

  if (
    !mindshareData?.success ||
    !mentionsData?.success ||
    !smartEngagementsData?.success
  ) {
    console.error(
      "Cookie.fun API error:",
      mindshareData?.error || mentionsData?.error || smartEngagementsData?.error
    );
    return null;
  }

  const points = mindshareData?.points || mindshareData?.data?.points || [];
  const latest = points.length > 0 ? points[points.length - 1].value || 0 : 0;
  const prev = points.length > 1 ? points[points.length - 2].value || 0 : 0;
  const change = prev ? ((latest - prev) / prev) * 100 : 0;

  const mentions = mentionsData?.mentions24h ?? mentionsData?.mentions ?? 0;
  const smartEngagements =
    smartEngagementsData?.smartEngagements24h ?? smartEngagementsData?.smartEngagements ?? 0;

  const result: CookieMetrics = {
    mindshare: latest,
    mindshareChange: change,
    mentions,
    smartEngagements,
  };

  await setInCache(key, result, COOKIE_CACHE_DURATION);
  return result;
}

export async function batchFetchCookieMetrics(
  projects: string[]
): Promise<Map<string, CookieMetrics | null>> {
  const entries = await Promise.all(
    projects.map(async p => [p, await fetchCookieMetrics(p)] as const)
  );
  return new Map(entries);
}

export async function fetchProjectSlug(symbol: string, address?: string): Promise<string | null> {
  const direct = getTokenSlug(symbol);
  if (direct) return direct;

  const cacheKeyAddr = address ? `${CACHE_KEYS.COOKIE_SLUG_PREFIX}${address.toLowerCase()}` : null;
  const cacheKeySym = `${CACHE_KEYS.COOKIE_SLUG_PREFIX}sym:${symbol.toUpperCase()}`;

  if (cacheKeyAddr) {
    const cached = await getFromCache<string>(cacheKeyAddr);
    if (cached) return cached;
  }

  const cachedSym = await getFromCache<string>(cacheKeySym);
  if (cachedSym) return cachedSym;

  if (address) {
    const data = await postCookie("/v3/project/search", { contractAddress: address });
    const slug = data?.slug || data?.project?.slug || data?.data?.slug;
    if (slug) {
      if (cacheKeyAddr) await setInCache(cacheKeyAddr, slug, COOKIE_CACHE_DURATION);
      await setInCache(cacheKeySym, slug, COOKIE_CACHE_DURATION);
      return slug as string;
    }
  }

  const dataBySymbol = await postCookie("/v3/project/search", { symbol });
  const slug = dataBySymbol?.slug || dataBySymbol?.project?.slug || dataBySymbol?.data?.slug;
  if (slug) {
    if (cacheKeyAddr) await setInCache(cacheKeyAddr, slug, COOKIE_CACHE_DURATION);
    await setInCache(cacheKeySym, slug, COOKIE_CACHE_DURATION);
    return slug as string;
  }

  return null;
}

export interface TokenIdentifier {
  symbol: string;
  token?: string;
}

export async function batchFetchCookieMetricsForTokens(tokens: TokenIdentifier[]): Promise<Map<string, CookieMetrics | null>> {
  const entries = await Promise.all(
    tokens.map(async t => {
      const slug = await fetchProjectSlug(t.symbol, t.token);
      if (!slug) return [t.symbol.toUpperCase(), null] as const;
      const data = await fetchCookieMetrics(slug);
      return [t.symbol.toUpperCase(), data] as const;
    })
  );
  return new Map(entries);
}

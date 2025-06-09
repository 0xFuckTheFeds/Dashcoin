export interface CookieMetrics {
  mindshare: number | null;
  mentions: number | null;
  smartEngagements: number | null;
}

import { getFromCache, setInCache, CACHE_KEYS } from '@/lib/redis';

const BASE_URL = 'https://api.staging.cookie.fun';
const API_KEY = process.env.COOKIE_API_KEY;
const COOKIE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const slugMap: Record<string, string> = {
  KLED: 'kled',
  DUPE: 'dupe',
};

async function postJson(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY || '',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  try {
    return await res.json();
  } catch (err) {
    console.error('Error parsing cookie.fun response', err);
    return null;
  }
}

export async function fetchCookieMetrics(symbol: string): Promise<CookieMetrics | null> {
  const slug = slugMap[symbol.toUpperCase()] || symbol.toLowerCase();

  const cacheKey = `${CACHE_KEYS.COOKIE_METRICS_PREFIX}${slug}`;
  const cached = await getFromCache<CookieMetrics>(cacheKey);
  if (cached) return cached;

  const mindshareResp = await postJson('/v3/project/mindshare-graph', {
    projectSlug: slug,
  });
  const mentionsResp = await postJson('/v3/metrics', {
    projectSlug: slug,
    metricType: 'Mentions',
  });
  const smartResp = await postJson('/v3/metrics', {
    projectSlug: slug,
    metricType: 'SmartEngagements',
  });

  const metrics: CookieMetrics = {
    mindshare: Array.isArray(mindshareResp?.data)
      ? Number(mindshareResp.data[mindshareResp.data.length - 1]?.value) || null
      : null,
    mentions: typeof mentionsResp?.data?.value === 'number'
      ? mentionsResp.data.value
      : null,
    smartEngagements: typeof smartResp?.data?.value === 'number'
      ? smartResp.data.value
      : null,
  };

  await setInCache(cacheKey, metrics, COOKIE_CACHE_DURATION);
  return metrics;
}

export async function batchFetchCookieMetrics(symbols: string[]): Promise<Record<string, CookieMetrics | null>> {
  const results: Record<string, CookieMetrics | null> = {};
  const unique = Array.from(new Set(symbols.map(s => s.toUpperCase())));
  for (const sym of unique) {
    results[sym] = await fetchCookieMetrics(sym);
  }
  return results;
}

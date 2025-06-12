import { NextResponse } from 'next/server'
import { fetchAllTokensFromDune } from '@/app/actions/dune-actions'

const COOKIE_API_KEY = process.env.COOKIE_API_KEY || ''
const API_BASE = 'https://api.staging.cookie.fun'

interface MetricEntry {
  date: string
  value: number
}

interface TokenResult {
  token: string
  address: string
  mindshare: number | null
  mentions: number | null
  smartEngagements: number | null
  updated: string | null
  error?: string
}

const CACHE_TTL = 4 * 60 * 60 * 1000

const cache = new Map<string, { data: TokenResult; timestamp: number }>()

async function fetchMindshare(slug: string): Promise<MetricEntry> {
  const res = await fetch(`${API_BASE}/v3/project/mindshare-graph`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': COOKIE_API_KEY,
    },
    body: JSON.stringify({ projectSlug: slug, granulation: '_24Hours' }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch mindshare')
  }
  const entries = json.ok?.entries || []
  return entries[entries.length - 1] || { date: new Date().toISOString(), value: 0 }
}

async function fetchMetric(slug: string, metric: string): Promise<MetricEntry> {
  const res = await fetch(`${API_BASE}/v3/metrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': COOKIE_API_KEY,
    },
    body: JSON.stringify({
      projectSlug: slug,
      metricType: metric,
      granulation: '_24Hours',
    }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `Failed to fetch ${metric}`)
  }
  const entries = json.ok?.entries || []
  return entries[entries.length - 1] || { date: new Date().toISOString(), value: 0 }
}

export async function GET(req: Request) {
  const force = req.url.includes('refresh=1')
  const results: TokenResult[] = []
  const now = Date.now()

  const allTokens = await fetchAllTokensFromDune()
  const topTokens = allTokens
    .slice(0, 30)
    .map(t => ({
      slug: t.symbol?.toLowerCase(),
      address: t.token?.toLowerCase(),
    }))
    .filter(t => t.slug && t.address) as { slug: string; address: string }[]

  for (const { slug, address } of topTokens) {
    const cached = cache.get(address)
    if (cached && !force && now - cached.timestamp < CACHE_TTL) {
      results.push(cached.data)
      continue
    }

    let tokenData: TokenResult = {
      token: slug.toUpperCase(),
      address,
      mindshare: null,
      mentions: null,
      smartEngagements: null,
      updated: null,
    }

    try {
      const [mind, mentions, smart] = await Promise.all([
        fetchMindshare(slug),
        fetchMetric(slug, 'Mentions'),
        fetchMetric(slug, 'SmartEngagements'),
      ])
      tokenData.mindshare = mind.value
      tokenData.mentions = mentions.value
      tokenData.smartEngagements = smart.value
      tokenData.updated = mind.date || new Date().toISOString()
    } catch (err: any) {
      tokenData.error = err.message || 'API error'
    }

    cache.set(address, { data: tokenData, timestamp: now })
    results.push(tokenData)
  }

  return NextResponse.json({ data: results })
}


"use server"

import { getFromCache, setInCache, CACHE_KEYS } from "@/lib/redis"

export interface ResearchScore {
  project: string
  score: number | null
}

const SHEET_ID = "1Nra5QH-JFAsDaTYSyu-KocjbkZ0MATzJ4R-rUt-gLe0"
const RANGE = "Dashcoin Scoring!A1:K"
const CACHE_TTL = 60 * 1000

export async function fetchResearchScores(): Promise<ResearchScore[]> {
  const cacheKey = CACHE_KEYS.RESEARCH_SCORES
  const cached = await getFromCache<ResearchScore[]>(cacheKey)
  if (cached && cached.length) {
    return cached
  }

  const API_KEY = process.env.GOOGLE_API_KEY
  if (!API_KEY) {
    console.error("GOOGLE_API_KEY is not set")
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (!data.values || data.values.length < 2) {
      console.warn("No data found in Google Sheet")
      await setInCache(cacheKey, [], CACHE_TTL)
      return []
    }

    const [header, ...rows] = data.values as string[][]
    const scores: ResearchScore[] = rows.map((row) => {
      const entry: Record<string, any> = {}
      header.forEach((key, i) => {
        entry[key.trim()] = row[i] || ""
      })
      return {
        project: (entry["Project"] || "").toString(),
        score:
          entry["Score"] !== undefined && entry["Score"] !== ""
            ? parseFloat(entry["Score"])
            : null,
      }
    })

    await setInCache(cacheKey, scores, CACHE_TTL)
    return scores
  } catch (err) {
    console.error("Google Sheets API error:", err)
    if (cached) return cached
    return []
  }
}

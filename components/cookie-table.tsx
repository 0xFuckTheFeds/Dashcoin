"use client"

import { useEffect, useState } from 'react'
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from '@/components/ui/dashcoin-card'

interface TokenRow {
  token: string
  mindshare: number | null
  mentions: number | null
  smartEngagements: number | null
  updated: string | null
  error?: string
}

export function CookieTable() {
  const [data, setData] = useState<TokenRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async (force = false) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/cookie-data${force ? '?refresh=1' : ''}`)
      const json = await res.json()
      setData(json.data || [])
    } catch (err) {
      console.error('Failed to load cookie data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const id = setInterval(() => loadData(), 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isStale = (iso: string | null) => {
    if (!iso) return false
    return Date.now() - new Date(iso).getTime() > 2 * 60 * 60 * 1000
  }

  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle>Cookie.fun Metrics</DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="mb-4">
          <button onClick={() => loadData(true)} className="px-3 py-1 bg-dashGreen text-white rounded-md text-sm">Refresh Now</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dashBlue-dark border-b border-dashBlack">
                <th className="text-left py-2 px-4 text-dashYellow">Token</th>
                <th className="text-left py-2 px-4 text-dashYellow">Mindshare</th>
                <th className="text-left py-2 px-4 text-dashYellow">Mentions</th>
                <th className="text-left py-2 px-4 text-dashYellow">SmartEngagements</th>
                <th className="text-left py-2 px-4 text-dashYellow">Last Updated</th>
                <th className="text-left py-2 px-4 text-dashYellow">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center">Loading...</td>
                </tr>
              ) : data.length > 0 ? (
                data.map(row => (
                  <tr key={row.token} className="border-b border-dashBlue-light">
                    <td className="py-2 px-4 font-semibold">{row.token}</td>
                    <td className="py-2 px-4">{row.mindshare ?? '—'}</td>
                    <td className="py-2 px-4">{row.mentions ?? '—'}</td>
                    <td className="py-2 px-4">{row.smartEngagements ?? '—'}</td>
                    <td className="py-2 px-4">{formatTime(row.updated)}</td>
                    <td className="py-2 px-4">
                      {row.error ? (
                        <span title={row.error}>❌ API error</span>
                      ) : isStale(row.updated) ? (
                        <span title="Stale data">⚠️</span>
                      ) : (
                        '✅ OK'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  )
}


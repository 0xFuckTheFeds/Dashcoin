"use client"

import { useEffect, useRef } from "react"
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card"
import type { TokenMarketCapData } from "@/types/dune"
import { formatCurrency } from "@/lib/utils"

export const palette = [
  "#4E79A7", // blue
  "#F28E2B", // orange
  "#E15759", // red
  "#76B7B2", // teal
  "#59A14F", // green
  "#EDC948", // yellow
  "#AF7AA1", // purple
  "#FF9DA7", // pink
  "#9C755F", // brown
  "#BAB0AC", // gray
]

interface MarketCapPieProps {
  data: TokenMarketCapData[]
}

export function MarketCapPie({ data }: MarketCapPieProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const hasData = data && data.length > 0

  useEffect(() => {
    if (!hasData) return

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/chart.js"
    script.async = true
    script.onload = () => {
      if (chartRef.current) {
        createChart()
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [hasData])

  useEffect(() => {
    if (hasData && window.Chart && chartRef.current) {
      createChart()
    }
  }, [data, hasData])

  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current?.getContext("2d")
    if (!ctx || !data || data.length === 0) return

    const topTokens = [...data]
      .filter((token) => token && token.market_cap_usd !== undefined)
      .sort((a, b) => (b.market_cap_usd || 0) - (a.market_cap_usd || 0))
      .slice(0, 10)

    if (topTokens.length === 0) return

    const dashYellowLight = "#A0A0B0"

    const colors = palette

    const chartData = {
      labels: topTokens.map((item) => item.symbol || "Unknown"),
      datasets: [
        {
          data: topTokens.map((item) => item.market_cap_usd || 0),
          backgroundColor: colors.slice(0, topTokens.length),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }

    chartInstance.current = new window.Chart(ctx, {
      type: "pie",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 16,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: dashYellowLight,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || ""
                const value = context.raw
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(2)
                return `${label}: ${formatCurrency(value)} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }

  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle>Market Cap Distribution</DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        {hasData ? (
          <div className="min-h-[300px] p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <canvas ref={chartRef} />
          </div>
        ) : (
          <div className="min-h-[300px] flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <p>No market cap data available.</p>
          </div>
        )}
      </DashcoinCardContent>
    </DashcoinCard>
  )
}

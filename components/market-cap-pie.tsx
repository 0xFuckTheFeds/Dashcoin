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

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/chart.js"
    script.async = true
    script.onload = () => {
      if (chartRef.current && data.length > 0) {
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
  }, [])

  useEffect(() => {
    if (window.Chart && chartRef.current && data.length > 0) {
      createChart()
    }
  }, [data])

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
          borderColor: "#2A2A35",
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
        plugins: {
          title: {
            display: true,
            text: `Top ${topTokens.length} Tokens by Market Cap`,
            color: dashYellowLight,
          },
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
        {(!data || data.length === 0) && (
          <p className="text-center py-12">No market cap data available.</p>
        )}
        <div className="min-h-[300px] h-64 bg-white dark:bg-neutral-900 rounded-lg mt-4">
          <canvas ref={chartRef} className="w-full h-full" />
        </div>
      </DashcoinCardContent>
    </DashcoinCard>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card"
import type { MarketCapTimeData } from "@/types/dune"
import { formatCurrency, getCssVariable, hexToRgba } from "@/lib/utils"
import { DuneQueryLink } from "@/components/dune-query-link"

declare global {
  interface Window {
    Chart: any
  }
}

interface MarketCapChartProps {
  data: MarketCapTimeData[]
}

export function MarketCapChart({ data }: MarketCapChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current?.getContext("2d")
    if (!ctx || !data || data.length === 0) return

    const sortedData = [...data].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateA - dateB
    })

    const dashYellow = getCssVariable("--dashYellow") || "#ffd700"
    const dashYellowLight = getCssVariable("--dashYellow-light") || "#fff0a0"
    const dashGreen = getCssVariable("--dashGreen-accent") || "#66cc33"

    const chartData = {
      labels: sortedData.map((item) => (item.date ? new Date(item.date).toLocaleDateString() : "Unknown")),
      datasets: [
        {
          label: "Market Cap (USD)",
          data: sortedData.map((item) => item.marketcap || 0),
          borderColor: dashYellow,
          backgroundColor: hexToRgba(dashYellow, 0.1),
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Holders",
          data: sortedData.map((item) => item.num_holders || 0),
          borderColor: dashGreen,
          backgroundColor: hexToRgba(dashGreen, 0.1),
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    }

    chartInstance.current = new window.Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: "rgba(42, 47, 14, 0.3)",
            },
            ticks: {
              color: dashYellowLight,
            },
          },
          y: {
            grid: {
              color: "rgba(42, 47, 14, 0.3)",
            },
            ticks: {
              color: dashYellowLight,
              callback: (value: number) => formatCurrency(value),
            },
          },
          y1: {
            position: "right",
            grid: {
              display: false,
            },
            ticks: {
              color: dashGreen,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: dashYellowLight,
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || ""
                const value = context.raw
                if (label === "Market Cap (USD)") {
                  return `${label}: ${formatCurrency(value)}`
                }
                return `${label}: ${value.toLocaleString()}`
              },
            },
          },
        },
      },
    })
  }

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

  return (
    <DashcoinCard>
      <DashcoinCardHeader>
        <DashcoinCardTitle>Market Cap & Holders Over Time</DashcoinCardTitle>
      </DashcoinCardHeader>
      <DashcoinCardContent>
        <div className="h-80">
          <canvas ref={chartRef} />
        </div>
        <DuneQueryLink queryId={5119241} className="mt-2" />
      </DashcoinCardContent>
    </DashcoinCard>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { DashcoinCard, DashcoinCardHeader, DashcoinCardTitle, DashcoinCardContent } from "@/components/ui/dashcoin-card"
import type { MarketCapTimeData } from "@/types/dune"
import { formatCurrency } from "@/lib/utils"
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

    const chartData = {
      labels: sortedData.map((item) => (item.date ? new Date(item.date).toLocaleDateString() : "Unknown")),
      datasets: [
        {
          label: "Market Cap (USD)",
          data: sortedData.map((item) => item.marketcap || 0),
          borderColor: "#f5f5f5",
          backgroundColor: "rgba(245, 245, 245, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Holders",
          data: sortedData.map((item) => item.num_holders || 0),
          borderColor: "#656565",
          backgroundColor: "rgba(101, 101, 101, 0.1)",
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
              color: "rgba(43, 43, 43, 0.3)",
            },
            ticks: {
              color: "#fafafa",
            },
          },
          y: {
            grid: {
              color: "rgba(43, 43, 43, 0.3)",
            },
            ticks: {
              color: "#fafafa",
              callback: (value: number) => formatCurrency(value),
            },
          },
          y1: {
            position: "right",
            grid: {
              display: false,
            },
            ticks: {
              color: "#656565",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#fafafa",
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

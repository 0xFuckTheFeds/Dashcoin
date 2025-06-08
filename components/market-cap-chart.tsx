"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import type { MarketCapTimeData } from "@/types/dune"
import { formatCurrency, hexToRgba } from "@/lib/utils"

declare global {
  interface Window {
    Chart: any
  }
}

interface MarketCapChartProps {
  data: MarketCapTimeData[]
}

export const MarketCapChart = forwardRef<HTMLCanvasElement, MarketCapChartProps>(
  ({ data }, ref) => {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<any>(null)

    useImperativeHandle(ref, () => chartRef.current as HTMLCanvasElement)

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

    const dashYellow = "#50E3C2"
    const dashYellowLight = "#A0A0B0"
    const dashGreen = "#6A8DFF"
    const gridColor = "#334155"

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
              color: gridColor,
            },
            ticks: {
              color: dashYellowLight,
            },
          },
          y: {
            grid: {
              color: gridColor,
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
            position: "bottom",
            labels: {
              color: dashYellowLight,
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleColor: "#f1f5f9",
            bodyColor: "#f1f5f9",
            borderColor: "#475569",
            borderWidth: 1,
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
    <div className="relative h-72 w-full">
      <canvas ref={chartRef} className="!w-full !h-full" />
    </div>
  )
})

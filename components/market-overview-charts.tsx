'use client'
import { useRef } from 'react'
import { TrendingUp, PieChart, Download, Info, Clock, Target } from 'lucide-react'
import { MarketCapChart } from './market-cap-chart'
import { MarketCapPie } from './market-cap-pie'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function MarketCapTrendCard({ data }: { data: any[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  const handleDownload = () => {
    if (!chartRef.current) return
    const link = document.createElement('a')
    link.href = chartRef.current.toDataURL('image/png')
    link.download = 'market-cap-trend.png'
    link.click()
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Market Cap Trend</h3>
            <p className="text-sm text-slate-400">Last 30 days performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Shows overall market cap and holders over time.</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Real-time</span>
          </div>
          <Download onClick={handleDownload} className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-200" />
        </div>
      </div>
      <MarketCapChart ref={chartRef} data={data} />
    </div>
  )
}

export function MarketCapDistributionCard({ data }: { data: any[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  const handleDownload = () => {
    if (!chartRef.current) return
    const link = document.createElement('a')
    link.href = chartRef.current.toDataURL('image/png')
    link.download = 'market-distribution.png'
    link.click()
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Market Distribution</h3>
            <p className="text-sm text-slate-400">Top tokens by market cap</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>Breakdown of market cap across leading tokens.</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Target className="w-4 h-4" />
            <span>Live data</span>
          </div>
          <Download onClick={handleDownload} className="w-4 h-4 cursor-pointer text-slate-400 hover:text-slate-200" />
        </div>
      </div>
      <MarketCapPie ref={chartRef} data={data} />
    </div>
  )
}

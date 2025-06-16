import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatCurrency0 = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  } else {
    return value.toFixed(2)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0
  return ((currentValue - previousValue) / previousValue) * 100
}

/**
 * Format a date string to a locale date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) {
    return `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 30) {
    return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`
  }

  const monthsAgo = Math.floor(daysAgo / 30)
  if (monthsAgo < 12) {
    return `${monthsAgo} month${monthsAgo === 1 ? '' : 's'} ago`
  }

  const yearsAgo = Math.floor(monthsAgo / 12)
  return `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`
}

export function getCssVariable(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function linkify(text: string): string {
  if (!text) return ''
  const formula = /=HYPERLINK\("(https?:\/\/[^\"]+)"\s*,\s*"([^)]+)"\)/gi
  const markdownLink = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  const url = /(https?:\/\/[^\s]+)/g
  return text
    .replace(formula, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(markdownLink, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(url, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br />')
}

interface RichCell {
  formattedValue?: string
  hyperlink?: string
  textFormatRuns?: {
    startIndex?: number
    format?: {
      link?: {
        uri?: string
      }
    }
  }[]
}

export function richTextToHtml(cell: RichCell | undefined): string {
  const text = cell?.formattedValue || ''
  if (!cell) return linkify(text)
  if (cell.hyperlink && (!cell.textFormatRuns || cell.textFormatRuns.length === 0)) {
    return `<a href="${cell.hyperlink}" target="_blank" rel="noopener noreferrer">${text}</a>`
  }
  const runs = cell.textFormatRuns
  if (!runs || runs.length === 0) {
    return linkify(text)
  }
  let result = ''
  let idx = 0
  for (let i = 0; i < runs.length; i++) {
    const start = runs[i].startIndex ?? 0
    if (idx < start) {
      result += linkify(text.slice(idx, start))
    }
    const end = i + 1 < runs.length ? runs[i + 1].startIndex ?? text.length : text.length
    const segment = text.slice(start, end)
    const uri = runs[i].format?.link?.uri
    if (uri) {
      result += `<a href="${uri}" target="_blank" rel="noopener noreferrer">${segment}</a>`
    } else {
      result += linkify(segment)
    }
    idx = end
  }
  if (idx < text.length) {
    result += linkify(text.slice(idx))
  }
  return result.replace(/\n/g, '<br />')
}

export function extractHyperlink(cell: RichCell | undefined): string {
  if (!cell) return ''
  if (cell.hyperlink) return cell.hyperlink
  if (cell.textFormatRuns) {
    for (const run of cell.textFormatRuns) {
      const uri = run.format?.link?.uri
      if (uri) return uri
    }
  }
  const text = cell.formattedValue || ''
  const m = text.match(/https?:\/\/\S+/)
  return m ? m[0] : ''
}
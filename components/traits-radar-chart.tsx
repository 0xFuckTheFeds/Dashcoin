import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { canonicalChecklist } from '@/components/founders-edge-checklist'
import { gradeMaps, valueToScore } from '@/lib/score'

export function TraitsRadarChart({ token }: { token: Record<string, any> }) {
  const data = canonicalChecklist.map(label => {
    const raw = (token as any)[label]
    const score = valueToScore(raw, (gradeMaps as any)[label] || gradeMaps.default)
    const val = score === 2 ? 3 : score === 1 ? 1 : 2
    return { trait: label, value: val }
  })

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid stroke="#d1d5db" />
          <PolarAngleAxis dataKey="trait" tick={{ fill: '#111111', fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 3]} tick={false} />
          <Radar dataKey="value" stroke="#00C851" fill="#00C851" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

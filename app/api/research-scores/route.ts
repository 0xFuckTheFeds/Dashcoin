import { NextResponse } from 'next/server'
import { fetchResearchScores } from '@/app/actions/research-scores'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const scores = await fetchResearchScores()
    return NextResponse.json(scores)
  } catch (err) {
    console.error('Error fetching research scores:', err)
    return NextResponse.json([], { status: 200 })
  }
}

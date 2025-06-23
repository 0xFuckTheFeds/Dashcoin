import { NextResponse } from 'next/server'
import {
  fetchAllTokensFromDune,
  fetchPaginatedTokens,
} from '@/app/actions/dune-actions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 0

    if (limit > 0) {
      const { tokens } = await fetchPaginatedTokens(1, limit)
      return NextResponse.json(tokens)
    }

    const tokens = await fetchAllTokensFromDune()
    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch tokens' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
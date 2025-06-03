import { NextResponse } from 'next/server';
import { fetchDefaultTokens } from '@/app/actions/dexscreener-actions';

export async function GET() {
  try {
    const tokens = await fetchDefaultTokens();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch tokens' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
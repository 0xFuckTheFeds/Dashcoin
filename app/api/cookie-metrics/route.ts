import { NextResponse } from 'next/server';
import { batchFetchCookieMetrics } from '@/app/actions/cookie-fun-actions';

export async function POST(req: Request) {
  try {
    const { symbols } = await req.json();
    if (!Array.isArray(symbols)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const data = await batchFetchCookieMetrics(symbols);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching cookie metrics:', err);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch metrics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

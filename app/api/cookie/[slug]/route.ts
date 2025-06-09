import { NextResponse } from 'next/server';
import { fetchCookieMetrics } from '@/app/actions/cookie-actions';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const data = await fetchCookieMetrics(params.slug);
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching cookie metrics:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

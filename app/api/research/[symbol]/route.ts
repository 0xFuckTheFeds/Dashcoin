import { NextResponse } from 'next/server';
import { fetchTokenResearch } from '@/app/actions/googlesheet-action';

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const all = await fetchTokenResearch();
    const symbol = params.symbol.toUpperCase();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || undefined;
    const matches = all.filter(r => r.symbol.toUpperCase() === symbol);
    if (matches.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    let entry = matches[0];
    if (name && matches.length > 1) {
      const lower = name.toLowerCase();
      const found = matches.find(m => (m.project || '').toLowerCase() === lower);
      if (found) entry = found;
    }
    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (err) {
    console.error('Error fetching research:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

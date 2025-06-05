import { NextResponse } from 'next/server';
import { fetchTokenResearch } from '@/app/actions/googlesheet-action';

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const all = await fetchTokenResearch();
    const symbol = params.symbol.toUpperCase();
    const url = new URL(req.url);
    const ca = url.searchParams.get('ca');
    const matches = all.filter(r => r.symbol.toUpperCase() === symbol);
    let entry = matches[0];
    if (matches.length > 1 && ca) {
      const byCa = matches.find(r => r.ca && r.ca.toLowerCase() === ca.toLowerCase());
      if (byCa) entry = byCa;
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

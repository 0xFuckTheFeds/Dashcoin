import { NextResponse } from 'next/server';
import { fetchTokenResearch } from '@/app/actions/googlesheet-action';

export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const all = await fetchTokenResearch();
    const symbol = params.symbol.toUpperCase();
    const entry = all.find(r => r.symbol.toUpperCase() === symbol);
    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (err) {
    console.error('Error fetching research:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

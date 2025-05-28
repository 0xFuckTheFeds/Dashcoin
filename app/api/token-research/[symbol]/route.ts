import { NextResponse } from 'next/server';
import { fetchTokenResearchBySymbol } from '@/app/actions/googlesheet-action';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const data = await fetchTokenResearchBySymbol(params.symbol);
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token research:', error);
    return NextResponse.json({ error: 'Failed to fetch token research' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { fetchTokenResearch } from '@/app/actions/googlesheet-action';

export async function GET() {
  try {
    const data = await fetchTokenResearch();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching token research:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch token research' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

import { NextResponse } from 'next/server';
import { fetchTokenResearch } from '@/app/actions/googlesheet-action';

export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchTokenResearch();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching projects:', err);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

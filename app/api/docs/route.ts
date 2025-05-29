import { NextResponse } from 'next/server';
import { getDocumentsList } from '@/lib/google-docs';

export async function GET() {
  try {
    const docs = await getDocumentsList();
    return NextResponse.json(docs);
  } catch (err) {
    console.error('Error fetching docs list:', err);
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
  }
}

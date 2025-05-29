import { NextResponse, NextRequest } from 'next/server';
import { getDocumentHtml } from '@/lib/google-docs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { html, title } = await getDocumentHtml(params.id);
    return NextResponse.json({ id: params.id, title, html });
  } catch (err) {
    console.error('Error fetching doc:', err);
    return NextResponse.json({ error: 'Failed to fetch doc' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { fetchPaginatedTokens } from '@/app/actions/dune-actions';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortField = searchParams.get('sortField') || 'marketCap';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const searchTerm = searchParams.get('searchTerm') || '';

    const data = await fetchPaginatedTokens(page, pageSize, sortField, sortDirection, searchTerm);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching paginated tokens:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch paginated tokens' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

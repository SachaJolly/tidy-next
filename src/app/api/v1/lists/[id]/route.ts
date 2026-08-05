import { NextResponse } from 'next/server';

import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const list = await api.auth.get<List>(`/api/v1/lists/${id}`, {
      cache: 'no-store',
    });

    if (!list) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(list);
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    throw error;
  }
}

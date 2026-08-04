import { NextResponse } from 'next/server';
import { api, ApiFetchError } from '@/lib/api';
import { User } from '@/lib/types';

export async function GET() {
  try {
    const user = await api.auth.get<User>('/api/v1/me', {
      cache: 'no-store',
    });

    return NextResponse.json({ authenticated: !!user });
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401) {
      return NextResponse.json({ authenticated: false });
    }

    throw error;
  }
}

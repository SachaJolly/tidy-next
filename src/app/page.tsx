import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api, ApiFetchError } from '@/lib/api';
import { User } from '@/lib/types';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tidy_token')?.value;

  if (!token) {
    redirect('/discover');
  }

  try {
    const user = await api.auth.get<User>('/api/v1/me', {
      authorization: token,
      cache: 'no-store',
    });

    if (user) {
      redirect('/dashboard');
    }
  } catch (error) {
    if (!(error instanceof ApiFetchError && error.status === 401)) {
      throw error;
    }
  }

  redirect('/discover');
}

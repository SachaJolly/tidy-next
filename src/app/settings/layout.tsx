import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { api, ApiFetchError } from '@/lib/api';
import type { User } from '@/lib/types';
import SettingsLayout from '@/layouts/SettingsLayout';

interface SettingsRouteLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsRouteLayout({ children }: SettingsRouteLayoutProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

  if (!authToken) {
    redirect('/signin?callbackUrl=/settings/profile');
  }

  try {
    const me = await api.auth.get<User>('/api/v1/me', {
      authorization: authToken,
      cache: 'no-store',
    });

    if (!me) {
      redirect('/signin?callbackUrl=/settings/profile');
    }
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401) {
      redirect('/signin?callbackUrl=/settings/profile');
    }

    throw error;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}

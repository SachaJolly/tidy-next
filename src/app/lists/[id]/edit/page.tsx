import { notFound, redirect } from 'next/navigation';

import EditListModal from '@/components/modals/EditListModal';
import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const list = await api.auth.get<List>(`/api/v1/lists/${id}`, {
      cache: 'no-store',
    });

    if (!list) {
      redirect('/signin');
    }

    return <EditListModal forceOpen initialList={list} />;
  } catch (error) {
    if (error instanceof ApiFetchError && (error.status === 404 || error.status === 403)) {
      notFound();
    }

    if (error instanceof ApiFetchError && error.status === 401) {
      redirect('/signin');
    }

    throw error;
  }
}

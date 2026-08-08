import { notFound, redirect } from 'next/navigation';

import EditListModal from '@/components/modals/EditListModal';
import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Route counterpart of the `?modal=edit-list` param, so `/lists/:id/edit` is a real address.
 *
 * Unlike the query-param path, the list is fetched here on the server and handed to the
 * modal as `initialList`. That skips the client-side fetch the modal falls back to, so a
 * cold load paints the populated form instead of its loading state.
 */
export default async function EditListPage({ params }: PageProps) {
  const { id } = await params;

  try {
    // Always authenticated: editing is owner-only, and `no-store` avoids showing a stale
    // title or visibility in a form that is about to overwrite them.
    const list = await api.auth.get<List>(`/api/v1/lists/${id}`, {
      cache: 'no-store',
    });

    if (!list) {
      redirect('/signin');
    }

    return <EditListModal forceOpen initialList={list} />;
  } catch (error) {
    // 403 is folded into 404 on purpose: answering "forbidden" would confirm that a private
    // list exists at this id. A visitor who may not edit it should not learn it is there.
    if (error instanceof ApiFetchError && (error.status === 404 || error.status === 403)) {
      notFound();
    }

    // 401 is different — the list may well be theirs, they just have no valid session.
    if (error instanceof ApiFetchError && error.status === 401) {
      redirect('/signin');
    }

    throw error;
  }
}

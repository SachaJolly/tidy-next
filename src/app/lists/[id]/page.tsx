import React, { Suspense, use, cache } from 'react';
import { notFound as nextNotFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import { api, ApiFetchError } from '@/lib/api';
import type { List, User } from '@/lib/types';
import { TIMEZONE_COOKIE_NAME, parseTimezone } from '@/lib/timezone-mapper';

import ListLayout from '@/layouts/ListLayout';
import ListHeader from '@/components/ListHeader/ListHeader';
import { ListHeaderSkeleton } from '@/components/ListHeader/ListHeader.skeleton';
import { ListItemsSkeleton } from '@/components/Item/ListItems.skeleton';
import { Item } from '@/components/Item/Item';

import styles from '@/layouts/ListLayout/ListLayout.module.scss';
import { ListProvider } from './ListProvider';
import ItemModals from './_items/ItemModals';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('tidy_token')?.value ?? null;
    const list = await getListById(id, authToken);
    return { title: list?.title ?? 'List not found' };
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 404) {
      return { title: 'List not found' };
    }
    throw error;
  }
}

// ============================================================================
// Data Fetching
// ============================================================================

const getListById = cache(async (id: string, authToken: string | null) => {
  try {
    return authToken
      ? await api.auth.get<List>(`/api/v1/lists/${id}`, {
          authorization: authToken,
          cache: 'no-store',
        })
      : await api.get<List>(`/api/v1/lists/${id}`, { cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401 && authToken) {
      return api.get<List>(`/api/v1/lists/${id}`, { cache: 'no-store' });
    }

    throw error;
  }
});

const getListPageData = cache(async (id: string) => {
  const locale = await getLocale();
  const t = await getTranslations('listPage');
  const common = await getTranslations('common');
  const date = await getTranslations('date');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;
  const timezone = parseTimezone(cookieStore.get(TIMEZONE_COOKIE_NAME)?.value);

  let currentUser: User | null = null;
  if (authToken) {
    try {
      currentUser = await api.auth.get<User>('/api/v1/me', {
        authorization: authToken,
        cache: 'no-store',
      });
    } catch (error) {
      if (!(error instanceof ApiFetchError && error.status === 401)) {
        throw error;
      }
    }
  }

  let list: List | null = null;
  try {
    list = await getListById(id, authToken);
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 404) {
      nextNotFound();
    }

    throw error;
  }

  if (!list) {
    nextNotFound();
  }

  const canAccessList = list.visibility !== 'PRIVATE' || currentUser?.id === list.author?.id;
  if (!canAccessList) {
    nextNotFound();
  }

  const isAuthor = currentUser?.id === list.author?.id;

  return { list, currentUser, locale, timezone, t, common, date, isAuthor };
});

// ============================================================================
// Presentational Components
// ============================================================================

async function ListHeaderContainer({ id }: { id: string }) {
  const { list, locale, isAuthor } = await getListPageData(id);

  return (
    <ListHeader
      // The header never reads the items, and everything handed to a client component is
      // serialised into the RSC payload — so the array is left out rather than shipped twice.
      list={{ ...list, items: undefined }}
      author={list.author}
      locale={locale}
      isAuthor={isAuthor}
    />
  );
}

async function ListTopCover({ id }: { id: string }) {
  const { list } = await getListPageData(id);

  const coverStyle = {
    '--list-cover-color': list.color,
    '--list-cover-height': '256px',
    '--list-cover-gradient-height': '160px',
  } as React.CSSProperties;

  return <div className={styles['page-cover']} style={coverStyle} aria-hidden="true" />;
}

/**
 * Items and their modals share one boundary: both need the same list and the same
 * permission, so the page resolves them once and exposes them through ListProvider instead
 * of threading `listId` / `canManage` / `items` through every component underneath.
 */
async function ListBody({ id }: { id: string }) {
  const { list, common, isAuthor } = await getListPageData(id);
  const items = list.items ?? [];

  return (
    <ListProvider list={list} canManage={isAuthor}>
      <section className={styles['items-section']}>
        {items.length > 0 ? (
          <div className={styles['items-grid']}>
            {items.map((item) => (
              <Item item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <div className={styles['empty-state']}>
            <p>{common('noItemsYet')}</p>
          </div>
        )}
      </section>
      <ItemModals />
    </ListProvider>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function ListPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ListLayout
      cover={
        <Suspense fallback={null}>
          <ListTopCover id={id} />
        </Suspense>
      }
    >
      <Suspense fallback={<ListHeaderSkeleton />}>
        <ListHeaderContainer id={id} />
      </Suspense>
      <Suspense fallback={<ListItemsSkeleton />}>
        <ListBody id={id} />
      </Suspense>
    </ListLayout>
  );
}

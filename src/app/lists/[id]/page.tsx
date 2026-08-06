import React, { Suspense, use, cache } from 'react';
import { notFound as nextNotFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import { api, ApiFetchError } from '@/lib/api';
import type { List, Item as ItemType, User } from '@/lib/types';
import { TIMEZONE_COOKIE_NAME, parseTimezone } from '@/lib/timezone-mapper';

import ListLayout from '@/layouts/ListLayout';
import ListHeader from '@/components/ListHeader/ListHeader';
import { ListHeaderSkeleton } from '@/components/ListHeader/ListHeaderSkeleton';
import { Item } from '@/components/Item/Item';
import { ListItemsSkeleton } from '@/components/LoadingSkeletons';

import styles from '@/layouts/ListLayout/ListLayout.module.scss';
import EditItemModal from './EditItemModal';
import NewItemModal from './NewItemModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const list = await api.get<List>(`/api/v1/lists/${id}`);
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
    list = authToken
      ? await api.auth.get<List>(`/api/v1/lists/${id}`, {
          authorization: authToken,
          cache: 'no-store',
        })
      : await api.get<List>(`/api/v1/lists/${id}`, { cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401 && authToken) {
      try {
        list = await api.get<List>(`/api/v1/lists/${id}`, { cache: 'no-store' });
      } catch (fallbackError) {
        if (fallbackError instanceof ApiFetchError && fallbackError.status === 404) {
          nextNotFound();
        }
        throw fallbackError;
      }
    } else if (error instanceof ApiFetchError && error.status === 404) {
      nextNotFound();
    } else {
      throw error;
    }
  }

  if (!list) {
    nextNotFound();
  }

  const canAccessList = list.visibility !== 'PRIVATE' || currentUser?.id === list.author?.id;
  if (!canAccessList) {
    nextNotFound();
  }

  return { list, currentUser, locale, timezone, t, common, date };
});

// ============================================================================
// Presentational Components
// ============================================================================

async function ListHeaderContainer({ id }: { id: string }) {
  const { list, currentUser, locale, timezone } = await getListPageData(id);
  const author = list.author!;
  const isAuthor = currentUser?.id === author.id;

  return (
    <ListHeader
      list={list}
      author={author}
      locale={locale}
      timezone={timezone}
      isAuthor={isAuthor}
    />
  );
}

async function ListItems({ id }: { id: string }) {
  const { list, currentUser, common } = await getListPageData(id);
  const items = list.items || [];
  const isAuthor = currentUser?.id === list.author?.id;

  return (
    <section className={styles.itemsSection}>
      {items.length > 0 ? (
        <div className={styles.itemsGrid}>
          {items.map((item: ItemType) => (
            <Item item={item} key={item.id} listId={id} canManage={isAuthor} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{common('noItemsYet')}</p>
        </div>
      )}
    </section>
  );
}

async function ListModals({ id }: { id: string }) {
  const { list, currentUser } = await getListPageData(id);
  const isAuthor = currentUser?.id === list.author?.id;

  if (!isAuthor) {
    return null;
  }

  return (
    <>
      <NewItemModal listId={id} />
      <EditItemModal listId={id} items={list.items || []} />
    </>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function ListPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ListLayout>
      <Suspense fallback={<ListHeaderSkeleton />}>
        <ListHeaderContainer id={id} />
      </Suspense>
      <Suspense fallback={<ListItemsSkeleton />}>
        <ListItems id={id} />
      </Suspense>
      <Suspense fallback={null}>
        <ListModals id={id} />
      </Suspense>
    </ListLayout>
  );
}

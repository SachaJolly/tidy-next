import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import { api, ApiFetchError } from '@/lib/api';
import { List, Item as ItemType, User } from '@/lib/types';
import styles from '@/layouts/ListLayout/ListLayout.module.scss';
import Link from 'next/link';
import { Item } from '@/components/Item/Item';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import Meta from '@/components/Meta/Meta';
import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { Dropdown } from '@/components/Dropdown';
import { localizePath } from '@/lib/locale-path';
import { formatDate } from '@/lib/date';
import { TIMEZONE_COOKIE_NAME, parseTimezone } from '@/lib/timezone-mapper';
import ListOptionsDropdown from './ListOptionsDropdown';
import { ListHeaderSkeleton } from '@/components/ListHeader/ListHeader.skeleton';
import { ListItemsSkeleton } from '@/components/Item/ListItems.skeleton';

type ListPageData = {
  list: List;
  currentUser: User | null;
  locale: string;
  timezone: string | null;
  t: Awaited<ReturnType<typeof getTranslations>>;
  common: Awaited<ReturnType<typeof getTranslations>>;
  date: Awaited<ReturnType<typeof getTranslations>>;
};

const getListPageData = cache(async (id: string): Promise<ListPageData> => {
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
      // This fetch for the user is always dynamic and not cached.
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
    // CONDITIONAL CACHING:
    // - If the user is authenticated, fetch with 'no-store' to always get fresh data.
    // - If the user is a public visitor, use the default 'force-cache' for performance.
    list = authToken
      ? await api.auth.get<List>(`/api/v1/lists/${id}`, {
          authorization: authToken,
          cache: 'no-store',
        })
      : await api.get<List>(`/api/v1/lists/${id}`); // Default cache behavior
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401 && authToken) {
      try {
        // Fallback for authenticated users trying to view a public list they don't own
        list = await api.get<List>(`/api/v1/lists/${id}`);
      } catch (fallbackError) {
        if (fallbackError instanceof ApiFetchError && fallbackError.status === 404) {
          notFound();
        }
        throw fallbackError;
      }
    } else if (error instanceof ApiFetchError && error.status === 404) {
      notFound();
    } else {
      throw error;
    }
  }

  if (!list) {
    notFound();
  }

  const canAccessList = list.visibility !== 'PRIVATE' || currentUser?.id === list.author?.id;

  if (!canAccessList) {
    notFound();
  }

  return { list, currentUser, locale, timezone, t, common, date };
});

export async function ListHeaderSection({ id }: { id: string }) {
  const { list, currentUser, locale, timezone, t, common, date } = await getListPageData(id);
  const author = list.author!;
  const canCreateItem = !!currentUser;
  const isAuthor = currentUser?.id === author.id;

  return (
    <header className={styles['list-header']}>
      <div className={styles['list-header-title']}>
        <h1 className={styles.title}>{list.title}</h1>
        <MetaGroup>
          <Meta size="base">
            <Avatar
              initials={author.name.charAt(0)}
              src={author.avatar ?? undefined}
              size="24"
              alt={author.name}
            />
            <span>
              {common('curatedBy')}{' '}
              <Link className={styles.metaLink} href={localizePath(`/${author.username}`, locale)}>
                {author.name}
              </Link>
            </span>
          </Meta>
          <Meta size="base">
            {date('lastUpdated', {
              date: formatDate(list.updatedAt, locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: timezone,
              }),
            })}
          </Meta>
          <Meta size="base">{t('items', { count: list.itemsCount })}</Meta>
        </MetaGroup>
      </div>

      {list.description && (
        <p className={styles.description}>
          <span className={styles.statusBadge}>{list.visibility}</span>
          {list.description}
        </p>
      )}

      <div className={styles['list-header-actions']}>
        <div className={styles['list-header-buttons']}>
          {canCreateItem && (
            <Button icon="add" label={t('addItem')} variant="interactive" size="small" />
          )}
          <div className={styles['list-header-like']}>
            <Button icon="like" label={t('like')} size="small" tinted={true} />
            <span className="text-muted">
              {t('peopleLikedThisList', { count: list.notesCount })}
            </span>
          </div>
        </div>
        <ButtonGroup>
          <Button icon="share" label={t('share')} size="small" tinted={true} />
          <Button icon="favorite" aria-label={t('addToFavorites')} size="small" tinted={true} />
          <Dropdown>
            <Button icon="settings" aria-label={t('settings')} size="small" tinted={true} />
            <ListOptionsDropdown
              listId={list.id}
              isAuthor={isAuthor}
              initialVisibility={list.visibility}
              authorName={author.name}
              updatedAt={list.updatedAt}
            />
          </Dropdown>
        </ButtonGroup>
      </div>
    </header>
  );
}

export async function ListItemsSection({ id }: { id: string }) {
  const { list, common } = await getListPageData(id);
  const items = list.items || [];

  return (
    <section className={styles.itemsSection}>
      {items.length > 0 ? (
        <div className={styles.itemsGrid}>
          {items.map((item: ItemType) => (
            <Item item={item} key={item.id} />
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

export { getListPageData, ListHeaderSkeleton, ListItemsSkeleton };

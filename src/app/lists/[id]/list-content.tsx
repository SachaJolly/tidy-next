import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import { api, ApiFetchError } from '@/lib/api';
import { List, Item as ItemType, User } from '@/lib/types';
import styles from '@/app/layouts/list-layout.module.scss';
import Link from 'next/link';
import { Item } from '@/components/item/item';
import MetaGroup from '@/components/meta-group/meta-group';
import Meta from '@/components/meta/meta';
import Avatar from '@/components/avatar/avatar';
import Button from '@/components/button/button';
import ButtonGroup from '@/components/button-group/button-group';
import { Dropdown } from '@/components/dropdown';
import { localizePath } from '@/lib/locale-path';
import ListOptionsDropdown from '@/components/lists/list-options-dropdown';
import { ListHeaderSkeleton, ListItemsSkeleton } from '@/components/loading-skeletons';

type ListPageData = {
  list: List;
  currentUser: User | null;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
  common: Awaited<ReturnType<typeof getTranslations>>;
};

const getListPageData = cache(async (id: string): Promise<ListPageData> => {
  const locale = await getLocale();
  const t = await getTranslations('list-page');
  const common = await getTranslations('common');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

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

  return { list, currentUser, locale, t, common };
});

function formatUpdatedDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export async function ListHeaderSection({ id }: { id: string }) {
  const { list, currentUser, locale, t, common } = await getListPageData(id);
  const author = list.author!;
  const canCreateItem = !!currentUser;
  const isAuthor = currentUser?.id === author.id;

  return (
    <header className={styles['list-header']}>
      <div className={styles['list-header-title']}>
        <h1 className={styles.title}>{list.title}</h1>
        <MetaGroup>
          <Meta size="base">
            <Avatar initials={author.name.charAt(0)} size="24" alt={author.name} />
            <span>
              {common('curatedBy')}{' '}
              <Link className={styles.metaLink} href={localizePath(`/${author.username}`, locale)}>
                {author.name}
              </Link>
            </span>
          </Meta>
          <Meta size="base">
            {t('updated', { date: formatUpdatedDate(list.updatedAt, locale) })}
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
              listTitle={list.title}
              listDescription={list.description}
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

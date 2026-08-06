'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { localizePath } from '@/lib/locale-path';
import { formatDate } from '@/lib/date';

import MetaGroup from '@/components/MetaGroup/MetaGroup';
import Meta from '@/components/Meta/Meta';
import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { Dropdown } from '@/components/Dropdown';
import ListOptionsDropdown from '@/app/lists/[id]/ListOptionsDropdown';

import styles from '@/layouts/ListLayout/ListLayout.module.scss';
import type { List, User } from '@/lib/types';

interface ListHeaderProps {
  list: List;
  author: User;
  locale: string;
  timezone: string | null;
  isAuthor: boolean;
}

export default function ListHeader({
  list,
  author,
  locale,
  timezone,
  isAuthor,
}: ListHeaderProps) {
  const t = useTranslations('listPage');
  const common = useTranslations('common');
  const date = useTranslations('date');

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
                timeZone: timezone ?? undefined,
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
          {isAuthor && (
            <Button
              href={`/lists/${list.id}?modal=new-item&modalId=${list.id}`}
              icon="add"
              label={t('addItem')}
              variant="interactive"
              size="small"
              scroll={false}
            />
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
              canManage={isAuthor}
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

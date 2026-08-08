'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { localizePath } from '@/lib/locale-path';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useQueryModal } from '@/hooks/use-query-modal';

import MetaGroup from '@/components/MetaGroup/MetaGroup';
import Meta from '@/components/Meta/Meta';
import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { Dropdown } from '@/components/Dropdown';
import ListOptionsDropdown from '@/components/ListOptionsDropdown/ListOptionsDropdown';

import type { List, User } from '@/lib/types';
import styles from './ListHeader.module.scss';

interface ListHeaderProps {
  list: List;
  author: User;
  locale: string;
  isAuthor: boolean;
}

export default function ListHeader({list, author, locale, isAuthor }: ListHeaderProps) {
  const t = useTranslations('listPage');
  const common = useTranslations('common');
  const date = useTranslations('date');
  const formatDate = useDateFormatter();
  const queryModal = useQueryModal();

  const handleAddItem = () => {
    queryModal.openModal('new-item', list.id);
  };

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1>{list.title}</h1>
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
              <Link href={localizePath(`/${author.username}`, locale)}>
                {author.name}
              </Link>
            </span>
          </Meta>
          <Meta size="base" label={date('lastUpdated', { date: formatDate(list.updatedAt, 'short') })} />
          <Meta size="base" label={t('items', { count: list.itemsCount })} />
        </MetaGroup>
      </div>

      {list.description && (
        <p>
          <span>{list.visibility}</span>
          {list.description}
        </p>
      )}

      <div className={styles.actions}>
        <div className={styles.buttons}>
          {isAuthor && (
            <Button
              onClick={handleAddItem}
              icon="add"
              label={t('addItem')}
              variant="interactive"
              size="small"
            />
          )}
          <div className={styles['like-section']}>
            <Button icon="like" label={t('like')} size="small" tinted={true} />
            <span className="text-small text-muted text-truncated">
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

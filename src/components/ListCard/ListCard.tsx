'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown } from '@/components/Dropdown';
import { ButtonHover } from '@/components/ButtonHover';
import Meta from '@/components/Meta/Meta';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import ListOptionsDropdown from '@/components/ListOptionsDropdown/ListOptionsDropdown';
import styles from './ListCard.module.scss';
import { List } from '@/lib/types';

interface ListCardProps {
  list: List;
  bigger?: boolean;
  canManage?: boolean;
}

export default function ListCard({
  list,
  bigger = false,
  canManage = false,
  ...props
}: ListCardProps & React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('ListCard');
  const listPage = useTranslations('listPage');
  const listClasses = `${styles.container} ${bigger ? styles.bigger : ''}`;
  const coverColor = { backgroundColor: list.color };

  return (
    <div className={listClasses} {...props}>
      {/*
       * <a> comes first in DOM so natural tab order is: link → ButtonHover trigger.
       * .actions is position:absolute so DOM order has no visual effect.
       */}
      <a href={`/lists/${list.id}`} className={styles['content']}>
        <div className={styles['cover']} style={coverColor}>
          {list.thumbnail && (
            <picture>
              <source
                media="(max-width:617px)"
                srcSet={list.thumbnail}
              />
              <img
                alt={list.title}
                src={list.thumbnail}
              />
            </picture>
          )}
        </div>
        <div className={styles['infos']}>
          <h4 className={styles['title']}>{list.title}</h4>
          <MetaGroup>
            {list.isPinned && (
              <Meta type="pinned" icon="pin" label={t('pinned')} />
            )}

            {list.visibility === 'PRIVATE' && (
              <Meta type="visibility" icon="private" label={t('private')} />
            )}

            {list.visibility === 'UNINDEXED' && (
              <Meta type="visibility" icon="visibility_off" label={t('unindexed')} />
            )}

            {list.isTrending ? (
              <Meta type="trending" icon="hot" label={t('trending')} />
            ) : list.isPopular ? (
              <Meta type="popular" icon="recommended" label={t('popular')} />
            ) : (
              list.isFeatured && (
                <Meta type="featured" icon="featured" label={t('featured')} />
              )
            )}

            {list.itemsCount > 0 ? (
              <Meta label={t('item', { count: list.itemsCount })} />
            ) : (
              <Meta label={t('empty')} />
            )}

            {list.notesCount > 0 && <Meta>{t('note', { count: list.notesCount })}</Meta>}
          </MetaGroup>
        </div>
      </a>
      <div className={styles.actions}>
        <Dropdown>
          <ButtonHover aria-label={listPage('settings')} />
          <ListOptionsDropdown
            listId={list.id}
            canManage={canManage}
            initialVisibility={list.visibility}
            authorName={list.author.name}
            updatedAt={list.updatedAt}
          />
        </Dropdown>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/components/Icon/Icon';
import { Dropdown } from '@/components/Dropdown';
import { ButtonHover } from '@/components/ButtonHover';
import Meta from '@/components/Meta/Meta';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import ListOptionsDropdown from '@/app/lists/[id]/ListOptionsDropdown';
import styles from './ListCard.module.scss';
import { List } from '@/lib/types';

interface ListCardProps {
  list: List;
  bigger?: boolean;
  isAuthor?: boolean;
}

export default function ListCard({
  list,
  bigger = false,
  isAuthor = false,
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
              <Meta type="pinned">
                <Icon name="pin" size={16}></Icon>
                <span>{t('pinned')}</span>
              </Meta>
            )}

            {list.visibility === 'PRIVATE' && (
              <Meta type="visibility">
                <Icon name="private" size={16}></Icon>
                <span>{t('private')}</span>
              </Meta>
            )}

            {list.visibility === 'UNINDEXED' && (
              <Meta type="visibility">
                <Icon name="visibility_off" size={16}></Icon>
                <span>{t('unindexed')}</span>
              </Meta>
            )}

            {list.isTrending ? (
              <Meta type="trending">
                <Icon name="hot" size={16}></Icon>
                <span>{t('trending')}</span>
              </Meta>
            ) : list.isPopular ? (
              <Meta type="popular">
                <Icon name="recommended" size={16}></Icon>
                <span>{t('popular')}</span>
              </Meta>
            ) : (
              list.isFeatured && (
                <Meta type="featured">
                  <Icon name="featured" size={16}></Icon>
                  <span>{t('featured')}</span>
                </Meta>
              )
            )}

            {list.itemsCount > 0 ? (
              <Meta>{t('item', { count: list.itemsCount })}</Meta>
            ) : (
              <Meta>{t('empty')}</Meta>
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
            isAuthor={isAuthor}
            initialVisibility={list.visibility}
            authorName={list.author.name}
            updatedAt={list.updatedAt}
          />
        </Dropdown>
      </div>
    </div>
  );
}

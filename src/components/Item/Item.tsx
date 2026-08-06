'use client';

import { useTranslations } from 'next-intl';

import { ButtonHover } from '@/components/ButtonHover';
import { Dropdown } from '@/components/Dropdown';
import ItemOptionsDropdown from '@/app/lists/[id]/ItemOptionsDropdown';
import Meta from '@/components/Meta/Meta';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import ItemBody from '@/components/ItemBody/ItemBody';
import { ItemBookmark, ItemEmbed, ItemLink } from '@/components/ItemLink/ItemLink';
import type { ItemLinkMetadata } from '@/components/ItemLink/ItemLink.types';
import { Item as ItemType } from '@/lib/types';

import styles from './Item.module.scss';

interface ItemStatsProps {
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface ItemProps {
  item: ItemType;
  listId: string;
  canManage?: boolean;
}

// Type-safe metadata shape for items
const ItemStats = ({ stats }: ItemStatsProps) => {
  const t = useTranslations('item');

  return (
    <MetaGroup>
      <Meta>{stats.likes} {t('likes')}</Meta>
      <Meta>{stats.comments} {t('comments')}</Meta>
    </MetaGroup>
  );
};

export const Item = ({ item, listId, canManage = false }: ItemProps) => {
  const t = useTranslations('item');
  const listPage = useTranslations('listPage');
  const metadata = item.metadata as ItemLinkMetadata;
  const linkTitle = metadata.title?.trim() || t('noTitle');
  const hasLinkUrl = typeof item.url === 'string' && item.url.trim().length > 0;
  const actions = canManage && (
    <div className={styles.actions}>
      <Dropdown>
        <ButtonHover aria-label={listPage('settings')} />
        <ItemOptionsDropdown
          listId={listId}
          itemId={item.id}
          viewsCount={item.stats?.views ?? 0}
          canManage={canManage}
          authorName={item.author?.name}
          createdAt={item.createdAt}
          updatedAt={item.updatedAt}
        />
      </Dropdown>
    </div>
  );

  const content = (() => {
    const linkMetadata: ItemLinkMetadata = { ...metadata, title: linkTitle };
    const url = item.url as string;

    switch (item.display_mode) {
      case 'bookmark':
        return <ItemBookmark url={url} metadata={linkMetadata} noDescriptionLabel={t('noDescription')} />;
      case 'embed':
        return <ItemEmbed url={url} metadata={linkMetadata} />;
      case 'link':
        return <ItemLink url={url} metadata={linkMetadata} />;
    }
  })();


  return (
    <div className={styles['container']}>
      {content}
      {item.body && (
        <div className={styles.itemBody}>
          <ItemBody
            body={item.body}
            small={content && true}
          />
        </div>
      )}
      {actions}
    </div>
  );
};

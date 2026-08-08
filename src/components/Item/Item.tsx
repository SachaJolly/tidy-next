'use client';

import { useTranslations } from 'next-intl';

import { ButtonHover } from '@/components/ButtonHover';
import { Dropdown } from '@/components/Dropdown';
import ItemOptionsDropdown from '@/components/ItemOptionsDropdown/ItemOptionsDropdown';
import ItemBody from '@/components/ItemBody/ItemBody';
import ItemLink from '@/components/ItemLink/ItemLink';
import type { ItemLinkMetadata } from '@/components/ItemLink/ItemLink.types';
import { Item as ItemType } from '@/lib/types';

import styles from './Item.module.scss';

interface ItemProps {
  item: ItemType;
  listId: string;
  canManage?: boolean;
}

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
          updatedAt={item.updatedAt}
        />
      </Dropdown>
    </div>
  );

  const content = hasLinkUrl
    ? (() => {
        const linkMetadata: ItemLinkMetadata = { ...metadata, title: linkTitle };
        const url = item.url as string;
        const resolvedDisplayMode =
          item.display_mode === 'bookmark' || item.display_mode === 'embed'
            ? item.display_mode
            : 'link';

        return <ItemLink url={url} metadata={linkMetadata} displayMode={resolvedDisplayMode} />;
      })()
    : null;

  return (
    <div className={styles['container']}>
      {content}
      {item.body && (
        <div className={styles['item-body']}>
          <ItemBody body={item.body} small={!!content} />
        </div>
      )}
      {actions}
    </div>
  );
};

'use client';

import { useTranslations } from 'next-intl';

import { ButtonHover } from '@/components/ButtonHover';
import { Dropdown } from '@/components/Dropdown';
import ItemOptionsDropdown from '@/components/ItemOptionsDropdown/ItemOptionsDropdown';
import ItemBody from '@/components/ItemBody/ItemBody';
import ItemLink from '@/components/ItemLink/ItemLink';
import ItemLinkSkeleton from '@/components/ItemLink/ItemLink.skeleton';
import type { ItemLinkMetadata } from '@/components/ItemLink/ItemLink.types';
import { useItemPreviewControls } from '@/hooks/use-item-preview-controls';
import { Item as ItemType } from '@/lib/types';
import { useOptionalListContext } from '@/app/lists/[id]/ListProvider';

import styles from './Item.module.scss';

interface ItemProps {
  item: ItemType;
  /**
   * Overrides the permission carried by the list context. Only the archive confirmation
   * needs it, to render a read-only preview of the item it is about to remove.
   */
  canManage?: boolean;
}

export const Item = ({ item, canManage }: ItemProps) => {
  const t = useTranslations('item');
  const listPage = useTranslations('listPage');
  const listContext = useOptionalListContext();
  const showActions = canManage ?? listContext?.canManage ?? false;
  const metadata = item.metadata as ItemLinkMetadata;
  const linkTitle = metadata.title?.trim() || t('noTitle');
  const hasLinkUrl = typeof item.url === 'string' && item.url.trim().length > 0;

  // Owned here rather than inside the dropdown: the menu starts these two writes, but the
  // card is what has to show they are running. `Item` is the closest parent of both.
  const preview = useItemPreviewControls({
    itemId: item.id,
    listId: listContext?.list.id,
    url: item.url,
    displayMode: item.display_mode,
    canManage: showActions,
  });

  const actions = showActions && (
    <div className={styles.actions}>
      <Dropdown>
        <ButtonHover aria-label={listPage('settings')} />
        <ItemOptionsDropdown
          itemId={item.id}
          viewsCount={item.stats?.views ?? 0}
          authorName={item.author?.name}
          updatedAt={item.updatedAt}
          metadata={metadata}
          preview={preview}
        />
      </Dropdown>
    </div>
  );

  // Swapping the card for its skeleton is the only feedback these writes get: they happen
  // from a menu that closes on select, so without it a refetch looks like nothing happened
  // until the content silently changes underneath.
  const content = hasLinkUrl ? (
    preview.isPending ? (
      <ItemLinkSkeleton displayMode={preview.displayMode} />
    ) : (
      <ItemLink
        url={item.url as string}
        metadata={{ ...metadata, title: linkTitle }}
        // The optimistic mode, so a switch redraws immediately and the skeleton is already
        // shaped like the mode being applied rather than the one being left.
        displayMode={preview.displayMode}
      />
    )
  ) : null;

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

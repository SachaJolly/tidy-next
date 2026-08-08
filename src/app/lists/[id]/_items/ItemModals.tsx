'use client';

import dynamic from 'next/dynamic';

import { useQueryModal } from '@/hooks/use-query-modal';

import { useListContext } from '../ListProvider';

// Same hub pattern as GlobalModals: the URL decides which modal exists in the tree, and each
// chunk is only downloaded once its param is active. Previously all three were mounted on
// every list page, so their forms — including the metadata fetching in ItemForm — shipped
// with the initial payload even for a visitor who never opens one.
const NewItemModal = dynamic(() => import('./NewItemModal'), { ssr: false });
const EditItemModal = dynamic(() => import('./EditItemModal'), { ssr: false });
const DeleteItemModal = dynamic(() => import('./DeleteItemModal'), { ssr: false });

export default function ItemModals() {
  const { canManage } = useListContext();
  const { activeModal } = useQueryModal();

  if (!canManage) {
    return null;
  }

  if (activeModal === 'new-item') {
    return <NewItemModal />;
  }

  if (activeModal === 'edit-item') {
    return <EditItemModal />;
  }

  // The archive flow uses `?modal=delete&id=…` so it can be opened from a list card too.
  if (activeModal === 'delete') {
    return <DeleteItemModal />;
  }

  return null;
}

'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createListItemAction } from '@/actions/items';
import { useQueryModal } from '@/hooks/use-query-modal';

import { useListContext } from '../ListProvider';

import ItemForm from './ItemForm';
import ListModal from '@/components/Modal/ListModal';

export default function NewItemModal() {
  const { list } = useListContext();
  const t = useTranslations('NewItemModal');
  const router = useRouter();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('new-item');

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  const handleSuccess = useCallback(() => {
    // Close before refreshing: `revalidatePath('/', 'layout')` in the server action turns a
    // subsequent `router.refresh()` into a hard MPA navigation to the router's current URL.
    // Clearing the modal params first keeps that refresh soft, so the page never reloads and
    // the modal cannot re-open from a stale `?modal=` param.
    closeModal();
    router.refresh();
  }, [closeModal, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <ListModal onClose={closeModal}>
      <ItemForm
        title={t('title')}
        submitLabel={t('add')}
        action={(values) => createListItemAction(list.id, values)}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </ListModal>
  );
}

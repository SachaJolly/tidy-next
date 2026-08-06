'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createListItemAction } from '@/app/actions/items';
import { useQueryModal } from '@/hooks/use-query-modal';

import ItemForm from './ItemForm';
import ListModal from '../ListModal';

type NewItemModalProps = {
  listId: string;
};

export default function NewItemModal({ listId }: NewItemModalProps) {
  const t = useTranslations('NewItemModal');
  const router = useRouter();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('new-item');

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  const handleSuccess = useCallback(() => {
    router.refresh();
    closeModal();
  }, [closeModal, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <ListModal onClose={closeModal}>
      <ItemForm
        title={t('title')}
        submitLabel={t('save')}
        action={(values) => createListItemAction(listId, values)}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </ListModal>
  );
}

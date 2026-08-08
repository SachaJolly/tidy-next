'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { updateListItemAction } from '@/actions/items';
import { ModalContent, ModalHeader } from '@/components/Modal/Modal';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { Item } from '@/lib/types';

import ItemForm from './ItemForm';
import ListModal from '../ListModal';

type EditItemModalProps = {
  listId: string;
  items: Item[];
};

export default function EditItemModal({ listId, items }: EditItemModalProps) {
  const t = useTranslations('EditItemModal');
  const router = useRouter();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('edit-item');
  const itemId = queryModal.activeModalId;

  const item = useMemo(
    () => items.find((candidate) => candidate.id === itemId) ?? null,
    [itemId, items],
  );

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  const handleSuccess = useCallback(() => {
    // Order matters. Our server actions call `revalidatePath('/', 'layout')`, which makes
    // the following `router.refresh()` fall back to a full MPA navigation towards the URL
    // the router currently holds. Closing first rewrites that URL (via replaceState) so the
    // modal params are already gone, which keeps the refresh soft and stops the page — and
    // every embedded iframe — from reloading and re-opening the modal.
    closeModal();
    router.refresh();
  }, [closeModal, router]);

  if (!isOpen) {
    return null;
  }

  if (!item) {
    return (
      <ListModal onClose={closeModal}>
        <ModalHeader title={t('title')} />
        <ModalContent>
          <div style={{ color: 'var(--danger)' }}>{t('error.notFound')}</div>
        </ModalContent>
      </ListModal>
    );
  }

  return (
    <ListModal onClose={closeModal}>
      <ItemForm
        title={t('title')}
        submitLabel={t('save')}
        action={(values) => updateListItemAction(listId, item.id, values)}
        initialBody={item.body}
        initialExtractedUrl={item.url}
        initialDisplayMode={item.display_mode}
        initialMetadata={item.metadata}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </ListModal>
  );
}

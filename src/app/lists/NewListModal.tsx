'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Modal, ModalContent, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import ListForm from './ListForm';
import type { List } from '@/lib/types';
import styles from '@/components/Modal/Modal.module.scss';
import { localizePath } from '@/lib/locale-path';
import { useQueryModal } from '@/hooks/use-query-modal';

/**
 * Dedicated modal for creating a new list.
 *
 * Keeping this entity-specific makes later create/edit flows for items and
 * collections follow the same pattern without reintroducing a generic shell.
 */
export default function NewListModal() {
  const t = useTranslations('NewList');
  const router = useRouter();
  const locale = useLocale();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('new-list');

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  const handleSuccess = useCallback(
    (list: List) => {
      router.replace(localizePath(`/lists/${list.id}`, locale), { scroll: false });
      router.refresh();
    },
    [locale, router],
  );

  // This component is now pure modal content: the visibility and trigger live in
  // the URL/query layer, not beside the form. That makes the modal reusable from
  // the global hub and keeps the trigger placement free to change per screen.
  if (!isOpen) {
    return null;
  }

  return (
    <Modal size="default" onClose={closeModal}>
      <ModalHeader>
        <h2>{t('title')}</h2>
        <ModalClose />
      </ModalHeader>
      <ListForm onCancel={closeModal} onSuccess={handleSuccess} />
    </Modal>
  );
}

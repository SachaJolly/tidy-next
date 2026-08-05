'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Modal, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import ListForm from '@/app/lists/ListForm';
import { updateListAction } from '@/app/actions/lists';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List } from '@/lib/types';

interface EditListModalProps {
  listId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialVisibility?: string;
}

/**
 * Modal component for editing an existing list via query param (?modal=edit-list).
 * 
 * This component manages the modal lifecycle through the query parameter rather than
 * route changes, providing a better UX for in-place edits while maintaining the
 * standard modal pattern used across the app.
 */
export default function EditListModal({
  listId,
  initialTitle,
  initialDescription,
  initialVisibility,
}: EditListModalProps) {
  const t = useTranslations('EditList');
  const router = useRouter();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('edit-list');

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  const handleSuccess = useCallback(() => {
    router.refresh();
    queryModal.closeModal();
  }, [router, queryModal]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal size="default" onClose={closeModal}>
      <ModalHeader>
        <h2>{t('title')}</h2>
        <ModalClose />
      </ModalHeader>
      <ListForm
        action={(values) => updateListAction(listId, values)}
        submitLabel={t('submit')}
        initialTitle={initialTitle}
        initialDescription={initialDescription ?? ''}
        initialVisibility={initialVisibility}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </Modal>
  );
}

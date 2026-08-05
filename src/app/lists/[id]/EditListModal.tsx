'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Modal, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import ListForm from '@/app/lists/ListForm';
import { updateListAction } from '@/app/actions/lists';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List } from '@/lib/types';

/**
 * Modal component for editing an existing list via query param (?modal=edit-list).
 * 
 * This modal is displayed globally via GlobalModals and is mounted on the [id]/page.tsx route.
 * It retrieves the list ID from the URL params and accesses list data via context or cache.
 * No direct data prop passing—the modal is purely query-param driven per AGENTS.md architecture.
 */
export default function EditListModal() {
  const t = useTranslations('EditList');
  const router = useRouter();
  const params = useParams();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('edit-list');

  // Extract listId from URL params
  const listId = useMemo(() => {
    if (typeof params.id === 'string') return params.id;
    return Array.isArray(params.id) ? params.id[0] : null;
  }, [params]);

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  const handleSuccess = useCallback(() => {
    router.refresh();
    queryModal.closeModal();
  }, [router, queryModal]);

  if (!isOpen || !listId) {
    return null;
  }

  return (
    <Modal size="default" onClose={closeModal}>
      <ModalHeader>
        <h2>{t('title')}</h2>
        <ModalClose />
      </ModalHeader>
      <EditListModalContent
        listId={listId}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </Modal>
  );
}

// Separate client component for fetching list data
function EditListModalContent({
  listId,
  onCancel,
  onSuccess,
}: {
  listId: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations('EditList');
  // TODO: Fetch list data here via API or context
  // For now, using placeholder—implement proper data fetching

  return (
    <ListForm
      action={(values) => updateListAction(listId, values)}
      submitLabel={t('submit')}
      initialTitle=""
      initialDescription=""
      initialVisibility="PUBLIC"
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}

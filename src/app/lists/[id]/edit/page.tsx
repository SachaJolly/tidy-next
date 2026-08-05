'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import EditListForm from './EditListForm';
import type { List } from '@/lib/types';

interface EditListPageProps {
  listId: string;
  initialTitle: string;
  initialDescription: string | null;
  initialVisibility?: string;
}

export default function EditListPage({
  listId,
  initialTitle,
  initialDescription,
  initialVisibility,
}: EditListPageProps) {
  const router = useRouter();

  const handleSuccess = useCallback(
    (list: List) => {
      router.back();
      router.refresh();
    },
    [router],
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Modal size="default" onClose={handleCancel}>
      <ModalHeader>
        <h2>Edit List</h2>
        <ModalClose />
      </ModalHeader>

      <ModalContent>
        <EditListForm
          listId={listId}
          initialTitle={initialTitle}
          initialDescription={initialDescription}
          initialVisibility={initialVisibility}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </ModalContent>
    </Modal>
  );
}

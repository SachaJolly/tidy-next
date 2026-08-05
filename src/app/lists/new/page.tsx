'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import ListForm from '../ListForm';

export default function NewListPage() {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    router.back();
    router.refresh();
  }, [router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Modal size="default" onClose={handleCancel}>
      <ModalHeader>
        <h2>Create a new list</h2>
        <ModalClose />
      </ModalHeader>
      <ModalContent>
        <ListForm onCancel={handleCancel} onSuccess={handleSuccess} />
      </ModalContent>
    </Modal>
  );
}

'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Modal, ModalContent, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import ListForm from './ListForm';
import type { List } from '@/lib/types';
import { localizePath } from '@/lib/locale-path';

export default function NewListPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleSuccess = useCallback(
    (list: List) => {
      router.replace(localizePath(`/lists/${list.id}`, locale), { scroll: false });
      router.refresh();
    },
    [locale, router],
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Modal size="default" onClose={handleCancel}>
      <ModalHeader>
        <h2>Create List</h2>
        <ModalClose />
      </ModalHeader>

      <ModalContent>
        <ListForm onCancel={handleCancel} onSuccess={handleSuccess} />
      </ModalContent>
    </Modal>
  );
}

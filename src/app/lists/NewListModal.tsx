'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List, NewListGate } from '@/lib/types';

import ListLimitReached from './ListLimitReached';
import ListModal from './ListModal';
import ListForm from './ListForm';

/**
 * Dedicated modal for creating a new list.
 */
export default function NewListModal({
  forceOpen = false,
  newListGate = {
    emailConfirmed: true,
    limitReached: false,
  },
}: {
  forceOpen?: boolean;
  newListGate?: NewListGate;
}) {
  const t = useTranslations('NewList');
  const router = useRouter();
  const locale = useLocale();
  const queryModal = useQueryModal();
  const isOpen = forceOpen || queryModal.isOpen('new-list');

  const closeModal = useCallback(() => {
    if (forceOpen) {
      router.back();
      return;
    }

    queryModal.closeModal();
  }, [forceOpen, queryModal, router]);

  const handleSuccess = useCallback(
    (list: List) => {
      router.replace(localizePath(`/lists/${list.id}`, locale), { scroll: false });
      router.refresh();
    },
    [locale, router],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <ListModal onClose={closeModal}>
      {newListGate.limitReached && !newListGate.emailConfirmed ? (
      <ListLimitReached
        title={t('warningTitle')}
        description={t('warningDescription')}
        onClose={closeModal}
      />
      ) : (
        <ListForm
          title={t('title')}
          onCancel={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </ListModal>
  );
}

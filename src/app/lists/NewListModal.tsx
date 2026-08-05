'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List } from '@/lib/types';

import ListModal from './ListModal';
import ListForm from './ListForm';

/**
 * Dedicated modal for creating a new list.
 *
 * The shell stays reusable, while the action wiring and redirect logic remain
 * specific to the list-create flow.
 */
export default function NewListModal({ forceOpen = false }: { forceOpen?: boolean } = {}) {
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

  // This component is now pure modal content: the visibility and trigger live in
  // the URL/query layer, not beside the form. That makes the modal reusable from
  // the global hub and keeps the trigger placement free to change per screen.
  if (!isOpen) {
    return null;
  }

  return (
    <ListModal title={t('title')} onClose={closeModal}>
      <ListForm onCancel={closeModal} onSuccess={handleSuccess} />
    </ListModal>
  );
}

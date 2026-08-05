'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Icon from '@/components/Icon/Icon';
import { localizePath } from '@/lib/locale-path';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List, NewListGate } from '@/lib/types';

import ListModal from './ListModal';
import ListForm from './ListForm';

/**
 * Dedicated modal for creating a new list.
 *
 * The shell stays reusable, while the action wiring and redirect logic remain
 * specific to the list-create flow.
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

  // This component is now pure modal content: the visibility and trigger live in
  // the URL/query layer, not beside the form. That makes the modal reusable from
  // the global hub and keeps the trigger placement free to change per screen.
  if (!isOpen) {
    return null;
  }

  const title = newListGate.limitReached && !newListGate.emailConfirmed ? t('warningTitle') : t('title');

  return (
    <ListModal title={title} onClose={closeModal}>
      {newListGate.limitReached && !newListGate.emailConfirmed ? (
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: 'var(--border-error)',
            backgroundColor: 'var(--surface-highlight)',
          }}
        >
          <div className="flex items-start gap-3" style={{ color: 'var(--text-body)' }}>
            <Icon
              name="warning"
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: 'var(--border-error)' }}
            />
            <div className="space-y-1">
              <p className="font-medium">{t('warningTitle')}</p>
              <p className="text-sm leading-6">{t('warningDescription')}</p>
            </div>
          </div>
        </div>
      ) : (
        <ListForm onCancel={closeModal} onSuccess={handleSuccess} />
      )}
    </ListModal>
  );
}

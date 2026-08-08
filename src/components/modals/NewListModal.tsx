'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List, NewListGate } from '@/lib/types';

import ListLimitReached from '@/components/modals/ListLimitReached';
import ListModal from '@/components/Modal/ListModal';
import ListForm from '@/components/modals/ListForm';

/**
 * Creates a list, from two different entry points.
 *
 * - Overlay: `?modal=new-list` on any page, opened by GlobalModals.
 * - Route: `/lists/new`, which passes `forceOpen` so the modal shows without the param.
 *
 * `newListGate` defaults to "allowed" so the overlay usage does not have to pass it; the
 * route resolves the real gate on the server.
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
    // On the route there is no page underneath to reveal — clearing a param that was never
    // there would leave the user staring at /lists/new. Going back returns them where they
    // came from, or to the previous entry if they landed here directly.
    if (forceOpen) {
      router.back();
      return;
    }

    queryModal.closeModal();
  }, [forceOpen, queryModal, router]);

  const handleSuccess = useCallback(
    (list: List) => {
      // `replace`, not `push`: the creation form is not a step worth going back to, and
      // going back would land on a URL that re-opens an empty modal.
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
      {/*
        The cap only bites unconfirmed accounts: confirmed users may pass `limitReached`
        without being blocked. Mirrors the server-side gate in the Rails List model.
      */}
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

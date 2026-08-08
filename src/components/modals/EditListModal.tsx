'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List } from '@/lib/types';
import { ModalContent, ModalHeader } from '@/components/Modal/Modal';

import { updateListAction } from '@/actions/lists';
import ListForm from '@/components/modals/ListForm';
import ListModal from '@/components/Modal/ListModal';

/**
 * Edits a list, from two different entry points.
 *
 * - Overlay: `?modal=edit-list&modalId=<id>` on any page, opened by GlobalModals. The param
 *   carries an id but no list, so the modal has to fetch it from the client.
 * - Route: `/lists/:id/edit`, which resolves the list on the server and passes it as
 *   `initialList`, skipping that fetch entirely.
 *
 * A dropdown can open this from a card on `/discover` or `/dashboard`, where the page never
 * loaded that list — hence the client fetch rather than reading it from a parent.
 */
type EditListModalProps = {
  forceOpen?: boolean;
  initialList?: List | null;
};

export default function EditListModal({
  forceOpen = false,
  initialList = null,
}: EditListModalProps = {}) {
  const t = useTranslations('EditListModal');
  const router = useRouter();
  const queryModal = useQueryModal();
  const isOpen = forceOpen || queryModal.isOpen('edit-list');
  const listId = forceOpen ? (initialList?.id ?? null) : queryModal.activeModalId;
  const [list, setList] = useState<List | null>(initialList);
  const [isLoading, setIsLoading] = useState(!initialList && !!listId);
  const [error, setError] = useState<string | null>(null);
  const shouldRender = isOpen && !!listId;

  const closeModal = useCallback(() => {
    // On the route there is no page underneath to reveal, so clearing the param would strand
    // the user on /lists/:id/edit. Going back returns them to wherever they came from.
    if (forceOpen) {
      router.back();
      return;
    }

    queryModal.closeModal();
  }, [forceOpen, queryModal, router]);

  const handleSuccess = useCallback(() => {
    // Close before refreshing: `revalidatePath('/', 'layout')` in the server action turns a
    // subsequent `router.refresh()` into a hard MPA navigation to the router's current URL.
    // Clearing the modal params first keeps that refresh soft, so the page never reloads and
    // the modal cannot re-open from a stale `?modal=` param.
    closeModal();
    router.refresh();
  }, [closeModal, router]);

  useEffect(() => {
    if (!shouldRender || !listId) {
      return;
    }

    // The route already resolved the list on the server; refetching it would only add a
    // loading flash to a form that is ready to paint.
    if (initialList) {
      setList(initialList);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Guards against a stale response overwriting a newer one: the user can close and
    // reopen on another list while the first request is still in flight.
    let isActive = true;

    const fetchList = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/lists/${listId}`);
        if (response.ok) {
          const fetchedList = (await response.json()) as List;
          if (isActive) {
            setList(fetchedList);
          }
        } else if (response.status === 401 || response.status === 403) {
          if (isActive) {
            setError(t('error.forbidden'));
          }
        } else if (response.status === 404) {
          if (isActive) {
            setError(t('error.notFound'));
          }
        } else {
          if (isActive) {
            setError(t('error.loadFailed'));
          }
        }
      } catch {
        if (isActive) {
          setError(t('error.loadFailed'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchList();

    return () => {
      isActive = false;
    };
  }, [initialList, listId, shouldRender, t]);

  if (!shouldRender) {
    return null;
  }

  if (isLoading) {
    return (
      <ListModal onClose={closeModal}>
        <ModalHeader title={t('title')} />
        <ModalContent>{t('loading')}</ModalContent>
      </ListModal>
    );
  }

  if (error || !list) {
    return (
      <ListModal onClose={closeModal}>
        <ModalHeader title={t('title')} />
        <ModalContent>
          <div style={{ color: 'var(--danger)' }}>{error || t('error.loadFailed')}</div>
        </ModalContent>
      </ListModal>
    );
  }

  return (
    <ListModal onClose={closeModal}>
      <ListForm
        title={t('title')}
        action={(values) => updateListAction(listId, values)}
        submitLabel={t('save')}
        initialTitle={list.title}
        initialDescription={list.description ?? ''}
        initialVisibility={list.visibility}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </ListModal>
  );
}

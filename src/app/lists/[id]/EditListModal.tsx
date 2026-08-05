'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List } from '@/lib/types';

import { updateListAction } from '@/app/actions/lists';
import ListForm from '@/app/lists/ListForm';
import ListModal from '@/app/lists/ListModal';

/**
 * Modal component for editing an existing list via query param (?modal=edit-list&modalId=xxx).
 *
 * The modal can also be rendered directly by the standalone edit route with
 * `forceOpen`, which keeps the same form logic reusable across entry points.
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
    if (forceOpen) {
      router.back();
      return;
    }

    queryModal.closeModal();
  }, [forceOpen, queryModal, router]);

  const handleSuccess = useCallback(() => {
    router.refresh();
    closeModal();
  }, [closeModal, router]);

  useEffect(() => {
    if (!shouldRender || !listId) {
      return;
    }

    if (initialList) {
      setList(initialList);
      setIsLoading(false);
      setError(null);
      return;
    }

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
        } else if (response.status === 401) {
          if (isActive) {
            setError(t('error.forbidden'));
          }
        } else if (response.status === 404) {
          if (isActive) {
            setError(t('error.notFound'));
          }
        } else if (response.status === 403) {
          if (isActive) {
            setError(t('error.forbidden'));
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
      <ListModal title={t('title')} onClose={closeModal}>
        <div style={{ padding: '1rem' }}>{t('loading')}</div>
      </ListModal>
    );
  }

  if (error || !list) {
    return (
      <ListModal title={t('title')} onClose={closeModal}>
        <div style={{ padding: '1rem', color: 'var(--danger)' }}>
          {error || t('error.loadFailed')}
        </div>
      </ListModal>
    );
  }

  return (
    <ListModal title={t('title')} onClose={closeModal}>
      <ListForm
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

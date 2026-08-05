'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Modal, ModalHeader, ModalClose } from '@/components/Modal/Modal';
import ListForm from '@/app/lists/ListForm';
import { updateListAction } from '@/app/actions/lists';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { List } from '@/lib/types';

/**
 * Modal component for editing an existing list via query param (?modal=edit-list&listId=xxx).
 * 
 * The listId is passed via search param (?listId=xxx) to support opening from any page.
 * The modal lifecycle is driven by the query params, not component state or props.
 * Per AGENTS.md #5: All modal visibility is strictly URL-driven.
 */
export default function EditListModal() {
  const t = useTranslations('EditList');
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryModal = useQueryModal();
  const isOpen = queryModal.isOpen('edit-list');

  // Get listId from search params (?listId=xxx)
  const listId = useMemo(() => searchParams?.get('listId') ?? null, [searchParams]);

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

// Separate client component for fetching and managing list data
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
  const [list, setList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch list data from API to populate the form
        const response = await fetch(`/api/v1/lists/${listId}`);
        if (response.ok) {
          const fetchedList = await response.json() as List;
          setList(fetchedList);
        } else if (response.status === 404) {
          setError(t('error.notFound'));
        } else if (response.status === 403) {
          setError(t('error.forbidden'));
        } else {
          setError(t('error.loadFailed'));
        }
      } catch (err) {
        setError(t('error.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [listId, t]);

  if (isLoading) {
    return <div className="p-4">{t('loading')}</div>;
  }

  if (error || !list) {
    return <div className="p-4 text-red-500">{error || t('error.loadFailed')}</div>;
  }

  return (
    <ListForm
      action={(values) => updateListAction(listId, values)}
      submitLabel={t('submit')}
      initialTitle={list.title}
      initialDescription={list.description ?? ''}
      initialVisibility={list.visibility}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  );
}

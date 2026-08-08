'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { archiveListAction } from '@/actions/lists';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { NewListGate } from '@/lib/types';
import type { List } from '@/lib/types';

const NewListModal = dynamic(() => import('@/app/lists/NewListModal'), {
  ssr: false,
});

const EditListModal = dynamic(() => import('@/app/lists/[id]/EditListModal'), {
  ssr: false,
});

const DeleteListModal = dynamic(() => import('@/app/lists/[id]/DeleteListModal'), {
  ssr: false,
});

type GlobalModalsProps = {
  newListGate: NewListGate;
};

export default function GlobalModals({ newListGate }: GlobalModalsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const deleteListModal = useQueryModal();
  const t = useTranslations('DeleteListModal');
  const [list, setList] = useState<List | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeModal = deleteListModal.activeModal;
  const activeListId = deleteListModal.activeModalId;

  useEffect(() => {
    if (activeModal !== 'delete-list' || !activeListId) {
      setList(null);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    let isActive = true;

    const fetchList = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setList(null);

      try {
        const response = await fetch(`/api/v1/lists/${activeListId}`, {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!isActive) return;

        if (response.ok) {
          const fetchedList = (await response.json()) as List;
          setList(fetchedList);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setErrorMessage(t('error.forbidden'));
          return;
        }

        if (response.status === 404) {
          setErrorMessage(t('error.notFound'));
          return;
        }

        setErrorMessage(t('error.loadFailed'));
      } catch {
        if (isActive) {
          setErrorMessage(t('error.loadFailed'));
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
  }, [activeListId, activeModal, t]);

  const closeDeleteModal = useCallback(() => {
    deleteListModal.closeModal();
  }, [deleteListModal]);

  const handleDeleteList = useCallback(async () => {
    if (!activeListId || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await archiveListAction(activeListId);
    if (result.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
      return;
    }

    if (pathname === `/lists/${activeListId}`) {
      deleteListModal.closeModal();
      router.replace('/dashboard');
      return;
    }

    deleteListModal.closeModal();
    router.refresh();
    setIsLoading(false);
  }, [activeListId, deleteListModal, isLoading, pathname, router]);

  // The hub is the single place where URL state decides which modal chunk exists
  // in the tree. Each modal stays decoupled from its trigger, and code only loads
  // when the matching query param is active.
  if (activeModal === 'delete-list') {
    return (
      <DeleteListModal
        isOpen={true}
        list={list}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onClose={closeDeleteModal}
        onConfirm={() => void handleDeleteList()}
      />
    );
  }

  if (activeModal === 'new-list') {
    return <NewListModal newListGate={newListGate} />;
  }

  if (activeModal === 'edit-list') {
    return <EditListModal />;
  }

  return null;
}

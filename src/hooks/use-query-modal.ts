'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type QueryModalName = string;

interface UseQueryModalOptions {
  modalKey?: string;
  modalIdKey?: string;
}

/**
 * URL-driven modal state for App Router pages.
 *
 * The current modal is encoded in the search params so every modal can be
 * deep-linked, shared, and restored with the browser back button.
 */
export function useQueryModal({
  modalKey = 'modal',
  modalIdKey = 'modalId',
}: UseQueryModalOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentModal = searchParams.get(modalKey);
  const currentModalId = searchParams.get(modalIdKey) ?? searchParams.get('listId');

  const buildUrl = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const isOpen = useCallback(
    (modalName: QueryModalName, modalId?: string) => {
      if (currentModal !== modalName) return false;
      if (modalId === undefined) return true;
      return currentModalId === modalId;
    },
    [currentModal, currentModalId],
  );

  const openModal = useCallback(
    (modalName: QueryModalName, modalId?: string) => {
      if (currentModal === modalName && currentModalId === (modalId ?? null)) {
        return;
      }

      router.push(
        buildUrl((params) => {
          params.set(modalKey, modalName);
          if (modalId) {
            params.set(modalIdKey, modalId);
            params.delete('listId');
          } else {
            params.delete(modalIdKey);
            params.delete('listId');
          }
        }),
        { scroll: false },
      );
    },
    [buildUrl, currentModal, currentModalId, modalIdKey, modalKey, router],
  );

  const closeModal = useCallback(() => {
    if (!currentModal) return;

    router.replace(
      buildUrl((params) => {
        params.delete(modalKey);
        params.delete(modalIdKey);
        params.delete('listId');
      }),
      { scroll: false },
    );
  }, [buildUrl, currentModal, modalIdKey, modalKey, router]);

  return useMemo(
    () => ({
      activeModal: currentModal,
      activeModalId: currentModalId,
      isOpen,
      openModal,
      closeModal,
    }),
    [closeModal, currentModal, currentModalId, isOpen, openModal],
  );
}

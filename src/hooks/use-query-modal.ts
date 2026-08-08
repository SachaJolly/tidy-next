'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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
 *
 * WHY the native History API instead of `router.push` / `router.replace`:
 * both router methods are real *navigations*. In the App Router any change to the
 * search params — even on the exact same pathname — invalidates the client cache
 * entry for the route and refetches its RSC payload. Our list pages fetch with
 * `cache: 'no-store'`, so every single modal open/close re-rendered the whole page
 * subtree on the server and re-created the `<Item>` DOM. That destroys and rebuilds
 * every provider `<iframe>`, which is why embedded players visibly reloaded (and
 * restarted from zero) each time any modal was opened, saved or closed.
 *
 * `window.history.pushState` / `replaceState` are patched by Next.js: they update the
 * URL and re-run `usePathname` / `useSearchParams` with **no** server round-trip and
 * no re-render of Server Components, so the existing DOM — iframes included — is left
 * untouched. Reads are unchanged, so deep links still work: a cold load of
 * `/lists/42?modal=edit-item&modalId=7` is still server-rendered from the URL, and
 * back/forward still fire `popstate`, which Next.js syncs back into `useSearchParams`.
 */
export function useQueryModal({
  modalKey = 'modal',
  modalIdKey = 'modalId',
}: UseQueryModalOptions = {}) {
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

      // pushState (not replaceState) so the back button closes the modal instead of
      // leaving the page, matching the previous `router.push` behaviour.
      window.history.pushState(
        null,
        '',
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
      );
    },
    [buildUrl, currentModal, currentModalId, modalIdKey, modalKey],
  );

  const closeModal = useCallback(() => {
    if (!currentModal) return;

    // replaceState mirrors the previous `router.replace`: closing consumes the entry
    // created by openModal rather than stacking a second "modal-less" one.
    window.history.replaceState(
      null,
      '',
      buildUrl((params) => {
        params.delete(modalKey);
        params.delete(modalIdKey);
        params.delete('listId');
      }),
    );
  }, [buildUrl, currentModal, modalIdKey, modalKey]);

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

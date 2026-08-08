'use client';

import React, { createContext, useContext, useMemo } from 'react';

import type { Item, List } from '@/lib/types';

type ListContextValue = {
  list: List;
  items: Item[];
  /** True when the viewer owns the list and may create, edit or archive its items. */
  canManage: boolean;
};

const ListContext = createContext<ListContextValue | null>(null);

type ListProviderProps = {
  list: List;
  canManage: boolean;
  children: React.ReactNode;
};

/**
 * Shares the list the page already fetched with every client component below it.
 *
 * Without it the same values travel down by hand: `page.tsx` hands `listId` and `canManage`
 * to each `Item`, which hands them to its dropdown, while the edit and archive modals each
 * receive their own copy of the items array only to look one entry up. That array is part of
 * the RSC payload, so drilling it into several components ships it several times.
 *
 * The page stays the single place that fetches and authorises; consumers just read.
 */
export function ListProvider({ list, canManage, children }: ListProviderProps) {
  const value = useMemo<ListContextValue>(
    () => ({ list, items: list.items ?? [], canManage }),
    [canManage, list],
  );

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

/** Returns the list context, or null outside a list page. */
export function useOptionalListContext(): ListContextValue | null {
  return useContext(ListContext);
}

/** Returns the list context, and fails loudly when a component is mounted outside the page. */
export function useListContext(): ListContextValue {
  const context = useContext(ListContext);

  if (!context) {
    throw new Error('useListContext must be used inside <ListProvider>.');
  }

  return context;
}

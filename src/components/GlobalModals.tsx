'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { useQueryModal } from '@/hooks/use-query-modal';
import type { NewListGate } from '@/lib/types';

const NewListModal = dynamic(() => import('@/app/lists/NewListModal'), {
  ssr: false,
});

const EditListModal = dynamic(() => import('@/app/lists/[id]/EditListModal'), {
  ssr: false,
});

type GlobalModalsProps = {
  newListGate: NewListGate;
};

export default function GlobalModals({ newListGate }: GlobalModalsProps) {
  const { activeModal } = useQueryModal();

  // The hub is the single place where URL state decides which modal chunk exists
  // in the tree. Each modal stays decoupled from its trigger, and code only loads
  // when the matching query param is active.
  if (activeModal === 'new-list') {
    return <NewListModal newListGate={newListGate} />;
  }

  if (activeModal === 'edit-list') {
    return <EditListModal />;
  }

  return null;
}

"use client";

import React from 'react';
import styles from './modal.module.scss';
import { Modal, ModalContent, ModalHeader, ModalClose } from './modal';

type NewCollectionModalProps = {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

/**
 * Dedicated modal shell for collection creation/editing.
 *
 * Like the item modal, this is intentionally separate so future collection
 * forms do not need to share a generic modal wrapper.
 */
export default function NewCollectionModal({
  open,
  title = 'New collection',
  description,
  children,
  onClose,
}: NewCollectionModalProps) {
  if (!open) return null;

  return (
    <Modal size="default" onClose={onClose}>
      <ModalHeader>
        <h2>{title}</h2>
        <ModalClose />
      </ModalHeader>

      <ModalContent>
        {description && <p className={styles.small}>{description}</p>}
        {children}
      </ModalContent>
    </Modal>
  );
}

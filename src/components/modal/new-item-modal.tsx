"use client";

import React from 'react';
import styles from './modal.module.scss';
import { Modal, ModalContent, ModalHeader, ModalClose } from './modal';

type NewItemModalProps = {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

/**
 * Dedicated modal shell for item creation/editing.
 *
 * The modal is intentionally entity-specific so the item flow can evolve
 * independently from lists and collections.
 */
export default function NewItemModal({
  open,
  title = 'New item',
  description,
  children,
  onClose,
}: NewItemModalProps) {
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

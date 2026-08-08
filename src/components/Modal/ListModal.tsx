'use client';

import React from 'react';

import { Modal, ModalClose } from '@/components/Modal/Modal';

type ListModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};

export default function ListModal({ onClose, children }: ListModalProps) {
  return (
    <Modal size="default" onClose={onClose}>
      <ModalClose />
      {children}
    </Modal>
  );
}

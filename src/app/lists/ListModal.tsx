'use client';

import React from 'react';

import { Modal, ModalClose, ModalHeader } from '@/components/Modal/Modal';

type ListModalProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ListModal({ title, description, onClose, children }: ListModalProps) {
  return (
    <Modal size="default" onClose={onClose}>
      <ModalHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h2>{title}</h2>
          {description ? <p className="text-small">{description}</p> : null}
        </div>
        <ModalClose />
      </ModalHeader>
      {children}
    </Modal>
  );
}

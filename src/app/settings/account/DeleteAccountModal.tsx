'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalClose } from '@/components/Modal/Modal';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';

interface DeleteAccountModalProps {
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

const DangerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function DeleteAccountModal({ isDeleting, error, onConfirm, onClose }: DeleteAccountModalProps) {
  const t = useTranslations('settings');

  return (
    <Modal size="default" onClose={onClose}>
      <ModalHeader
        title={t('account.deleteConfirmTitle')}
        icon={<DangerIcon />}
        iconVariant="danger"
      />
      <ModalClose />
      <ModalContent>
        <p style={{ margin: 0, color: 'var(--text-body)', lineHeight: 1.6 }}>
          {t('account.deleteConfirmBody')}
        </p>
        {error && (
          <p style={{ margin: '1rem 0 0', color: 'var(--color-red-500)', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
      </ModalContent>
      <ModalFooter>
        <ButtonGroup>
          <Button type="button" variant="default" onClick={onClose} disabled={isDeleting}>
            {t('account.deleteCancel')}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? t('account.deleteDeleting') : t('account.deleteConfirm')}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}

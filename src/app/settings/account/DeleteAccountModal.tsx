'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Icon from '@/components/Icon/Icon';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalClose } from '@/components/Modal/Modal';

interface DeleteAccountModalProps {
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteAccountModal({ isDeleting, error, onConfirm, onClose }: DeleteAccountModalProps) {
  const t = useTranslations('settings');

  return (
    <Modal size="default" onClose={onClose}>
      <ModalHeader
        title={t('account.deleteConfirmTitle')}
        icon={<Icon name="warning" />}
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

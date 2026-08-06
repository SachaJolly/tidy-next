'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalClose } from '@/components/Modal/Modal';

interface DeleteAccountSectionProps {
  onDelete: () => Promise<void>;
}

export default function DeleteAccountSection({ onDelete }: DeleteAccountSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete();
      // Redirect to home after successful deletion — account is gone.
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('account.deleteFailed'));
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card title={t('account.deleteTitle')} description={t('account.deleteDescription')}>
        <div>
          <Button
            type="button"
            variant="default"
            tinted
            onClick={() => setIsModalOpen(true)}
          >
            {t('account.deleteButton')}
          </Button>
        </div>
      </Card>

      {isModalOpen && (
        <Modal size="small" onClose={() => setIsModalOpen(false)}>
          <ModalHeader title={t('account.deleteConfirmTitle')} />
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
          <ModalFooter justify="space-between">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsModalOpen(false)}
              disabled={isDeleting}
            >
              {t('account.deleteCancel')}
            </Button>
            <Button
              type="button"
              variant="default"
              tinted
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('account.deleteDeleting') : t('account.deleteConfirm')}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}

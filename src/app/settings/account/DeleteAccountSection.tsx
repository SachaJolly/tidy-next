'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useQueryModal } from '@/hooks/use-query-modal';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import DeleteAccountModal from './DeleteAccountModal';

const MODAL_NAME = 'delete-account';

interface DeleteAccountSectionProps {
  onDelete: () => Promise<void>;
}

export default function DeleteAccountSection({ onDelete }: DeleteAccountSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useQueryModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete();
      closeModal();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('account.deleteFailed'));
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    closeModal();
  };

  return (
    <>
      <Card title={t('account.deleteTitle')} description={t('account.deleteDescription')}>
        <div>
          <Button
            type="button"
            variant="danger"
            onClick={() => openModal(MODAL_NAME)}
          >
            {t('account.deleteButton')}
          </Button>
        </div>
      </Card>

      {isOpen(MODAL_NAME) && (
        <DeleteAccountModal
          isDeleting={isDeleting}
          error={error}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      )}
    </>
  );
}

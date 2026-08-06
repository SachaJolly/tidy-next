'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useQueryModal } from '@/hooks/use-query-modal';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import DeleteAccountModal from './DeleteAccountModal';
import Icon from "@/components/Icon/Icon";

const MODAL_NAME = 'delete-account';

interface DeleteAccountSectionProps {
  onDelete: () => Promise<void>;
  emailConfirmed: boolean;
}

export default function DeleteAccountSection({ onDelete, emailConfirmed }: DeleteAccountSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useQueryModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!emailConfirmed) {
      setError(t('account.deleteRequiresConfirmation'));
      return;
    }

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

  const handleOpenDeleteModal = () => {
    if (!emailConfirmed) return;
    openModal(MODAL_NAME);
  };

  return (
    <>
      <Card title={t('account.deleteTitle')} description={t('account.deleteDescription')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            type="button"
            variant="danger"
            disabled={!emailConfirmed}
            onClick={handleOpenDeleteModal}
          >
            {t('account.deleteButton')}
          </Button>
          {!emailConfirmed && (
            <div className="text-warning" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Icon name="warning" size={16} />
              <p className="text-small">{t('account.deleteRequiresConfirmation')}</p>
            </div>
          )}
        </div>
      </Card>

      {emailConfirmed && isOpen(MODAL_NAME) && (
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

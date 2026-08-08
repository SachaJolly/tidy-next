'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import ListCard from '@/components/ListCard/ListCard';
import Notice from '@/components/Notice/Notice';
import Spinner from '@/components/Spinner/Spinner';
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/Modal/Modal';
import type { List } from '@/lib/types';

type DeleteListModalProps = {
  isOpen: boolean;
  list: List | null;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteListModal({
  isOpen,
  list,
  isLoading,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteListModalProps) {
  const t = useTranslations('DeleteListModal');
  const forms = useTranslations('forms');

  if (!isOpen) {
    return null;
  }

  return (
    <Modal size="small" onClose={onClose}>
      <ModalHeader title={t('title')} icon="warning" iconVariant="danger" />
      <ModalClose />
      <ModalContent>
        {isLoading && !list ? (
          <>
            <Spinner size={20} />
            <p>{t('loading')}</p>
          </>
        ) : list ? (
          <>
            <p>{t('description')}</p>

            <div
              className="non-interactive"
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-interactive)',
                width: 'min(100%, 17rem)',
                margin: '0 auto',
              }}
            >
              <ListCard list={list} canManage={false} />
            </div>

            {errorMessage && <Notice variant="error" description={errorMessage} />}
          </>
        ) : (
          <>
            <p>{t('error.notFound')}</p>
            {errorMessage && <Notice variant="error" description={errorMessage} />}
          </>
        )}
      </ModalContent>
      <ModalFooter>
        <ButtonGroup>
          <Button onClick={onClose} disabled={isLoading}>
            {forms('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            loading={isLoading}
            disabled={isLoading || !list}
          >
            {isLoading ? t('confirmArchivePending') : t('confirmArchive')}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}

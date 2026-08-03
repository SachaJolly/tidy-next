"use client";

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Button from '@/components/button/button';
import { Modal, ModalContent, ModalHeader, ModalClose } from './modal';
import ListForm from '@/app/components/lists/list-form';
import type { List } from '@/lib/types';
import styles from './modal.module.scss';
import { useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';

/**
 * Dedicated modal for creating a new list.
 *
 * Keeping this entity-specific makes later create/edit flows for items and
 * collections follow the same pattern without reintroducing a generic shell.
 */
export default function NewListModal() {
  const t = useTranslations('NewList');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSuccess = useCallback((list: List) => {
    setIsOpen(false);
    router.push(localizePath(`/lists/${list.id}`, locale));
    router.refresh();
  }, [locale, router]);

  return (
    <>
      <Button
        icon="add"
        label={t('title')}
        variant="interactive"
        tinted={true}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <Modal size="default" onClose={closeModal}>
          <ModalHeader>
            <h2>{t('title')}</h2>
            <ModalClose />
          </ModalHeader>

          <ModalContent>
            <p className={styles.small}>
              {t('description')}
            </p>
            <ListForm onCancel={closeModal} onSuccess={handleSuccess} />
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

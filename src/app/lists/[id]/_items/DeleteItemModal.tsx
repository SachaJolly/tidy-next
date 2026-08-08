'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { archiveListItemAction } from '@/actions/items';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { Item } from '@/components/Item/Item';
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader } from '@/components/Modal/Modal';
import { useQueryModal } from '@/hooks/use-query-modal';
import Notice from '@/components/Notice/Notice';

import { useListContext } from '../ListProvider';

export default function DeleteItemModal() {
  const { list, items } = useListContext();
  const t = useTranslations('ItemOptionsDropdown');
  const forms = useTranslations('forms');
  // `?modal=delete&id=…` rather than the default `modalId`, so an item archive can be open
  // at the same time as a list modal without the two fighting over the same param.
  const queryModal = useQueryModal({ modalIdKey: 'id' });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOpen = queryModal.isOpen('delete');
  const itemId = queryModal.activeModalId;

  const item = useMemo(
    () => items.find((candidate) => candidate.id === itemId) ?? null,
    [itemId, items],
  );

  const closeModal = useCallback(() => {
    queryModal.closeModal();
  }, [queryModal]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError(item ? null : t('notFound'));
    setIsSubmitting(false);
  }, [isOpen, item, itemId, t]);

  const handleConfirmArchive = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!item) {
      setError(t('notFound'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await archiveListItemAction(list.id, item.id);
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    queryModal.closeModal();
    router.refresh();
    setIsSubmitting(false);
  }, [isSubmitting, item, list.id, queryModal, router, t]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal size="small" onClose={closeModal}>
      <ModalHeader title={t('confirmTitle')} icon="warning" iconVariant="danger" />
      <ModalClose />
      <ModalContent>
        {item ? (
          <>
            <p>{t('confirmDescription')}</p>

            <div className="non-interactive">
              {/* Preview only: the confirmation must never expose the item actions. */}
              <Item item={item} canManage={false} />
            </div>

            {error && <Notice variant="error" description={error} />}
          </>
        ) : (
          <p>{t('notFound')}</p>
        )}
      </ModalContent>
      <ModalFooter>
        <ButtonGroup>
          <Button onClick={closeModal} disabled={isSubmitting}>
            {forms('cancel')}
          </Button>
          {item && <Button
            onClick={handleConfirmArchive}
            variant="danger"
            loading={isSubmitting}
            disabled={isSubmitting || !item}
          >
            {isSubmitting ? t('confirmArchivePending') : t('confirmArchive')}
          </Button>}
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}

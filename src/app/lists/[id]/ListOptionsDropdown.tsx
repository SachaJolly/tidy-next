'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownText,
} from '@/components/Dropdown';
import { Modal, ModalClose, ModalContent, ModalHeader } from '@/components/Modal/Modal';
import type { List } from '@/lib/types';
import EditListModal from '@/components/Lists/EditListModal';
import { updateListVisibilityAction } from '@/app/actions/lists';
import { useQueryModal } from '@/hooks/use-query-modal';
import { formatDate } from '@/lib/date';

type ListVisibility = List['visibility'];

interface ListOptionsDropdownProps {
  listId: string;
  isAuthor: boolean;
  initialVisibility: ListVisibility;
  listTitle: string;
  listDescription: string | null;
  authorName: string;
  updatedAt: string;
  inline?: boolean;
}

const VISIBILITY_OPTIONS: Array<{
  value: ListVisibility;
  icon: 'visibility_on' | 'visibility_off' | 'private';
  labelKey: 'visibility.public.label' | 'visibility.unindexed.label' | 'visibility.private.label';
  captionKey:
    | 'visibility.public.caption'
    | 'visibility.unindexed.caption'
    | 'visibility.private.caption';
}> = [
  {
    value: 'PUBLIC',
    icon: 'visibility_on',
    labelKey: 'visibility.public.label',
    captionKey: 'visibility.public.caption',
  },
  {
    value: 'UNINDEXED',
    icon: 'visibility_off',
    labelKey: 'visibility.unindexed.label',
    captionKey: 'visibility.unindexed.caption',
  },
  {
    value: 'PRIVATE',
    icon: 'private',
    labelKey: 'visibility.private.label',
    captionKey: 'visibility.private.caption',
  },
];

export default function ListOptionsDropdown({
  listId,
  isAuthor,
  initialVisibility,
  listTitle,
  listDescription,
  authorName,
  updatedAt,
  inline = false,
}: ListOptionsDropdownProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('ListOptionsDropdown');
  const date = useTranslations('date');
  const common = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const [visibility, setVisibility] = useState<ListVisibility>(initialVisibility);
  const [error, setError] = useState<string | null>(null);
  const queryModal = useQueryModal();
  const isEditModalOpen = queryModal.isOpen('edit-list', listId);
  const isCollaboratorsModalOpen = queryModal.isOpen('manage-collaborators', listId);

  const updatedLabel = useMemo(
    () =>
      date('lastUpdated', {
        date: formatDate(updatedAt, locale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }),
    [date, locale, updatedAt],
  );

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/lists/${listId}`;
    await navigator.clipboard.writeText(url);
  };

  const handleVisibilityChange = (value: string) => {
    if (!isAuthor || isPending) return;

    const nextVisibility = value as ListVisibility;
    if (nextVisibility === visibility) return;

    const previousVisibility = visibility;
    setVisibility(nextVisibility);
    setError(null);

    startTransition(async () => {
      const result = await updateListVisibilityAction(listId, nextVisibility);
      if (result.error) {
        setVisibility(previousVisibility);
        setError(result.error);
        return;
      }

      setVisibility(result.list?.visibility ?? nextVisibility);
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu align="end" inline={inline}>
        {isAuthor ? (
          <>
            <DropdownItem
              icon="edit"
              label={common('action.edit')}
              onSelect={() => queryModal.openModal('edit-list', listId)}
            />
            <DropdownItem
              icon="group"
              label={common('action.manageCollaborators')}
              onSelect={() => queryModal.openModal('manage-collaborators', listId)}
            />
            <DropdownItem icon="archive" destructive label={common('action.archive')} />
            <DropdownSeparator />

            <DropdownLabel>{common('action.setVisibility')}</DropdownLabel>
            <DropdownRadioGroup
              value={visibility}
              onValueChange={handleVisibilityChange}
              label={common('action.setVisibility')}
              closeOnSelect
            >
              {VISIBILITY_OPTIONS.map(({ value, icon, labelKey, captionKey }) => (
                <DropdownRadioItem
                  key={value}
                  value={value}
                  icon={icon}
                  label={common(labelKey)}
                  caption={common(captionKey)}
                />
              ))}
            </DropdownRadioGroup>
            {error ? (
              <DropdownText>
                <p className="text-small" style={{ color: 'var(--danger)' }}>
                  {common('updateVisibilityError')}
                </p>
              </DropdownText>
            ) : null}
            <DropdownSeparator />
          </>
        ) : null}

        <DropdownItem
          icon="copy"
          label={common('action.copyLink')}
          onSelect={() => void handleCopyLink()}
        />
        <DropdownSeparator />
        <DropdownText>
          <p className="text-small">{common('curatedByAuthor', { author: authorName })}</p>
          <p className="text-small">{updatedLabel}</p>
        </DropdownText>
      </DropdownMenu>

      <EditListModal
        listId={listId}
        initialTitle={listTitle}
        initialDescription={listDescription}
        initialVisibility={visibility}
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            queryModal.closeModal();
          }
        }}
      />

      {isCollaboratorsModalOpen && (
        <Modal size="default" onClose={() => queryModal.closeModal()}>
          <ModalHeader>
            <h2>{common('action.manageCollaborators')}</h2>
            <ModalClose />
          </ModalHeader>
          <ModalContent>
            <p className="text-small">{t('manageCollaboratorsPlaceholder')}</p>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

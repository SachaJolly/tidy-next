'use client';

import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownText,
} from '@/components/Dropdown';
import VisibilityRadioGroup from '@/components/Lists/VisibilityRadioGroup';
import type { List } from '@/lib/types';
import { updateListVisibilityAction } from '@/actions/lists';
import { useQueryModal } from '@/hooks/use-query-modal';
import { useDateFormatter } from '@/hooks/use-date-formatter';

type ListVisibility = List['visibility'];

interface ListOptionsDropdownProps {
  listId: string;
  canManage: boolean;
  initialVisibility: ListVisibility;
  authorName: string;
  updatedAt: string;
  inline?: boolean;
}

export default function ListOptionsDropdown({
  listId,
  canManage,
  initialVisibility,
  authorName,
  updatedAt,
  inline = false,
}: ListOptionsDropdownProps) {
  const router = useRouter();
  const formatDate = useDateFormatter();
  const date = useTranslations('date');
  const common = useTranslations('common');
  const queryModal = useQueryModal();
  const [isPending, startTransition] = useTransition();
  const [visibility, setVisibility] = useState<ListVisibility>(initialVisibility);
  const [error, setError] = useState<string | null>(null);

  const updatedLabel = useMemo(
    () => date('lastUpdated', { date: formatDate(updatedAt, 'short') }),
    [date, formatDate, updatedAt],
  );

  const handleEdit = () => {
    queryModal.openModal('edit-list', listId);
  };

  const handleArchive = useCallback(() => {
    queryModal.openModal('delete-list', listId);
  }, [listId, queryModal]);

  const handleVisibilityChange = (value: string) => {
    if (!canManage || isPending) return;

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
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem icon="edit" label={common('action.edit')} onSelect={handleEdit} />
          <DropdownItem
            icon="delete"
            destructive
            label={common('action.archive')}
            onSelect={handleArchive}
          />
          <DropdownSeparator />
          <VisibilityRadioGroup
            value={visibility}
            onValueChange={handleVisibilityChange}
          />
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
        onSelect={() =>
          void navigator.clipboard.writeText(`${window.location.origin}/lists/${listId}`)
        }
      />
      <DropdownSeparator />
      <DropdownText>
        <p className="text-small">{common('curatedByAuthor', { author: authorName })}</p>
        <p className="text-small">{updatedLabel}</p>
      </DropdownText>
    </DropdownMenu>
  );
}

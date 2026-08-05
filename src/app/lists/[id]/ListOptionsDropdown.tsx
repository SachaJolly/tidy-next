'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownText,
} from '@/components/Dropdown';
import VisibilityRadioGroup from '@/components/Lists/VisibilityRadioGroup';
import type { List } from '@/lib/types';
import { updateListVisibilityAction } from '@/app/actions/lists';
import { formatDate } from '@/lib/date';
import { useQueryModal } from '@/hooks/use-query-modal';

type ListVisibility = List['visibility'];

interface ListOptionsDropdownProps {
  listId: string;
  isAuthor: boolean;
  initialVisibility: ListVisibility;
  authorName: string;
  updatedAt: string;
  inline?: boolean;
}

export default function ListOptionsDropdown({
  listId,
  isAuthor,
  initialVisibility,
  authorName,
  updatedAt,
  inline = false,
}: ListOptionsDropdownProps) {
  const router = useRouter();
  const locale = useLocale();
  const date = useTranslations('date');
  const common = useTranslations('common');
  const queryModal = useQueryModal();
  const [isPending, startTransition] = useTransition();
  const [visibility, setVisibility] = useState<ListVisibility>(initialVisibility);
  const [error, setError] = useState<string | null>(null);

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

  const handleEdit = () => {
    queryModal.openModal('edit-list', listId);
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
    <DropdownMenu align="end" inline={inline}>
      {isAuthor ? (
        <>
          <DropdownItem icon="edit" label={common('action.edit')} onSelect={handleEdit} />
          <DropdownItem icon="delete" destructive label={common('action.archive')} />
          <DropdownSeparator />

          <DropdownLabel>{common('action.setVisibility')}</DropdownLabel>
          <VisibilityRadioGroup
            value={visibility}
            onValueChange={handleVisibilityChange}
            showLabel={false}
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

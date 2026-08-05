'use client';

import React, { useCallback, useState } from 'react';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Input from '@/components/Input/Input';
import Textarea from '@/components/Textarea/Textarea';
import { Dropdown, DropdownMenu } from '@/components/Dropdown';
import VisibilityRadioGroup from './VisibilityRadioGroup';
import Icon from '@/components/Icon/Icon';
import { createListAction, type ListMutationResult } from '@/app/actions/lists';
import type { List } from '@/lib/types';
import { useTranslations } from 'next-intl';

type ListFormProps = {
  action?: (values: { title: string; description: string; visibility?: string }) => Promise<ListMutationResult>;
  submitLabel?: string;
  cancelLabel?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialVisibility?: string;
  onCancel: () => void;
  onSuccess?: (list: List) => void;
};

/**
 * Shared list form body.
 *
 * The `action` prop lets future edit modals reuse the same UI while swapping
 * the server mutation underneath.
 */
export default function ListForm({
  action = createListAction,
  submitLabel,
  cancelLabel,
  initialTitle = '',
  initialDescription = '',
  initialVisibility = 'restricted',
  onCancel,
  onSuccess,
}: ListFormProps) {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const resolvedSubmitLabel = submitLabel ?? t('createList');
  const resolvedCancelLabel = cancelLabel ?? t('cancel');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] = useState<'published' | 'unindexed' | 'restricted'>(initialVisibility as 'published' | 'unindexed' | 'restricted');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const titleValue = title.trim();
      const descriptionValue = description.trim();

      if (!titleValue) {
        setError(t('titleRequired'));
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const result = await action({
          title: titleValue,
          description: descriptionValue,
          visibility,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.list) {
          throw new Error(t('didNotReturnList'));
        }

        onSuccess?.(result.list);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : t('creationFailed'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [action, description, onSuccess, title, visibility, t],
  );

  // Visibility dropdown options
  const visibilityOptions = [
    { value: 'published', label: tCommon('visibility.public.label'), caption: tCommon('visibility.public.caption'), icon: 'visibility_on' as const },
    { value: 'unindexed', label: tCommon('visibility.unindexed.label'), caption: tCommon('visibility.unindexed.caption'), icon: 'visibility_off' as const },
    { value: 'restricted', label: tCommon('visibility.private.label'), caption: tCommon('visibility.private.caption'), icon: 'private' as const },
  ];

  const currentVisibility = visibilityOptions.find(opt => opt.value === visibility);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        id="list-title"
        name="title"
        label={t('titleLabel')}
        placeholder={t('titlePlaceholder')}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        autoFocus={true}
        disabled={isSubmitting}
        required
      />

      <Textarea
        id="list-description"
        name="description"
        label={t('descriptionLabel')}
        placeholder={t('descriptionPlaceholder')}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={isSubmitting}
      />

      {error && (
        <p role="alert" style={{ color: 'var(--danger)', margin: 0 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Visibility dropdown in modal footer */}
        <Dropdown>
          <Button type="button" disabled={isSubmitting} transparent>
            {currentVisibility && <Icon name={currentVisibility.icon as any} size={16} />}
            {currentVisibility?.label}
          </Button>

          <DropdownMenu>
            <VisibilityRadioGroup value={visibility} onValueChange={setVisibility} />
          </DropdownMenu>
        </Dropdown>

        {/* Buttons */}
        <ButtonGroup>
          <Button
            type="button"
            label={resolvedCancelLabel}
            transparent
            onClick={onCancel}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            label={isSubmitting ? t('saving') : resolvedSubmitLabel}
            variant="interactive"
            disabled={isSubmitting}
          />
        </ButtonGroup>
      </div>
    </form>
  );
}

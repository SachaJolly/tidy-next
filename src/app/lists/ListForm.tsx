'use client';

import React, { useCallback, useState } from 'react';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Input from '@/components/Input/Input';
import Textarea from '@/components/Textarea/Textarea';
import { Dropdown, DropdownRadioGroup, DropdownRadioItem, DropdownLabel } from '@/components/Dropdown';
import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import { createListAction } from '@/app/actions/lists';
import type { List } from '@/lib/types';
import { useTranslations } from 'next-intl';

type ListFormProps = {
  action?: (values: { title: string; description: string; visibility?: string }) => Promise<{ list?: List; error?: string }>;
  submitLabel?: string;
  cancelLabel?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialVisibility?: string;
  onCancel: () => void;
  onSuccess?: (list: List) => void;
};

type VisibilityOption = {
  value: string;
  label: string;
  caption: string;
  icon: IconName;
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
  const [visibility, setVisibility] = useState(initialVisibility);
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
  const visibilityOptions: VisibilityOption[] = [
    { value: 'published', label: tCommon('visibility.public.label'), caption: tCommon('visibility.public.caption'), icon: 'public' },
    { value: 'unindexed', label: tCommon('visibility.unindexed.label'), caption: tCommon('visibility.unindexed.caption'), icon: 'visibility_off' },
    { value: 'restricted', label: tCommon('visibility.private.label'), caption: tCommon('visibility.private.caption'), icon: 'private' },
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
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              background: 'var(--surface-highlight)',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-interactive)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-body)',
              fontFamily: 'inherit',
            }}
            disabled={isSubmitting}
          >
            {currentVisibility && <Icon name={currentVisibility.icon} size={16} />}
            {currentVisibility?.label}
          </button>

          <DropdownRadioGroup value={visibility} onValueChange={setVisibility}>
            <DropdownLabel>{tCommon('action.setVisibility')}</DropdownLabel>
            {visibilityOptions.map(option => (
              <DropdownRadioItem key={option.value} value={option.value}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Icon name={option.icon} size={16} />
                    {option.label}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {option.caption}
                  </span>
                </div>
              </DropdownRadioItem>
            ))}
          </DropdownRadioGroup>
        </Dropdown>

        <ButtonGroup>
          <Button label={resolvedCancelLabel} variant="default" onClick={onCancel} disabled={isSubmitting} />
          <Button label={resolvedSubmitLabel} variant="interactive" type="submit" disabled={isSubmitting} />
        </ButtonGroup>
      </div>
    </form>
  );
}

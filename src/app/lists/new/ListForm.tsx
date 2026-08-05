'use client';

import React, { useCallback, useState } from 'react';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Input from '@/components/Input/Input';
import Textarea from '@/components/Textarea/Textarea';
import { Dropdown, DropdownRadioGroup, DropdownRadioItem, DropdownLabel } from '@/components/Dropdown';
import Icon from '@/components/Icon/Icon';
import { createListAction, type ListMutationResult } from '@/app/actions/lists';
import type { List } from '@/lib/types';
import { useTranslations } from 'next-intl';

type ListFormProps = {
  onCancel: () => void;
  onSuccess?: (list: List) => void;
};

export default function ListForm({ onCancel, onSuccess }: ListFormProps) {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('restricted');
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
        const result = await createListAction({
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
    [description, onSuccess, title, visibility, t],
  );

  const visibilityOptions = [
    { value: 'published', label: tCommon('visibility.public.label'), caption: tCommon('visibility.public.caption'), icon: 'globe' },
    { value: 'unindexed', label: tCommon('visibility.unindexed.label'), caption: tCommon('visibility.unindexed.caption'), icon: 'eye-off' },
    { value: 'restricted', label: tCommon('visibility.private.label'), caption: tCommon('visibility.private.caption'), icon: 'lock' },
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
            {currentVisibility && <Icon name={currentVisibility.icon as any} size={16} />}
            {currentVisibility?.label}
          </button>

          <DropdownRadioGroup value={visibility} onValueChange={setVisibility}>
            <DropdownLabel>{tCommon('action.setVisibility')}</DropdownLabel>
            {visibilityOptions.map(option => (
              <DropdownRadioItem key={option.value} value={option.value}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Icon name={option.icon as any} size={16} />
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
          <Button type="button" transparent={true} onClick={onCancel} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="interactive" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('createList')}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  );
}

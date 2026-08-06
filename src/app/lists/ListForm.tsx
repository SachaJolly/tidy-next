'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { Dropdown, DropdownMenu } from '@/components/Dropdown';
import FormField from '@/components/FormField/FormField';
import type { IconName } from '@/components/Icon/icons';
import Input from '@/components/Input/Input';
import VisibilityRadioGroup from '@/components/Lists/VisibilityRadioGroup';
import { ModalHeader, ModalFooter } from '@/components/Modal/Modal';
import Textarea from '@/components/Textarea/Textarea';
import { createListAction } from '@/actions/lists';
import type { List } from '@/lib/types';
import {ModalFormFields} from "@/components/Modal/ModalFormFields";

type ListFormProps = {
  title: string;
  action?: (values: {
    title: string;
    description: string;
    visibility?: string;
  }) => Promise<{ list?: List; error?: string }>;
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

function normalizeVisibility(value: string): 'published' | 'unindexed' | 'restricted' {
  const mapping: Record<string, 'published' | 'unindexed' | 'restricted'> = {
    PUBLIC: 'published',
    published: 'published',
    UNINDEXED: 'unindexed',
    unindexed: 'unindexed',
    PRIVATE: 'restricted',
    restricted: 'restricted',
  };

  return mapping[value] || 'restricted';
}

export default function ListForm({
  title,
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
  const resolvedCancelLabel = cancelLabel ?? t('discard');

  const [formTitle, setFormTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] = useState<'published' | 'unindexed' | 'restricted'>(
    normalizeVisibility(initialVisibility),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormTitle(initialTitle);
    setDescription(initialDescription);
    setVisibility(normalizeVisibility(initialVisibility));
    setError(null);
  }, [initialTitle, initialDescription, initialVisibility]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const titleValue = formTitle.trim();
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
    [action, description, formTitle, onSuccess, t, visibility],
  );

  const visibilityOptions: VisibilityOption[] = [
    {
      value: 'published',
      label: tCommon('visibility.public.label'),
      caption: tCommon('visibility.public.caption'),
      icon: 'public',
    },
    {
      value: 'unindexed',
      label: tCommon('visibility.unindexed.label'),
      caption: tCommon('visibility.unindexed.caption'),
      icon: 'visibility_off',
    },
    {
      value: 'restricted',
      label: tCommon('visibility.private.label'),
      caption: tCommon('visibility.private.caption'),
      icon: 'private',
    },
  ];

  const currentVisibility = visibilityOptions.find((opt) => opt.value === visibility);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <ModalHeader title={title} />
      <ModalFormFields>
        <FormField label={t('titleLabel')} htmlFor="list-title">
          <Input
            id="list-title"
            name="title"
            placeholder={t('titlePlaceholder')}
            value={formTitle}
            onChange={(event) => setFormTitle(event.target.value)}
            autoFocus={true}
            disabled={isSubmitting}
            required
          />
        </FormField>

        <FormField label={t('descriptionLabel')} htmlFor="list-description">
          <Textarea
            id="list-description"
            name="description"
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
          />
        </FormField>

        {error && (
          <p role="alert" style={{ color: 'var(--danger)', margin: 0 }}>
            {error}
          </p>
        )}
      </ModalFormFields>
      <ModalFooter justify="space-between">
        <Dropdown>
          <Button
            type="button"
            icon={currentVisibility?.icon}
            label={currentVisibility?.label}
            hasDropdown
            disabled={isSubmitting}
            transparent
          />
          <DropdownMenu>
            <VisibilityRadioGroup
              value={visibility}
              onValueChange={(val) =>
                setVisibility(val as 'published' | 'unindexed' | 'restricted')
              }
            />
          </DropdownMenu>
        </Dropdown>

        <ButtonGroup>
          <Button
            type="button"
            label={resolvedCancelLabel}
            variant="default"
            onClick={onCancel}
            disabled={isSubmitting}
          />
          <Button
            label={resolvedSubmitLabel}
            variant="interactive"
            type="submit"
            disabled={isSubmitting}
          />
        </ButtonGroup>
      </ModalFooter>
    </form>
  );
}

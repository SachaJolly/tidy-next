"use client";

import React, { useCallback, useState } from 'react';
import Button from '@/components/button/button';
import ButtonGroup from '@/components/button-group/button-group';
import Input from '@/components/input/input';
import Textarea from '@/components/textarea/textarea';
import { createListAction, type ListMutationResult } from '@/app/actions/lists';
import type { List } from '@/lib/types';
import { useTranslations } from 'next-intl';

type ListFormProps = {
  action?: (values: { title: string; description: string }) => Promise<ListMutationResult>;
  submitLabel?: string;
  cancelLabel?: string;
  initialTitle?: string;
  initialDescription?: string;
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
  onCancel,
  onSuccess,
}: ListFormProps) {
  const t = useTranslations('forms');
  const resolvedSubmitLabel = submitLabel ?? t('createList');
  const resolvedCancelLabel = cancelLabel ?? t('cancel');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
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
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.list) {
        throw new Error(t('didNotReturnList'));
      }

      onSuccess?.(result.list);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
        : t('creationFailed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [action, description, onSuccess, title, t]);

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

      {error && <p role="alert" style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}

      <ButtonGroup className="ml-auto">
        <Button type="button" transparent={true} onClick={onCancel} disabled={isSubmitting}>
          {resolvedCancelLabel}
        </Button>
        <Button type="submit" variant="interactive" disabled={isSubmitting}>
          {isSubmitting ? t('saving') : resolvedSubmitLabel}
        </Button>
      </ButtonGroup>
    </form>
  );
}

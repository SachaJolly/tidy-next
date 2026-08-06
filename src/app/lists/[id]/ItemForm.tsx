'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';
import { ModalFooter, ModalHeader } from '@/components/Modal/Modal';
import { ModalFormFields } from '@/components/Modal/ModalFormFields';
import Textarea from '@/components/Textarea/Textarea';
import type { Item } from '@/lib/types';

type ItemFormProps = {
  title: string;
  action: (values: { title: string; caption: string; url: string }) => Promise<{
    item?: Item;
    error?: string;
  }>;
  submitLabel: string;
  onCancel: () => void;
  onSuccess: (item: Item) => void;
  initialTitle?: string;
  initialCaption?: string;
  initialUrl?: string;
};

export default function ItemForm({
  title,
  action,
  submitLabel,
  onCancel,
  onSuccess,
  initialTitle = '',
  initialCaption = '',
  initialUrl = '',
}: ItemFormProps) {
  const t = useTranslations('forms');
  const [itemTitle, setItemTitle] = useState(initialTitle);
  const [caption, setCaption] = useState(initialCaption);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setItemTitle(initialTitle);
    setCaption(initialCaption);
    setUrl(initialUrl);
    setError(null);
  }, [initialCaption, initialTitle, initialUrl]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const titleValue = itemTitle.trim();
      const captionValue = caption.trim();
      const urlValue = url.trim();

      if (!titleValue) {
        setError(t('item.titleRequired'));
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const result = await action({
          title: titleValue,
          caption: captionValue,
          url: urlValue,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.item) {
          throw new Error(t('item.didNotReturnItem'));
        }

        onSuccess(result.item);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : t('item.saveFailed'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [action, caption, itemTitle, onSuccess, t, url],
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <ModalHeader title={title} />
      <ModalFormFields>
        <FormField label={t('item.titleLabel')} htmlFor="item-title">
          <Input
            id="item-title"
            name="title"
            placeholder={t('item.titlePlaceholder')}
            value={itemTitle}
            onChange={(event) => setItemTitle(event.target.value)}
            autoFocus={true}
            disabled={isSubmitting}
            required
          />
        </FormField>

        <FormField label={t('item.urlLabel')} htmlFor="item-url">
          <Input
            id="item-url"
            name="url"
            placeholder={t('item.urlPlaceholder')}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label={t('item.captionLabel')} htmlFor="item-caption">
          <Textarea
            id="item-caption"
            name="caption"
            placeholder={t('item.captionPlaceholder')}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            disabled={isSubmitting}
          />
        </FormField>

        {error ? (
          <p role="alert" style={{ color: 'var(--danger)', margin: 0 }}>
            {error}
          </p>
        ) : null}
      </ModalFormFields>
      <ModalFooter>
        <ButtonGroup>
          <Button
            type="button"
            label={t('cancel')}
            variant="default"
            onClick={onCancel}
            disabled={isSubmitting}
          />
          <Button label={submitLabel} variant="interactive" type="submit" disabled={isSubmitting} />
        </ButtonGroup>
      </ModalFooter>
    </form>
  );
}

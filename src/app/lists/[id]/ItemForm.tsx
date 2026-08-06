'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import FormField from '@/components/FormField/FormField';
import { Item as ItemPreviewCard } from '@/components/Item/Item';
import { ModalFooter, ModalHeader } from '@/components/Modal/Modal';
import { ModalFormFields } from '@/components/Modal/ModalFormFields';
import Textarea from '@/components/Textarea/Textarea';
import type { Item as ItemType } from '@/lib/types';

const LEADING_URL_REGEX = /^(https?:\/\/[^\s]+)([\s\S]*)$/;

type ItemFormProps = {
  title: string;
  action: (values: {
    body: string;
    display_mode: 'text' | 'link' | 'bookmark' | 'embed';
    url?: string;
  }) => Promise<{
    item?: ItemType;
    error?: string;
  }>;
  submitLabel: string;
  onCancel: () => void;
  onSuccess: (item: ItemType) => void;
  initialBody?: string;
  initialExtractedUrl?: string | null;
  initialDisplayMode?: ItemType['display_mode'];
  showPreview?: boolean;
  listId?: string;
  initialMetadata?: ItemType['metadata'];
  initialStats?: ItemType['stats'];
  initialItemId?: ItemType['id'];
};

export default function ItemForm({
  title,
  action,
  submitLabel,
  onCancel,
  onSuccess,
  initialBody = '',
  initialExtractedUrl = null,
  initialDisplayMode = 'text',
  showPreview = false,
  listId,
  initialMetadata = {},
  initialStats = { views: 0, likes: 0, comments: 0 },
  initialItemId = 'preview-item',
}: ItemFormProps) {
  const t = useTranslations('forms');
  const [markdownBody, setMarkdownBody] = useState<string>(initialBody);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(initialExtractedUrl);
  const [urlDisplayMode, setUrlDisplayMode] = useState<'link' | 'bookmark' | 'embed'>(
    initialDisplayMode === 'link' || initialDisplayMode === 'embed' || initialDisplayMode === 'bookmark'
      ? initialDisplayMode
      : 'bookmark',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyParsedText = useCallback((rawText: string) => {
    const match = rawText.match(LEADING_URL_REGEX);

    if (!match) {
      setMarkdownBody(rawText);
      return false;
    }

    const url = match[1];
    const remainingBody = match[2].replace(/^\s+/, '');

    setExtractedUrl(url);
    setMarkdownBody(remainingBody);
    return true;
  }, []);

  const resizeTextarea = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  // Sync initial values when props change (e.g., when editing a different item)
  useEffect(() => {
    setMarkdownBody(initialBody);
    setExtractedUrl(initialExtractedUrl);
    setUrlDisplayMode(
      initialDisplayMode === 'link' ||
        initialDisplayMode === 'embed' ||
        initialDisplayMode === 'bookmark'
        ? initialDisplayMode
        : 'bookmark',
    );
    setError(null);
  }, [initialBody, initialDisplayMode, initialExtractedUrl]);

  useEffect(() => {
    const textarea = document.getElementById('item-body');
    if (!(textarea instanceof HTMLTextAreaElement)) {
      return;
    }

    resizeTextarea(textarea);
  }, [markdownBody, resizeTextarea]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      void applyParsedText(event.currentTarget.value);
    },
    [applyParsedText],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = event.clipboardData.getData('text');
      const field = event.currentTarget;
      const selectionStart = field.selectionStart ?? 0;
      const selectionEnd = field.selectionEnd ?? 0;
      if (selectionStart !== 0) {
        return;
      }
      const nextValue =
        field.value.slice(0, selectionStart) + pastedText + field.value.slice(selectionEnd);

      const match = nextValue.match(LEADING_URL_REGEX);
      if (!match) {
        return;
      }

      event.preventDefault();
      void applyParsedText(nextValue);
    },
    [applyParsedText],
  );

  const previewItem = showPreview && listId
    ? ({
        id: initialItemId,
        body: markdownBody,
        url: extractedUrl,
        display_mode: extractedUrl ? urlDisplayMode : 'text',
        metadata: {
          ...initialMetadata,
          ...(extractedUrl ? { url: extractedUrl } : {}),
        },
        stats: initialStats,
      } satisfies ItemType)
    : null;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedMarkdownBody = markdownBody.trim();

      if (!trimmedMarkdownBody && !extractedUrl) {
        setError(t('item.bodyOrUrlRequired'));
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const result = await action(
          extractedUrl
            ? {
                url: extractedUrl,
                display_mode: urlDisplayMode,
                body: trimmedMarkdownBody,
              }
            : {
                display_mode: 'text',
                body: trimmedMarkdownBody,
              },
        );

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
    [action, markdownBody, extractedUrl, onSuccess, t, urlDisplayMode],
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <ModalHeader title={title} />
      <ModalFormFields>
        {previewItem && (
          <FormField label={t('item.previewLabel')}>
            <ItemPreviewCard item={previewItem} listId={String(listId)} canManage={false} />
          </FormField>
        )}
        {extractedUrl && (
          <FormField label={t('item.extractedUrlLabel')}>
            <p style={{ margin: 0, wordBreak: 'break-all' }}>{extractedUrl}</p>
          </FormField>
        )}
        {extractedUrl && (
          <FormField label={t('item.displayModeLabel')}>
            <ButtonGroup>
              <Button
                type="button"
                label={t('item.displayModes.link')}
                variant={urlDisplayMode === 'link' ? 'interactive' : 'default'}
                onClick={() => setUrlDisplayMode('link')}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                label={t('item.displayModes.bookmark')}
                variant={urlDisplayMode === 'bookmark' ? 'interactive' : 'default'}
                onClick={() => setUrlDisplayMode('bookmark')}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                label={t('item.displayModes.embed')}
                variant={urlDisplayMode === 'embed' ? 'interactive' : 'default'}
                onClick={() => setUrlDisplayMode('embed')}
                disabled={isSubmitting}
              />
            </ButtonGroup>
          </FormField>
        )}
        <FormField label={t('item.bodyLabel')} htmlFor="item-body">
          <Textarea
            id="item-body"
            name="body"
            placeholder={t('item.bodyPlaceholder')}
            value={markdownBody}
            onChange={handleInputChange}
            onPaste={handlePaste}
            autoFocus={true}
            disabled={isSubmitting}
            rows={1}
            style={{ overflow: 'hidden', resize: 'none' }}
          />
        </FormField>

        {error ? (
          <p role="alert" className="text-danger">
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

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { OpenGraphMetadata } from '@/actions/fetch-opengraph';
import { fetchOpenGraphAction } from '@/actions/fetch-opengraph';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import FormField from '@/components/FormField/FormField';
import { ModalFooter, ModalHeader } from '@/components/Modal/Modal';
import { ModalFormFields } from '@/components/Modal/ModalFormFields';
import Textarea from '@/components/Textarea/Textarea';
import { getResolvedDisplayMode } from '@/lib/item-display-mode';
import type { Item as ItemType } from '@/lib/types';

import LinkPreview from './LinkPreview/LinkPreview';

const LEADING_URL_DRAFT_REGEX = /^(https?:\/\/[^\s]*)([\s\S]*)$/;
const EMPTY_METADATA: ItemType['metadata'] = {};
const URL_DEBOUNCE_MS = 2000;

function toInitialLinkMetadata(
  initialUrl: string | null,
  initialMetadata: ItemType['metadata'],
): OpenGraphMetadata | null {
  if (!initialUrl) {
    return null;
  }

  return {
    url: initialUrl,
    title: typeof initialMetadata?.title === 'string' ? initialMetadata.title : undefined,
    description:
      typeof initialMetadata?.description === 'string' ? initialMetadata.description : undefined,
    image: typeof initialMetadata?.image === 'string' ? initialMetadata.image : undefined,
    favicon: typeof initialMetadata?.favicon === 'string' ? initialMetadata.favicon : undefined,
    siteName: typeof initialMetadata?.siteName === 'string' ? initialMetadata.siteName : undefined,
    embed: typeof initialMetadata?.embed === 'string' ? initialMetadata.embed : undefined,
  };
}

function isCompleteHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') {
      return false;
    }

    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(parsed.hostname)) {
      return false;
    }

    return /\.[a-z]{2,}$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

type ItemFormProps = {
  title: string;
  action: (values: {
    body: string;
    display_mode: 'text' | 'link' | 'bookmark' | 'embed';
    url?: string;
    metadata?: ItemType['metadata'];
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
  initialMetadata?: ItemType['metadata'];
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
  initialMetadata = EMPTY_METADATA,
}: ItemFormProps) {
  const t = useTranslations('forms');
  const linkPreviewFetchFailedLabel = t('item.linkPreviewFetchFailed');
  const [markdownBody, setMarkdownBody] = useState<string>(initialBody);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(initialExtractedUrl);
  const [urlDisplayMode, setUrlDisplayMode] = useState<'link' | 'bookmark' | 'embed'>(
    initialDisplayMode === 'link' ||
      initialDisplayMode === 'embed' ||
      initialDisplayMode === 'bookmark'
      ? initialDisplayMode
      : 'bookmark',
  );
  const [linkMetadata, setLinkMetadata] = useState<OpenGraphMetadata | null>(
    toInitialLinkMetadata(initialExtractedUrl, initialMetadata),
  );
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [urlDraft, setUrlDraft] = useState<{ token: string; remainingBody: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metadataRefreshKey, setMetadataRefreshKey] = useState(0);
  const resolvedMetadataUrlRef = useRef<string | null>(null);
  const suppressedAutoPreviewUrlRef = useRef<string | null>(null);
  const lastHandledRefreshKeyRef = useRef(0);
  const lastSyncedInitialRef = useRef<{
    body: string;
    url: string | null;
    displayMode: ItemType['display_mode'];
  } | null>(null);
  const initialMetadataTitle =
    typeof initialMetadata?.title === 'string' ? initialMetadata.title : '';
  const initialMetadataDescription =
    typeof initialMetadata?.description === 'string' ? initialMetadata.description : '';
  const initialMetadataImage =
    typeof initialMetadata?.image === 'string' ? initialMetadata.image : '';
  const initialMetadataFavicon =
    typeof initialMetadata?.favicon === 'string' ? initialMetadata.favicon : '';
  const initialMetadataSiteName =
    typeof initialMetadata?.siteName === 'string' ? initialMetadata.siteName : '';
  const initialMetadataEmbed =
    typeof initialMetadata?.embed === 'string' ? initialMetadata.embed : '';

  const resizeTextarea = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  // Sync initial values when props change (e.g., when editing a different item)
  useEffect(() => {
    const hasSameCoreInitialValues =
      lastSyncedInitialRef.current?.body === initialBody &&
      lastSyncedInitialRef.current?.url === initialExtractedUrl &&
      lastSyncedInitialRef.current?.displayMode === initialDisplayMode;

    // Prevent accidental state rollback when parent re-renders with unchanged item core data.
    if (hasSameCoreInitialValues) {
      return;
    }

    setMarkdownBody(initialBody);
    setExtractedUrl(initialExtractedUrl);
    setUrlDisplayMode(
      initialDisplayMode === 'link' ||
        initialDisplayMode === 'embed' ||
        initialDisplayMode === 'bookmark'
        ? initialDisplayMode
        : 'bookmark',
    );
    setLinkMetadata(
      initialExtractedUrl
        ? {
            url: initialExtractedUrl,
            title: initialMetadataTitle || undefined,
            description: initialMetadataDescription || undefined,
            image: initialMetadataImage || undefined,
            favicon: initialMetadataFavicon || undefined,
            siteName: initialMetadataSiteName || undefined,
            embed: initialMetadataEmbed || undefined,
          }
        : null,
    );
    setMetadataError(null);
    setIsFetchingMetadata(false);
    setUrlDraft(null);
    resolvedMetadataUrlRef.current = initialExtractedUrl;
    suppressedAutoPreviewUrlRef.current = null;
    lastHandledRefreshKeyRef.current = 0;
    setMetadataRefreshKey(0);
    setError(null);
    lastSyncedInitialRef.current = {
      body: initialBody,
      url: initialExtractedUrl,
      displayMode: initialDisplayMode,
    };
  }, [
    initialBody,
    initialDisplayMode,
    initialExtractedUrl,
    initialMetadataDescription,
    initialMetadataEmbed,
    initialMetadataFavicon,
    initialMetadataImage,
    initialMetadataSiteName,
    initialMetadataTitle,
  ]);

  useEffect(() => {
    if (extractedUrl) {
      setUrlDraft(null);
      return;
    }

    const match = markdownBody.match(LEADING_URL_DRAFT_REGEX);
    if (!match) {
      setUrlDraft(null);
      return;
    }

    const token = match[1];
    const remainingBody = match[2].replace(/^\s+/, '');

    if (suppressedAutoPreviewUrlRef.current && token === suppressedAutoPreviewUrlRef.current) {
      setUrlDraft(null);
      return;
    }

    if (suppressedAutoPreviewUrlRef.current && token !== suppressedAutoPreviewUrlRef.current) {
      suppressedAutoPreviewUrlRef.current = null;
    }

    setUrlDraft({ token, remainingBody });
  }, [extractedUrl, markdownBody]);

  useEffect(() => {
    if (!urlDraft) {
      return;
    }

    if (!isCompleteHttpsUrl(urlDraft.token)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setExtractedUrl(urlDraft.token);
      setMarkdownBody(urlDraft.remainingBody);
      setUrlDraft(null);
    }, URL_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [urlDraft]);

  useEffect(() => {
    if (!extractedUrl) {
      setLinkMetadata(null);
      setMetadataError(null);
      setIsFetchingMetadata(false);
      resolvedMetadataUrlRef.current = null;
      return;
    }

    const isForcedRefresh = metadataRefreshKey !== lastHandledRefreshKeyRef.current;
    if (isForcedRefresh) {
      lastHandledRefreshKeyRef.current = metadataRefreshKey;
    }

    if (resolvedMetadataUrlRef.current === extractedUrl && !isForcedRefresh) {
      return;
    }

    let isStale = false;
    setIsFetchingMetadata(true);
    setMetadataError(null);

    void fetchOpenGraphAction(extractedUrl)
      .then((result) => {
        if (isStale) {
          return;
        }

        if (result.error) {
          setMetadataError(result.error);
          resolvedMetadataUrlRef.current = extractedUrl;
          setLinkMetadata((current) =>
            current?.url === extractedUrl
              ? current
              : {
                  url: extractedUrl,
                },
          );
          return;
        }

        setLinkMetadata(
          result.metadata ?? {
            url: extractedUrl,
          },
        );
        resolvedMetadataUrlRef.current = extractedUrl;
      })
      .catch(() => {
        if (isStale) {
          return;
        }

        setMetadataError(linkPreviewFetchFailedLabel);
        resolvedMetadataUrlRef.current = extractedUrl;
      })
      .finally(() => {
        if (isStale) {
          return;
        }

        setIsFetchingMetadata(false);
      });

    return () => {
      isStale = true;
    };
  }, [extractedUrl, linkPreviewFetchFailedLabel, metadataRefreshKey]);

  useEffect(() => {
    if (!extractedUrl || isFetchingMetadata) {
      return;
    }

    const resolvedMode = getResolvedDisplayMode(urlDisplayMode, linkMetadata);
    if (resolvedMode !== urlDisplayMode) {
      setUrlDisplayMode(resolvedMode);
    }
  }, [extractedUrl, isFetchingMetadata, linkMetadata, urlDisplayMode]);

  useEffect(() => {
    const textarea = document.getElementById('item-body');
    if (!(textarea instanceof HTMLTextAreaElement)) {
      return;
    }

    resizeTextarea(textarea);
  }, [markdownBody, resizeTextarea]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownBody(event.currentTarget.value);
  }, []);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!suppressedAutoPreviewUrlRef.current) {
      return;
    }

    const pastedText = event.clipboardData.getData('text').trim();
    const selectionStart = event.currentTarget.selectionStart ?? 0;
    if (selectionStart !== 0) {
      return;
    }

    if (pastedText.startsWith('https://')) {
      suppressedAutoPreviewUrlRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!markdownBody.trim() && !extractedUrl) {
        setError(t('item.bodyOrUrlRequired'));
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const metadataPayload = extractedUrl
          ? ({
              ...initialMetadata,
              ...linkMetadata,
              url: extractedUrl,
            } satisfies ItemType['metadata'])
          : undefined;

        const result = await action(
          extractedUrl
            ? {
                url: extractedUrl,
                display_mode: urlDisplayMode,
                body: markdownBody,
                metadata: metadataPayload,
              }
            : {
                display_mode: 'text',
                body: markdownBody,
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
    [
      action,
      extractedUrl,
      initialMetadata,
      linkMetadata,
      markdownBody,
      onSuccess,
      t,
      urlDisplayMode,
    ],
  );

  const handleRemovePreview = useCallback(() => {
    const removedUrl = extractedUrl ?? urlDraft?.token;
    if (!removedUrl) {
      return;
    }

    setExtractedUrl(null);
    setLinkMetadata(null);
    setMetadataError(null);
    setIsFetchingMetadata(false);
    if (extractedUrl) {
      setUrlDraft(null);
      setMarkdownBody((currentBody) => `${removedUrl}${currentBody ? ` ${currentBody}` : ''}`);
    } else if (urlDraft) {
      setUrlDraft(null);
      setMarkdownBody(urlDraft.remainingBody);
    }
    suppressedAutoPreviewUrlRef.current = removedUrl;
    resolvedMetadataUrlRef.current = null;
  }, [extractedUrl, urlDraft]);

  const handleRefreshPreview = useCallback(() => {
    if (!extractedUrl || isFetchingMetadata) {
      return;
    }

    resolvedMetadataUrlRef.current = null;
    setMetadataError(null);
    setMetadataRefreshKey((value) => value + 1);
  }, [extractedUrl, isFetchingMetadata]);

  const previewUrl = extractedUrl ?? urlDraft?.token ?? null;
  const isPreviewLoading = isFetchingMetadata || (!!urlDraft && !extractedUrl);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <ModalHeader title={title} />
      <ModalFormFields>
        {previewUrl && (
          <LinkPreview
            url={previewUrl}
            metadata={extractedUrl ? linkMetadata : null}
            displayMode={urlDisplayMode}
            onDisplayModeChange={setUrlDisplayMode}
            isLoading={isPreviewLoading}
            error={extractedUrl ? metadataError : null}
            onRemovePreview={handleRemovePreview}
            onRefreshPreview={handleRefreshPreview}
            labels={{
              link: t('item.displayModes.link'),
              bookmark: t('item.displayModes.bookmark'),
              embed: t('item.displayModes.embed'),
              refreshPreview: t('item.refreshPreview'),
              removePreview: t('item.removePreview'),
              fallbackTitle: t('item.linkPreviewFallbackTitle'),
            }}
            disabled={isSubmitting}
          />
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

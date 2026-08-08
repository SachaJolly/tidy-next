'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { fetchLinkMetadataAction } from '@/actions/fetch-link-metadata';
import type { LinkMetadata } from '@/actions/fetch-link-metadata';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import FormField from '@/components/FormField/FormField';
import { ModalFooter, ModalHeader } from '@/components/Modal/Modal';
import { ModalFormFields } from '@/components/Modal/ModalFormFields';
import Textarea from '@/components/Textarea/Textarea';
import { getResolvedDisplayMode } from '@/lib/item-display-mode';
import type { Item as ItemType } from '@/lib/types';

import LinkPreview from './LinkPreview/LinkPreview';
import type { LinkPreviewLabels } from './LinkPreview/LinkPreview';

const LEADING_URL_DRAFT_REGEX = /^(https?:\/\/[^\s]*)([\s\S]*)$/;
const EMPTY_METADATA: ItemType['metadata'] = {};
const URL_DEBOUNCE_MS = 2000;

function toInitialLinkMetadata(
  initialUrl: string | null,
  initialMetadata: ItemType['metadata'],
): LinkMetadata | null {
  if (!initialUrl) {
    return null;
  }

  // Helper guards: we never trust the DB shape blindly since metadata is
  // stored as Record<string, any>. Each field is validated before use so
  // a corrupt/legacy value can never silently corrupt the form state.
  const asString = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim().length > 0 ? v : undefined;

  const asStringArray = (v: unknown): string[] | undefined => {
    if (!Array.isArray(v)) {
      return undefined;
    }

    const filtered = v.filter((x): x is string => typeof x === 'string');
    return filtered.length > 0 ? filtered : undefined;
  };

  return {
    url: initialUrl,
    // Core card fields
    title: asString(initialMetadata?.title),
    description: asString(initialMetadata?.description),
    image: asString(initialMetadata?.image),
    images: asStringArray(initialMetadata?.images),
    imageAlt: asString(initialMetadata?.imageAlt),
    favicon: asString(initialMetadata?.favicon),
    siteName: asString(initialMetadata?.siteName),
    author: asString(initialMetadata?.author),
    // Embed and video fields
    embed: asString(initialMetadata?.embed),
    videoUrl: asString(initialMetadata?.videoUrl),
    videoUrls: asStringArray(initialMetadata?.videoUrls),
    videoType: asString(initialMetadata?.videoType),
    // Provider and source tracking
    provider: asString(initialMetadata?.provider) as LinkMetadata['provider'],
    metadataSource: asString(initialMetadata?.metadataSource) as LinkMetadata['metadataSource'],
    // Canonical and article fields
    canonicalUrl: asString(initialMetadata?.canonicalUrl),
    publishedTime: asString(initialMetadata?.publishedTime),
    modifiedTime: asString(initialMetadata?.modifiedTime),
    // Auxiliary fields
    type: asString(initialMetadata?.type),
    locale: asString(initialMetadata?.locale),
    language: asString(initialMetadata?.language),
    keywords: asString(initialMetadata?.keywords),
    twitterCard: asString(initialMetadata?.twitterCard),
    twitterSite: asString(initialMetadata?.twitterSite),
    twitterCreator: asString(initialMetadata?.twitterCreator),
    jsonLdType: asString(initialMetadata?.jsonLdType),
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
    // `null` (not `undefined`) so a text-only item explicitly clears any previously
    // extracted URL server-side — this matches ItemFormPayload in @/actions/items.
    url: string | null;
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
  const [linkMetadata, setLinkMetadata] = useState<LinkMetadata | null>(
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

  // Stable ref to the latest initialMetadata object. We use a ref (not state)
  // so the sync useEffect below can read the current metadata at run-time without
  // adding initialMetadata (a Record<string, any> that changes reference on every
  // parent render) to its dependency array — which would cause infinite re-renders.
  const initialMetadataRef = useRef(initialMetadata);
  initialMetadataRef.current = initialMetadata;

  const resizeTextarea = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  const focusTextarea = useCallback((cursorPosition?: number) => {
    const textarea = document.getElementById('item-body');
    if (!(textarea instanceof HTMLTextAreaElement)) {
      return;
    }

    textarea.focus();
    if (cursorPosition !== undefined) {
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, []);

  // Sync initial values when props change (e.g., when editing a different item).
  // We guard against unnecessary re-syncs by comparing the three "core identity"
  // fields (body, url, displayMode) that actually signal a new item being loaded.
  // initialMetadata is read from the ref so it's always current without needing
  // to be in the dependency array.
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
    // toInitialLinkMetadata reads the ref value so all fields (including author,
    // provider, canonicalUrl, etc.) are restored, not just the original subset.
    setLinkMetadata(toInitialLinkMetadata(initialExtractedUrl, initialMetadataRef.current));
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
  }, [initialBody, initialDisplayMode, initialExtractedUrl]);

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

    void fetchLinkMetadataAction(extractedUrl)
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
                url: null,
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

    // Restore keyboard flow to the body field so the user can immediately edit
    // the text that remains after removing the preview block.
    requestAnimationFrame(() => {
      focusTextarea(extractedUrl ? removedUrl.length : 0);
    });
  }, [extractedUrl, focusTextarea, urlDraft]);

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

  // LinkPreview is memoised, so the label bag has to keep a stable identity — an inline
  // object literal would invalidate the memo on every keystroke and defeat the point.
  const previewLabels = useMemo<LinkPreviewLabels>(
    () => ({
      link: t('item.displayModes.link'),
      bookmark: t('item.displayModes.bookmark'),
      embed: t('item.displayModes.embed'),
      refreshPreview: t('item.refreshPreview'),
      removePreview: t('item.removePreview'),
      fallbackTitle: t('item.linkPreviewFallbackTitle'),
      hint: t('item.linkPreviewHint'),
    }),
    [t],
  );

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
            labels={previewLabels}
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

'use client';

import React, { memo, useMemo } from 'react';

import type { OpenGraphMetadata } from '@/actions/fetch-opengraph';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import ItemLink from '@/components/ItemLink/ItemLink';
import ItemLinkSkeleton from '@/components/ItemLink/ItemLink.skeleton';
import type { ItemLinkDisplayMode, ItemLinkMetadata } from '@/components/ItemLink/ItemLink.types';
import Notice from '@/components/Notice/Notice';
import { getResolvedDisplayMode, isDisplayModeAvailable } from '@/lib/item-display-mode';

import styles from './LinkPreview.module.scss';

const DISPLAY_MODES: readonly ItemLinkDisplayMode[] = ['link', 'bookmark', 'embed'];

type LinkPreviewMetadata = OpenGraphMetadata & {
  // Stored for future rich providers (YouTube, Spotify, etc.).
  embed?: string;
};

export type LinkPreviewLabels = {
  link: string;
  bookmark: string;
  embed: string;
  refreshPreview: string;
  removePreview: string;
  fallbackTitle: string;
  hint: string;
};

type LinkPreviewProps = {
  url: string;
  metadata: LinkPreviewMetadata | null;
  displayMode: ItemLinkDisplayMode;
  onDisplayModeChange: (mode: ItemLinkDisplayMode) => void;
  isLoading: boolean;
  error: string | null;
  onRemovePreview: () => void;
  onRefreshPreview: () => void;
  labels: LinkPreviewLabels;
  disabled?: boolean;
};

function readHost(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function LinkPreview({
  url,
  metadata,
  displayMode,
  onDisplayModeChange,
  isLoading,
  error,
  onRemovePreview,
  onRefreshPreview,
  labels,
  disabled = false,
}: LinkPreviewProps) {
  const resolvedDisplayMode = getResolvedDisplayMode(displayMode, metadata);

  // The parent form re-renders on every keystroke in the body textarea. `ItemLink` reads
  // this object directly, so rebuilding it each time would push a new reference through the
  // whole preview subtree — including the embed, whose iframe we work hard to keep mounted.
  // Deriving it once per actual metadata change keeps the preview stable while typing.
  const linkMetadata = useMemo<ItemLinkMetadata>(
    () => ({
      title: metadata?.title?.trim() || labels.fallbackTitle,
      description: metadata?.description,
      favicon: metadata?.favicon,
      image: metadata?.image,
      images: metadata?.images,
      siteName: metadata?.siteName,
      // The URL is the only place a host can come from here; ItemLink falls back to it
      // whenever the page exposes no site name.
      host: readHost(url),
      author: metadata?.author,
      embed: metadata?.embed,
      videoUrl: metadata?.videoUrl,
      videoUrls: metadata?.videoUrls,
      videoType: metadata?.videoType,
    }),
    [labels.fallbackTitle, metadata, url],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ButtonGroup>
          {DISPLAY_MODES.map((mode) => (
            <Button
              key={mode}
              type="button"
              label={labels[mode]}
              variant={resolvedDisplayMode === mode ? 'interactive' : 'default'}
              onClick={() => onDisplayModeChange(mode)}
              // A mode the current metadata cannot render is disabled rather than guarded
              // inside the handler, so the button state is the single source of truth.
              disabled={disabled || !isDisplayModeAvailable(mode, metadata)}
            />
          ))}
        </ButtonGroup>
        <ButtonGroup>
          <Button
            type="button"
            icon="refresh"
            transparent
            aria-label={labels.refreshPreview}
            onClick={onRefreshPreview}
            disabled={disabled || isLoading}
          />
          <Button
            type="button"
            icon="delete"
            transparent
            aria-label={labels.removePreview}
            onClick={onRemovePreview}
            disabled={disabled || isLoading}
          />
        </ButtonGroup>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <ItemLinkSkeleton displayMode={resolvedDisplayMode} />
        ) : (
          <div className="non-interactive">
            <ItemLink url={url} metadata={linkMetadata} displayMode={resolvedDisplayMode} />
          </div>
        )}
      </div>

      {error ? (
        <Notice description={error} variant="error" />
      ) : (
        <Notice description={labels.hint} variant="discovery" />
      )}
    </div>
  );
}

// Memoised so typing in the item body does not re-render the preview. This only holds as
// long as callers pass stable `labels` and handlers — see ItemForm.
export default memo(LinkPreview);

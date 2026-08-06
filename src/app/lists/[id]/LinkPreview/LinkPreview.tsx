'use client';

import React from 'react';

import type { OpenGraphMetadata } from '@/actions/fetch-opengraph';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import ItemLink from '@/components/ItemLink/ItemLink';
import type { ItemLinkMetadata } from '@/components/ItemLink/ItemLink.types';
import { getResolvedDisplayMode, isEmbedModeAvailable } from '@/lib/item-display-mode';

import LinkPreviewSkeleton from './LinkPreviewSkeleton';
import styles from './LinkPreview.module.scss';
import SectionMessage from "@/components/SectionMessage/SectionMessage";

type LinkPreviewMetadata = OpenGraphMetadata & {
  // Stored for future rich providers (YouTube, Spotify, etc.).
  embed?: string;
};

type LinkPreviewProps = {
  url: string;
  metadata: LinkPreviewMetadata | null;
  displayMode: 'link' | 'bookmark' | 'embed';
  onDisplayModeChange: (mode: 'link' | 'bookmark' | 'embed') => void;
  isLoading: boolean;
  error: string | null;
  onRemovePreview: () => void;
  onRefreshPreview: () => void;
  labels: {
    link: string;
    bookmark: string;
    embed: string;
    refreshPreview: string;
    removePreview: string;
    fallbackTitle: string;
  };
  disabled?: boolean;
};

export default function LinkPreview({
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
  const canUseEmbedMode = isEmbedModeAvailable(metadata);
  const linkMetadata: ItemLinkMetadata = {
    title: metadata?.title?.trim() || labels.fallbackTitle,
    description: metadata?.description,
    favicon: metadata?.favicon,
    image: metadata?.image,
    siteName: metadata?.siteName,
    host: (() => {
      try {
        return new URL(url).host;
      } catch {
        return undefined;
      }
    })(),
    author: metadata?.author,
    embed: metadata?.embed,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ButtonGroup>
          <Button
            type="button"
            label={labels.link}
            variant={resolvedDisplayMode === 'link' ? 'interactive' : 'default'}
            onClick={() => onDisplayModeChange('link')}
            disabled={disabled}
          />
          <Button
            type="button"
            label={labels.bookmark}
            variant={resolvedDisplayMode === 'bookmark' ? 'interactive' : 'default'}
            onClick={() => onDisplayModeChange('bookmark')}
            disabled={disabled}
          />
          <Button
            type="button"
            label={labels.embed}
            variant={resolvedDisplayMode === 'embed' ? 'interactive' : 'default'}
            onClick={() => {
              if (!canUseEmbedMode) {
                return;
              }
              onDisplayModeChange('embed');
            }}
            disabled={disabled || !canUseEmbedMode}
          />
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
          <LinkPreviewSkeleton displayMode={resolvedDisplayMode} wrapped={false} />
        ) : (
          <ItemLink url={url} metadata={linkMetadata} displayMode={resolvedDisplayMode} />
        )}
      </div>
      {error && <SectionMessage description={error} variant="error" />}
    </div>
  );
}

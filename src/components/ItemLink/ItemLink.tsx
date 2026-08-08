'use client';

import React from 'react';

import styles from './ItemLink.module.scss';
import type {
  ItemLinkDisplayMode,
  ItemLinkProps,
  ItemLinkWithDisplayModeProps,
} from './ItemLink.types';
import {
  ItemLinkDataList, ItemLinkEmbedVideo,
  ItemLinkFavicon,
  ItemLinkInfoMeta,
  ItemLinkSite,
  ResponsiveContentImage,
} from './ItemLinkParts';

function ItemLink({ url, metadata, displayMode = 'link' }: ItemLinkWithDisplayModeProps) {
  const resolvedMode: ItemLinkDisplayMode = displayMode;
  const isLink = resolvedMode === 'link';
  const isBookmark = resolvedMode === 'bookmark';
  const isEmbed = resolvedMode === 'embed';

  const content =
    resolvedMode === 'bookmark' ? (
      <ItemLinkBookmark metadata={metadata} />
    ) : resolvedMode === 'embed' ? (
      <ItemLinkEmbed metadata={metadata} />
    ) : (
      <ItemLinkContent metadata={metadata} />
    );

  // Build a concise accessible label: screen readers announce the full link content
  // by default, but the <a> wraps many nested elements — an explicit aria-label
  // gives a clean one-liner ("Article title — The Verge") instead of all inner text.
  const siteName = metadata.siteName || metadata.host;
  const ariaLabel = siteName ? `${metadata.title} — ${siteName}` : metadata.title;

  return (
    <a
      aria-label={ariaLabel}
      className={[
        styles.content,
        isLink && styles.link,
        isBookmark && styles.bookmark,
        isEmbed && styles.embed,
      ]
        .filter(Boolean)
        .join(' ')}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

function ItemLinkContent({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  return (
    <>
      {metadata.favicon && <ItemLinkFavicon src={metadata.favicon} />}
      <h3 className={styles.title}>{metadata.title}</h3>
    </>
  );
}

function ItemLinkBookmark({ metadata }: { metadata: ItemLinkProps['metadata'] }) {
  const galleryImages = metadata.images?.slice(0, 4) ?? [];

  return (
    <>
      <div className={styles.info}>
        <ItemLinkInfoMeta
          title={metadata.title}
          titleClassName={`${styles.title} ${styles['bookmark-title']}`}
          description={metadata.description}
        />
        <ItemLinkDataList metadata={metadata} />
        <ItemLinkSite metadata={metadata} />
      </div>

      {galleryImages.length > 1 ? (
        <div className={styles.gallery} data-count={galleryImages.length}>
          {galleryImages.map((image, index) => (
            <div className={styles['gallery-image']} key={`${image}-${index}`}>
              <ResponsiveContentImage
                // Each image in the gallery gets a distinct positional alt so screen readers
                // don't announce the same title N times for a multi-image tweet/post.
                alt={`${metadata.title} — image ${index + 1} of ${galleryImages.length}`}
                className={styles['gallery-image-asset']}
                src={image}
              />
            </div>
          ))}
        </div>
      ) : (
        metadata.image && (
          <div className={styles.cover}>
            {/* Prefer explicit imageAlt (og:image:alt from the page) over the generic title */}
            <ResponsiveContentImage alt={metadata.imageAlt || metadata.title} src={metadata.image} />
          </div>
        )
      )}
    </>
  );
}

function ItemLinkEmbed({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  return (
    <>
      <ItemLinkInfoMeta title={metadata.title} description={metadata.description} />
      <ItemLinkDataList metadata={metadata} />
      {metadata.embed ? (
        <div className={styles['embed-content']} dangerouslySetInnerHTML={{ __html: metadata.embed }} />
      ) : metadata.videoUrl ? (
        <div className={styles['embed-content']}>
          <ItemLinkEmbedVideo src={metadata.videoUrl} title={metadata.title} />
        </div>
      ) : (
        metadata.image && (
          <div className={styles['embed-content']}>
            <ResponsiveContentImage alt={metadata.imageAlt || metadata.title} src={metadata.image} />
          </div>
        )
      )}
      <ItemLinkSite metadata={metadata} />
    </>
  );
}


export type {
  ItemLinkDisplayMode,
  ItemLinkMetadata,
  ItemLinkProps,
  ItemLinkWithDisplayModeProps,
} from './ItemLink.types';
export default ItemLink;

'use client';

import React from 'react';

import styles from './ItemLink.module.scss';
import type {
  ItemLinkDisplayMode,
  ItemLinkProps,
  ItemLinkWithDisplayModeProps,
} from './ItemLink.types';
import {
  ItemLinkDataList,
  ItemLinkEmbed,
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
      <ItemBookmarkContent metadata={metadata} />
    ) : resolvedMode === 'embed' ? (
      <ItemLinkEmbed metadata={metadata} />
    ) : (
      <ItemLinkContent metadata={metadata} />
    );

  return (
    <a
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

function ItemBookmarkContent({ metadata }: { metadata: ItemLinkProps['metadata'] }) {
  const galleryImages = metadata.images?.slice(0, 8) ?? [];

  return (
    <>
      <div className={styles.info}>
        <ItemLinkInfoMeta
          title={metadata.title}
          titleClassName={`${styles.title} ${styles.bookmarkTitle}`}
          description={metadata.description}
        />
        <ItemLinkDataList metadata={metadata} />
        <ItemLinkSite metadata={metadata} />
      </div>

      <div className={styles.media}>
        {galleryImages.length > 1 ? (
          <div className={styles.gallery} data-count={galleryImages.length}>
            {galleryImages.map((image, index) => (
              <div className={styles.galleryImage} key={`${image}-${index}`}>
                <ResponsiveContentImage
                  alt={metadata.title}
                  className={styles.galleryImageAsset}
                  src={image}
                />
              </div>
            ))}
          </div>
        ) : (
          metadata.image && (
            <div className={styles.cover}>
              <ResponsiveContentImage alt={metadata.title} src={metadata.image} />
            </div>
          )
        )}
      </div>
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

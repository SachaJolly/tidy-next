/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { toDisplayMediaUrl } from '@/lib/media-proxy';

import styles from './ItemLink.module.scss';
import type {
  ItemLinkDisplayMode,
  ItemLinkProps,
  ItemLinkWithDisplayModeProps,
} from './ItemLink.types';

const DEFAULT_NO_DESCRIPTION_LABEL = 'No description available.';

function ResponsiveContentImage({ src, alt, className = styles.coverImage }: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      alt={alt}
      className={className}
      src={toDisplayMediaUrl(src)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

function ItemLink({ url, metadata, displayMode = 'link' }: ItemLinkWithDisplayModeProps) {
  const resolvedMode: ItemLinkDisplayMode = displayMode;
  const isLink = resolvedMode === 'link';
  const isBookmark = resolvedMode === 'bookmark';
  const isEmbed = resolvedMode === 'embed';

  const content =
    resolvedMode === 'bookmark' ? (
      <ItemBookmarkContent metadata={metadata} noDescriptionLabel={DEFAULT_NO_DESCRIPTION_LABEL} />
    ) : resolvedMode === 'embed' ? (
      <ItemEmbedContent metadata={metadata} />
    ) : (
      <ItemLinkContent metadata={metadata} />
    );

  return (
    <a
      className={[
        styles.content,
        isLink && styles.link,
        isBookmark && styles.bookmark,
        isEmbed && styles.embed
      ].filter(Boolean).join(' ')}
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
      {metadata.favicon && (
        <img
          alt=""
          className={styles.favicon}
          src={toDisplayMediaUrl(metadata.favicon)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      <h3 className={styles.title}>{metadata.title}</h3>
    </>
  );
}

function ItemBookmarkContent({ metadata, noDescriptionLabel }: {
  metadata: ItemLinkProps['metadata'];
  noDescriptionLabel: string;
}) {
  const galleryImages = metadata.images?.slice(1, 4) ?? [];

  return (
    <>
      <div className={styles.info}>
        <div className={styles.infoMeta}>
          <h3 className={`${styles.title} ${styles.bookmarkTitle}`}>{metadata.title}</h3>
          {metadata.description ? (
            <p className={styles.description}>{metadata.description}</p>
          ) : (
            <p className={styles.description}>{noDescriptionLabel}</p>
          )}
        </div>
        {((metadata.label1 && metadata.value1) || (metadata.label2 && metadata.value2)) && (
          <dl className={styles.dataList}>
            {metadata.label1 && metadata.value1 && (
              <div className={styles.dataListItem}>
                <dt>{metadata.label1}</dt>
                <dd>{metadata.value1}</dd>
              </div>
            )}
            {metadata.label2 && metadata.value2 && (
              <div className={styles.dataListItem}>
                <dt>{metadata.label2}</dt>
                <dd>{metadata.value2}</dd>
              </div>
            )}
          </dl>
        )}

        <div className={styles.site}>
          {metadata.favicon && (
            <img
              alt=""
              className={styles.favicon}
              src={toDisplayMediaUrl(metadata.favicon)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
          <span>{metadata.siteName || metadata.host}</span>
          {metadata.author && <span>{metadata.author}</span>}
        </div>
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
        ) : metadata.image && (
          <div className={styles.cover}>
            <ResponsiveContentImage alt={metadata.title} src={metadata.image} />
          </div>
        )}
      </div>
    </>
  );
}

function ItemEmbedContent({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '.5rem' }}>
        {metadata.favicon && (
          <img
            alt=""
            className={styles.favicon}
            src={toDisplayMediaUrl(metadata.favicon)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
        <h2 className={styles.title}>{metadata.title}</h2>
      </div>
      {metadata.embed ? (
        <div className={styles.embedContent} dangerouslySetInnerHTML={{ __html: metadata.embed }} />
      ) : metadata.videoUrl ? (
        <div className={styles.embedContent}>
          <video
            className={styles.embedVideo}
            controls
            playsInline
            preload="metadata"
            src={toDisplayMediaUrl(metadata.videoUrl)}
          />
        </div>
      ) : (
        metadata.image && (
          <div className={styles.embedContent}>
            <ResponsiveContentImage alt={metadata.title} src={metadata.image} />
          </div>
        )
      )}
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

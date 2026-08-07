/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { toDisplayMediaUrl } from '@/lib/media-proxy';

import styles from './ItemLink.module.scss';
import type { ItemLinkProps } from './ItemLink.types';

export function ResponsiveContentImage({
  src,
  alt,
  className = styles.coverImage,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>) {
  return (
    <img
      alt={alt}
      className={className}
      src={toDisplayMediaUrl(src)}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}

export function ItemLinkFavicon({
  src,
  className = styles.favicon,
}: {
  src: string;
  className?: string;
}) {
  return (
    <ResponsiveContentImage
      alt=""
      aria-hidden="true"
      className={className}
      role="presentation"
      src={src}
    />
  );
}

export function ItemLinkInfoMeta({
  title,
  description,
  titleClassName = styles.title,
}: {
  title: string;
  description?: string;
  titleClassName?: string;
}) {
  return (
    <div className={styles.infoMeta}>
      <h3 className={titleClassName}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

export function ItemLinkDataList({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  const hasData = (metadata.label1 && metadata.value1) || (metadata.label2 && metadata.value2);

  if (!hasData) {
    return null;
  }

  return (
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
  );
}

export function ItemLinkSite({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  return (
    <div className={styles.site}>
      {metadata.favicon && <ItemLinkFavicon src={metadata.favicon} />}
      <span>{metadata.siteName || metadata.host}</span>
      {metadata.author && <span>{metadata.author}</span>}
    </div>
  );
}

export function ItemLinkEmbedVideo({ src }: { src: string }) {
  return (
    <video
      className={styles.embedVideo}
      controls
      playsInline
      preload="metadata"
      src={toDisplayMediaUrl(src)}
    />
  );
}

export function ItemLinkEmbed({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  return (
    <>
      <ItemLinkSite metadata={metadata} />
      <ItemLinkInfoMeta title={metadata.title} description={metadata.description} />
      <ItemLinkDataList metadata={metadata} />
      {metadata.embed ? (
        <div className={styles.embedContent} dangerouslySetInnerHTML={{ __html: metadata.embed }} />
      ) : metadata.videoUrl ? (
        <div className={styles.embedContent}>
          <ItemLinkEmbedVideo src={metadata.videoUrl} />
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

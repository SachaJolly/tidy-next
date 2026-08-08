/* eslint-disable @next/next/no-img-element */
import React from 'react';

import { toDisplayMediaUrl } from '@/lib/media-proxy';

import styles from './ItemLink.module.scss';
import type { ItemLinkProps } from './ItemLink.types';

export function ResponsiveContentImage({
  src,
  alt,
  className = styles['cover-image'],
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
    <div className={styles['info-meta']}>
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
    <dl className={styles['data-list']}>
      {metadata.label1 && metadata.value1 && (
        <div className={styles['data-list-item']}>
          <dt>{metadata.label1}</dt>
          <dd>{metadata.value1}</dd>
        </div>
      )}
      {metadata.label2 && metadata.value2 && (
        <div className={styles['data-list-item']}>
          <dt>{metadata.label2}</dt>
          <dd>{metadata.value2}</dd>
        </div>
      )}
    </dl>
  );
}

export function ItemLinkSite({ metadata }: Pick<ItemLinkProps, 'metadata'>) {
  const siteName = metadata.siteName || metadata.host;

  const formattedDate = metadata.publishedTime
    ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        new Date(metadata.publishedTime)
      )
    : null;

  return (
    <div className={styles.site}>
      {metadata.favicon && <ItemLinkFavicon src={metadata.favicon} />}

      {/* Each piece of meta is a list item — the CSS ::before separator is purely decorative
          and won't be read by screen readers, unlike an explicit <span>·</span> */}
      <ul className={styles['site-list']}>
        {siteName && <li className={styles['site-list-item']}>{siteName}</li>}
        {metadata.author && <li className={styles['site-list-item']}>{metadata.author}</li>}
        {formattedDate && metadata.publishedTime && (
          <li className={styles['site-list-item']}>
            <time dateTime={metadata.publishedTime}>{formattedDate}</time>
          </li>
        )}
      </ul>
    </div>
  );
}

export function ItemLinkEmbedVideo({ src, title }: { src: string; title?: string }) {
  return (
    // title mirrors aria-label for both AT and tooltip on hover
    <video
      aria-label={title}
      className={styles['embed-video']}
      controls
      playsInline
      preload="metadata"
      src={toDisplayMediaUrl(src)}
      title={title}
    />
  );
}

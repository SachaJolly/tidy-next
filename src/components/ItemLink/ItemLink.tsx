import React from 'react';
import Image from 'next/image';

import styles from './ItemLink.module.scss';
import type {
  ItemBookmarkProps,
  ItemLinkMetadata,
  ItemLinkProps,
} from './ItemLink.types';

const contentImageSizes = [
  { media: '(max-width: 617px)' },
  { media: '(min-width: 618px)' },
] as const;

function ResponsiveContentImage({ src, alt }: { src: string; alt: string }) {
  return (
    <picture>
      {contentImageSizes.map(({ media }) => (
        <source key={media} media={media} srcSet={src} />
      ))}
      <Image
        alt={alt}
        className={styles.coverImage}
        height={512}
        src={src}
        unoptimized={true}
        width={1024}
      />
    </picture>
  );
}

export function ItemLink({ url, metadata }: ItemLinkProps) {
  return (
    <a className={styles.content} href={url} target="_blank" rel="noopener noreferrer">
      {metadata.favicon && (
        <Image
          alt=""
          className={styles.favicon}
          height={16}
          src={metadata.favicon}
          unoptimized={true}
          width={16}
        />
      )}
      <h3 className={styles.title}>{metadata.title}</h3>
    </a>
  );
}

export function ItemBookmark({
  url,
  metadata,
  noDescriptionLabel,
}: ItemBookmarkProps) {
  return (
    <a
      className={[styles.content, styles.bookmark].filter(Boolean).join(' ')}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
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
            <Image
              alt=""
              className={styles.favicon}
              height={16}
              src={metadata.favicon}
              unoptimized={true}
              width={16}
            />
          )}
          <span>{metadata.siteName || metadata.host}</span>
          {metadata.author && <span>{metadata.author}</span>}
        </div>
      </div>

      <div className={styles.cover}>
        {metadata.image && <ResponsiveContentImage alt={metadata.title} src={metadata.image} />}
      </div>
    </a>
  );
}

export function ItemEmbed({ url, metadata }: ItemLinkProps) {
  return (
    <a className={styles.content} href={url} target="_blank" rel="noopener noreferrer">
      {metadata.favicon && (
        <Image
          alt=""
          className={styles.favicon}
          height={16}
          src={metadata.favicon}
          unoptimized={true}
          width={16}
        />
      )}
      <h2 className={styles.title}>{metadata.title}</h2>
      {metadata.embed ? (
        <div dangerouslySetInnerHTML={{ __html: metadata.embed }} />
      ) : (
        metadata.image && (
          <div>
            <ResponsiveContentImage alt={metadata.title} src={metadata.image} />
          </div>
        )
      )}
    </a>
  );
}

export type { ItemBookmarkProps, ItemLinkMetadata, ItemLinkProps } from './ItemLink.types';
export default ItemLink;

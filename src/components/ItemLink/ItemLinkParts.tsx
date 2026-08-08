/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Spinner from '@/components/Spinner/Spinner';
import { useDateFormatter } from '@/hooks/use-date-formatter';

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
  const siteName = metadata.siteName?.trim() || metadata.host?.trim();
  const formatDate = useDateFormatter();

  const formattedDate = metadata.publishedTime
    ? formatDate(metadata.publishedTime, 'short')
    : null;

  return (
    <div className={styles.site}>
      {metadata.favicon && <ItemLinkFavicon src={metadata.favicon} />}
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

/**
 * Raw provider embed markup (YouTube/Spotify/SoundCloud `<iframe>`, tweet blockquote…).
 *
 * Three things are going on here, all of them about *not* reloading the provider page.
 *
 * 1. Lazy mounting. Provider oEmbed HTML ships without `loading="lazy"` (YouTube, Spotify
 *    and friends all return a bare `<iframe>`), so a list of 20 embeds used to open 20
 *    third-party pages the moment the list rendered. The markup is now injected only once
 *    the placeholder approaches the viewport, and never removed afterwards — unmounting on
 *    scroll-out would make it reload on the way back.
 * 2. Stable innerHTML. React 19 diffs `dangerouslySetInnerHTML` by *object identity*, not
 *    by comparing the `__html` string, so a fresh `{ __html }` literal on every render
 *    re-runs setInnerHTML and destroys the iframe. The object is pinned to `html`.
 * 3. Memoised on `html`, so unrelated parent re-renders (a `router.refresh()` after saving
 *    an item, a locale change, a sibling item updating) skip this subtree entirely.
 *
 * The spinner covers the frame until the provider reports `load`. It is an absolutely
 * positioned *sibling* of the injected markup on purpose: toggling it must never change
 * the props of the `dangerouslySetInnerHTML` node.
 */
export const ItemLinkEmbedHtml = React.memo(function ItemLinkEmbedHtml({ html }: { html: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  // Starts `true` so the spinner is already up on the very first paint after mounting.
  const [isLoading, setIsLoading] = useState(true);

  const dangerousHtml = useMemo(() => ({ __html: html }), [html]);

  useEffect(() => {
    // One-way switch: once mounted the embed stays mounted for the rest of the session.
    if (isInView) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Non-browser or legacy environments can't observe: fall back to loading right away
    // rather than never showing the embed at all.
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      // Start fetching just before the embed scrolls in, so it is usually ready on arrival.
      { rootMargin: '400px 0px' },
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const frame = container.querySelector('iframe');

    // Script-driven embeds (tweet/Instagram blockquotes) have no iframe of their own,
    // so no `load` would ever fire — reveal them immediately instead of spinning forever.
    if (!frame) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const reveal = () => setIsLoading(false);
    frame.addEventListener('load', reveal);
    // A blocked or dead provider still has to reveal the frame, otherwise the spinner sticks.
    frame.addEventListener('error', reveal);

    // Safety net: `load` can be missed if the frame resolved between React's commit and
    // this effect, and some providers never fire it at all. Cross-origin frames can't be
    // probed for `readyState` (the initial about:blank always reports "complete"), so a
    // timeout is the only reliable escape hatch.
    const timeout = window.setTimeout(reveal, 10_000);

    return () => {
      frame.removeEventListener('load', reveal);
      frame.removeEventListener('error', reveal);
      window.clearTimeout(timeout);
    };
  }, [html, isInView]);

  return (
    <div
      className={styles['embed-content']}
      data-loading={(isInView && isLoading) || undefined}
      ref={wrapperRef}
    >
      {isInView && (
        <div
          className={styles['embed-html']}
          ref={containerRef}
          dangerouslySetInnerHTML={dangerousHtml}
        />
      )}
      {isInView && isLoading && (
        // Decorative only: the wrapping <a> already carries a full aria-label, so an
        // extra live region here would just add noise for screen readers.
        <span className={styles['embed-loader']} aria-hidden="true">
          <Spinner size={24} hidden />
        </span>
      )}
    </div>
  );
});

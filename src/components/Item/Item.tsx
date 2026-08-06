'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ButtonHover } from '@/components/ButtonHover';
import { Dropdown } from '@/components/Dropdown';
import ItemOptionsDropdown from '@/app/lists/[id]/ItemOptionsDropdown';
import Meta from '@/components/Meta/Meta';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import { Item as ItemType } from '@/lib/types';

import styles from './Item.module.scss';

interface ItemStatsProps {
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface ItemProps {
  item: ItemType;
  listId: string;
  canManage?: boolean;
}

// Type-safe metadata shape for items
interface ItemMetadata {
  url?: string;
  favicon?: string;
  title?: string;
  description?: string;
  label1?: string;
  value1?: string;
  label2?: string;
  value2?: string;
  author?: string;
  siteName?: string;
  host?: string;
  image?: string;
  embed?: string;
}

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
        className={styles['cover-image']}
        height={512}
        src={src}
        unoptimized={true}
        width={1024}
      />
    </picture>
  );
}

const ItemStats = ({ stats }: ItemStatsProps) => {
  const t = useTranslations('item');

  return (
    <MetaGroup>
      <Meta>
        {stats.views} {t('views')}
      </Meta>
      <Meta>
        {stats.likes} {t('likes')}
      </Meta>
      <Meta>
        {stats.comments} {t('comments')}
      </Meta>
    </MetaGroup>
  );
};

export const Item = ({ item, listId, canManage = false }: ItemProps) => {
  const t = useTranslations('item');
  const listPage = useTranslations('listPage');
  // Cast metadata to a type-safe shape
  const metadata = item.metadata as ItemMetadata;
  const actions = canManage ? (
    <div className={styles.actions}>
      <Dropdown>
        <ButtonHover aria-label={listPage('settings')} />
        <ItemOptionsDropdown listId={listId} itemId={item.id} canManage={canManage} />
      </Dropdown>
    </div>
  ) : null;

  // LINK display mode
  if (item.display_mode === 'link') {
    return (
      <div className={styles['container']}>
        {actions}
        <a
          className={`${styles['content']} ${styles['is-link']}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {metadata.favicon && (
            <Image
              alt=""
              className={styles['favicon']}
              height={16}
              src={metadata.favicon}
              unoptimized={true}
              width={16}
            />
          )}
          <h3 className={styles['title']}>{item.body}</h3>
        </a>

        <ItemStats stats={item.stats} />
      </div>
    );
  }

  // BOOKMARK display mode
  if (item.display_mode === 'bookmark') {
    return (
      <div className={styles['container']}>
        {actions}
        <a
          className={`${styles['content']} ${styles['is-bookmark']}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles['info']}>
            <div className={styles['info-meta']}>
              <h3 className={styles['title']}>{item.body}</h3>
              {metadata.description ? (
                <p className={styles['description']}>{metadata.description}</p>
              ) : (
                <p className={styles['description']}>{t('noDescription')}</p>
              )}
            </div>
            {((metadata.label1 && metadata.value1) || (metadata.label2 && metadata.value2)) && (
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
            )}

            <div className={styles['site']}>
              {metadata.favicon && (
                <Image
                  alt=""
                  className={styles['favicon']}
                  height={16}
                  src={metadata.favicon}
                  unoptimized={true}
                  width={16}
                />
              )}
              <MetaGroup>
                <Meta>{metadata.siteName || metadata.host}</Meta>
                {metadata.author && <Meta>{metadata.author}</Meta>}
              </MetaGroup>
            </div>
          </div>

          <div className={styles['cover']}>
            {metadata.image && <ResponsiveContentImage alt={item.body} src={metadata.image} />}
          </div>
        </a>

        <ItemStats stats={item.stats} />
      </div>
    );
  }

  // EMBED display mode
  return (
    <div className={styles['container']}>
      {actions}
      <div className={styles['content']}>
        {metadata.favicon && (
          <Image
            alt=""
            className={styles['favicon']}
            height={16}
            src={metadata.favicon}
            unoptimized={true}
            width={16}
          />
        )}
        <h2>{item.body}</h2>

        {metadata.embed ? (
          <div dangerouslySetInnerHTML={{ __html: metadata.embed }} />
        ) : (
          metadata.image && (
            <div>
              <ResponsiveContentImage alt={item.body} src={metadata.image} />
            </div>
          )
        )}
      </div>

      <ItemStats stats={item.stats} />
    </div>
  );
};

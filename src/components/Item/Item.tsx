import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

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
}

// Type-safe content shape for items
interface ItemContent {
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

const ItemStats = async ({ stats }: ItemStatsProps) => {
  const t = await getTranslations('item');

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

export const Item = async ({ item }: ItemProps) => {
  const t = await getTranslations('item');
  // Cast content to a type-safe shape
  const content = item.content as ItemContent;

  // LINK display mode
  if (item.displayMode === 'LINK') {
    return (
      <div className={styles['container']}>
        <a
          className={`${styles['content']} ${styles['is-link']}`}
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.favicon && (
            <Image
              alt=""
              className={styles['favicon']}
              height={16}
              src={content.favicon}
              unoptimized={true}
              width={16}
            />
          )}
          <h3 className={styles['title']}>{item.title}</h3>
        </a>

        {item.caption && <p className={styles['caption']}>{item.caption}</p>}
        <ItemStats stats={item.stats} />
      </div>
    );
  }

  // BOOKMARK display mode
  if (item.displayMode === 'BOOKMARK') {
    return (
      <div className={styles['container']}>
        <a
          className={`${styles['content']} ${styles['is-bookmark']}`}
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles['info']}>
            <div className={styles['info-meta']}>
              <h3 className={styles['title']}>{item.title}</h3>
              {content.description ? (
                <p className={styles['description']}>{content.description}</p>
              ) : (
                <p className={styles['description']}>{t('noDescription')}</p>
              )}
            </div>
            {((content.label1 && content.value1) || (content.label2 && content.value2)) && (
              <dl className={styles['data-list']}>
                {content.label1 && content.value1 && (
                  <div className={styles['data-list-item']}>
                    <dt>{content.label1}</dt>
                    <dd>{content.value1}</dd>
                  </div>
                )}
                {content.label2 && content.value2 && (
                  <div className={styles['data-list-item']}>
                    <dt>{content.label2}</dt>
                    <dd>{content.value2}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className={styles['site']}>
              {content.favicon && (
                <Image
                  alt=""
                  className={styles['favicon']}
                  height={16}
                  src={content.favicon}
                  unoptimized={true}
                  width={16}
                />
              )}
              <MetaGroup>
                <Meta>{content.siteName || content.host}</Meta>
                {content.author && <Meta>{content.author}</Meta>}
              </MetaGroup>
            </div>
          </div>

          <div className={styles['cover']}>
            {content.image && <ResponsiveContentImage alt={item.title} src={content.image} />}
          </div>
        </a>

        {item.caption && <p className={styles['caption']}>{item.caption}</p>}
        <ItemStats stats={item.stats} />
      </div>
    );
  }

  // EMBED display mode
  return (
    <div className={styles['container']}>
      <div className={styles['content']}>
        {content.favicon && (
          <Image
            alt=""
            className={styles['favicon']}
            height={16}
            src={content.favicon}
            unoptimized={true}
            width={16}
          />
        )}
        <h2>{item.title}</h2>

        {content.embed ? (
          <div dangerouslySetInnerHTML={{ __html: content.embed }} />
        ) : (
          content.image && (
            <div>
              <ResponsiveContentImage alt={item.title} src={content.image} />
            </div>
          )
        )}
      </div>

      {item.caption && <p className={styles['caption']}>{item.caption}</p>}
      <ItemStats stats={item.stats} />
    </div>
  );
};

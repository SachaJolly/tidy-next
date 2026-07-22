import React from 'react';
import Icon from '../icon/icon';
import MetaGroup from '../meta-group/meta-group';
import Meta from '../meta/meta';
import styles from './list-card.module.scss';
import { List } from '@/lib/types';

interface ListCardProps {
  list: List;
  bigger?: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ list, bigger = false, ...props }) => {
  const listClasses = `${styles.container} ${bigger ? styles.bigger : ''}`;
  const coverColor = { backgroundColor: list.color };

  return (
    <div className={listClasses} {...props}>
      <a href={`/lists/${list.id}`} className={styles['content']}>
        <div className={styles['cover']} style={coverColor}>
          {list.thumbnail && (
            <picture>
              <source
                media="(max-width:617px)"
                srcSet={`https://s3-eu-west-1.amazonaws.com/invowsandbox/p/col_thumb/s512x256/${list.thumbnail}.jpeg`}
              />
              <img
                alt={list.title}
                src={`https://s3-eu-west-1.amazonaws.com/invowsandbox/p/col_thumb/s512x256/${list.thumbnail}.jpeg`}
              />
            </picture>
          )}
        </div>
        <div className={styles['infos']}>
          <h4 className={styles['title']}>{list.title}</h4>
          <MetaGroup>
            {list.isPinned && (
              <Meta type="pinned">
                <Icon name="pin" size={16}></Icon>
                <span>Pinned</span>
              </Meta>
            )}

            {list.visibility === 'PRIVATE' && (
              <Meta type="visibility">
                <Icon name="private" size={16}></Icon>
                <span>Private</span>
              </Meta>
            )}

            {list.visibility === 'UNINDEXED' && (
              <Meta type="visibility">
                <Icon name="visibility_off" size={16}></Icon>
                <span>Unindexed</span>
              </Meta>
            )}

            {list.isTrending ? (
              <Meta type="trending">
                <Icon name="hot" size={16}></Icon>
                <span>Trending</span>
              </Meta>
            ) : list.isPopular ? (
              <Meta type="popular">
                <Icon name="recommended" size={16}></Icon>
                <span>Popular</span>
              </Meta>
            ) : (
              list.isFeatured && (
                <Meta type="featured">
                  <Icon name="featured" size={16}></Icon>
                  <span>Featured</span>
                </Meta>
              )
            )}

            {list.itemsCount > 0 ? (
              <Meta>
                {list.itemsCount} {list.itemsCount === 1 ? 'item' : 'items'}
              </Meta>
            ) : (
              <Meta>Empty</Meta>
            )}

            {list.notesCount > 0 && (
              <Meta>
                {list.notesCount} {list.notesCount === 1 ? 'note' : 'notes'}
              </Meta>
            )}
          </MetaGroup>
        </div>
      </a>
    </div>
  );
};

export default ListCard;

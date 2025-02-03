import React from "react";
import Icon from "../icon/icon";
import Meta from "../meta-list/meta-list";
import MetaData from "../meta-data/meta-data";
import styles from "./list-card.module.scss";

enum Visibility {
  PRIVATE = "PRIVATE",
  UNINDEXED = "UNINDEXED",
  PUBLIC = "PUBLIC",
}

interface ListCardProps {
  _id: { $oid: string };
  title: string;
  color: string;
  _thumbnail?: string;
  visibility: Visibility;
  itemsCount: number;
  starsCount: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  bigger?: boolean;
}

const ListCard: React.FC<ListCardProps> = ({
  _id,
  title,
  color,
  _thumbnail,
  visibility,
  itemsCount,
  starsCount,
  isPinned = false,
  isFeatured = false,
  isPopular = false,
  isTrending = false,
  bigger = false,
  ...props
}) => {
  const listClasses = `${styles.container} ${bigger ? styles.bigger : ""}`;
  const coverColor = { backgroundColor: "#" + color };

  return (
    <div className={listClasses} {...props}>
      <a href={`/list/${_id.$oid}`} className={styles["content"]}>
        <div className={styles["cover"]} style={coverColor}>
          {_thumbnail && (
            <picture>
              <source
                media="(max-width:617px)"
                srcSet={`https://s3-eu-west-1.amazonaws.com/invowsandbox/p/col_thumb/s512x256/${_thumbnail}.jpeg`}
              />
              <img
                alt={title}
                src={`https://s3-eu-west-1.amazonaws.com/invowsandbox/p/col_thumb/s512x256/${_thumbnail}.jpeg`}
              />
            </picture>
          )}
        </div>
        <div className={styles["infos"]}>
          <h4 className={styles["title"]}>{title}</h4>
          <Meta>
            {isPinned && (
              <MetaData type="pinned">
                <Icon name="keep" size="16px"></Icon>
                <span>Pinned</span>
              </MetaData>
            )}

            {visibility === "PRIVATE" && (
              <MetaData type="visibility">
                <Icon name="lock" size="16px"></Icon>
                <span>Private</span>
              </MetaData>
            )}

            {visibility === "UNINDEXED" && (
              <MetaData type="visibility">
                <Icon name="visibility_off" size="16px"></Icon>
                <span>Unindexed</span>
              </MetaData>
            )}

            {visibility === "PUBLIC" && (
              <>
                {isTrending ? (
                  <MetaData type="trending">
                    <Icon name="whatshot" size="16px"></Icon>
                    <span>Trending</span>
                  </MetaData>
                ) : isPopular ? (
                  <MetaData type="popular">
                    <Icon name="recommend" size="16px"></Icon>
                    <span>Popular</span>
                  </MetaData>
                ) : (
                  isFeatured && (
                    <MetaData type="featured">
                      <Icon name="stars" size="16px"></Icon>
                      <span>Featured</span>
                    </MetaData>
                  )
                )}
              </>
            )}

            {itemsCount > 0 ? (
              <MetaData>
                {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </MetaData>
            ) : (
              <MetaData>Empty</MetaData>
            )}

            {starsCount > 0 && (
              <MetaData>
                {starsCount} {starsCount === 1 ? "note" : "notes"}
              </MetaData>
            )}
          </Meta>
        </div>
      </a>
    </div>
  );
};

export default ListCard;

import MetaGroup from "../meta-group/meta-group";
import Meta from "../meta/meta";
import styles from "./item.module.scss";

interface ItemStats {
  views: number;
  likes: number;
  comments: number;
}

interface ItemContent {
  url: string;
  title: string;
  description: string;
  label1?: string;
  value1?: string;
  label2?: string;
  value2?: string;
  author?: string;
  host: string;
  siteName?: string;
  favicon?: string;
  image?: string;
  embed?: string;
}

interface ItemProps {
  item: {
    displayMode: "LINK" | "BOOKMARK" | "EMBED";
    stats: ItemStats;
    content: ItemContent;
    caption: string;
  };
}

const ItemStats = ({ stats }: { stats: ItemStats }) => (
  <MetaGroup>
    <Meta>{stats.views} views</Meta>
    <Meta>{stats.likes} likes</Meta>
    <Meta>{stats.comments} comments</Meta>
  </MetaGroup>
);

export const Item = ({ item }: ItemProps) => {
  // LINK display mode
  if (item.displayMode === "LINK") {
    return (
      <div className={styles["container"]}>
        <a
          className={`${styles["content"]} ${styles["is-link"]}`}
          href={item.content.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.content.favicon && (
            <img
              className={styles["favicon"]}
              src={item.content.favicon}
              alt=""
            />
          )}
          <h3 className={styles["title"]}>{item.content.title}</h3>
        </a>

        {item.caption && <p className={styles["caption"]}>{item.caption}</p>}
        {/* <ItemStats stats={item.stats} /> */}
      </div>
    );
  }

  // BOOKMARK display mode
  if (item.displayMode === "BOOKMARK") {
    return (
      <div className={styles["container"]}>
        <a
          className={`${styles["content"]} ${styles["is-bookmark"]}`}
          href={item.content.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles["info"]}>
            <div className={styles["info-meta"]}>
              <h3 className={styles["title"]}>{item.content.title}</h3>
              {item.content.description ? (
                <p className={styles["description"]}>
                  {item.content.description}
                </p>
              ) : (
                <p className={styles["description"]}>No description</p>
              )}
            </div>
            {((item.content.label1 && item.content.value1) ||
              (item.content.label2 && item.content.value2)) && (
              <dl className={styles["data-list"]}>
                {item.content.label1 && item.content.value1 && (
                  <div className={styles["data-list-item"]}>
                    <dt>{item.content.label1}</dt>
                    <dd>{item.content.value1}</dd>
                  </div>
                )}
                {item.content.label2 && item.content.value2 && (
                  <div className={styles["data-list-item"]}>
                    <dt>{item.content.label2}</dt>
                    <dd>{item.content.value2}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className={styles["site"]}>
              {item.content.favicon && (
                <img
                  className={styles["favicon"]}
                  src={item.content.favicon}
                  alt=""
                />
              )}
              <MetaGroup>
                <Meta>{item.content.siteName || item.content.host}</Meta>
                {item.content.author && <Meta>{item.content.author}</Meta>}
              </MetaGroup>
            </div>
          </div>

          <div className={styles["cover"]}>
            {item.content.image && (
              <picture>
                <img src={item.content.image} alt={item.content.title} />
              </picture>
            )}
          </div>
        </a>

        {item.caption && <p className={styles["caption"]}>{item.caption}</p>}
        {/* <ItemStats stats={item.stats} /> */}
      </div>
    );
  }

  // EMBED display mode
  return (
    <div className={styles["container"]}>
      <div className={styles["content"]}>
        {item.content.favicon && (
          <img
            className={styles["favicon"]}
            src={item.content.favicon}
            alt=""
          />
        )}
        <h2>{item.content.title}</h2>

        {item.content.embed ? (
          <div dangerouslySetInnerHTML={{ __html: item.content.embed }} />
        ) : (
          item.content.image && (
            <div>
              <img src={item.content.image} alt={item.content.title} />
            </div>
          )
        )}
      </div>

      {item.caption && <p className={styles["caption"]}>{item.caption}</p>}
      {/* <ItemStats stats={item.stats} /> */}
    </div>
  );
};

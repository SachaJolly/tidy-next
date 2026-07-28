import React from "react";
import styles from "./curator-meta.module.scss";
import ButtonGroup from "@/components/button-group/button-group";
import Button from "@/components/button/button";
import Avatar from "@/components/avatar/avatar";
import MetaGroup from "@/components/meta-group/meta-group";
import Meta from "@/components/meta/meta";
import Icon from "@/components/icon/icon";
import ListCard from "@/components/list-card/list-card";
import type { List } from "@/lib/types";

// Shape of a list as returned by the Rails ListSerializer (after transformApiData).
// `deleted_at` is not serialized by the API so it is omitted here.
export interface ApiList {
  id: string;
  title: string;
  description?: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNINDEXED';
  color: string;
  thumbnail?: string | null;
  displayMode: string;
  itemsCount: number;
  collaboratorsCount: number;
  notesCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shape of a curator entry as returned by GET /api/v1/users/curators
// after transformApiData resolves the recentLists relationship from included.
export interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  listsCount: number;
  recentLists: ApiList[];
}

interface CuratorMetaProps {
  profile: Profile;
}

// Maps the API list shape to the @/lib/types List shape expected by ListCard.
function toDisplayList(l: ApiList): List {
  return {
    id: l.id,
    title: l.title,
    description: l.description ?? null,
    status: l.status === 'DELETED' ? 'ARCHIVED' : l.status,
    visibility: l.visibility,
    color: l.color,
    thumbnail: l.thumbnail ?? null,
    displayMode: l.displayMode,
    itemsCount: l.itemsCount,
    collaboratorsCount: l.collaboratorsCount,
    notesCount: l.notesCount,
    isPinned: l.isPinned,
    isFeatured: l.isFeatured,
    isTrending: l.isTrending,
    isPopular: l.isPopular,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    deleted_at: null,
  };
}

const CuratorMeta: React.FC<CuratorMetaProps> = ({ profile }) => {
  const { name, username, bio, listsCount, recentLists } = profile;
  const displayLists = recentLists.map(toDisplayList);

  return (
    <section className={styles["curator-list"]}>
      <div className={styles["curator-meta-container"]}>
        <div className={styles["curator-meta-content"]}>
          <div className={styles["curator-meta-profile"]}>
            <Avatar size="56" initials={(name || username)[0]} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              <h4 className={styles['title']}>{name || username}</h4>
              <MetaGroup>
                <Meta type="handle">@{username}</Meta>
              </MetaGroup>
            </div>
          </div>
          {bio && (
            <div className={styles["curator-meta-description"]}>
              {bio}
            </div>
          )}
          <MetaGroup orientation="vertical">
            <Meta>
              <Icon name="verified" size={16} />
              <span>Verified user</span>
            </Meta>
            <Meta>
              <Icon name="list" size={16} />
              <span>{listsCount} {listsCount === 1 ? 'list' : 'lists'}</span>
            </Meta>
          </MetaGroup>
        </div>
        <ButtonGroup>
          <Button label="Follow" size="small" variant="interactive" />
          <Button label="See more" size="small" variant="interactive" tinted={true} />
        </ButtonGroup>
      </div>
      {displayLists.length > 0 && (
        displayLists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))
      )}
    </section>
  );
};

export default CuratorMeta;

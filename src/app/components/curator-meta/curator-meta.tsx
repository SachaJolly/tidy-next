import React from "react";
import styles from "./curator-meta.module.scss";
import ButtonGroup from "@/components/button-group/button-group";
import Button from "@/components/button/button";
import Avatar from "@/components/avatar/avatar";
import MetaGroup from "@/components/meta-group/meta-group";
import Meta from "@/components/meta/meta";
import { User } from "@/lib/types";
import Icon from "@/components/icon/icon";

interface CuratorMetaProps {
  profile: User;
  /** Number of lists the curator has published. */
  listsCount?: number;
  children?: React.ReactNode;
}

const CuratorMeta: React.FC<CuratorMetaProps> = ({ profile, listsCount = 0, children }) => (
  <section className={styles["curator-list"]}>
    <div className={styles["curator-meta-container"]}>
      <div className={styles["curator-meta-content"]}>
        <div className={styles["curator-meta-profile"]}>
          <Avatar size="56" initials={(profile.name || profile.username)[0]} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <h4 className={styles['title']}>{profile.name || profile.username}</h4>
            <MetaGroup>
              <Meta type="handle">@{profile.username}</Meta>
            </MetaGroup>
          </div>
        </div>
        {profile.bio && (
          <div className={styles["curator-meta-description"]}>
            {profile.bio}
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
    {children}
  </section>
);

export default CuratorMeta;

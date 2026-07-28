import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import Avatar from "@/components/avatar/avatar";
import styles from "@/components/page-header/page-header.module.scss";
import React from "react";
import MetaGroup from "@/components/meta-group/meta-group";
import Meta from "@/components/meta/meta";
import Icon from "@/components/icon/icon";

interface UserPageProps {
  params: {
    username: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const awaitedParams = await params;
  const user = await api.get<User>(`/api/v1/users/${awaitedParams.username}`);

  if (!user) {
    notFound();
  }

  return (
    <Page>
      <PageHeader>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
          <Avatar
            initials={user?.name ? user.name.charAt(0) : user?.username.charAt(0)}
            size="96"
            src={user?.avatar}
            alt={user?.name}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <h1 className={styles["title"]}>{user?.name ? user.name : user.username}</h1>
                <MetaGroup>
                  <Meta>@{user?.username}</Meta>
                </MetaGroup>
              </div>
              {user?.bio && <p className={styles["caption"]}>{user.bio}</p>}
            </div>
            <MetaGroup>
              <Meta>
                <Icon name="verified" size={16}/>
                <span>Verified user</span>
              </Meta>
              <Meta>
                <Icon name="list" size={16}/>
                {user?.listsCount ? user.listsCount : 0} {user?.listsCount === 1 ? 'list' : 'lists'}
              </Meta>
            </MetaGroup>
          </div>
        </div>
      </PageHeader>
    </Page>
  );
}

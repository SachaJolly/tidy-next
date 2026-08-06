import React from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import Avatar from '@/components/Avatar/Avatar';
import styles from '@/components/PageHeader/PageHeader.module.scss';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import Meta from '@/components/Meta/Meta';
import Icon from '@/components/Icon/Icon';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Button from '@/components/Button/Button';
import { List, User } from '@/lib/types';

type ProfileUser = User & {
  public_lists_count: number;
  publicLists: List[];
  avatar: string | null;
  emailConfirmed?: boolean;
  unconfirmedProfilePublicVisible?: boolean;
};

type ProfileHeaderSectionProps = {
  user: ProfileUser;
  verifiedUserLabel: string;
  publicListsLabel: string;
  showEditProfileButton: boolean;
};

export default function ProfileHeaderSection({
  user,
  verifiedUserLabel,
  publicListsLabel,
  showEditProfileButton,
}: ProfileHeaderSectionProps) {
  return (
    <PageHeader>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
        <Avatar
          initials={user.name.charAt(0)}
          size="96"
          src={user.avatar ?? undefined}
          alt={user.name}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <h1 className={styles.title}>{user.name}</h1>
              <MetaGroup>
                <Meta>@{user.username}</Meta>
              </MetaGroup>
            </div>
            {user.bio && <p className={styles.caption}>{user.bio}</p>}
          </div>
          <MetaGroup>
            <Meta>
              <Icon name="verified" size={16} />
              <span>{verifiedUserLabel}</span>
            </Meta>
            <Meta>
              <Icon name="list" size={16} />
              {publicListsLabel}
            </Meta>
          </MetaGroup>
          {showEditProfileButton && (
            <ButtonGroup>
              <Button label="Edit profile" href="/settings" />
            </ButtonGroup>
          )}
        </div>
      </div>
    </PageHeader>
  );
}

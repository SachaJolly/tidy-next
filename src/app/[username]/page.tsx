import React from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PageLayout from '@/layouts/PageLayout';
import ProfileHeaderSection from './ProfileHeaderSection';
import ProfileListsSection from './ProfileListsSection';
import ProfileUnconfirmedVisibilitySection from './ProfileUnconfirmedVisibilitySection';
import { api, ApiFetchError } from '@/lib/api';
import { List, User } from '@/lib/types';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

type ProfileUser = User & {
  public_lists_count: number;
  publicLists: List[];
  avatar: string | null;
  emailConfirmed?: boolean;
  unconfirmedProfilePublicVisible?: boolean;
  viewerIsOwner?: boolean;
};

const PROFILE_PUBLIC_LISTS_LIMIT = 12;

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const t = await getTranslations('profile');
  const common = await getTranslations('common');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

  const user = await fetchProfileUser(username, authToken);

  if (!user) {
    notFound();
  }

  const isConfirmedUser = user.emailConfirmed !== false;
  const isPublicVisibleForUnconfirmed = user.unconfirmedProfilePublicVisible ?? false;
  const isCurrentUser = user.viewerIsOwner === true;
  const isAuthor = isCurrentUser;

  if (!isConfirmedUser && !isPublicVisibleForUnconfirmed && !isCurrentUser) {
    notFound();
  }

  const publicLists = user.publicLists ?? [];
  const shouldShowUnconfirmedVisibilityMessage = !isConfirmedUser && !isPublicVisibleForUnconfirmed && isCurrentUser;

  return (
    <PageLayout>
      <ProfileHeaderSection
        user={user}
        verifiedUserLabel={common('verifiedUser')}
        publicListsLabel={t('publicLists', { count: user.public_lists_count })}
        showEditProfileButton={isCurrentUser}
      />
      <ProfileUnconfirmedVisibilitySection
        isVisible={shouldShowUnconfirmedVisibilityMessage}
        title={t('unconfirmedVisibilityTitle')}
        description={t('unconfirmedVisibilityDescription')}
        action={t('unconfirmedVisibilityAction')}
      />
      <ProfileListsSection
        publicLists={publicLists}
        isAuthor={isAuthor}
        title={t('publicLists', { count: publicLists.length })}
      />
    </PageLayout>
  );
}

async function fetchProfileUser(username: string, authToken: string | null): Promise<ProfileUser | null> {
  const path = `/api/v1/users/${username}?lists_limit=${PROFILE_PUBLIC_LISTS_LIMIT}`;

  try {
    return await api.public.get<ProfileUser>(
      path,
      authToken
        ? {
            authorization: authToken,
            cache: 'no-store',
          }
        : {
            cache: 'force-cache',
            revalidate: 60,
          },
    );
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

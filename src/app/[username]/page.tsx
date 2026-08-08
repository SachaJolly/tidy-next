import React from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PageLayout from '@/layouts/PageLayout';
import ProfileHeader, { type ProfileUser } from '@/components/ProfileHeader/ProfileHeader';
import Notice from '@/components/Notice/Notice';
import Section from '@/components/Section/Section';
import ProfileListsSection from './ProfileListsSection';
import { api, ApiFetchError } from '@/lib/api';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

type UserPageProfile = ProfileUser & { viewerIsOwner?: boolean };

const PROFILE_PUBLIC_LISTS_LIMIT = 12;

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const t = await getTranslations('profile');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

  const user = await fetchProfileUser(username, authToken);

  if (!user) {
    notFound();
  }

  const isConfirmedUser = user.emailConfirmed !== false;
  const isPublicVisibleForUnconfirmed = user.unconfirmedProfilePublicVisible ?? false;
  const isCurrentUser = user.viewerIsOwner === true;
  const isPrivateProfile = user.profilePrivate === true;
  const isPrivateProfileForVisitor = isPrivateProfile && !isCurrentUser;
  const isAuthor = isCurrentUser;

  if (!isConfirmedUser && !isPublicVisibleForUnconfirmed && !isCurrentUser) {
    notFound();
  }

  const publicLists = user.publicLists ?? [];
  const shouldShowPrivateVisibilityMessage = isPrivateProfile;
  const shouldShowUnconfirmedVisibilityMessage = !isConfirmedUser && !isPublicVisibleForUnconfirmed && isCurrentUser;

  const visibilityMessage = shouldShowPrivateVisibilityMessage
    ? {
        title: isCurrentUser ? t('privateVisibilityTitle') : t('privateVisibilityVisitorTitle'),
        description: isCurrentUser ? t('privateVisibilityDescription') : t('privateVisibilityVisitorDescription'),
        actions: isCurrentUser
          ? [{ label: t('privateVisibilityAction'), href: '/settings/profile' }]
          : undefined,
        variant: 'information' as const,
        isVisible: true,
      }
    : {
        title: t('unconfirmedVisibilityTitle'),
        description: t('unconfirmedVisibilityDescription'),
        actions: [{ label: t('unconfirmedVisibilityAction'), href: '/settings/account' }],
        variant: 'warning' as const,
        isVisible: shouldShowUnconfirmedVisibilityMessage,
      };

  return (
    <PageLayout>
      <ProfileHeader user={user} showEdit={isCurrentUser}/>

      {visibilityMessage.isVisible && (
        <Section>
          <Notice
            variant={visibilityMessage.variant}
            title={visibilityMessage.title}
            description={visibilityMessage.description}
            actions={visibilityMessage.actions}
          />
        </Section>
      )}

      {!isPrivateProfileForVisitor && (
        <ProfileListsSection
          publicLists={publicLists}
          canManage={isAuthor}
          title={t('publicLists', { count: publicLists.length })}
        />
      )}
    </PageLayout>
  );
}

async function fetchProfileUser(username: string, authToken: string | null): Promise<UserPageProfile | null> {
  const path = `/api/v1/users/${username}?lists_limit=${PROFILE_PUBLIC_LISTS_LIMIT}`;

  try {
    return await api.public.get<UserPageProfile>(
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

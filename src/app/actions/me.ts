'use server';

import { cookies } from 'next/headers';

import { api } from '@/lib/api';

type NullableString = string | null;

export interface UpdatePublicProfileInput {
  name: string;
  bio: string;
  pronouns: string;
  avatar: string;
  cover: string;
}

export interface UpdateProfileLinksInput {
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
}

export interface UpdateProfileVisibilityInput {
  profilePrivate: boolean;
}

export interface UpdateAccountInput {
  email: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  passwordConfirmation: string;
}

export interface UpdateNotificationsInput {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

function normalizeOptional(value: string): NullableString {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function getAuthorizationToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('tidy_token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  return token;
}

export async function updatePublicProfileSettings(input: UpdatePublicProfileInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        name: input.name.trim(),
        bio: normalizeOptional(input.bio),
        pronouns: normalizeOptional(input.pronouns),
        avatar: normalizeOptional(input.avatar),
        cover: normalizeOptional(input.cover),
      },
    },
    { authorization: token, cache: 'no-store' },
  );
}

export async function updateProfileLinksSettings(input: UpdateProfileLinksInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        website: normalizeOptional(input.website),
        twitter: normalizeOptional(input.twitter),
        github: normalizeOptional(input.github),
        linkedin: normalizeOptional(input.linkedin),
      },
    },
    { authorization: token, cache: 'no-store' },
  );
}

export async function updateProfileVisibilitySettings(input: UpdateProfileVisibilityInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        profile_private: input.profilePrivate,
      },
    },
    { authorization: token, cache: 'no-store' },
  );
}

export async function updateAccountSettings(input: UpdateAccountInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    { user: { email: input.email.trim() } },
    { authorization: token, cache: 'no-store' },
  );
}

export async function updateUsernameSettings(username: string): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    { user: { username: username.trim() } },
    { authorization: token, cache: 'no-store' },
  );
}

export async function updatePasswordSettings(input: UpdatePasswordInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        current_password: input.currentPassword,
        password: input.newPassword,
        password_confirmation: input.passwordConfirmation,
      },
    },
    { authorization: token, cache: 'no-store' },
  );
}

export async function updateNotificationsSettings(input: UpdateNotificationsInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        email_notifications: input.emailNotifications,
        push_notifications: input.pushNotifications,
      },
    },
    { authorization: token, cache: 'no-store' },
  );
}

export async function deleteAccount(): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.delete('/api/v1/me', {
    authorization: token,
    cache: 'no-store',
  });

  // Clear all session cookies so the user is fully signed out after deletion.
  const cookieStore = await cookies();
  cookieStore.delete('tidy_token');
  cookieStore.delete('tidy_language');
  cookieStore.delete('tidy_theme');
  cookieStore.delete('tidy_timezone');
}

export async function resendConfirmationEmail(): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.post(
    '/api/v1/me/resend_confirmation',
    {},
    { authorization: token, cache: 'no-store' },
  );
}

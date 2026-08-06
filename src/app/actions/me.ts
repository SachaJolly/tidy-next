'use server';

import { cookies } from 'next/headers';

import { saveLanguagePreference } from '@/app/actions/language';
import { saveThemePreference } from '@/app/actions/theme';
import { saveTimezonePreference } from '@/app/actions/timezone';
import { api } from '@/lib/api';
import { type LanguagePreference } from '@/lib/language-mapper';
import { type ThemePreference } from '@/lib/theme-mapper';

type NullableString = string | null;

interface UpdateProfileInput {
  name: string;
  bio: string;
  avatar: string;
  cover: string;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
}

interface UpdateAccountInput {
  email: string;
}

interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  passwordConfirmation: string;
}

interface UpdatePreferencesInput {
  language: LanguagePreference;
  theme: ThemePreference;
  timezone: string | null;
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

export async function updateProfileSettings(input: UpdateProfileInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        name: input.name.trim(),
        bio: normalizeOptional(input.bio),
        avatar: normalizeOptional(input.avatar),
        cover: normalizeOptional(input.cover),
        website: normalizeOptional(input.website),
        twitter: normalizeOptional(input.twitter),
        github: normalizeOptional(input.github),
        linkedin: normalizeOptional(input.linkedin),
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

export async function updatePreferencesSettings(input: UpdatePreferencesInput): Promise<void> {
  const token = await getAuthorizationToken();

  await api.auth.patch(
    '/api/v1/me',
    {
      user: {
        language: input.language,
        theme: input.theme.toUpperCase(),
        timezone: input.timezone ?? null,
        email_notifications: input.emailNotifications,
        push_notifications: input.pushNotifications,
      },
    },
    { authorization: token, cache: 'no-store' },
  );

  await Promise.all([
    saveLanguagePreference(input.language),
    saveThemePreference(input.theme),
    saveTimezonePreference(input.timezone),
  ]);
}

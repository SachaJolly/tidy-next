'use server';

import { cookies } from 'next/headers';

import { saveLanguagePreference } from '@/app/actions/language';
import { saveThemePreference } from '@/app/actions/theme';
import { api } from '@/lib/api';
import { type Language } from '@/lib/language-mapper';
import { type ThemePreference } from '@/lib/theme-mapper';

type NullableString = string | null;

interface UpdateProfileInput {
  name: string;
  username: string;
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
  password: string;
  passwordConfirmation: string;
}

interface UpdatePreferencesInput {
  language: Language;
  theme: ThemePreference;
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
        username: input.username.trim(),
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

  const userPayload: Record<string, string> = {
    email: input.email.trim(),
  };

  if (input.password.trim().length > 0 || input.passwordConfirmation.trim().length > 0) {
    userPayload.password = input.password;
    userPayload.password_confirmation = input.passwordConfirmation;
  }

  await api.auth.patch(
    '/api/v1/me',
    { user: userPayload },
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
        email_notifications: input.emailNotifications,
        push_notifications: input.pushNotifications,
      },
    },
    { authorization: token, cache: 'no-store' },
  );

  await Promise.all([saveLanguagePreference(input.language), saveThemePreference(input.theme)]);
}

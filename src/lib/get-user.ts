import 'server-only';

import { cookies } from 'next/headers';

import type { User } from '@/lib/types';

/**
 * Server-only utility to resolve the authenticated user from Rails (/api/v1/me).
 *
 * Why it exists:
 * - Centralizes auth-user fetching in one place (no duplicated `/me` logic).
 * - Returns `null` for unauthenticated states so server components can branch safely.
 * - Keeps fetch options explicit to leverage Next.js request memoization/caching controls.
 */
type GetUserOptions = {
  // Optional explicit token. Useful when caller already resolved auth outside this helper.
  token?: string | null;
  // Default is `no-store` because `/me` is user-specific and should stay fresh.
  cache?: RequestCache;
  // Optional Next.js cache controls for advanced server rendering strategies.
  revalidate?: number;
  tags?: string[];
};

type JsonApiUserDocument = {
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  } | null;
};

/**
 * Resolves the Rails API base URL from environment configuration.
 *
 * Throws early when the variable is missing to avoid silent misconfiguration
 * and to surface a clear error in server logs.
 */
function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_TIDY_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_TIDY_API_URL is not configured in the environment.');
  }

  return apiUrl;
}

/**
 * Normalizes Authorization token input to the raw token format.
 *
 * Accepts both:
 * - "abc123"
 * - "Bearer abc123"
 * and always returns the raw token value.
 */
function normalizeToken(token: string): string {
  // Accept both "raw token" and "Bearer <token>" inputs to keep caller ergonomics simple.
  return token.replace(/^Bearer\s+/i, '');
}

/**
 * Small runtime guard used before reading unknown JSON payload fields.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

/**
 * Guards the plain Rails `/api/v1/me` payload shape before we treat it as `User`.
 *
 * We only require the fields that are mandatory in our shared `User` type.
 * Optional fields are left untouched so the backend can omit them safely.
 */
function isPlainUserPayload(value: unknown): value is User {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string' &&
    typeof value.username === 'string' &&
    (typeof value.bio === 'string' || value.bio === null) &&
    typeof value.createdAt === 'string'
  );
}

/**
 * Converts `/api/v1/me` response payload into the app's `User` shape.
 *
 * Supported backend formats:
 * - Plain object user payload
 * - JSON:API document ({ data: { id, attributes } })
 *
 * Returns `null` when payload shape is unexpected instead of crashing downstream
 * server rendering logic.
 */
function parseUserFromPayload(payload: unknown): User | null {
  if (!isRecord(payload)) {
    return null;
  }

  // Rails endpoints can return either a plain user object or JSON:API resource data.
  // We support both shapes so consumers always receive a normalized `User | null`.
  const jsonApi = payload as JsonApiUserDocument;
  if (jsonApi.data && isRecord(jsonApi.data) && isRecord(jsonApi.data.attributes)) {
    const id = typeof jsonApi.data.id === 'string' ? jsonApi.data.id : null;
    if (!id) {
      return null;
    }

    return {
      id,
      ...(jsonApi.data.attributes as Omit<User, 'id'>),
    };
  }

  if (isPlainUserPayload(payload)) {
    return payload;
  }

  return null;
}

/**
 * Fetches the currently authenticated user from Rails.
 *
 * Behavior contract:
 * - Returns `User` when authenticated and payload is valid
 * - Returns `null` when no token exists or token is unauthorized (401)
 * - Throws for non-auth API failures (5xx, malformed server response status, etc.)
 *
 * This function is server-only and intended to be called by layouts/pages that
 * need one centralized user fetch before hydrating client state.
 */
export async function getUser(options: GetUserOptions = {}): Promise<User | null> {
  const tokenFromOptions = options.token ?? null;
  // Fallback to request cookie when token is not passed explicitly.
  // This keeps callsites minimal in server components/layouts.
  const tokenFromCookie = tokenFromOptions ?? (await cookies()).get('tidy_token')?.value ?? null;
  if (!tokenFromCookie) {
    // Missing token is a normal guest state, not an exception.
    return null;
  }

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${normalizeToken(tokenFromCookie)}`);

  const response = await fetch(`${getApiBaseUrl()}/api/v1/me`, {
    method: 'GET',
    headers,
    cache: options.cache ?? 'no-store',
    ...(options.revalidate !== undefined || options.tags?.length
      ? {
          next: {
            ...(options.revalidate !== undefined ? { revalidate: options.revalidate } : {}),
            ...(options.tags?.length ? { tags: options.tags } : {}),
          },
        }
      : {}),
  });

  if (response.status === 401) {
    // Invalid/expired token should behave like "not authenticated" for the UI layer.
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status} ${response.statusText}`);
  }

  const payload: unknown = await response.json();
  return parseUserFromPayload(payload);
}

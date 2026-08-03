import 'server-only';

import { cookies } from 'next/headers';

/**
 * Centralized server-side API client for the Rails backend.
 *
 * Why this exists:
 * - It keeps every page on the same data-fetching contract.
 * - It makes auth handling explicit instead of scattered across pages.
 * - It lets us use Next.js fetch caching/deduplication in one place.
 *
 * Important: this file is server-only because it reads request cookies.
 * That is intentional: protected requests must be decided before network IO.
 */

type CacheOptions = {
  /**
   * Standard Next.js fetch cache mode.
   * - "force-cache" for stable public pages
   * - "no-store" for authenticated pages that must always be fresh
   */
  cache?: RequestCache;
  /**
   * Next.js ISR-style revalidation for public content.
   * This is how we get shared caching without hard-coding a page-level fetch.
   */
  revalidate?: number;
  /**
   * Optional cache tags if we want to invalidate by domain later.
   */
  tags?: string[];
};

type ApiRequestOptions = CacheOptions & {
  headers?: HeadersInit;
  authenticated?: boolean;
  authorization?: string;
  cookie?: string;
  method?: string;
  body?: BodyInit | null;
};

type ApiResponseWithHeaders<T> = {
  data: T | null;
  headers: Headers;
};

export class ApiFetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiFetchError';
    this.status = status;
  }
}

const ErrorResponseSchema = {
  parse(value: unknown): string | null {
    if (!value || typeof value !== 'object') return null;
    const maybeStatus = (value as { status?: { message?: unknown } }).status;
    if (!maybeStatus || typeof maybeStatus.message !== 'string') return null;
    return maybeStatus.message;
  },
};

function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_TIDY_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_TIDY_API_URL is not configured in the environment.');
  }
  return apiUrl;
}

async function getSessionToken(): Promise<string | null> {
  // Reading cookies here lets us stop protected requests before any fetch runs.
  const cookieStore = await cookies();
  return cookieStore.get('tidy_token')?.value ?? null;
}

function normalizeToken(token: string): string {
  return token.replace(/^Bearer\s+/i, '');
}

function mergeHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers();
  merged.set('Content-Type', 'application/json');

  if (!headers) {
    return merged;
  }

  if (headers instanceof Headers) {
    headers.forEach((value, key) => merged.set(key, value));
    return merged;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => merged.set(key, value));
    return merged;
  }

  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'string') {
      merged.set(key, value);
    }
  });

  return merged;
}

function applyServerAuthHeaders(headers: Headers, options: ApiRequestOptions): Headers {
  if (options.authorization) {
    headers.set('Authorization', `Bearer ${normalizeToken(options.authorization)}`);
  }

  if (options.cookie) {
    headers.set('Cookie', options.cookie);
  }

  return headers;
}

function buildFetchInit(options: ApiRequestOptions): RequestInit {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: mergeHeaders(options.headers),
  };

  if (options.cache) {
    init.cache = options.cache;
  }

  if (options.revalidate !== undefined || options.tags?.length) {
    init.next = {
      ...(options.revalidate !== undefined ? { revalidate: options.revalidate } : {}),
      ...(options.tags?.length ? { tags: options.tags } : {}),
    };
  }

  if (options.body !== undefined) {
    init.body = options.body;
  }

  return init;
}

/**
 * JSON:API responses come back in one of two shapes:
 * - a resource object (or array of resource objects)
 * - a plain payload we already want to consume directly
 *
 * The transformer only flattens the JSON:API case. Plain objects are returned
 * unchanged so endpoints can intentionally aggregate multiple lists in one payload.
 */
type JsonApiIdentifier = {
  id: string;
  type: string;
};

type JsonApiRelationship = {
  data?: JsonApiIdentifier | JsonApiIdentifier[] | null;
};

type JsonApiResource = {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, JsonApiRelationship>;
};

type JsonApiDocument = {
  data: JsonApiResource | JsonApiResource[];
  included?: JsonApiResource[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isJsonApiIdentifier(value: unknown): value is JsonApiIdentifier {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string'
  );
}

function isJsonApiResource(value: unknown): value is JsonApiResource {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.type === 'string' &&
    isRecord(value.attributes)
  );
}

function isJsonApiDocument(value: unknown): value is JsonApiDocument {
  if (!isRecord(value) || !('data' in value)) return false;
  const data = value.data;
  if (Array.isArray(data)) {
    return data.every(isJsonApiResource);
  }
  return isJsonApiResource(data);
}

function transformApiData(response: unknown) {
  if (isRecord(response) && 'data' in response && !isJsonApiDocument(response)) {
    // Some endpoints intentionally return a plain `{ data: ... }` envelope
    // (not JSON:API resources). In that case, consumers expect the inner payload.
    return response.data;
  }

  if (!isJsonApiDocument(response)) {
    return response;
  }

  const data = response.data;
  const included = Array.isArray(response.included) ? response.included : [];
  const dataResources = Array.isArray(data) ? data : [data];
  const rawResources = [...included, ...dataResources];

  // Build a lookup table so relationship resolution is O(1), including
  // top-level resources for nested relationship chains.
  const rawResourceMap = new Map<string, JsonApiResource>();
  rawResources.forEach((item) => {
    rawResourceMap.set(`${item.type}-${item.id}`, item);
  });

  const flattenedResourceMap = new Map<string, Record<string, unknown>>();

  const flattenFromResource = (
    resource: JsonApiResource,
    stack = new Set<string>(),
  ): Record<string, unknown> => {
    const resourceKey = `${resource.type}-${resource.id}`;
    const cached = flattenedResourceMap.get(resourceKey);
    if (cached) return cached;
    if (stack.has(resourceKey)) {
      return { id: resource.id, ...resource.attributes };
    }

    const nextStack = new Set(stack);
    nextStack.add(resourceKey);

    const flattened: Record<string, unknown> = { id: resource.id, ...resource.attributes };

    // Resolve relationships only when the backend has included the related
    // resource. That gives us normalized frontend data without extra requests.
    if (resource.relationships) {
      for (const key in resource.relationships) {
        const relationship = resource.relationships[key];
        if (!relationship?.data) continue;

        if (Array.isArray(relationship.data)) {
          flattened[key] = relationship.data
            .map((ref) => flattenRef(ref, nextStack))
            .filter(Boolean);
        } else {
          flattened[key] = flattenRef(relationship.data, nextStack) ?? null;
        }
      }
    }

    flattenedResourceMap.set(resourceKey, flattened);
    return flattened;
  };

  const flattenRef = (ref: unknown, stack: Set<string>) => {
    if (!isJsonApiIdentifier(ref)) return null;
    const key = `${ref.type}-${ref.id}`;
    const raw = rawResourceMap.get(key);
    if (!raw) return null;
    return flattenFromResource(raw, stack);
  };

  const flattenResource = (resource: JsonApiResource) => flattenFromResource(resource);

  if (Array.isArray(data)) {
    return data.map(flattenResource);
  }

  return flattenResource(data);
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T | null> {
  const apiUrl = getApiBaseUrl();
  const authenticated = options.authenticated === true;

  // Security gate: if the route is protected and we have no session token,
  // we stop here. That prevents unauthenticated users from hitting the Rails
  // endpoint at all.
  let token: string | null = null;
  if (authenticated) {
    token = options.authorization ?? null;

    if (!token && !options.cookie) {
      token = await getSessionToken();
      if (!token) {
        return null;
      }
    }
  }

  const headers = mergeHeaders(options.headers);
  applyServerAuthHeaders(headers, options);
  if (authenticated && token) {
    headers.set('Authorization', `Bearer ${normalizeToken(token)}`);
  }

  const init = buildFetchInit({
    ...options,
    headers,
  });

  const response = await fetch(`${apiUrl}${path}`, init);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const parsedMessage = ErrorResponseSchema.parse(errorBody);
    throw new ApiFetchError(
      parsedMessage ?? `API Error: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const jsonData = await response.json();
  return transformApiData(jsonData) as T;
}

async function requestWithHeaders<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponseWithHeaders<T>> {
  const apiUrl = getApiBaseUrl();
  const authenticated = options.authenticated === true;

  let token: string | null = null;
  if (authenticated) {
    token = options.authorization ?? null;

    if (!token && !options.cookie) {
      token = await getSessionToken();
      if (!token) {
        return { data: null, headers: new Headers() };
      }
    }
  }

  const headers = mergeHeaders(options.headers);
  applyServerAuthHeaders(headers, options);
  if (authenticated && token) {
    headers.set('Authorization', `Bearer ${normalizeToken(token)}`);
  }

  const init = buildFetchInit({
    ...options,
    headers,
  });

  const response = await fetch(`${apiUrl}${path}`, init);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const parsedMessage = ErrorResponseSchema.parse(errorBody);
    throw new ApiFetchError(
      parsedMessage ?? `API Error: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  if (response.status === 204) {
    return { data: null, headers: response.headers };
  }

  const jsonData = await response.json();
  return {
    data: transformApiData(jsonData) as T,
    headers: response.headers,
  };
}

/**
 * Public methods never touch the session cookie, so they stay cache-friendly.
 * Authenticated methods read the session first and short-circuit if missing.
 */
const publicClient = {
  get: async <T>(
    path: string,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'authenticated'> = {},
  ): Promise<T> => request<T>(path, { ...options, authenticated: false, method: 'GET' }) as Promise<T>,
  post: async <T>(
    path: string,
    body: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'authenticated'> = {},
  ): Promise<T> =>
    request<T>(path, {
      ...options,
      authenticated: false,
      method: 'POST',
      body: JSON.stringify(body),
    }) as Promise<T>,
  postWithHeaders: async <T>(
    path: string,
    body: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'authenticated'> = {},
  ): Promise<ApiResponseWithHeaders<T>> =>
    requestWithHeaders<T>(path, {
      ...options,
      authenticated: false,
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

const authClient = {
  get: async <T>(
    path: string,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'authenticated'> = {},
  ): Promise<T | null> => request<T>(path, { ...options, authenticated: true, method: 'GET' }),
  post: async <T>(
    path: string,
    body: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'authenticated'> = {},
  ): Promise<T | null> =>
    request<T>(path, {
      ...options,
      authenticated: true,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patch: async <T>(
    path: string,
    body: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body' | 'authenticated'> = {},
  ): Promise<T | null> =>
    request<T>(path, {
      ...options,
      authenticated: true,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export const api = {
  public: publicClient,
  auth: authClient,
  get: publicClient.get,
  post: publicClient.post,
  ApiFetchError,
};

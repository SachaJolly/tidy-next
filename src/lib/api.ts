/**
 * A centralized API client for interacting with the Tidy-API.
 * This handles URL construction, headers, authentication, and data transformation.
 */

// We use Zod for runtime validation of API responses.
// This ensures that the data we receive matches the expected shape.
import { z } from 'zod';

const ErrorResponseSchema = z.object({
  status: z.object({
    code: z.number().optional(),
    message: z.string(),
  }),
});

/**
 * Transforms a JSON:API response object (or array of objects) into a simple JS object.
 * It flattens the `attributes` into the main object alongside the `id`.
 * It also handles `included` relationships, attaching them to their parent objects.
 * @example
 * // Transforms: { data: { id: '1', type: 'list', attributes: { title: 'My List' }, relationships: { author: { data: { id: 'u1', type: 'user' } } } }, included: [{ id: 'u1', type: 'user', attributes: { name: 'John' } }] }
 * // Into: { id: '1', title: 'My List', author: { id: 'u1', name: 'John' } }
 */
function transformApiData(response: any) {
  if (!response) return response;

  const data = response.data;
  const included = response.included || [];

  // Create a map for quick lookup of included resources
  const includedMap = new Map<string, any>();
  included.forEach((item: any) => {
    includedMap.set(`${item.type}-${item.id}`, { id: item.id, ...item.attributes });
  });

  const processResource = (resource: any) => {
    if (!resource || !resource.attributes) return resource;

    const transformed = { id: resource.id, ...resource.attributes };

    // Process relationships
    if (resource.relationships) {
      for (const key in resource.relationships) {
        const relationship = resource.relationships[key];
        if (relationship.data) {
          if (Array.isArray(relationship.data)) {
            // Handle hasMany relationships
            transformed[key] = relationship.data
              .map((rel: any) => includedMap.get(`${rel.type}-${rel.id}`))
              .filter(Boolean); // Filter out any relationships not found in included
          } else {
            // Handle belongsTo relationships
            transformed[key] = includedMap.get(`${relationship.data.type}-${relationship.data.id}`);
          }
        }
      }
    }
    return transformed;
  };

  if (Array.isArray(data)) {
    return data.map(processResource);
  }

  return processResource(data);
}

/**
 * The core fetch function.
 * @param path The API endpoint path (e.g., "/api/v1/lists/featured").
 * @param options The standard RequestInit options for fetch.
 * @returns The transformed, flattened JSON response body.
 */
async function apiFetch(path: string, options: RequestInit = {}) {
  // Use the NEXT_PUBLIC_ variable which is available on both server and client.
  const apiUrl = process.env.NEXT_PUBLIC_TIDY_API_URL;
  if (!apiUrl) {
    // This error will be thrown if the .env.local file is not configured correctly.
    throw new Error("NEXT_PUBLIC_TIDY_API_URL is not configured in your environment variables.");
  }

  const response = await fetch(`${apiUrl}${path}`, options);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const parsedError = ErrorResponseSchema.safeParse(errorBody);
    if (parsedError.success) {
      throw new Error(`API Error: ${parsedError.data.status.message}`);
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const jsonData = await response.json();
  // Transform the data before returning it
  return transformApiData(jsonData);
}

/**
 * A collection of simplified methods for making API calls.
 */
export const api = {
  /**
   * Performs a GET request and returns the flattened data.
   * @param path The API endpoint path.
   * @param token Optional JWT for authenticated requests.
   */
  get: <T>(path: string, token?: string): Promise<T> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return apiFetch(path, { method: 'GET', headers });
  },

  /**
   * Performs a POST request.
   * @returns An object containing the transformed response data and the original headers.
   */
  post: async <T>(path: string, body: unknown, token?: string): Promise<{ data: T, headers: Headers }> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Use the NEXT_PUBLIC_ variable here as well for consistency.
    const apiUrl = process.env.NEXT_PUBLIC_TIDY_API_URL;
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_TIDY_API_URL is not configured.");
    }

    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const parsedError = ErrorResponseSchema.safeParse(errorBody);
      if (parsedError.success) {
        throw new Error(`API Error: ${parsedError.data.status.message}`);
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();
    // Also transform the data on POST responses
    const data = transformApiData(jsonData);
    return { data, headers: response.headers };
  },
};

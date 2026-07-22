/**
 * A centralized API client for interacting with the Tidy API.
 * This handles URL construction, headers, authentication, and basic error handling.
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
 * @example
 * // Transforms: { id: '1', type: 'list', attributes: { title: 'My List' } }
 * // Into: { id: '1', title: 'My List' }
 */
function transformApiData(response: any) {
  if (!response || !response.data) return response;

  const transformObject = (obj: any) => {
    if (!obj.attributes) return obj;
    return { id: obj.id, ...obj.attributes };
  };

  if (Array.isArray(response.data)) {
    return response.data.map(transformObject);
  }

  return transformObject(response.data);
}

/**
 * The core fetch function.
 * @param path The API endpoint path (e.g., "/api/v1/lists/featured").
 * @param options The standard RequestInit options for fetch.
 * @returns The transformed, flattened JSON response body.
 */
async function apiFetch(path: string, options: RequestInit = {}) {
  const apiUrl = process.env.TIDY_API_URL;
  if (!apiUrl) {
    throw new Error("TIDY_API_URL is not configured in your environment variables.");
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
 *
 * @example
 * // Fetching public data (e.g., in a Server Component)
 * const { data } = await api.get<ApiResponse>('/api/v1/lists/featured');
 *
 * @example
 * // Fetching protected data (e.g., in a client component)
 * const token = getAuthToken(); // Assume this function exists
 * const { data } = await api.get<ApiResponse>('/api/v1/me/lists', token);
 *
 * @example
 * // Posting data
 * const { data, headers } = await api.post('/api/v1/login', { email, password });
 * const jwt = headers.get('Authorization');
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

    const response = await fetch(`${process.env.TIDY_API_URL}${path}`, {
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

/**
 * TypeScript interfaces for the data models returned by the Tidy API.
 * These types correspond to the JSON output of the Rails serializers.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  emailConfirmed?: boolean;
}

export type NewListGate = {
  emailConfirmed: boolean;
  limitReached: boolean;
};

export interface Item {
  id: string;
  title: string;
  caption: string | null;
  // `content` is a flexible object that can hold any key-value pairs
  content: Record<string, unknown>;
  position: number;
  itemType: 'URL' | 'TEXT' | 'IMAGE'; // Example types
  displayMode: string;
  createdAt: string;
  updatedAt: string;
  deleted_at: string | null;

  // The `stats` object is constructed by the API serializer
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface List {
  id: string;
  title: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNINDEXED';
  color: string;
  thumbnail: string | null;
  displayMode: string;
  itemsCount: number;
  collaboratorsCount: number;
  notesCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  deleted_at: string | null;

  // Lists must always expose their author in API responses consumed by the app.
  author: User;
  items?: Item[];
}

// A standard API response structure from our Rails backend
export type ApiResponse<T> = {
  data: T;
};

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
  pronouns?: string | null;
  avatar?: string | null;
  cover?: string | null;
  website?: string | null;
  twitter?: string | null;
  github?: string | null;
  linkedin?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  role?: 'ADMIN' | 'USER';
  theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
  timezone?: string | null;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  language?: string | null;
  profilePrivate?: boolean;
  createdAt: string;
  confirmedAt?: string | null;
  emailConfirmed?: boolean;
}

export type NewListGate = {
  emailConfirmed: boolean;
  limitReached: boolean;
};

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

export interface Item {
  id: string;
  body: string; // Markdown text
  url: string | null;
  display_mode: 'text' | 'link' | 'bookmark' | 'embed';
  metadata: Record<string, any>; // Formerly `content`
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

// A standard API response structure from our Rails backend
export type ApiResponse<T> = {
  data: T;
};

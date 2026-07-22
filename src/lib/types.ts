/**
 * TypeScript interfaces for the data models returned by the Tidy API.
 * These types correspond to the JSON output of the Rails serializers.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  caption: string | null;
  content: {
    url?: string;
  };
  position: number;
  itemType: 'URL' | 'TEXT' | 'IMAGE'; // Example types
  displayMode: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
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

  // Relationships (included via serializer)
  author?: User;
  items?: Item[];
}

// A standard API response structure from our Rails backend (using jsonapi-serializer)
export type ApiResponse<T> = {
  data: T;
  // You can add 'included' here if you use compound documents
};

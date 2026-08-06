import type { Meta, StoryObj } from '@storybook/react';
import { Item } from './Item';
import type { Item as ItemType } from '@/lib/types';

const meta = {
  title: 'Components/Item',
  component: Item,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    canManage: true,
  }
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseLinkItem: ItemType = {
  id: '1',
  title: 'Introducing TypeScript 5.0',
  caption: null,
  displayMode: 'LINK',
  position: 0,
  itemType: 'URL',
  stats: { views: 1234, likes: 89, comments: 12 },
  content: {
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html',
    favicon: 'https://www.typescriptlang.org/favicon-32x32.png',
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  deleted_at: null,
};

const baseBookmarkItem: ItemType = {
  id: '2',
  title: 'Next.js 14 Released',
  caption: null,
  displayMode: 'BOOKMARK',
  position: 0,
  itemType: 'URL',
  stats: { views: 5678, likes: 234, comments: 45 },
  content: {
    url: 'https://nextjs.org/blog/next-14',
    favicon: 'https://nextjs.org/favicon.ico',
    description: 'Discover the latest features in Next.js 14 including improved performance, better developer experience, and more.',
    siteName: 'Next.js',
    image: 'https://via.placeholder.com/600x400?text=Next.js+14',
    label1: 'Release Date',
    value1: 'October 26, 2023',
    label2: 'Status',
    value2: 'Stable',
  },
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-10T10:00:00Z',
  deleted_at: null,
};

/**
 * Link display mode - Simple link with title and favicon
 */
export const Link: Story = {
  args: {
    item: baseLinkItem,
    listId: 'list-123',
  },
};

/**
 * Link mode without favicon
 */
export const LinkNoFavicon: Story = {
  args: {
    item: {
      ...baseLinkItem,
      content: {
        url: baseLinkItem.content.url,
      },
    },
    listId: 'list-123',
  },
};

/**
 * Link with caption
 */
export const LinkCaption: Story = {
  args: {
    item: {
      ...baseLinkItem,
      caption: 'A major release with new features and improvements',
    },
    listId: 'list-123',
  },
};

/**
 * Bookmark display mode - Rich preview with image, description, and metadata
 */
export const Bookmark: Story = {
  args: {
    item: baseBookmarkItem,
    listId: 'list-123',
  },
};

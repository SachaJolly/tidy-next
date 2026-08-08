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
  body: 'Introducing TypeScript 5.0',
  url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html',
  display_mode: 'link',
  stats: { views: 1234, likes: 89, comments: 12 },
  metadata: {
    favicon: 'https://www.typescriptlang.org/favicon-32x32.png',
  },
};

const baseBookmarkItem: ItemType = {
  id: '2',
  body: 'Next.js 14 Released',
  url: 'https://nextjs.org/blog/next-14',
  display_mode: 'bookmark',
  stats: { views: 5678, likes: 234, comments: 45 },
  metadata: {
    favicon: 'https://nextjs.org/favicon.ico',
    description: 'Discover the latest features in Next.js 14 including improved performance, better developer experience, and more.',
    siteName: 'Next.js',
    image: 'https://via.placeholder.com/600x400?text=Next.js+14',
    label1: 'Release Date',
    value1: 'October 26, 2023',
    label2: 'Status',
    value2: 'Stable',
  },
};

/**
 * Link display mode - Simple link with title and favicon
 */
export const Link: Story = {
  args: {
    item: baseLinkItem,
  },
};

/**
 * Link mode without favicon
 */
export const LinkNoFavicon: Story = {
  args: {
    item: {
      ...baseLinkItem,
      metadata: {},
    },
  },
};

/**
 * Link with body text
 */
export const LinkCaption: Story = {
  args: {
    item: {
      ...baseLinkItem,
      body: 'A major release with new features and improvements',
    },
  },
};

/**
 * Bookmark display mode - Rich preview with image, description, and metadata
 */
export const Bookmark: Story = {
  args: {
    item: baseBookmarkItem,
  },
};

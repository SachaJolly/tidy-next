import type { Meta, StoryObj } from '@storybook/react';

import ListHeader from './ListHeader';
import { ListHeaderSkeleton } from './ListHeaderSkeleton';
import type { List, User } from '@/lib/types';

const meta: Meta<typeof ListHeader> = {
  component: ListHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListHeader>;

const mockAuthor: User = {
  id: '1',
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  pronouns: 'she/her',
  bio: 'Product designer and coffee enthusiast',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-08-01T14:30:00Z',
};

const mockList: List = {
  id: 'list-1',
  title: 'Best Productivity Apps',
  description: 'A curated collection of tools that boost my daily workflow.',
  visibility: 'PUBLIC',
  color: '#FF6B35',
  thumbnail: null,
  author: mockAuthor,
  itemsCount: 12,
  notesCount: 24,
  isPinned: false,
  isTrending: false,
  isPopular: false,
  isFeatured: false,
  items: [],
  createdAt: '2024-03-10T08:45:00Z',
  updatedAt: '2024-08-06T12:00:00Z',
};

export const AsAuthor: Story = {
  args: {
    list: mockList,
    author: mockAuthor,
    locale: 'en',
    timezone: 'America/New_York',
    isAuthor: true,
  },
};

export const AsViewer: Story = {
  args: {
    list: mockList,
    author: mockAuthor,
    locale: 'en',
    timezone: 'America/New_York',
    isAuthor: false,
  },
};

export const WithoutDescription: Story = {
  args: {
    list: { ...mockList, description: null },
    author: mockAuthor,
    locale: 'en',
    timezone: 'America/New_York',
    isAuthor: true,
  },
};

export const PrivateList: Story = {
  args: {
    list: { ...mockList, visibility: 'PRIVATE' },
    author: mockAuthor,
    locale: 'en',
    timezone: 'America/New_York',
    isAuthor: true,
  },
};

export const SkeletonState: Story = {
  render: () => <ListHeaderSkeleton />,
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import CuratorMeta from './curator-meta';
import ListCard from '@/components/list-card/list-card';
import type { User, List } from '@/lib/types';

const mockProfile: User = {
  id: '1',
  name: 'Alexandra Jolly',
  username: 'sachaaaj',
  bio: 'Curator of fine links and digital discoveries.',
  email: 'alex@tidycards.app',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockLists: List[] = [
  {
    id: '1',
    title: 'Design Systems & Tokens',
    description: 'A curated collection of articles on design systems.',
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#7c3aed',
    thumbnail: null,
    displayMode: 'list',
    itemsCount: 24,
    collaboratorsCount: 2,
    notesCount: 3,
    isPinned: false,
    isFeatured: false,
    isTrending: true,
    isPopular: false,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-06-15T00:00:00.000Z',
    deleted_at: null,
  },
  {
    id: '2',
    title: 'Frontend Architecture',
    description: null,
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    color: '#0ea5e9',
    thumbnail: null,
    displayMode: 'list',
    itemsCount: 11,
    collaboratorsCount: 0,
    notesCount: 0,
    isPinned: false,
    isFeatured: true,
    isTrending: false,
    isPopular: false,
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2024-07-01T00:00:00.000Z',
    deleted_at: null,
  },
  {
    id: '3',
    title: 'Reading List',
    description: 'Books and long-reads worth your time.',
    status: 'ACTIVE',
    visibility: 'UNINDEXED',
    color: '#10b981',
    thumbnail: null,
    displayMode: 'list',
    itemsCount: 1,
    collaboratorsCount: 0,
    notesCount: 7,
    isPinned: false,
    isFeatured: false,
    isTrending: false,
    isPopular: true,
    createdAt: '2024-04-20T00:00:00.000Z',
    updatedAt: '2024-07-20T00:00:00.000Z',
    deleted_at: null,
  },
];

const meta = {
  title: 'Components/Curator Meta',
  component: CuratorMeta,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    profile: mockProfile,
    listsCount: mockLists.length,
  },

} satisfies Meta<typeof CuratorMeta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { listsCount: mockLists.length },
  render: (args) => (
    <CuratorMeta {...args}>
      {mockLists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </CuratorMeta>
  ),
};

export const NoBio: Story = {
  args: {
    profile: { ...mockProfile, bio: null },
  },
};

export const SingleList: Story = {
  args: { listsCount: 1 },
};

export const NoLists: Story = {
  args: { listsCount: 0 },
};


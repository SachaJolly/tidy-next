import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PageLayout from '@/layouts/PageLayout';
import Section from '@/components/Section/Section';

import ProfileCard, { type ProfileCardEntry } from './ProfileCard';

const mockAuthor = {
  id: '1',
  email: 'alexandra@example.com',
  name: 'Alexandra',
  username: 'sachaaaj',
  bio: 'Profile card for fine links and digital discoveries.',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockProfile: ProfileCardEntry = {
  id: '1',
  name: 'Alexandra',
  handle: 'sachaaaj',
  bio: 'Profile card for fine links and digital discoveries.',
  listsCount: 12,
  recentLists: [
    {
      id: '1',
      title: 'Design Systems & Tokens',
      description: 'A curated collection on design systems.',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      color: '#7c3aed',
      displayMode: 'LIST',
      itemsCount: 24,
      collaboratorsCount: 2,
      notesCount: 3,
      isPinned: true,
      isFeatured: false,
      isTrending: true,
      isPopular: false,
      author: mockAuthor,
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-06-15T00:00:00.000Z',
      deleted_at: null,
      thumbnail: null,
    },
    {
      id: '2',
      title: 'Frontend Architecture',
      description: 'Modern patterns and best practices.',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      color: '#0ea5e9',
      displayMode: 'LIST',
      itemsCount: 11,
      collaboratorsCount: 0,
      notesCount: 0,
      isPinned: false,
      isFeatured: true,
      isTrending: false,
      isPopular: false,
      author: mockAuthor,
      createdAt: '2024-03-10T00:00:00.000Z',
      updatedAt: '2024-07-01T00:00:00.000Z',
      deleted_at: null,
      thumbnail: null,
    },
    {
      id: '3',
      title: 'Reading List',
      description: 'Books and long-reads worth your time.',
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      color: '#10b981',
      displayMode: 'LIST',
      itemsCount: 1,
      collaboratorsCount: 0,
      notesCount: 7,
      isPinned: false,
      isFeatured: false,
      isTrending: false,
      isPopular: true,
      author: mockAuthor,
      createdAt: '2024-04-20T00:00:00.000Z',
      updatedAt: '2024-07-20T00:00:00.000Z',
      deleted_at: null,
      thumbnail: null,
    },
  ],
};

const meta = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { profile: mockProfile },
  render: (args) => (
    <PageLayout>
      <Section>
        <ProfileCard {...args} />
      </Section>
    </PageLayout>
  ),
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoLists: Story = {
  args: { profile: { ...mockProfile, recentLists: [] } },
};

export const NoBio: Story = {
  args: { profile: { ...mockProfile, bio: null } },
};

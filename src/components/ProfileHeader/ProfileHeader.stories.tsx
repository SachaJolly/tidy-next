import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PageLayout from '@/layouts/PageLayout';

import ProfileHeader, { type ProfileUser } from './ProfileHeader';

const mockUser: ProfileUser = {
  id: '1',
  email: 'alexandra@example.com',
  name: 'Alexandra',
  username: 'sachaaaj',
  bio: 'Profile card for fine links and digital discoveries.',
  pronouns: 'she/her',
  avatar: null,
  createdAt: '2024-01-01T00:00:00Z',
  public_lists_count: 12,
  publicLists: [],
};

const meta = {
  title: 'Components/ProfileHeader',
  component: ProfileHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    user: mockUser,
    showEditProfileButton: false,
  },
  render: (args) => (
    <PageLayout>
      <ProfileHeader {...args} />
    </PageLayout>
  ),
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EditableProfile: Story = {
  args: {
    showEditProfileButton: true,
  },
};

export const WithoutPronouns: Story = {
  args: {
    user: {
      ...mockUser,
      pronouns: null,
    },
  },
};

export const WithoutBio: Story = {
  args: {
    user: {
      ...mockUser,
      bio: null,
    },
  },
};
